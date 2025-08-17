/* ---------------------------
   Ritters OS — Full Demo (single file)
   - Demo messages (localStorage)
   - Live backgrounds saved
   - All apps working locally
--------------------------- */

/* CONFIG */
const USERS_KEY = 'ritters_users';
const CURRENT_USER_KEY = 'ritters_currentUser';
const WEATHER_API_KEY = 'bc35dc734bb6fb3c973c5c4de9d0c0e2'; // your existing key

/* UTIL */
const $ = id => document.getElementById(id);
function loadUsers(){ return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); }
function saveUsers(u){ localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
function ukey(k){
  // guard if no current user
  const u = currentUser || 'anon';
  return `${u}::${k}`;
}
function userGet(k, fallback){
  try {
    const val = localStorage.getItem(ukey(k));
    return val ? JSON.parse(val) : fallback;
  } catch(e){
    return fallback;
  }
}
function userSet(k, value){ localStorage.setItem(ukey(k), JSON.stringify(value)); }

/* HASH password using SubtleCrypto SHA-256 -> hex */
async function hashPassword(pw){
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(pw));
  const arr = Array.from(new Uint8Array(buf));
  return arr.map(b => b.toString(16).padStart(2,'0')).join('');
}

/* small helper to escape HTML (fixed to proper entities) */
function escapeHtml(str){
  if(str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* current user */
let currentUser = localStorage.getItem(CURRENT_USER_KEY) || null;

/* Everything that touches DOM should run after DOM is ready */
document.addEventListener('DOMContentLoaded', () => {

  /* AUTH element refs - safe to query now */
  const authModal = $('authModal'), authUser = $('authUser'), authPass = $('authPass'), authBio = $('authBio'), authPic = $('authPic');
  const authPreview = $('authPreview'), authMessage = $('authMessage');

  /* preview clear and preview change (safe-guard with optional chaining) */
  $('previewClear')?.addEventListener('click', ()=> { if(authPreview) authPreview.src = ''; if(authPic) authPic.value = ''; });
  authPic?.addEventListener('change', (e)=>{ const f = e.target.files && e.target.files[0]; if(!f){ if(authPreview) authPreview.src=''; return; } const r=new FileReader(); r.onload = ()=> { if(authPreview) authPreview.src = r.result; }; r.readAsDataURL(f); });

  function showAuth(msg=''){ if(authMessage) authMessage.textContent = msg; if(authModal) authModal.style.display = 'flex'; }
  function hideAuth(){ if(authModal) authModal.style.display = 'none'; if(authMessage) authMessage.textContent = ''; }

  /* nav */
  const navButtons = document.querySelectorAll('nav button');
  const sections = document.querySelectorAll('main section');
  function setActiveTab(tab){
    navButtons.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    sections.forEach(s => s.id === `tab-${tab}` ? s.classList.add('active') : s.classList.remove('active'));
    window.scrollTo({top:0, behavior:'smooth'});
  }
  navButtons.forEach(b => b.addEventListener('click', ()=> setActiveTab(b.dataset.tab)));
  window.navTo = function(t){ setActiveTab(t); };

  /* logout */
  function logout(){
    localStorage.removeItem(CURRENT_USER_KEY);
    currentUser = null;
    showAuth('Signed out. Please sign in.');
    renderSignedOutUI();
  }
  $('logoutBtn')?.addEventListener('click', logout);
  $('logoutBtnAside')?.addEventListener('click', logout);

  /* theme toggle */
  $('themeToggle')?.addEventListener('click', ()=>{
    const curBg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    if(curBg === '#fff'){ document.documentElement.style.setProperty('--bg','#071018'); document.documentElement.style.setProperty('--text','#e9f2ff'); }
    else { document.documentElement.style.setProperty('--bg','#fff'); document.documentElement.style.setProperty('--text','#111'); }
  });

  /* auth actions */
  $('signupBtn')?.addEventListener('click', async ()=>{
    const name = authUser.value.trim(); const pw = authPass.value;
    if(!name||!pw){ if(authMessage) authMessage.textContent='Username and password required.'; return; }
    if(/\s/.test(name)){ if(authMessage) authMessage.textContent='No spaces allowed in username.'; return; }
    const users = loadUsers();
    if(users[name]){ if(authMessage) authMessage.textContent='Username taken.'; return; }
    const hash = await hashPassword(pw);
    users[name] = { passwordHash: hash, bio: authBio?.value||'', pic: authPreview?.src||'', joined: new Date().toISOString() };
    saveUsers(users);
    localStorage.setItem(CURRENT_USER_KEY, name);
    initForUser();
    hideAuth();
  });

  $('loginBtn')?.addEventListener('click', async ()=>{
    const name = authUser.value.trim(), pw = authPass.value;
    if(!name||!pw){ if(authMessage) authMessage.textContent='Username and password required.'; return; }
    const users = loadUsers();
    if(!users[name]){ if(authMessage) authMessage.textContent='No such user.'; return; }
    const hash = await hashPassword(pw);
    if(hash !== users[name].passwordHash){ if(authMessage) authMessage.textContent='Invalid credentials.'; return; }
    localStorage.setItem(CURRENT_USER_KEY, name);
    initForUser();
    hideAuth();
  });

  $('demoBtn')?.addEventListener('click', ()=>{
    const users = loadUsers();
    if(!users.demo){ users.demo = { passwordHash: '', bio:'Demo user', pic:'', joined:new Date().toISOString() }; saveUsers(users); }
    localStorage.setItem(CURRENT_USER_KEY, 'demo');
    initForUser(); hideAuth();
  });

  $('closeAuth')?.addEventListener('click', ()=> { if(!currentUser) return; hideAuth(); });
  $('forgotBtn')?.addEventListener('click', ()=> { alert('No server reset — this is local-only. Create a new account if needed.'); });

  /* signed out/in UI */
  function renderSignedOutUI(){
    $('welcomeText') && ($('welcomeText').textContent = 'Please sign in');
    $('logoutBtn') && ($('logoutBtn').style.display = 'none');
    $('currentUserLabel') && ($('currentUserLabel').textContent = '');
    $('asideName') && ($('asideName').textContent = '');
    $('asideBio') && ($('asideBio').textContent = '');
    $('asidePic') && ($('asidePic').src = '');
    $('profilePic') && ($('profilePic').src = '');
    $('profileName') && ($('profileName').textContent = '');
    $('profileJoined') && ($('profileJoined').textContent = '');
  }
  function renderSignedInUI(userObj){
    $('welcomeText') && ($('welcomeText').textContent = `Welcome, ${currentUser}`);
    $('logoutBtn') && ($('logoutBtn').style.display = 'inline-block');
    $('currentUserLabel') && ($('currentUserLabel').textContent = currentUser);
    $('asideName') && ($('asideName').textContent = currentUser);
    $('asideBio') && ($('asideBio').textContent = userObj.bio || '');
    $('asidePic') && ($('asidePic').src = userObj.pic || '');
    $('profilePic') && ($('profilePic').src = userObj.pic || '');
    $('profileName') && ($('profileName').textContent = currentUser);
    $('profileJoined') && ($('profileJoined').textContent = 'Joined: ' + new Date(userObj.joined).toLocaleDateString());
  }

  /* init after login */
  function initForUser(){
    currentUser = localStorage.getItem(CURRENT_USER_KEY);
    const users = loadUsers();
    const me = users[currentUser] || { bio:'', pic:'', joined:new Date().toISOString(), passwordHash:'' };
    renderSignedInUI(me);
    renderAllUserData();
    hideAuth();
  }

  /* show auth if no user */
  if(!currentUser){ showAuth(); renderSignedOutUI(); } else { initForUser(); }

  /* ------------------ Journal ------------------ */
  function renderJournalList(){
    const list = userGet('journal', []);
    const container = $('journalList');
    if(!container) return;
    container.innerHTML = list.map(item => `
      <div class="card">
        <div style="display:flex;justify-content:space-between">
          <strong>${escapeHtml(item.title) || '(no title)'}</strong>
          <small class="small">${new Date(item.created).toLocaleString()}</small>
        </div>
        <div style="margin-top:8px">${escapeHtml(item.body||'').replace(/\n/g,'<br>')}</div>
        <div style="margin-top:8px"><button class="btn alt" onclick="deleteJournal(${item.id})">Delete</button></div>
      </div>
    `).join('');
  }
  window.deleteJournal = function(id){
    if(!currentUser){ alert('Log in first'); return; }
    let arr = userGet('journal', []);
    arr = arr.filter(i => i.id !== id);
    userSet('journal', arr); renderJournalList(); renderStats();
  };
  $('saveJournalBtn')?.addEventListener('click', ()=>{
    if(!currentUser){ alert('Log in first'); return; }
    const title = $('journalTitle')?.value.trim() || '', body = $('journalBody')?.value.trim() || '';
    if(!title && !body){ alert('Write something'); return; }
    const arr = userGet('journal', []); arr.unshift({ id: Date.now(), title, body, created: new Date().toISOString() });
    userSet('journal', arr);
    if($('journalTitle')) $('journalTitle').value='';
    if($('journalBody')) $('journalBody').value='';
    renderJournalList(); renderStats();
  });
  $('clearJournalBtn')?.addEventListener('click', ()=>{ if(!currentUser) return alert('Log in first'); if(confirm('Clear all journal entries?')){ userSet('journal', []); renderJournalList(); renderStats(); } });

  /* ------------------ Notes ------------------ */
  function renderNotesList(){
    const arr = userGet('notes', []);
    const container = $('notesList');
    if(!container) return;
    container.innerHTML = arr.map(n => `
      <div class="card">
        <div style="display:flex;justify-content:space-between"><strong>${escapeHtml(n.t)||'(no title)'}</strong><small class="small">${new Date(n.created).toLocaleString()}</small></div>
        <div style="margin-top:8px">${escapeHtml(n.b||'').replace(/\n/g,'<br>')}</div>
        <div style="margin-top:8px"><button class="btn alt" onclick="deleteNote(${n.id})">Delete</button></div>
      </div>
    `).join('');
  }
  window.deleteNote = function(id){
    if(!currentUser) return alert('Log in first');
    let arr = userGet('notes', []);
    arr = arr.filter(n => n.id !== id);
    userSet('notes', arr); renderNotesList(); renderStats();
  };
  $('saveNoteBtn')?.addEventListener('click', ()=>{
    if(!currentUser) return alert('Log in first');
    const t = $('noteTitle')?.value.trim() || '', b = $('noteBody')?.value.trim() || '';
    if(!t && !b) return alert('Write a note.');
    const arr = userGet('notes', []); arr.unshift({ id: Date.now(), t, b, created: new Date().toISOString() });
    userSet('notes', arr);
    if($('noteTitle')) $('noteTitle').value='';
    if($('noteBody')) $('noteBody').value='';
    renderNotesList(); renderStats();
  });
  $('clearNotesBtn')?.addEventListener('click', ()=>{ if(!currentUser) return alert('Log in first'); if(confirm('Clear all notes?')){ userSet('notes', []); renderNotesList(); renderStats(); } });

  /* ------------------ Calendar ------------------ */
  function renderEvents(){
    const events = userGet('events', {});
    const keys = Object.keys(events).sort();
    const container = $('calendarEventsList');
    if(!container) return;
    container.innerHTML = keys.map(d => `
      <div class="card"><div style="display:flex;justify-content:space-between"><strong>${escapeHtml(d)}</strong><small class="small">${events[d].length} event(s)</small></div>
      <div style="margin-top:8px">${events[d].map(ev => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid rgba(255,255,255,0.01)">${escapeHtml(ev.title)}<button class="btn alt" onclick="deleteEvent('${d}',${ev.id})">Delete</button></div>`).join('')}</div></div>
    `).join('');
  }
  $('saveEventBtn')?.addEventListener('click', ()=>{
    if(!currentUser) return alert('Log in first');
    const date = $('eventDate')?.value, title = $('eventTitle')?.value.trim() || '';
    if(!date || !title) return alert('Pick date and title');
    const events = userGet('events', {}); if(!events[date]) events[date]=[]; events[date].push({ id: Date.now(), title }); userSet('events', events);
    if($('eventDate')) $('eventDate').value=''; if($('eventTitle')) $('eventTitle').value='';
    renderEvents(); renderStats();
  });
  window.deleteEvent = function(date,id){
    if(!currentUser) return alert('Log in first');
    const events = userGet('events', {}); if(!events[date]) return; events[date] = events[date].filter(e=> e.id !== id); if(events[date].length===0) delete events[date]; userSet('events', events); renderEvents(); renderStats();
  };

  /* ------------------ Stopwatch ------------------ */
  let swInterval = null, swStart = 0, swElapsed = 0, swRunning = false;
  function swFormat(ms){
    const hours = Math.floor(ms/3600000);
    const mins = Math.floor(ms%3600000/60000);
    const secs = Math.floor(ms%60000/1000);
    const msecs = ms%1000;
    return `${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}.${String(msecs).padStart(3,'0')}`;
  }
  function swUpdate(){ const now = Date.now(); const diff = (swRunning ? now - swStart + swElapsed : swElapsed); if($('stopwatchDisplay')) $('stopwatchDisplay').textContent = swFormat(diff); }
  $('startSW')?.addEventListener('click', ()=>{ if(!currentUser) return alert('Log in first'); if(swRunning) return; swStart = Date.now(); swRunning = true; swInterval = setInterval(swUpdate, 40); });
  $('stopSW')?.addEventListener('click', ()=>{ if(!currentUser) return alert('Log in first'); if(!swRunning) return; clearInterval(swInterval); swElapsed += Date.now() - swStart; swRunning = false; swUpdate(); persistStopwatch(); });
  $('resetSW')?.addEventListener('click', ()=>{ if(!currentUser) return alert('Log in first'); if(confirm('Reset stopwatch?')){ clearInterval(swInterval); swStart=0; swElapsed=0; swRunning=false; if($('stopwatchDisplay')) $('stopwatchDisplay').textContent='00:00:00.000'; userSet('sw_laps', []); renderLaps(); persistStopwatch(); }});
  $('lapSW')?.addEventListener('click', ()=>{ if(!currentUser) return alert('Log in first'); const val = $('stopwatchDisplay')?.textContent || swFormat(swElapsed); const laps = userGet('sw_laps', []); laps.unshift({ id: Date.now(), time: val }); userSet('sw_laps', laps); renderLaps(); renderStats(); });
  function renderLaps(){ const laps = userGet('sw_laps', []); const c = $('lapsContainer'); if(!c) return; c.innerHTML = laps.map(l=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.02)">${l.time}<button class="btn alt" onclick="deleteLap(${l.id})">Del</button></div>`).join(''); }
  window.deleteLap = function(id){ if(!currentUser) return alert('Log in first'); let laps = userGet('sw_laps', []); laps = laps.filter(l=> l.id !== id); userSet('sw_laps', laps); renderLaps(); renderStats(); };
  function persistStopwatch(){ userSet('sw_state', { swElapsed, swRunning, swStart: swRunning ? swStart : 0 }); }
  function loadStopwatchState(){ const s = userGet('sw_state', null); if(s){ swElapsed = s.swElapsed||0; swRunning = s.swRunning||false; if(swRunning){ swStart = Date.now(); swInterval = setInterval(swUpdate,40); } swUpdate(); } renderLaps(); }

  /* ------------------ Music ------------------ */
  $('playFileBtn')?.addEventListener('click', ()=>{ if(!currentUser) return alert('Log in first'); const f = $('musicFile')?.files && $('musicFile').files[0]; if(!f) return alert('Choose audio file'); const url = URL.createObjectURL(f); if($('musicPlayer')) { $('musicPlayer').src = url; $('musicPlayer').play(); } });

  /* ------------------ Mood ------------------ */
  $('saveMoodBtn')?.addEventListener('click', ()=>{ if(!currentUser) return alert('Log in first'); const mood = $('moodSelect')?.value || ''; const note = $('moodNote')?.value.trim() || ''; const arr = userGet('moods', []); arr.unshift({ id: Date.now(), mood, note, t: new Date().toISOString() }); userSet('moods', arr); if($('moodNote')) $('moodNote').value=''; renderMoodHistory(); renderStats(); });
  function renderMoodHistory(){ const arr = userGet('moods', []); const c = $('moodHistory'); if(!c) return; c.innerHTML = arr.map(m => `<div class="card"><div style="display:flex;justify-content:space-between"><div>${escapeHtml(m.mood)} ${escapeHtml(m.note||'')}</div><small class="small">${new Date(m.t).toLocaleString()}</small></div></div>`).join(''); }
  renderMoodHistory();

  /* ------------------ Weather ------------------ */
  const weatherResult = $('weatherResult'), asideWeather = $('asideWeather');
  async function displayWeatherFromData(data){
    if(!asideWeather || !weatherResult) return;
    asideWeather.textContent = `${Math.round(data.main.temp)}°C • ${data.weather[0].main}`;
    weatherResult.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px">
        <div><strong>${escapeHtml(data.name)}, ${escapeHtml(data.sys.country)}</strong><div class="small">${escapeHtml(data.weather[0].description)}</div></div>
        <div style="font-size:1.6rem">${Math.round(data.main.temp)}°C</div>
      </div>
      <div style="margin-top:8px" class="small">Humidity ${data.main.humidity}% • Wind ${data.wind.speed} m/s</div>
    `;
  }
  async function fetchWeatherByCity(city){
    if(!city) return alert('Enter a city, like "London, GB"');
    if(!WEATHER_API_KEY){ weatherResult && (weatherResult.innerHTML = '<div style="color:orange">Weather API key not set.</div>'); return; }
    try{
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`);
      const data = await res.json();
      if(data.cod && data.cod !== 200){ weatherResult && (weatherResult.innerHTML = '<div style="color:orange">City not found — try "City, CountryCode".</div>'); return; }
      displayWeatherFromData(data); userSet('lastWeather', city);
    } catch(e){
      weatherResult && (weatherResult.innerHTML = '<div style="color:red">Network error</div>');
    }
  }
  async function fetchWeatherByCoords(lat, lon){
    if(!WEATHER_API_KEY){ weatherResult && (weatherResult.innerHTML = '<div style="color:orange">Weather API key not set.</div>'); return; }
    try{
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`);
      const data = await res.json();
      if(data.cod && data.cod !== 200){ weatherResult && (weatherResult.innerHTML = '<div style="color:orange">Location data not found.</div>'); return; }
      displayWeatherFromData(data); userSet('lastWeather', data.name);
    } catch(e){
      weatherResult && (weatherResult.innerHTML = '<div style="color:red">Network error</div>');
    }
  }
  $('weatherSearchBtn')?.addEventListener('click', ()=> fetchWeatherByCity($('weatherCity')?.value.trim()));
  $('weatherDetectBtn')?.addEventListener('click', ()=> { if(!navigator.geolocation) return alert('Geolocation not supported'); navigator.geolocation.getCurrentPosition(p=> fetchWeatherByCoords(p.coords.latitude, p.coords.longitude), ()=> alert('Location denied or unavailable')); });
  (function tryInitWeather(){
    if(!currentUser) return;
    const last = userGet('lastWeather', null);
    if(last){ if($('weatherCity')) $('weatherCity').value = last; fetchWeatherByCity(last); }
    else if(navigator.geolocation) navigator.geolocation.getCurrentPosition(p=> fetchWeatherByCoords(p.coords.latitude, p.coords.longitude), ()=>{/* ignore */});
  })();

  /* ------------------ Live Backgrounds ------------------ */
  const bgSelect = $('bgSelect'), bgPreview = $('bgPreview'), bgApplyBtn = $('bgApplyBtn'), bgClearBtn = $('bgClearBtn');
  const BG_KEY = 'ritters_bg_choice';
  function updateBgPreview(choice){
    if(!bgPreview) return;
    if(choice === 'space') bgPreview.style.background = "url('https://picsum.photos/1200/700?image=1050') center/cover no-repeat";
    else if(choice === 'nature') bgPreview.style.background = "url('https://picsum.photos/1200/700?image=1025') center/cover no-repeat";
    else if(choice === 'video') bgPreview.style.background = "linear-gradient(135deg,#021428,#042b4a)";
    else if(choice === 'solid') bgPreview.style.background = "#0b1b2a";
    else bgPreview.style.background = "linear-gradient(120deg,#071018,#0b1b2a)";
  }
  bgSelect?.addEventListener('change', ()=> updateBgPreview(bgSelect.value));
  bgApplyBtn?.addEventListener('click', ()=>{
    const v = bgSelect?.value || 'gradient';
    applyBgChoice(v);
    localStorage.setItem(BG_KEY, v);
  });
  bgClearBtn?.addEventListener('click', ()=>{ localStorage.removeItem(BG_KEY); applyBgChoice('gradient'); if(bgSelect) { bgSelect.value='gradient'; } updateBgPreview('gradient'); });
  function applyBgChoice(v){
    if(v === 'space') document.body.style.background = "url('https://picsum.photos/1600/1000?image=1050') center/cover no-repeat";
    else if(v === 'nature') document.body.style.background = "url('https://picsum.photos/1600/1000?image=1025') center/cover no-repeat";
    else if(v === 'video'){
      document.body.style.background = "linear-gradient(120deg,#071018,#06283d)";
    }
    else if(v === 'solid') document.body.style.background = "#071018";
    else document.body.style.background = "linear-gradient(120deg,#071018,#0b1b2a)";
  }
  (function initBg(){
    const saved = localStorage.getItem(BG_KEY) || 'gradient';
    if(bgSelect) bgSelect.value = saved;
    updateBgPreview(saved);
    applyBgChoice(saved);
  })();

  /* ------------------ Search (DuckDuckGo + JSONP fallback) ------------------ */
  /* JSONP helper */
  function jsonp(url, timeout = 10000){
    return new Promise((resolve, reject) => {
      const cbName = 'ddg_cb_' + Date.now() + '_' + Math.floor(Math.random()*100000);
      window[cbName] = function(data){
        cleanup();
        resolve(data);
      };
      const script = document.createElement('script');
      const separator = url.includes('?') ? '&' : '?';
      script.src = url + separator + 'callback=' + cbName;
      script.onerror = () => { cleanup(); reject(new Error('JSONP load error')); };
      document.body.appendChild(script);
      const timer = setTimeout(()=>{ cleanup(); reject(new Error('JSONP timeout')); }, timeout);
      function cleanup(){ clearTimeout(timer); try{ delete window[cbName]; }catch(e){} script.remove(); }
    });
  }
  $('doSearchBtn')?.addEventListener('click', performSearch);
  $('openSearchInNewTab')?.addEventListener('click', ()=> {
    const q = $('searchQuery')?.value.trim();
    if(!q) return alert('Enter a query');
    window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
  });
  async function performSearch(){
    const q = $('searchQuery')?.value.trim();
    if(!q) return alert('Enter a query');
    const searchResults = $('searchResults');
    const searchQuick = $('searchQuick');
    if(searchResults) searchResults.innerHTML = `
      <div><a href="https://www.google.com/search?q=${encodeURIComponent(q)}" target="_blank">Open Google results for "${escapeHtml(q)}"</a></div>
      <div style="margin-top:6px"><a href="https://www.bing.com/search?q=${encodeURIComponent(q)}" target="_blank">Open Bing results</a></div>
      <div style="margin-top:6px"><a href="https://duckduckgo.com/?q=${encodeURIComponent(q)}" target="_blank">Open DuckDuckGo results</a></div>
    `;
    if(searchQuick) searchQuick.textContent = 'Searching...';
    const endpoint = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`;
    try {
      const res = await fetch(endpoint);
      if(!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      handleDuckAnswer(data);
      return;
    } catch (e) {
      try {
        const data = await jsonp(endpoint, 10000);
        handleDuckAnswer(data);
        return;
      } catch (e2) {
        if(searchQuick) searchQuick.textContent = 'Quick answer failed (network/CORS). Use the links above for a full search.';
        return;
      }
    }
  }
  function handleDuckAnswer(data){
    try{
      let qaHtml = '';
      if(data && data.AbstractText && data.AbstractText.trim()){
        qaHtml += `<div>${escapeHtml(data.AbstractText)}</div>`;
        if(data.AbstractURL) qaHtml += `<div class="small" style="margin-top:6px">Source: <a target="_blank" href="${escapeHtml(data.AbstractURL)}">${escapeHtml(data.AbstractURL)}</a></div>`;
      } else if(data && data.Heading && data.AbstractText){
        qaHtml += `<div><strong>${escapeHtml(data.Heading)}</strong> — ${escapeHtml(data.AbstractText)}</div>`;
      } else {
        let related = [];
        if(Array.isArray(data.RelatedTopics)){
          for(const t of data.RelatedTopics){
            if(t.Text) related.push({text:t.Text, url: t.FirstURL});
            else if(t.Topics && t.Topics.length){
              for(const sub of t.Topics){
                if(sub.Text) related.push({text: sub.Text, url: sub.FirstURL});
              }
            }
            if(related.length >= 5) break;
          }
        }
        if(related.length){
          qaHtml += '<div><strong>Related</strong></div><ul>';
          related.slice(0,5).forEach(r => qaHtml += `<li>${escapeHtml(r.text)} ${r.url?`— <a target="_blank" href="${escapeHtml(r.url)}">source</a>`:''}</li>`);
          qaHtml += '</ul>';
        }
      }
      if(!qaHtml) qaHtml = 'No quick answer found. Use the links above for a full web search.';
      if($('searchQuick')) $('searchQuick').innerHTML = qaHtml;
    }catch(err){
      if($('searchQuick')) $('searchQuick').textContent = 'Error processing quick answer';
    }
  }

  /* ------------------ Messages (demo local room) ------------------ */
  const CHAT_KEY = 'ritters_public_chat';
  function loadChat(){ try{ return JSON.parse(localStorage.getItem(CHAT_KEY) || '[]'); }catch(e){ return []; } }
  function saveChat(arr){ localStorage.setItem(CHAT_KEY, JSON.stringify(arr)); }
  function renderChat(){
    const list = loadChat();
    const el = $('msgList');
    if(!el) return;
    el.innerHTML = list.map(m => `<div class="msg"><div style="display:flex;justify-content:space-between"><strong>${escapeHtml(m.user)}</strong><small class="small">${new Date(m.t).toLocaleTimeString()}</small></div><div style="margin-top:6px">${escapeHtml(m.text)}</div></div>`).join('');
    el.scrollTop = el.scrollHeight;
  }
  function sendMessage(){
    if(!currentUser) return alert('Log in first');
    const t = $('msgText')?.value.trim();
    if(!t) return;
    const list = loadChat();
    list.push({ id: Date.now(), user: currentUser, text: t, t: new Date().toISOString() });
    saveChat(list);
    if($('msgText')) $('msgText').value = '';
    renderChat();
  }
  window.addEventListener('storage', (ev)=>{
    if(ev.key === CHAT_KEY) renderChat();
  });
  setInterval(renderChat, 1500);
  $('sendMsgBtn')?.addEventListener('click', sendMessage);

  /* ------------------ Profile edit ------------------ */
  $('editPic')?.addEventListener('change', e => {
    if(!currentUser) return alert('Log in first');
    const f = e.target.files[0]; if(!f) return;
    const r = new FileReader(); r.onload = ()=> {
      if($('profilePic')) $('profilePic').src = r.result; if($('asidePic')) $('asidePic').src = r.result;
      const users = loadUsers(); if(!users[currentUser]) users[currentUser] = { passwordHash:'', bio:'', pic:'', joined:new Date().toISOString() };
      users[currentUser].pic = r.result; saveUsers(users);
    }; r.readAsDataURL(f);
  });
  $('saveProfileBtn')?.addEventListener('click', ()=> {
    if(!currentUser) return alert('Log in first');
    const users = loadUsers();
    if(!users[currentUser]) users[currentUser] = { passwordHash:'', bio:'', pic:'', joined:new Date().toISOString() };
    users[currentUser].bio = $('editBio')?.value || '';
    saveUsers(users);
    if($('asideBio')) $('asideBio').textContent = users[currentUser].bio;
    alert('Profile saved');
  });
  $('deleteAccountBtn')?.addEventListener('click', ()=>{
    if(!currentUser) return alert('Log in first');
    if(!confirm('Delete account and all data? This is permanent.')) return;
    const users = loadUsers(); delete users[currentUser]; saveUsers(users);
    Object.keys(localStorage).forEach(k => { if(k.startsWith((currentUser || '') + '::')) localStorage.removeItem(k); });
    logout();
  });

  /* ------------------ Stats ------------------ */
  function computeStats(){
    if(!currentUser) return { journal:0, notes:0, moods:0, events:0 };
    const journal = userGet('journal', []), notes = userGet('notes', []), moods = userGet('moods', []), events = userGet('events', {});
    return { journal: journal.length, notes: notes.length, moods: moods.length, events: Object.keys(events).length };
  }
  function renderStats(){
    const s = computeStats();
    const area = $('statsArea');
    const profile = $('profileStats');
    const html = `
      <div style="display:flex;justify-content:space-between;padding:8px;border-radius:8px;background:rgba(255,255,255,0.02);margin-bottom:8px"><div class="small">Journal</div><div>${s.journal}</div></div>
      <div style="display:flex;justify-content:space-between;padding:8px;border-radius:8px;background:rgba(255,255,255,0.02);margin-bottom:8px"><div class="small">Notes</div><div>${s.notes}</div></div>
      <div style="display:flex;justify-content:space-between;padding:8px;border-radius:8px;background:rgba(255,255,255,0.02);margin-bottom:8px"><div class="small">Moods</div><div>${s.moods}</div></div>
      <div style="display:flex;justify-content:space-between;padding:8px;border-radius:8px;background:rgba(255,255,255,0.02);margin-bottom:8px"><div class="small">Events</div><div>${s.events}</div></div>
    `;
    if(area) area.innerHTML = html;
    if(profile) profile.innerHTML = html;
  }

  /* ------------------ LOAD / BOOT ------------------ */
  function renderAllUserData(){
    renderJournalList(); renderNotesList(); renderEvents(); renderLaps(); renderMoodHistory(); renderStats(); loadStopwatchState(); renderChat();
  }

  // ensure renderStats updates when localStorage setItem called
  (function(){
    const orig = localStorage.setItem;
    localStorage.setItem = function(k,v){ orig.apply(this, arguments); try{ renderStats(); }catch(e){} };
  })();

  /* initial draws */
  renderMoodHistory();
  renderStats();
  renderChat();

  // load saved stopwatch state (if any)
  loadStopwatchState();

  /* end of DOMContentLoaded block */
}); // DOMContentLoaded

// ------------------ Snake game logic (kept outside DOMContentLoaded as it checks for element) ------------------
(function(){
  // Config
  const canvas = document.getElementById('snakeCanvas');
  if(!canvas) return; // Exit if the snake canvas element doesn't exist

  const ctx = canvas.getContext('2d');
  const startBtn = document.getElementById('snakeStart');
  const pauseBtn = document.getElementById('snakePause');
  const resetBtn = document.getElementById('snakeReset');
  const scoreEl = document.getElementById('snakeScore');
  const highEl = document.getElementById('snakeHigh');

  // Responsive canvas: keep square and adjust to container
  function resizeCanvas(){
    const rect = canvas.getBoundingClientRect();
    const size = Math.min(480, rect.width); // limit max size
    canvas.width = size;
    canvas.height = size;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Game state
  let grid = 18;            // number of cells per row/col
  let cellSize = 0;
  let snake = [];
  let dir = {x:1,y:0};
  let nextDir = null;
  let apple = null;
  let running = false;
  let paused = false;
  let intervalId = null;
  let speed = 100; // ms per tick (lower = faster)
  let score = 0;
  let high = Number(localStorage.getItem('rcp_snake_high') || 0);

  if(highEl) highEl.textContent = 'High: ' + high;
  if(scoreEl) scoreEl.textContent = 'Score: ' + score;

  function startGame(){
    cancelTick();
    grid = Math.max(12, Math.floor(canvas.width/20)); // scale grid to canvas size
    cellSize = Math.floor(canvas.width / grid);
    snake = [{x: Math.floor(grid/2), y: Math.floor(grid/2)}];
    dir = {x:1,y:0};
    nextDir = null;
    spawnApple();
    running = true;
    paused = false;
    score = 0;
    if(scoreEl) scoreEl.textContent = 'Score: ' + score;
    intervalId = setInterval(tick, speed);
    draw();
  }

  function pauseGame(){
    if(!running) return;
    paused = !paused;
    if(paused) cancelTick(); else intervalId = setInterval(tick, speed);
    if(pauseBtn) pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  }

  function resetGame(){
    startGame();
  }

  function cancelTick(){
    if(intervalId) { clearInterval(intervalId); intervalId = null; }
  }

  function spawnApple(){
    let tries = 0;
    while(true){
      tries++;
      const ax = Math.floor(Math.random()*grid);
      const ay = Math.floor(Math.random()*grid);
      if(!snake.some(s => s.x===ax && s.y===ay)){
        apple = {x:ax,y:ay};
        return;
      }
      if(tries>200) { apple = null; return; }
    }
  }

  function tick(){
    if(!running || paused) return;
    if(nextDir){
      // prevent immediate reverse
      if(!(nextDir.x === -dir.x && nextDir.y === -dir.y)) dir = nextDir;
      nextDir = null;
    }

    const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

    // wrap-around
    if(head.x < 0) head.x = grid - 1;
    if(head.y < 0) head.y = grid - 1;
    if(head.x >= grid) head.x = 0;
    if(head.y >= grid) head.y = 0;

    // collision with self?
    if(snake.some(s => s.x === head.x && s.y === head.y)){
      gameOver();
      return;
    }

    snake.unshift(head);

    // apple eaten?
    if(apple && head.x === apple.x && head.y === apple.y){
      score += 1;
      if(scoreEl) scoreEl.textContent = 'Score: ' + score;
      spawnApple();
      // speed up slightly every 5 apples
      if(score % 5 === 0 && speed > 40){
        speed = Math.max(40, speed - 8);
        cancelTick();
        intervalId = setInterval(tick, speed);
      }
    } else {
      snake.pop();
    }

    draw();
  }

  function gameOver(){
    running = false;
    cancelTick();
    // save high score
    if(score > high){
      high = score;
      localStorage.setItem('rcp_snake_high', String(high));
      if(highEl) highEl.textContent = 'High: ' + high;
    }
    // simple game over effect
    for(let i=0;i<3;i++){
      setTimeout(()=>{ canvas.style.opacity = i%2?0.3:1; }, i*120);
    }
    setTimeout(()=>{ canvas.style.opacity = 1; }, 360);
  }

  function draw(){
    // clear
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // background
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    roundRect(ctx, 0, 0, canvas.width, canvas.height, 8);

    // grid - optional subtle lines
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 1;
    for(let i=1;i<grid;i++){
      ctx.beginPath();
      ctx.moveTo(i*cellSize,0);
      ctx.lineTo(i*cellSize,canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0,i*cellSize);
      ctx.lineTo(canvas.width,i*cellSize);
      ctx.stroke();
    }

    // apple
    if(apple){
      ctx.fillStyle = 'red';
      drawRoundedRect(ctx, apple.x * cellSize, apple.y * cellSize, cellSize, cellSize, 4);
    }

    // snake
    ctx.fillStyle = '#7a4dff';
    snake.forEach(segment => {
      drawRoundedRect(ctx, segment.x * cellSize, segment.y * cellSize, cellSize, cellSize, 4);
    });
  }

  // Controls and event listeners
  startBtn?.addEventListener('click', startGame);
  pauseBtn?.addEventListener('click', pauseGame);
  resetBtn?.addEventListener('click', resetGame);

  document.addEventListener('keydown', e => {
    if(!running || paused) return;
    switch(e.key){
      case 'ArrowUp': nextDir = {x:0,y:-1}; break;
      case 'ArrowDown': nextDir = {x:0,y:1}; break;
      case 'ArrowLeft': nextDir = {x:-1,y:0}; break;
      case 'ArrowRight': nextDir = {x:1,y:0}; break;
    }
  });

  // Touch controls
  let startX, startY;
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, {passive:false});
  canvas.addEventListener('touchend', e => {
    if(!running || paused) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - startX;
    const dy = endY - startY;

    if(Math.abs(dx) > Math.abs(dy)){
      if(dx > 0) nextDir = {x:1,y:0};
      else nextDir = {x:-1,y:0};
    } else {
      if(dy > 0) nextDir = {x:0,y:1};
      else nextDir = {x:0,y:-1};
    }
  });

  // Drawing helpers
  function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  // Initial setup
  startGame();

})();