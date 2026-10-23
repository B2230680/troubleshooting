// コマンド解説の設定です。ここに項目を追加・編集すると、解説とショートカットが画面に反映されます。
// command: 実行するコマンド、label: ボタン名、title: 解説の見出し、description: 解説本文
window.commandHelp = [
  {
    command: 'ping 192.168.30.40',
    label: 'ping',
    type: ['situation','survey','check'],
    description: `ICMP で宛先 IP への到達性を確認します。名前解決を除外した IP レベルの切り分けに使えます。

<strong>＜オプション＞</strong>
-c　指定回数だけ送信する
-i　指定間隔で送信する


<strong>＜なぜ使う＞</strong>
指定したipアドレスの機器まで通信を確認する。

<strong>＜結果＞</strong>
成功
PING 192.168.30.40 (192.168.30.40) 56(84) bytes of data.
64 bytes from 192.168.30.40: icmp_seq=1 ttl=61 time=0.319 ms
64 bytes from 192.168.30.40: icmp_seq=2 ttl=61 time=0.425 ms
64 bytes from 192.168.30.40: icmp_seq=3 ttl=61 time=0.162 ms

--- 192.168.30.40 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 1998ms
rtt min/avg/max/mdev = 0.162/0.302/0.425/0.108 ms

失敗
ping 192.168.30.40
ping: connect: Network is unreachable

PING 192.168.30.40 (192.168.30.40) 56(84) bytes of data.
^C
--- 192.168.30.40 ping statistics ---
6 packets transmitted, 0 received, 100% packet loss, time 5234ms`,

  },
  {
    command: 'traceroute -n 192.168.30.40',
    label: 'traceroute',
    title: '経路を追跡する',
    description: 'パケットが通るルータを順に表示します。どこで通信が途切れるかを特定できます。',
  },
  {
    command: 'dig example.test',
    label: 'dig',
    title: 'DNS を確認する',
    description: '名前から IP アドレスを引けるかを確認します。client1 は DNS サーバー 192.168.30.30 を使います。',
  },
  {
    command: 'curl -i http://www.example.test/',
    label: 'curl Web',
    title: 'HTTP を確認する',
    description: '名前解決後に Web サーバーまで到達し、HTTP 応答を得られるか確認します。',
  },
  {
    command: 'ip route',
    label: 'ip route',
    type: 'router',
    description: `ルーティングテーブルを表示します。デフォルトゲートウェイと宛先ネットワークへの経路を確認します。`,
  },
  {
    command: "vtysh -c 'show ip route'",
    label: 'FRR route',
    title: 'ルータの経路を確認する',
    description: 'FRRouting のルーティング情報を確認・修正するためのコマンドです。',
  },
 {
    command: 'show ip route',
    label: 'show ip route',
    title: 'ルータの経路設定を確認する。',
    description: 'ルータに設定されているルーティングテーブルを表示します。',
  },
];
