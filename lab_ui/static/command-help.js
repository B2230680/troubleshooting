// コマンド解説の設定です。ここに項目を追加・編集すると、解説とショートカットが画面に反映されます。
// command: 実行するコマンド、label: ボタン名、title: 解説の見出し、description: 解説本文
window.commandHelp = [
  {
    command: 'ip route',
    label: 'ip route',
    title: '経路を確認する',
    description: 'ルーティングテーブルを表示します。デフォルトゲートウェイと宛先ネットワークへの経路を確認します。',
  },
  {
    command: 'ping -c 3 192.168.30.40',
    label: 'ping Web',
    title: 'IP 疎通を確認する',
    description: 'ICMP で宛先 IP への到達性を確認します。名前解決を除外した IP レベルの切り分けに使えます。',
  },
  {
    command: 'traceroute -n 192.168.30.40',
    label: 'traceroute',
    title: '経路を追跡する',
    description: 'パケットが通るルータを順に表示します。どこで通信が途切れるかを特定できます。',
  },
  {
    command: 'dig www.example.test',
    label: 'dig DNS',
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
    command: "vtysh -c 'show ip route'",
    label: 'FRR route',
    title: 'ルータの経路を確認する',
    description: 'FRRouting のルーティング情報を確認・修正するためのコマンドです。',
  },
];
