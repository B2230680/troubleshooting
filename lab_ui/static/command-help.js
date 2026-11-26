// コマンド解説の設定です。ここに項目を追加・編集すると、解説とショートカットが画面に反映されます。
// command: 実行するコマンド、label: ボタン名、title: 解説の見出し、description: 解説本文
window.commandHelp = [
  {
    command: 'ping 192.168.30.40',
    label: 'ping',
    type: ['situation','survey','check'],
    description: `
<strong>＜使い方＞</strong>
ping ＜ipアドレス＞

<strong>＜オプション＞</strong>
-c <回数>　指定回数だけ送信する。
-i <秒数>　指定間隔で送信する。


<strong>＜何を確認できるか＞</strong>
・指定したipアドレスの機器から応答が返ってくるか。
・パケットの送信から応答までの時間。
・送信したパケットのうち、応答がなかった割合。

<strong>＜結果＞</strong>
<strong>成功</strong>
PING 192.168.30.40 (192.168.30.40) 56(84) bytes of data.
64 bytes from 192.168.30.40: icmp_seq=1 ttl=61 time=0.319 ms
64 bytes from 192.168.30.40: icmp_seq=2 ttl=61 time=0.425 ms
64 bytes from 192.168.30.40: icmp_seq=3 ttl=61 time=0.162 ms

--- 192.168.30.40 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 1998ms
rtt min/avg/max/mdev = 0.162/0.302/0.425/0.108 ms

応答が返ってきているため、対象機器まで通信ができている。

<strong>失敗１</strong>
ping 192.168.30.40
ping: connect: Network is unreachable

この宛先に送るためのネットワーク経路が存在しない可能性があります。
→ 通信先までの経路設定を確認しましょう。

<strong>失敗２</strong>
From 192.168.1.10 icmp_seq=1 Destination Host Unreachable

この宛先への通信に失敗しています。
→ 通信先までの経路設定や宛先ネットワークの状態を確認しましょう。

<strong>失敗３</strong>
PING 192.168.30.40 (192.168.30.40) 56(84) bytes of data.
^C
--- 192.168.30.40 ping statistics ---
6 packets transmitted, 0 received, 100% packet loss, time 5234ms

パケットが送信されたが、応答を受信できていません。
→ どの通信経路で、どこまでパケットが届いているかを確認しましょう。`,
  },
  {
    command: 'traceroute 192.168.30.40',
    label: 'traceroute',
    type: ['situation','suvey','check'],
    description: `
<strong>＜使い方＞</strong>
traceroute ＜ipアドレス＞

<strong>＜オプション＞</strong>
-n　　　　　 ipアドレスをホスト名に変換せずに表示する。
-m ＜回数＞　最大ホップ数を指定する。
-p ＜番号＞　使用する宛先ポート番号を指定する。
-I　　　　　 UDPからICMP ECHOを使用する。
-T　　　　　 UDPからTCP SYNを使用する。

<strong>＜何を確認できるか＞</strong>
・指定したipアドレスの機器までのネットワーク経路。
・各ホップにおける応答時間。

<strong>＜結果＞</strong>
<strong>成功</strong>
# traceroute 192.168.30.40
traceroute to 192.168.30.40 (192.168.30.40), 30 hops max, 60 byte packets
 1  192.168.20.10 (192.168.20.10)  4.424 ms  3.094 ms  1.947 ms
 2  192.168.12.10 (192.168.12.10)  1.845 ms  1.666 ms  1.605 ms
 3  192.168.13.20 (192.168.13.20)  1.575 ms  0.987 ms  0.920 ms
 4  192.168.30.40 (192.168.30.40)  0.837 ms  0.453 ms  0.336 ms

宛先ipアドレスから応答が返されており、通信経路と各ホップの応答時間が確認できています。

<strong>失敗1</strong>
# traceroute 192.168.30.40
traceroute to 192.168.30.40 (192.168.30.40), 30 hops max, 60 byte packets
 1  192.168.20.10 (192.168.20.10)  0.966 ms  0.052 ms  0.050 ms
 2  192.168.12.10 (192.168.12.10)  0.069 ms  0.021 ms  0.021 ms
 3  192.168.12.10 (192.168.12.10)  3066.954 ms !H  3066.848 ms !H  3066.813 ms !H

!Hは、Host Unreachableでホスト到達不能を示す応答を表します。
経路上の機器から、宛先ipアドレスに到達できないことを示す応答が返されています。
→　応答を返した機器のルーティングテーブルを確認し、宛先ネットワークへの経路設定や転送先を調べましょう。

<strong>失敗2</strong>
# traceroute 192.168.30.40
traceroute to 192.168.30.40 (192.168.30.40), 30 hops max, 60 byte packets
 1  192.168.20.10 (192.168.20.10)  0.914 ms  0.846 ms  0.833 ms
 2  192.168.12.10 (192.168.12.10)  0.822 ms  0.786 ms  0.769 ms
 3  192.168.20.1 (192.168.20.1)  0.754 ms  0.252 ms  0.206 ms
 4  * * *
 5  * * *

＊は規定時間内に応答を受信できなかったことを表します。
途中のルータが応答を返さない設定になっている場合や、通信経路に問題がある場合などに発生します。
→　ルータの状態や宛先ネットワークの経路設定を確認しましょう。

<strong>失敗3</strong>
# traceroute 192.168.30.40
traceroute to 192.168.30.40 (192.168.30.40), 30 hops max, 60 byte packets
connect: Network is unreachable

宛先への通信経路が見つからず、パケットを送信できない状態です。
送信元のルーティングテーブルに該当する経路がない場合などに発生します。
→　送信元のルーティングテーブルを確認し、宛先ネットワークへの経路やデフォルトルートの設定を調べましょう。
`,
  },
  {
    command: 'dig example.test',
    label: 'dig',
    type: ['situation','survey','check'],
    description: '名前から IP アドレスを引けるかを確認します。client1 は DNS サーバー 192.168.30.30 を使います。',
  },
  {
    command: 'curl -i http://www.example.test/',
    label: 'curl',
    type: ['situation','survey','check'],
    description: '名前解決後に Web サーバーまで到達し、HTTP 応答を得られるか確認します。',
  },
  {
    command: 'ip route',
    label: 'ip route',
    type: ['survey','fix'],
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
    type: ['situation','survey'],
    description: 'ルータに設定されているルーティングテーブルを表示します。',
  },
  {
    command: 'nslookup',
    label: 'nslookup',
    type: ['situation','check'],
    description:``,
  },
  {
    command: 'ip addr',
    label: 'ip addr',
    type: ['survey','fix'],
    description:``,
  },
  {
    command: 'ip link',
    label: 'ip link',
    type: ['survey','fix'],
    description:``,
  },
  {
    command: 'show interface',
    label: 'show interface',
    type: ['situation','survey'],
    description:``,
  },
  {
    command: 'nginx',
    label: 'nginx',
    type: ['fix'],
    description:``,
  },
];
