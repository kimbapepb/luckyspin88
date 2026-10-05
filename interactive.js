function escapeText(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
async function runProgress(button, progress, messages, onLine) {
  button.disabled = true;
  progress.hidden = false;
  progress.value = 0;
  for (let i = 0; i < messages.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 380));
    progress.value = (i + 1) / messages.length * 100;
    if (onLine) onLine(messages[i]);
  }
  button.disabled = false;
}

document.addEventListener('DOMContentLoaded', () => {
  const output = document.getElementById('consoleOutput');
  if (!output || !window.EPB) return;
  const form = document.getElementById('commandForm');
  const input = document.getElementById('commandInput');
  const history = []; let historyIndex = 0;
  function print(text) {
    const line = document.createElement('div');
    line.textContent = text;
    output.append(line);
    output.scrollTop = output.scrollHeight;
  }
  const boot = ['[BOOT] EPB Seoul / CYBER UNIT TERMINAL', '[CASE] EPB-LS88-2026 · LUCKYSPIN88 · Gangseo-gu', '[OK] Evidence registry mounted', '[OK] Case workflow loaded', '[READY] Type help to view available commands.'];
  let bootIndex = 0;
  const timer = setInterval(() => { print(boot[bootIndex++]); if (bootIndex === boot.length) clearInterval(timer); }, 180);
  const clock = document.getElementById('consoleClock');
  function updateClock() { clock.textContent = new Date().toLocaleTimeString('en-GB', {hour12:false}); }
  updateClock(); setInterval(updateClock, 1000);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const command = input.value.trim();
    if (!command) return;
    history.push(command); historyIndex = history.length;
    print('epb@seoul:~$ ' + command); input.value = '';
    const [verb, module] = command.toLowerCase().split(/\s+/);
    const routes = {overview:'dashboard',evidence:'evidence',database:'database',transactions:'transaction',logs:'logs',review:'EPB',termination:'terminate',access:'index'};
    if (verb === 'help') print('help          List commands\nstatus        Show case progress\nmodules       List operation modules\nopen <module> Open a module\nrun           Execute the current review action\nlogs          Show recent case events\nclear         Clear terminal output');
    else if (verb === 'clear') output.textContent = '';
    else if (verb === 'modules') print(Object.keys(routes).join('  '));
    else if (verb === 'open') { if (routes[module]) window.EPB.navigate(routes[module] + '.html'); else print('[ERROR] Unknown module. Type modules.'); }
    else if (verb === 'status') {
      print('TARGET: LUCKYSPIN88 | ' + (window.EPB.getState().terminated ? 'OFFLINE' : 'ONLINE'));
      window.EPB.getStages().forEach(([key,label]) => print('[' + (window.EPB.getState()[key] ? 'DONE' : 'WAIT') + '] ' + label));
    } else if (verb === 'logs') {
      if (!window.EPB.getState().events.length) print('[INFO] No case events recorded.');
      window.EPB.getState().events.slice(-10).forEach(ev => print(ev.time + ' ' + ev.text));
    } else if (verb === 'run') {
      const actions = {index:'login',evidence:'seal',database:'complete',transaction:'complete',logs:'complete',EPB:'approve',terminate:'terminate'};
      const action = document.getElementById(actions[window.EPB.getPage()]);
      if (!action) print('[INFO] Open an operation module first.');
      else if (action.disabled) print('[WAIT] Action unavailable. Use status to inspect prerequisites.');
      else { print('[EXEC] ' + action.textContent.trim()); action.click(); }
    } else print('[ERROR] Command not found. Type help.');
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') {e.preventDefault();historyIndex=Math.max(0,historyIndex-1);input.value=history[historyIndex]||'';}
    if (e.key === 'ArrowDown') {e.preventDefault();historyIndex=Math.min(history.length,historyIndex+1);input.value=history[historyIndex]||'';}
  });
  const message = document.getElementById('message');
  if (message) new MutationObserver(() => {if(message.textContent)print('[SYSTEM] '+message.textContent);}).observe(message,{childList:true,subtree:true,characterData:true});
});
