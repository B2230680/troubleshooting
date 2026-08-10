const output = document.querySelector('#output');
const target = document.querySelector('#target');
const command = document.querySelector('#command');
const prompt = document.querySelector('#prompt');
const result = document.querySelector('#result');
const targetState = document.querySelector('#target-state');
let terminalSocket;
const decoder = new TextDecoder();
//const ansiUp = new AnsiUp();

const commandHelp = window.commandHelp || [];

function showCommandHelp(item) {
  document.querySelector('#command-title').textContent = item.title;
  const helpContent = document.querySelector('#help-content');
  helpContent.replaceChildren();
  const commandCode = document.createElement('code');
  commandCode.textContent = item.command;
  const description = document.createElement('p');
  description.textContent = item.description;
  helpContent.append(commandCode, description);
}

function setupQuickCommands() {
  const quickCommands = document.querySelector('.quick-commands');
  commandHelp.forEach(item => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = item.label;
    button.addEventListener('click', () => {
      showCommandHelp(item);
      command.value = item.command;
      command.focus();
    });
    quickCommands.append(button);
  });
  if (commandHelp[0]) showCommandHelp(commandHelp[0]);
}

function append(text) {
  //const html = ansiUp.ansi_to_html(text);
  // ANSIエスケープシーケンス（色やカーソル制御コード）を自動で消去する
  const cleanText = text.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
  output.textContent += cleanText;
  output.scrollTop = output.scrollHeight;
}

async function api(path, options = {}) {
  const response = await fetch(path, {headers: {'Content-Type': 'application/json'}, ...options});
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || '操作に失敗しました');
  return data;
}

function connectTerminal() {
  if (terminalSocket) terminalSocket.close();
  output.textContent = `Network Troubleshooting Lab terminal\n${target.value} に対話シェルを接続中…\n`;
  targetState.textContent = '接続中…';
  const scheme = location.protocol === 'https:' ? 'wss' : 'ws';
  terminalSocket = new WebSocket(`${scheme}://${location.host}/api/terminal/${target.value}`);
  terminalSocket.binaryType = 'arraybuffer';
  terminalSocket.onopen = () => {
    targetState.textContent = '対話接続中';
    command.focus();
  };
  terminalSocket.onmessage = event => {
    append(typeof event.data === 'string' ? event.data : decoder.decode(event.data, {stream: true}));
  };
  terminalSocket.onclose = () => { targetState.textContent = '切断'; };
  terminalSocket.onerror = () => { append('\n[ターミナル接続エラー]\n'); };
}

function sendTerminal(data) {
  if (!terminalSocket || terminalSocket.readyState !== WebSocket.OPEN) {
    append('\nError: ターミナルは未接続です。\n');
    return;
  }
  terminalSocket.send(data);
}

document.querySelector('#terminal-form').addEventListener('submit', event => {
  event.preventDefault();
  const value = command.value;
  if (value) sendTerminal(`${value}\n`);
  command.value = '';
});
command.addEventListener('keydown', event => {
  if (!event.ctrlKey) return;
  const controls = {c: '\x03', d: '\x04', l: '\x0c'};
  const control = controls[event.key.toLowerCase()];
  if (control) {
    event.preventDefault();
    sendTerminal(control);
  }
});
target.addEventListener('change', () => {
  prompt.textContent = `${target.value} $`;
  connectTerminal();
});
document.querySelector('#clear').onclick = () => { output.textContent = ''; command.focus(); };
setupQuickCommands();

async function fault(action) {
  try {
    const data = await api(`/api/fault/${action.fault}/${action.mode}`, {method:'POST'});
    const selected = data.fault ? ` (${data.fault})` : '';
    append(`\n[${action.label}${selected}]\n${data.output || '(完了)'}\n`);
    result.textContent = `${action.label}${selected} を実行しました。`;
    result.className = 'result';
  } catch(e) {
    result.textContent = e.message;
    result.className = 'result fail';
  }
}
document.querySelector('#inject-default').onclick = () => fault({fault:'default-route' , mode:'inject', label:'デフォルト経路の障害注入'});
document.querySelector('#inject-static').onclick = () => fault({fault:'static-route', mode:'inject', label:'静的経路の障害注入'});
//document.querySelector('#restore-default').onclick = () => fault({fault:'default-route', mode:'restore', label:'デフォルト経路の復旧'});
//document.querySelector('#restore-static').onclick = () => fault({fault:'static-route', mode:'restore', label:'静的経路の復旧'});
document.querySelector('#inject-random').onclick = () => fault({fault:'random', mode:'inject', label:'ランダム障害生成'});
document.querySelector('#check').onclick = async () => {
  result.textContent = '疎通を確認中…';
  result.className = 'result';
  try {
    const data = await api('/api/connectivity-check', {method:'POST'});
    append(`\n[疎通確認: DNS]\n${data.dns.output}\n[疎通確認: HTTP]\n${data.http.output}\n`);
    result.textContent = data.passed ? '演習完了: DNS と Web サーバーへの通信を確認しました。' : '未完了: DNS または HTTP 通信に失敗しています。診断して障害を修正してください。';
    result.className = `result ${data.passed ? 'success' : 'fail'}`;
  } catch(e) {
    result.textContent = e.message;
    result.className = 'result fail';
  }
};
async function refreshStatus() {
  try {
    const states = await api('/api/status');
    const active = Object.entries(states).filter(([,v]) => v === 'running').length;
    document.querySelector('#lab-status').textContent = `${active}/7 コンテナ稼働中`;
  } catch {
    document.querySelector('#lab-status').textContent = 'Docker 接続待機中';
  }
}
connectTerminal();
refreshStatus();
setInterval(refreshStatus, 5000);
