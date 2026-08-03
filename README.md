# Network Troubleshooting Lab

Docker 上のネットワーク障害対応演習を、ブラウザから操作するための環境です。

## 起動

Docker Desktop（WSL を使う場合は WSL integration を有効化）を起動してから、このディレクトリで実行します。

```bash
docker compose up -d --build
```

ブラウザで [http://localhost:8080](http://localhost:8080) を開きます。終了時は次を実行します。

```bash
docker compose down
```

## 画面操作

- 左上: client1 から DNS/Web へ向かうネットワーク構成図
- 左下: よく使う診断コマンドと解説。選択するとターミナル入力欄へ入ります。
- 右上: 障害注入、復旧、最終的な DNS + HTTP 疎通判定
- 右下: プルダウンで選んだ client / router / server コンテナ上でコマンドを実行するターミナル

合格条件は、client1 から `www.example.test` を DNS で解決し、HTTP で Web サーバーへ接続できることです。

> `lab-ui` は Docker ソケットをマウントして各演習コンテナでコマンドを実行します。ローカル学習用に限って使用し、外部ネットワークへ公開しないでください。
# troubleshooting_system
