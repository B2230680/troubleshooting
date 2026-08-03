const output = document.querySelector('#output');
const target = document.querySelector('#target');
const command = document.querySelector('#command');
const prompt = document.querySelector('#prompt');
const result = document.querySelector('#result');

const explanations = {
  'ip route': ['経路を確認する', 'ルーティングテーブルを表示します。デフォルトゲートウェイと宛先ネットワークへの経路を確認します。'],
  'ping': ['IP 疎通を確認する', 'ICMP で宛先 IP への到達性を確認します。名前解決を除外した IP レベルの切り分けに使えます。'],
  'traceroute': ['経路を追跡する', 'パケットが通るルータを順に表示します。どこで通信が途切れるかを特定できます。'],
  'dig': ['DNS を確認する', '名前から IP アドレスを引けるかを確認します。client1 は DNS サーバー 192.168.30.30 を使います。'],
  'curl': ['HTTP を確認する', '名前解決後に Web サーバーまで到達し、HTTP 応答を得られるか確認します。'],
  'vtysh': ['ルータの経路を確認する', 'FRRouting のルーティング情報を確認・修正するためのコマンドです。'],
};

function append(text) { output.textContent += text; output.scrollTop = output.scrollHeight; }
async function api(path, options = {}) {
  const response = await fetch(path, {headers: {'Content-Type': 'application/json'}, ...options});
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || '操作に失敗しました');
  return data;
}
async function execute(value) {
  const destination = target.value;
  append(`\n${destination} $ ${value}\n`);
  try { const data = await api('/api/command', {method:'POST', body:JSON.stringify({target:destination, command:value})}); append(data.output + (data.output.endsWith('\n') ? '' : '\n')); }
  catch (error) { append(`Error: ${error.message}\n`); }
}
document.querySelector('#terminal-form').addEventListener('submit', event => { event.preventDefault(); const value = command.value.trim(); if (value) { execute(value); command.value = ''; } });
target.addEventListener('change', () => { prompt.textContent = `${target.value} $`; document.querySelector('#target-state').textContent = '選択中'; });
document.querySelector('#clear').onclick = () => output.textContent = '';
document.querySelectorAll('[data-command]').forEach(button => button.onclick = () => { const value = button.dataset.command; const key = Object.keys(explanations).find(k => value.startsWith(k)); if (key) { document.querySelector('#command-title').textContent = explanations[key][0]; document.querySelector('#help-content').innerHTML = `<code>${value}</code><p>${explanations[key][1]}</p>`; } command.value = value; command.focus(); });
async function fault(action) { try { const data = await api(`/api/fault/${action.fault}/${action.mode}`, {method:'POST'}); append(`\n[${action.label}]\n${data.output}\n`); result.textContent = `${action.label} を実行しました。`; result.className = 'result'; } catch(e) { result.textContent = e.message; result.className = 'result fail'; } }
document.querySelector('#inject-default').onclick = () => fault({fault:'default-route', mode:'inject', label:'デフォルト経路の障害注入'});
document.querySelector('#inject-static').onclick = () => fault({fault:'static-route', mode:'inject', label:'静的経路の障害注入'});
document.querySelector('#restore-default').onclick = () => fault({fault:'default-route', mode:'restore', label:'デフォルト経路の復旧'});
document.querySelector('#restore-static').onclick = () => fault({fault:'static-route', mode:'restore', label:'静的経路の復旧'});
document.querySelector('#check').onclick = async () => { result.textContent = '疎通を確認中…'; result.className = 'result'; try { const data = await api('/api/connectivity-check', {method:'POST'}); append(`\n[疎通確認: DNS]\n${data.dns.output}\n[疎通確認: HTTP]\n${data.http.output}\n`); result.textContent = data.passed ? '演習完了: DNS と Web サーバーへの通信を確認しました。' : '未完了: DNS または HTTP 通信に失敗しています。診断して障害を修正してください。'; result.className = `result ${data.passed ? 'success' : 'fail'}`; } catch(e) { result.textContent = e.message; result.className = 'result fail'; } };
async function refreshStatus() { try { const states = await api('/api/status'); const active = Object.entries(states).filter(([,v]) => v === 'running').length; document.querySelector('#lab-status').textContent = `${active}/7 コンテナ稼働中`; } catch { document.querySelector('#lab-status').textContent = 'Docker 接続待機中'; } }
refreshStatus(); setInterval(refreshStatus, 5000);
