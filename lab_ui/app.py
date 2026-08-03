import shlex
from pathlib import Path

import docker
from docker.errors import DockerException, NotFound
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field


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


@app.post("/api/connectivity-check")
def connectivity_check():
    dns = run("client1", "dig +short www.example.test @192.168.30.30")
    http = run("client1", "curl -fsS --connect-timeout 3 http://www.example.test/")
    dns_ok = "192.168.30.40" in dns["output"] and dns["exit_code"] == 0
    http_ok = "Network Troubleshooting Training" in http["output"] and http["exit_code"] == 0
    return {"passed": dns_ok and http_ok, "dns": dns, "http": http}


@app.post("/api/fault/{fault}/inject")
def inject_fault(fault: str):
    if fault == "default-route":
        return run("client1", "ip route del default")
    if fault == "static-route":
        return run("router3", "vtysh -c 'configure terminal' -c 'no ip route 192.168.20.0/24 192.168.13.10' -c 'ip route 192.168.20.0/24 192.168.13.100'")
    raise HTTPException(404, "不明な障害です")


@app.post("/api/fault/{fault}/restore")
def restore_fault(fault: str):
    if fault == "default-route":
        return run("client1", "ip route replace default via 192.168.20.10")
    if fault == "static-route":
        return run("router3", "vtysh -c 'configure terminal' -c 'no ip route 192.168.20.0/24 192.168.13.100' -c 'ip route 192.168.20.0/24 192.168.13.10'")
    raise HTTPException(404, "不明な障害です")
