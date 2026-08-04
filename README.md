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
- 右下: プルダウンで選んだ client / router / server コンテナに `docker exec -it <container> /bin/sh` 相当で接続する対話ターミナル。接続中は `cd`、環境変数、対話コマンドの状態が維持され、`Ctrl+C` / `Ctrl+D` も使えます。
- 演習メニュー: 「ランダム障害生成」は、デフォルト経路断または Router3 の静的経路破損をランダムに一つ注入します。実行した障害種別は画面の結果欄に表示されます。

合格条件は、client1 から `www.example.test` を DNS で解決し、HTTP で Web サーバーへ接続できることです。

> `lab-ui` は Docker ソケットをマウントして各演習コンテナでコマンドを実行します。ローカル学習用に限って使用し、外部ネットワークへ公開しないでください。
# troubleshooting_system
