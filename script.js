(() => {
const key = 'epb-ls88-case-v2';
const initial = () => ({authenticated:false,evidence:false,database:false,transaction:false,logs:false,submitted:false,approved:false,terminated:false,archived:false,exhibits:[],notes:'',events:[]});
let state;
try {
  const shared = (location.hash || '').startsWith('#case=') ? decodeURIComponent(location.hash.slice(6)) : sessionStorage.getItem(key) || '{}';
  state = {...initial(), ...JSON.parse(shared)};
} catch { state = initial(); }
function requiredPage(target) {
  const gates = {database:'evidence',transaction:'database',logs:'transaction',EPB:'logs',terminate:'approved',ending:'terminated'};
  const fallback = {evidence:'evidence',database:'database',transaction:'transaction',logs:'logs',approved:'EPB',terminated:'terminate'};
  const requirement = gates[target];
  if (!requirement || state[requirement]) return target;
  return requiredPage(fallback[requirement]);
}
function navigate(url) {
  const target = url.replace('.html','');
  if (target !== 'index') {
    if (!state.authenticated) { location.href='index.html'; return; }
    const allowed = requiredPage(target);
    if (allowed !== target) url = allowed + '.html';
  }
  location.href = url + '#case=' + encodeURIComponent(JSON.stringify(state));
}
document.addEventListener('click', e => {
  const link = e.target.closest && e.target.closest('a[href]');
  if (!link || !/^[A-Za-z]+\.html$/.test(link.getAttribute('href')) || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
  e.preventDefault(); navigate(link.getAttribute('href'));
});
const page = document.body.dataset.page;
if (page === 'index') { state = initial(); try { sessionStorage.removeItem(key); localStorage.removeItem(key); } catch {} }
if (page !== 'index' && (!state.authenticated || (page === 'ending' && !state.terminated))) {
  location.replace('index.html'); return;
}
if (state.terminated && page !== 'index' && page !== 'ending') { navigate('ending.html'); return; }
if (page !== 'index' && requiredPage(page) !== page) { navigate(requiredPage(page) + '.html'); return; }
document.documentElement.style.visibility = 'visible';
window.EPB = { getState: () => state, navigate, getPage: () => page, getStages: () => stages };
if (page === 'ending') return;
const $ = id => document.getElementById(id);
function persist() { try { sessionStorage.setItem(key, JSON.stringify(state)); } catch { message('Browser storage unavailable; keep this tab open.'); } }
function event(text) { state.events.push({time:new Date().toISOString(),text}); persist(); }
function message(text) { if ($('message')) $('message').textContent = text; }
const stages = [['evidence','Evidence sealed','evidence.html'],['database','Database reviewed','database.html'],['transaction','Transactions correlated','transaction.html'],['logs','Logs reviewed','logs.html'],['approved','Review approved','EPB.html'],['terminated','Termination verified','terminate.html'],['archived','Case closed','ending.html']];
const reviewed = () => ['evidence','database','transaction','logs'].every(k => state[k]);
function checklist(list) { return list.map(([k,label,url]) => `<div class="step"><a href="${url}">${escapeText(label)}</a><span class="${state[k]?'complete':'pending'}">${state[k]?'Complete':'Pending'}</span></div>`).join(''); }
function render() {
  if ($('platformStatus')) $('platformStatus').textContent = state.terminated ? 'OFFLINE' : 'ONLINE';
  if ($('readiness')) $('readiness').textContent = stages.filter(([k]) => state[k]).length + ' / 7';
  if ($('roadmap')) $('roadmap').innerHTML = checklist(stages);
  if ($('requirements')) $('requirements').innerHTML = checklist(stages.slice(0,5));
  if ($('reviewStatus')) $('reviewStatus').innerHTML = checklist(stages.slice(0,5)) + `<p>${state.terminated?'Outcome verified for this operation. Ready for archive.':'Awaiting verified termination before case closure.'}</p>`;
  if ($('recent')) $('recent').innerHTML = state.events.length ? state.events.slice(-12).reverse().map(e => `<div class="event"><time>${escapeText(new Date(e.time).toLocaleString())}</time>${escapeText(e.text)}</div>`).join('') : '<p>No case actions recorded yet.</p>';
  if ($('archive')) $('archive').disabled = !state.terminated || state.archived;
  if ($('approve')) $('approve').disabled = !reviewed() || state.approved;
  if ($('terminate')) $('terminate').disabled = !state.approved || !reviewed() || state.terminated;
}
const nav = [['index','Access'],['dashboard','Overview'],['evidence','Evidence'],['database','Database'],['transaction','Transactions'],['logs','Logs'],['EPB','Review bureau'],['terminate','Termination']];
$('navigation').innerHTML = nav.map(([id,label]) => `<a href="${id}.html" class="${id===page?'active':''}" ${id===page?'aria-current="page"':''}>${label}</a>`).join('');
if ($('login')) { const login = () => { if ($('password').value==='notredame') { state.authenticated=true;event('Console accessed'); navigate('dashboard.html'); } else { message('Authorization key incorrect.'); } }; $('login').onclick=login; $('password').onkeydown=e => { if(e.key==='Enter') login(); }; }
if (page==='evidence') {
  document.querySelectorAll('[data-exhibit]').forEach(input => { input.checked=state.exhibits.includes(input.dataset.exhibit); input.onchange=() => { state.exhibits=[...document.querySelectorAll('[data-exhibit]:checked')].map(i=>i.dataset.exhibit); persist(); }; });
  $('seal').onclick=async () => { if (state.evidence) return message('Evidence package already sealed.'); if(state.exhibits.length!==4) return message('Review all four exhibits first.'); await runProgress($('seal'),$('progress'),['Validating exhibit references','Checking package completeness','Sealing case evidence'],message); state.evidence=true; event('Four-exhibit evidence package sealed'); message('Evidence sealed.'); render();navigate('database.html'); };
}
if (page==='database' || page==='transaction') {
  const rows=[...document.querySelectorAll('table tr')].slice(1);
  rows.forEach(row => { row.dataset.record='true'; row.tabIndex=0; row.setAttribute('role','button'); row.setAttribute('aria-label','Inspect '+row.cells[1].textContent); const select=() => { rows.forEach(r=>r.classList.remove('selected')); row.classList.add('selected'); $('selection').textContent=[...row.cells].map(c=>c.textContent).join(' · '); }; row.onclick=select; row.onkeydown=e => { if(e.key==='Enter'||e.key===' ') {e.preventDefault();select();} }; });
  $('search').oninput=e => rows.forEach(row=>row.hidden=!row.textContent.toLowerCase().includes(e.target.value.toLowerCase()));
  $('complete').onclick=() => { if(!state.evidence) return message('Seal the evidence package first.'); if(page==='transaction'&&!state.database) return message('Complete the database review first.'); if(state[page]) return message('This review is already complete.'); state[page]=true; event(page==='database'?'Operational account snapshot reviewed':'Transaction snapshot correlated; high-risk records documented'); message('Review complete.');render();navigate(page==='database'?'transaction.html':'logs.html'); };
}
if(page==='logs') $('complete').onclick=() => { if(!state.transaction) return message('Complete transaction correlation first.'); if(state.logs) return message('Log review already complete.'); state.logs=true;event('Security logs correlated with the case exhibits');message('Log review complete.');render();navigate('EPB.html'); };
if(page==='EPB') {
  $('approve').onclick=() => {if(!reviewed())return message('Complete all case reviews first.');if(!$('approvalCheck').checked)return message('Confirm that you reviewed the package.');state.approved=true;event('EPB approval recorded for termination');message('Approved.');render();navigate('terminate.html');};
}
if(page==='terminate') {
  if(state.terminated) message('Termination already verified. Proceed to archival.');
  $('terminate').onclick=async () => {if(!state.approved||!reviewed())return message('Complete reviews and obtain EPB approval first.');if($('confirm').value.trim()!=='LUCKYSPIN88')return message('Enter the exact target name to proceed.');$('execution').textContent='';const lines=['Evidence package preserved','Service suspension recorded','Transaction-channel restrictions recorded','Administrative access suspension recorded','Operation platform status verified: OFFLINE'];await runProgress($('terminate'),$('progress'),lines,line=>{const div=document.createElement('div');div.textContent='✓ '+line;$('execution').append(div);event(line);});state.terminated=true;state.archived=true;event('Termination completed; case closed');render();navigate('ending.html');};
}
render();

})();
