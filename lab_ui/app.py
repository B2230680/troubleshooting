import asyncio
import queue
import threading
from pathlib import Path

import docker
from docker.errors import DockerException, NotFound
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

import random

FAULTS = ("default-route", "static-route")

app = FastAPI(title="Network Troubleshooting Lab")
app.mount("/static", StaticFiles(directory="static"), name="static")

LAB_CONTAINERS = {"client1", "client2", "router1", "router2", "router3", "dns", "web"}
READ_ONLY_PREFIXES = ("ip ", "ping ", "traceroute", "tracepath", "dig ", "nslookup", "curl ", "cat ", "hostname", "vtysh", "ss ", "netstat", "tcpdump")
MUTATING_PREFIXES = ("ip route ", "ip link ", "vtysh ")


class CommandRequest(BaseModel):
    target: str = Field(pattern="^(client1|client2|router1|router2|router3|dns|web)$")
    command: str = Field(min_length=1, max_length=500)


def client():
    try:
        return docker.from_env()
    except DockerException as exc:
        raise HTTPException(503, f"Docker に接続できません: {exc}") from exc


def run(target: str, command: str) -> dict:
    if target not in LAB_CONTAINERS:
        raise HTTPException(400, "対象コンテナが不正です")
    command = command.strip()
    if not command.startswith(READ_ONLY_PREFIXES + MUTATING_PREFIXES):
        raise HTTPException(400, "この演習では ip / ping / traceroute / dig / curl / vtysh などのネットワーク診断コマンドを使用してください")
    try:
        result = client().containers.get(target).exec_run(["/bin/sh", "-lc", command], demux=True)
    except NotFound as exc:
        raise HTTPException(409, f"{target} が起動していません。先に docker compose up -d --build を実行してください。") from exc
    stdout, stderr = result.output or (b"", b"")
    output = (stdout or b"").decode("utf-8", "replace") + (stderr or b"").decode("utf-8", "replace")
    return {"exit_code": result.exit_code, "output": output or "(出力はありません)"}


def inject_known_fault(fault: str) -> dict:
    if fault == "default-route":
        return run("client1", "ip route del default")
    if fault == "static-route":
        return run("router3", "vtysh -c 'configure terminal' -c 'no ip route 192.168.20.0/24 192.168.13.10' -c 'ip route 192.168.20.0/24 192.168.13.100'")
    raise HTTPException(404, "不明な障害です")


@app.get("/")
def index():
    return FileResponse(Path("static/index.html"))


@app.get("/api/status")
def status():
    result = {}
    docker_client = client()
    for name in sorted(LAB_CONTAINERS):
        try:
            container = docker_client.containers.get(name)
            result[name] = container.status
        except NotFound:
            result[name] = "not created"
    return result


@app.post("/api/command")
def command(request: CommandRequest):
    return run(request.target, request.command)


@app.websocket("/api/terminal/{target}")
async def terminal(websocket: WebSocket, target: str):
    """Attach a browser session to an interactive /bin/sh, like docker exec -it."""
    if target not in LAB_CONTAINERS:
        await websocket.close(code=1008, reason="対象コンテナが不正です")
        return

    await websocket.accept()
    try:
        container = client().containers.get(target)
        exec_id = container.client.api.exec_create(
            container.id,
            cmd=["/bin/sh", "-i"],
            stdin=True,
            tty=True,
        )["Id"]
        docker_socket = container.client.api.exec_start(exec_id, socket=True, tty=True)
    except NotFound:
        await websocket.send_text(f"{target} が起動していません。\r\n")
        await websocket.close(code=1011)
        return
    except DockerException as exc:
        await websocket.send_text(f"Docker に接続できません: {exc}\r\n")
        await websocket.close(code=1011)
        return

    incoming: queue.Queue[bytes | None] = queue.Queue()
    outgoing: asyncio.Queue[bytes | None] = asyncio.Queue()
    loop = asyncio.get_running_loop()
    stopped = threading.Event()

    def read_from_container() -> None:
        try:
            while not stopped.is_set():
                data = docker_socket.read(4096)
                if not data:
                    break
                loop.call_soon_threadsafe(outgoing.put_nowait, data)
        except OSError:
            pass
        finally:
            loop.call_soon_threadsafe(outgoing.put_nowait, None)

    def write_to_container() -> None:
        try:
            while not stopped.is_set():
                data = incoming.get()
                if data is None:
                    break

               # print(f"DEBUG: 1. Received from browser -> {data}")

               # docker_socket.sendall(data)
                if hasattr(docker_socket, "_sock"):
                     docker_socket._sock.sendall(data)
                else:
                     docker_socket.wirte(data)

               # print("DEBUG: 2. Write completed")
        except OSError:
           # print(f"DEBUG: Error in write_to_container: {e}")
            pass

    threading.Thread(target=read_from_container, daemon=True).start()
    threading.Thread(target=write_to_container, daemon=True).start()

    receive_task = asyncio.create_task(websocket.receive())
    output_task = asyncio.create_task(outgoing.get())
    try:
        while True:
            done, _ = await asyncio.wait((receive_task, output_task), return_when=asyncio.FIRST_COMPLETED)
            if output_task in done:
                data = output_task.result()
                if data is None:
                    break
                await websocket.send_bytes(data)
                output_task = asyncio.create_task(outgoing.get())
            if receive_task in done:
                message = receive_task.result()
                if message["type"] == "websocket.disconnect":
                    break
                data = message.get("bytes")
                if data is None:
                    data = message.get("text", "").encode()
                incoming.put(data)
                receive_task = asyncio.create_task(websocket.receive())
    except WebSocketDisconnect:
        pass
    finally:
        stopped.set()
        incoming.put(None)
        receive_task.cancel()
        output_task.cancel()
        docker_socket.close()


@app.post("/api/connectivity-check")
def connectivity_check():
    dns = run("client1", "dig +short www.example.test @192.168.30.30")
    http = run("client1", "curl -fsS --connect-timeout 3 http://www.example.test/")
    dns_ok = "192.168.30.40" in dns["output"] and dns["exit_code"] == 0
    http_ok = "Network Troubleshooting Training" in http["output"] and http["exit_code"] == 0
    return {"passed": dns_ok and http_ok, "dns": dns, "http": http}


@app.post("/api/fault/{fault}/inject")
def inject_fault(fault: str):
    if fault == "random":
        selected = random.choice(FAULTS)
        result = inject_known_fault(selected)
        return {"output": result.get("output", "")}
    return {"fault": fault, **inject_known_fault(fault)}


@app.post("/api/fault/{fault}/restore")
def restore_fault(fault: str):
    if fault == "default-route":
        return run("client1", "ip route replace default via 192.168.20.10")
    if fault == "static-route":
        return run("router3", "vtysh -c 'configure terminal' -c 'no ip route 192.168.20.0/24 192.168.13.100' -c 'ip route 192.168.20.0/24 192.168.13.10'")
    raise HTTPException(404, "不明な障害です")
