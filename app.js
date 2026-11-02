const events = [
  { number: '01', date: '2021-03-25', displayDate: '25 marca 2021', category: 'poczatki', label: 'Początki', title: 'Wszystko zaczęło się na Twitchu.', description: '25 marca 2021 roku na kanale crisuuubtkj na Twitchu zaczęła się historia naszej społeczności.', icon: '↗', theme: 'purple', detail: 'To właśnie tutaj zaczyna się historia BTKJ × DRL — OG społeczności minionych lat.', url: 'https://www.twitch.tv/crisuuubtkj', linkLabel: 'Kanał crisuuubtkj na Twitchu' }
];
const list = document.querySelector('#timeline-list');
function render(filter = 'all') {
  list.replaceChildren();
  const visibleEvents = events.filter(event => filter === 'all' || event.category === filter);
  if (!visibleEvents.length) {
    const message = document.createElement('p');
    message.className = 'section-description';
    message.textContent = 'Nie dodaliśmy jeszcze wspomnień w tej kategorii.';
    list.append(message);
  }
  for (const event of visibleEvents) {
    const article = document.createElement('article');
    article.className = 'event';
    article.innerHTML = `<div class="event-date"><span>ROZDZIAŁ ${event.number}</span><small><time datetime="${event.date}">${event.displayDate}</time></small></div><div class="timeline-dot"></div><div class="event-card"><div class="event-text"><span class="category ${event.theme}">${event.label}</span><h3>${event.title}</h3><p>${event.description}</p><details><summary>O tym wspomnieniu <span>↗</span></summary><p>${event.detail}</p><p><a href="${event.url}" target="_blank" rel="noopener noreferrer">${event.linkLabel} ↗</a></p></details></div><div class="event-art ${event.theme}" aria-hidden="true"><span>${event.icon}</span><small>WSPOMNIENIE_${event.number}</small></div></div>`;
    list.append(article);
  }
}
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(other => {
    other.classList.toggle('active', other === button);
    other.setAttribute('aria-pressed', String(other === button));
  });
  render(button.dataset.filter);
}));
render();

document.querySelector('#open-settings').addEventListener('click', () => {
  document.querySelector('#settings-dialog').showModal();
});

const preferenceKey = 'btkj-drl-preferences-v1';
const defaults = {theme:'dark', oled:true, brightness:3, accent:'blue', tint:false, 'compact-timeline':false, 'text-size':'normal', 'sticky-nav':false, 'smooth-scroll':true, 'hide-decorations':false, 'reduce-motion':false};
let preferences = {...defaults};
try {
  const saved = JSON.parse(localStorage.getItem(preferenceKey) || '{}');
  for (const [key, value] of Object.entries(defaults)) {
    if (typeof saved?.[key] === typeof value) preferences[key] = saved[key];
  }
} catch {}
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function navigationBehavior() {
  return preferences['smooth-scroll'] && !preferences['reduce-motion'] && !reducedMotion.matches ? 'smooth' : 'instant';
}
function applyPreferences() {
  const dark = preferences.theme === 'system' ? systemTheme.matches : preferences.theme !== 'light';
  document.body.classList.toggle('light-theme', !dark);
  document.body.classList.toggle('oled-mode', dark && preferences.oled);
  document.body.classList.toggle('tinted', preferences.tint);
  for (const key of ['compact-timeline','hide-decorations','sticky-nav','reduce-motion']) document.body.classList.toggle(key, preferences[key]);
  document.body.classList.toggle('large-text', preferences['text-size'] === 'large');
  document.documentElement.style.scrollBehavior = navigationBehavior() === 'smooth' ? 'smooth' : 'auto';
  const colors = {blue:'122,146,228',pink:'207,138,163',green:'94,180,139',purple:'163,135,219'};
  document.documentElement.style.setProperty('--accent-rgb', colors[preferences.accent] || colors.blue);
  const brightness = Math.max(0, Math.min(5, Number(preferences.brightness) || 0));
  document.documentElement.style.setProperty('--card-level', String(brightness * 6));
  document.querySelector('#brightness-value').value = brightness + ' / 5';
  for (const control of document.querySelectorAll('[data-preference]')) {
    if (control.type === 'checkbox') control.checked = preferences[control.id];
    else control.value = preferences[control.id];
  }
  try {localStorage.setItem(preferenceKey, JSON.stringify(preferences));} catch {}
}
const backgroundControl = document.querySelector('#background');
backgroundControl.closest('.preference').remove();

const starCanvas = document.createElement('canvas');
starCanvas.className = 'starfield-canvas';
starCanvas.setAttribute('aria-hidden', 'true');
document.body.prepend(starCanvas);
const starContext = starCanvas.getContext('2d');
const stars = Array.from({length: 180}, () => ({}));
let starWidth = 0;
let starHeight = 0;
let starBoost = 1;
let lastStarFrame = performance.now();
function resetStar(star, randomDepth = true) {
  star.x = (Math.random() - .5) * 2.2;
  star.y = (Math.random() - .5) * 2.2;
  star.z = randomDepth ? Math.random() * .95 + .05 : 1;
  star.brightness = Math.random() * .65 + .35;
}
function resizeStarfield() {
  const ratio = Math.min(devicePixelRatio || 1, 2);
  starWidth = innerWidth;
  starHeight = innerHeight;
  starCanvas.width = Math.round(starWidth * ratio);
  starCanvas.height = Math.round(starHeight * ratio);
  starCanvas.style.width = starWidth + 'px';
  starCanvas.style.height = starHeight + 'px';
  starContext.setTransform(ratio, 0, 0, ratio, 0, 0);
}
function boostStarfield() {
  if (!reducedMotion.matches) starBoost = 5.5;
}
function drawStarfield(now) {
  const elapsed = Math.min(34, now - lastStarFrame);
  lastStarFrame = now;
  starContext.clearRect(0, 0, starWidth, starHeight);
  const centerX = starWidth / 2;
  const centerY = starHeight / 2;
  const depthStep = reducedMotion.matches ? 0 : .00022 * elapsed * starBoost;
  starBoost += (1 - starBoost) * Math.min(1, elapsed / 420);
  for (const star of stars) {
    const previousZ = star.z;
    star.z -= depthStep;
    if (star.z <= .018) resetStar(star, false);
    const scale = Math.min(starWidth, starHeight) * .54;
    const x = centerX + star.x / star.z * scale;
    const y = centerY + star.y / star.z * scale;
    const previousX = centerX + star.x / previousZ * scale;
    const previousY = centerY + star.y / previousZ * scale;
    if (x < -60 || x > starWidth + 60 || y < -60 || y > starHeight + 60) {
      resetStar(star, false);
      continue;
    }
    const size = Math.min(2.8, .35 + (1 - star.z) * 2.2);
    starContext.beginPath();
    starContext.moveTo(previousX, previousY);
    starContext.lineTo(x, y);
    starContext.strokeStyle = `rgba(200,215,255,${star.brightness * .55})`;
    starContext.lineWidth = size;
    starContext.stroke();
    starContext.beginPath();
    starContext.arc(x, y, size * .62, 0, Math.PI * 2);
    starContext.fillStyle = `rgba(235,240,255,${star.brightness})`;
    starContext.fill();
  }
  requestAnimationFrame(drawStarfield);
}
stars.forEach(star => resetStar(star));
resizeStarfield();
addEventListener('resize', resizeStarfield);
requestAnimationFrame(drawStarfield);
document.querySelectorAll('[data-preference]').forEach(control => {
  control.addEventListener(control.type === 'range' ? 'input' : 'change', () => {
    preferences[control.id] = control.type === 'checkbox' ? control.checked : control.type === 'range' ? Number(control.value) : control.value;
    applyPreferences();
  });
});
systemTheme.addEventListener('change', applyPreferences);
reducedMotion.addEventListener('change', applyPreferences);
applyPreferences();
let activeSettingsPage = '0';
function filterSettings() {
  const query = document.querySelector('#settings-search').value.trim().toLocaleLowerCase('pl');
  let results = 0;
  document.querySelectorAll('[data-settings-page]').forEach(page => {
    let matches = 0;
    page.querySelectorAll('.preference').forEach(row => {
      row.hidden = Boolean(query && !row.textContent.toLocaleLowerCase('pl').includes(query));
      if (!row.hidden) matches++;
    });
    page.hidden = query ? !matches : page.dataset.settingsPage !== activeSettingsPage;
    if (!page.hidden) results += matches;
  });
  document.querySelector('.settings-empty').hidden = results > 0;
}
document.querySelectorAll('[data-settings-tab]').forEach(tab => tab.addEventListener('click', () => {
  activeSettingsPage = tab.dataset.settingsTab;
  document.querySelector('#settings-search').value = '';
  document.querySelectorAll('[data-settings-tab]').forEach(item => {
    item.classList.toggle('selected', item === tab);
    item.setAttribute('aria-pressed', String(item === tab));
  });
  filterSettings();
  document.querySelector('.settings-content').scrollTop = 0;
}));
document.querySelector('#settings-search').addEventListener('input', filterSettings);
document.querySelector('#expand-settings').addEventListener('click', event => {
  const expanded = document.querySelector('#settings-dialog').classList.toggle('expanded');
  event.currentTarget.setAttribute('aria-pressed', String(expanded));
  event.currentTarget.setAttribute('aria-label', expanded ? 'Zmniejsz okno' : 'Powiększ okno');
});
document.querySelector('#reset-preferences').addEventListener('click', () => {
  preferences = {...defaults};
  applyPreferences();
  document.querySelector('#reset-status').textContent = 'Przywrócono ustawienia domyślne.';
});
document.querySelectorAll('.dialog-close').forEach(button => {
  button.addEventListener('click', () => button.closest('dialog').close());
});

// Use the same navigation behavior for every internal section link.
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const hash = link.getAttribute('href');
  const target = hash === '#' ? document.documentElement : hash === '#aktorzy' ? document.querySelector('#actors-view') : document.getElementById(hash.slice(1));
  if (!target) return;
  event.preventDefault();
  updatePageView(hash);
  const headerHeight = preferences['sticky-nav'] ? document.querySelector('.archive-topbar').offsetHeight : 0;
  const isPage = ['#obietnice','#vody','#media','#klipy','#aktorzy','#wazne','#info'].includes(hash);
  const top = hash === '#' || isPage ? 0 : target.getBoundingClientRect().top + window.scrollY - headerHeight - 24;
  window.scrollTo({top: Math.max(0, top), behavior: navigationBehavior()});
  if (location.hash !== hash) {
    try { history.pushState(null, '', hash); } catch {}
  }
});

const actors = [{
  name: 'crisuuubtkj', role: 'pierwszoplanowa', initials: 'C', image: './assets/images/pfp-crisuuubtkj.png',
  description: 'Magazynier, Legenda sceny mta, muzyk. Od niego wszystko się zaczęło.',
  detail: 'Pierwszy zapisany moment naszej społeczności jest związany z tym kanałem. Tutaj będziemy zbierać kolejne informacje i wspomnienia.',
  socials: [
    { name: 'Twitch', type: 'twitch', url: 'https://www.twitch.tv/crisuuubtkj' },
    { name: 'Kick', type: 'kick', url: 'https://kick.com/crisuuubtkj' },
    { name: 'YouTube', type: 'youtube', url: 'https://www.youtube.com/crisuuubtkj' },
    { name: 'Discord', type: 'discord', url: 'https://discord.gg/FVTSSrt4EY' },
    { name: 'X', type: 'x', url: 'https://x.com/crisuuubtkj1' }
  ]
}, {
  name: 'Dobrodziejskyy', role: 'drugoplanowa', initials: 'D', image: './assets/images/pfp-dobrodziejskyy.jpg',
  description: 'Wkrótce.', detail: 'Wkrótce.'
}];
function renderActors() {
  const query = document.querySelector('#actor-search').value.trim().toLocaleLowerCase('pl');
  const results = actors.filter(actor => [actor.name, actor.role, actor.description].join(' ').toLocaleLowerCase('pl').includes(query));
  const container = document.querySelector('#actors-list');
  container.replaceChildren();
  document.querySelector('#actors-count').textContent = results.length + ' ' + (results.length === 1 ? 'wpis' : results.length % 10 >= 2 && results.length % 10 <= 4 && (results.length % 100 < 12 || results.length % 100 > 14) ? 'wpisy' : 'wpisów');
  for (const actor of results) {
    const card = document.createElement('article');
    card.className = actor.role === 'pierwszoplanowa' ? 'actor-card featured-actor' : 'actor-card supporting-actor';
    const socialLinks = actor.socials?.map(social => `<a class="actor-link social-${social.type}" href="${social.url}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">●</span>${social.name} ↗</a>`).join('') || '';
    card.innerHTML = `<details><summary>${actor.image ? `<img class="actor-avatar actor-photo" src="${actor.image}" alt="${actor.name}" width="96" height="96">` : `<span class="actor-avatar" aria-hidden="true">${actor.initials}</span>`}<span class="actor-overview"><strong>${actor.name}</strong><span class="actor-role">${actor.role}</span><span class="actor-description">${actor.description}</span></span><span class="actor-chevron" aria-hidden="true">›</span></summary><div class="actor-detail"><p>${actor.detail}</p>${socialLinks ? `<div class="actor-socials" aria-label="Profile społecznościowe">${socialLinks}</div>` : ''}</div></details>`;
    container.append(card);
  }
  if (!results.length) {
    const empty = document.createElement('p');
    empty.className = 'actors-empty';
    empty.textContent = 'Nie znaleziono osób pasujących do wyszukiwania.';
    container.append(empty);
  }
}
document.querySelector('#actor-search').addEventListener('input', renderActors);
renderActors();

const promiseEntries = [{
  id: 'testowe', date: 'testowe', time: 'testowe', title: 'testowe', status: 'testowe',
  priority: 'testowe', source: 'testowe', details: 'testowe', archived: false
}];
const promiseStateKey = 'btkj-drl-promise-panel-v1';
let promiseState = {query:'', compact:false, remember:false, archive:false, grid:false, sort:'desc', status:'all', calendar:'', stats:false};
try {
  const saved = JSON.parse(localStorage.getItem(promiseStateKey) || '{}');
  if (saved.remember) promiseState = {...promiseState, ...saved, remember:true};
} catch {}
const promisesView = document.querySelector('#obietnice');
promisesView.innerHTML = `<div class="archive-page-heading"><h1 id="obietnice-title"><span aria-hidden="true">▣</span>Obietnice</h1><small>Aktualizowana na bieżąco lista obietnic BTKJ × DRL <span aria-hidden="true">›</span></small></div>
  <section class="panel promise-control-panel" aria-label="Narzędzia obietnic">
    <div class="promise-actions">
      <button type="button" data-promise-action="archive" aria-pressed="false"><span aria-hidden="true">▱</span>Archiwum</button>
      <button type="button" data-promise-action="random"><span aria-hidden="true">⚄</span>Losuj</button>
      <button type="button" data-promise-action="calendar" aria-expanded="false"><span aria-hidden="true">▣</span>Kalendarz</button>
      <label class="promise-switch">Widok kompaktowy <input type="checkbox" data-promise-toggle="compact" role="switch"><i></i></label>
      <label class="promise-switch">Pamiętaj filtry <input type="checkbox" data-promise-toggle="remember" role="switch"><i></i></label>
      <button class="promise-stats-button" type="button" data-promise-action="stats" aria-expanded="false"><span aria-hidden="true">⌁</span>Statystyki</button>
    </div>
    <div class="promise-calendar" hidden><label>Data <input type="date" data-promise-calendar></label><button type="button" data-promise-action="clear-calendar">Wyczyść</button></div>
    <div class="promise-search-row"><label class="archive-search"><span aria-hidden="true">⌕</span><input type="search" data-promise-search placeholder="Szukaj w obietnicach..." aria-label="Szukaj w obietnicach"></label><div class="promise-view-actions" aria-label="Widok i filtry"><button type="button" data-promise-action="grid" aria-label="Zmień układ" title="Zmień układ">⊞</button><button type="button" data-promise-action="stats" aria-label="Pokaż statystyki" title="Pokaż statystyki">▥</button><button type="button" data-promise-action="sort" aria-label="Zmień sortowanie" title="Zmień sortowanie">⇅</button><button type="button" data-promise-action="filter" aria-label="Filtruj status" title="Filtruj status">▽</button><button type="button" data-promise-action="reset" aria-label="Resetuj filtry" title="Resetuj filtry">↻</button></div></div>
    <div class="promise-statistics" hidden><div><strong data-stat="all">1</strong><span>testowe</span></div><div><strong data-stat="visible">1</strong><span>testowe</span></div><div><strong>testowe</strong><span>testowe</span></div></div>
  </section>
  <div class="promise-list-meta"><strong data-promise-count>1 wpis</strong><span>STATUS: <b data-promise-status>wszystkie</b></span><span>↻ Ostatnia aktualizacja: <b>testowe</b></span></div>
  <section class="panel promise-results" data-promise-results aria-live="polite"></section>`;

function savePromiseState() {
  try {
    if (promiseState.remember) localStorage.setItem(promiseStateKey, JSON.stringify(promiseState));
    else localStorage.removeItem(promiseStateKey);
  } catch {}
}
function visiblePromiseEntries() {
  const query = promiseState.query.trim().toLocaleLowerCase('pl');
  const rows = promiseEntries.filter(entry => {
    const matchesQuery = !query || Object.values(entry).join(' ').toLocaleLowerCase('pl').includes(query);
    const matchesArchive = promiseState.archive ? entry.archived : !entry.archived;
    const matchesStatus = promiseState.status === 'all' || entry.status === promiseState.status;
    const matchesCalendar = !promiseState.calendar || entry.date === promiseState.calendar;
    return matchesQuery && matchesArchive && matchesStatus && matchesCalendar;
  });
  return rows.sort((a, b) => promiseState.sort === 'asc' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
}
function renderPromisePanel() {
  const rows = visiblePromiseEntries();
  const results = promisesView.querySelector('[data-promise-results]');
  promisesView.classList.toggle('promise-compact', promiseState.compact);
  results.classList.toggle('promise-grid', promiseState.grid);
  results.innerHTML = rows.length ? rows.map(entry => `<article class="promise-entry" data-promise-id="${entry.id}"><div class="promise-entry-top"><span><strong>${entry.date}</strong> ${entry.time} <small>▧ · ${entry.details}</small></span><b>${entry.status}<i></i></b></div><h2>${entry.title}</h2><div class="promise-entry-bottom"><span>Priorytet: <strong>${entry.priority}</strong></span><span>${entry.source}</span><div><button type="button" aria-label="Historia obietnicy" title="Historia">↻</button><button type="button" aria-label="Kopiuj link" title="Kopiuj link" data-copy-promise>↗</button></div></div></article>`).join('') : `<div class="promise-empty"><strong>Brak pasujących obietnic</strong><span>Zmień wyszukiwanie lub wyczyść filtry.</span></div>`;
  promisesView.querySelector('[data-promise-count]').textContent = rows.length + (rows.length === 1 ? ' wpis' : ' wpisów');
  promisesView.querySelector('[data-promise-status]').textContent = promiseState.archive ? 'archiwum' : promiseState.status === 'all' ? 'wszystkie' : promiseState.status;
  promisesView.querySelector('[data-stat="visible"]').textContent = rows.length;
  promisesView.querySelector('[data-promise-search]').value = promiseState.query;
  promisesView.querySelector('[data-promise-toggle="compact"]').checked = promiseState.compact;
  promisesView.querySelector('[data-promise-toggle="remember"]').checked = promiseState.remember;
  promisesView.querySelector('[data-promise-calendar]').value = promiseState.calendar;
  promisesView.querySelector('[data-promise-action="archive"]').setAttribute('aria-pressed', String(promiseState.archive));
  promisesView.querySelector('.promise-statistics').hidden = !promiseState.stats;
  promisesView.querySelectorAll('[data-promise-action="stats"]').forEach(button => button.setAttribute('aria-expanded', String(promiseState.stats)));
  savePromiseState();
}
promisesView.addEventListener('input', event => {
  if (event.target.matches('[data-promise-search]')) promiseState.query = event.target.value;
  if (event.target.matches('[data-promise-calendar]')) promiseState.calendar = event.target.value;
  if (event.target.matches('[data-promise-toggle]')) promiseState[event.target.dataset.promiseToggle] = event.target.checked;
  renderPromisePanel();
});
promisesView.addEventListener('click', async event => {
  const button = event.target.closest('[data-promise-action], [data-copy-promise]');
  if (!button) return;
  if (button.hasAttribute('data-copy-promise')) {
    try { await navigator.clipboard.writeText(location.href.split('#')[0] + '#obietnice'); button.textContent = '✓'; } catch {}
    return;
  }
  const action = button.dataset.promiseAction;
  if (action === 'archive') promiseState.archive = !promiseState.archive;
  if (action === 'calendar') {
    const panel = promisesView.querySelector('.promise-calendar');
    panel.hidden = !panel.hidden;
    button.setAttribute('aria-expanded', String(!panel.hidden));
    return;
  }
  if (action === 'clear-calendar') promiseState.calendar = '';
  if (action === 'grid') promiseState.grid = !promiseState.grid;
  if (action === 'stats') promiseState.stats = !promiseState.stats;
  if (action === 'sort') promiseState.sort = promiseState.sort === 'desc' ? 'asc' : 'desc';
  if (action === 'filter') promiseState.status = promiseState.status === 'all' ? 'testowe' : 'all';
  if (action === 'reset') promiseState = {...promiseState, query:'', archive:false, grid:false, sort:'desc', status:'all', calendar:'', stats:false};
  if (action === 'random') {
    const rows = visiblePromiseEntries();
    renderPromisePanel();
    const chosen = rows.length ? promisesView.querySelector(`[data-promise-id="${rows[Math.floor(Math.random() * rows.length)].id}"]`) : null;
    chosen?.scrollIntoView({behavior:navigationBehavior(), block:'center'});
    chosen?.classList.add('is-random');
    setTimeout(() => chosen?.classList.remove('is-random'), 900);
    return;
  }
  renderPromisePanel();
});
renderPromisePanel();

let currentPageKey;
function updatePageView(hash = location.hash) {
  const pages = {obietnice:'Obietnice',vody:'VODy',media:'Media',klipy:'Klipy',aktorzy:'Aktorzy',wazne:'Ważne wydarzenia',info:'Informacje i kontakt'};
  const requested = hash.replace('#', '');
  const activePage = pages[requested] ? requested : 'home';
  if (currentPageKey && currentPageKey !== activePage) boostStarfield();
  currentPageKey = activePage;
  document.querySelectorAll('[data-page-view]').forEach(view => {
    const current = view.dataset.pageView === activePage;
    view.hidden = !current;
    if (current) {
      view.classList.remove('view-entering');
      void view.offsetWidth;
      view.classList.add('view-entering');
    }
  });
  document.querySelectorAll('.archive-nav .topbar-item').forEach(item => {
    const current = activePage === 'home' ? item.getAttribute('href') === '#' : item.getAttribute('href') === '#' + activePage;
    item.classList.toggle('is-current', current);
    if (current) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
  });
  document.title = activePage === 'home' ? 'BTKJ × DRL — Nasza historia zostaje' : pages[activePage] + ' — BTKJ × DRL Archive';
}
window.addEventListener('popstate', () => updatePageView());
window.addEventListener('hashchange', () => updatePageView());
updatePageView();

document.querySelectorAll('.page-tabs').forEach(group => {
  group.addEventListener('click', event => {
    const selected = event.target.closest('button');
    if (!selected) return;
    group.querySelectorAll('button').forEach(button => {
      button.classList.toggle('active', button === selected);
      button.setAttribute('aria-pressed', String(button === selected));
    });
  });
});

// Close on a backdrop click, but keep interaction inside the dialog intact.
document.querySelectorAll('dialog').forEach(dialog => {
  let startedOutside = false;
  const outside = event => {
    const box = dialog.getBoundingClientRect();
    return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
  };
  dialog.addEventListener('pointerdown', event => {
    startedOutside = event.target === dialog && outside(event);
  });
  dialog.addEventListener('pointercancel', () => { startedOutside = false; });
  dialog.addEventListener('click', event => {
    if (startedOutside && event.target === dialog && outside(event)) dialog.close();
    startedOutside = false;
  });
});

// Add confirmed records with status "done" or "failed" and resolvedAt YYYY-MM-DD.
const promises = [];
function calculatePromiseBalance(records, now = new Date()) {
  const end = now.toISOString().slice(0, 10);
  const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 6, 1));
  month.setUTCDate(Math.min(now.getUTCDate(), new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate()));
  const start = month.toISOString().slice(0, 10);
  const summarize = rows => {
    const done = rows.filter(row => row.status === 'done').length;
    const failed = rows.filter(row => row.status === 'failed').length;
    const total = done + failed;
    return {done, failed, total, percent: total ? Math.round(done / total * 100) : null};
  };
  return {all: summarize(records), recent: summarize(records.filter(row => row.resolvedAt >= start && row.resolvedAt <= end))};
}
const promiseBalances = calculatePromiseBalance(promises);
document.querySelectorAll('[data-balance]').forEach(card => {
  const balance = promiseBalances[card.dataset.balance];
  card.querySelector('.balance-percent').dataset.countTo = balance.percent ?? '';
  card.querySelector('.balance-completed').dataset.countTo = balance.done;
  card.querySelector('.balance-uncompleted').dataset.countTo = balance.failed;
  card.querySelector('.balance-total').dataset.countTo = balance.total;
  const track = card.querySelector('.balance-track');
  track.classList.toggle('is-empty', !balance.total);
  track.setAttribute('aria-label', balance.total ? `${balance.done} wykonane, ${balance.failed} niewykonane; ${balance.percent}% wykonanych` : 'Brak rozliczonych obietnic');
  card.querySelector('.balance-done').dataset.width = balance.total ? balance.done / balance.total * 100 : 0;
  card.querySelector('.balance-failed').dataset.width = balance.total ? balance.failed / balance.total * 100 : 0;
});

function motionAllowed() {
  return !preferences['reduce-motion'] && !reducedMotion.matches;
}
function animateNumber(element, target, format, duration = 900) {
  if (!motionAllowed() || target === 0) {
    element.textContent = format(target);
    return;
  }
  const start = performance.now();
  const step = now => {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = format(Math.round(target * eased));
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function startPageAnimations() {
  const revealItems = document.querySelectorAll('#home-view>section, .actors-view>*, .archive-page>*, footer');
  revealItems.forEach(item => item.classList.add('reveal-item'));
  if (!motionAllowed() || !('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {threshold: .08, rootMargin: '0px 0px -35px'});
    revealItems.forEach(item => observer.observe(item));
  }

  document.querySelectorAll('.stats .stat-card>strong').forEach(number => {
    const target = Number(number.textContent) || 0;
    number.setAttribute('aria-label', String(target));
    animateNumber(number, target, value => String(value), 1000);
  });
  document.querySelectorAll('[data-balance]').forEach((card, index) => {
    const balance = promiseBalances[card.dataset.balance];
    animateNumber(card.querySelector('.balance-percent'), balance.percent ?? 0, value => balance.percent === null ? '—' : value + '%');
    animateNumber(card.querySelector('.balance-completed'), balance.done, value => '✓ ' + value + ' Wykonane');
    animateNumber(card.querySelector('.balance-uncompleted'), balance.failed, value => value + ' Niewykonane ×');
    animateNumber(card.querySelector('.balance-total'), balance.total, value => value + ' łącznie');
    setTimeout(() => {
      card.querySelectorAll('.balance-track>span').forEach(segment => { segment.style.width = segment.dataset.width + '%'; });
      card.querySelector('.balance-track').classList.add('balance-animated');
    }, motionAllowed() ? 180 + index * 140 : 0);
  });
}
requestAnimationFrame(startPageAnimations);
