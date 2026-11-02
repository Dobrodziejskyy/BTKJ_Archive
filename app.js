const events = [
  { number: '00', date: '2020-05-23', displayDate: '23 maja 2020', category: 'poczatki', era: 'prequel', label: 'Prequel', title: 'Pierwszy dostępny stream na platformie Twitch.', description: 'Najstarszy dostępny zapis transmisji otwiera prequel historii BTKJ.', highlights: ['🎮 Epizod GTA V RP', '🤞 OG widownia. Nie do zobaczenia na aktualnych transmisjach.'], icon: '◁', theme: 'prequel', detail: 'Ten stream rozpoczyna okres poprzedzający właściwą historię społeczności — sezon Prequel.', url: 'https://www.twitch.tv/crisuuubtkj', linkLabel: 'Kanał crisuuubtkj na Twitchu' },
  { number: '01', date: '2021-03-25', displayDate: '25 marca 2021', category: 'poczatki', era: 'beginnings', label: 'Początki', title: 'Wszystko zaczęło się na Twitchu.', description: '25 marca 2021 roku na kanale crisuuubtkj na Twitchu zaczęła się historia naszej społeczności.', highlights: ['🎮 Legendarny stream z Drug Dealer Simulator', '🥳 Stream tak dobry, że zapoczątkował ponad 6 lat historii'], icon: '↗', theme: 'purple', detail: 'To właśnie tutaj zaczyna się historia BTKJ — OG społeczności minionych lat.', url: 'https://www.twitch.tv/crisuuubtkj', linkLabel: 'Kanał crisuuubtkj na Twitchu' }
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

const eventsSearch = document.querySelector('#events-search');
const eventsResults = document.querySelector('#events-results');
const eventsCount = document.querySelector('#events-count');
let eventsFilter = 'all';
function renderEventsPage() {
  if (!eventsResults) return;
  const query = eventsSearch.value.trim().toLocaleLowerCase('pl');
  const visible = events.filter(event => (eventsFilter === 'all' || event.era === eventsFilter) && (!query || Object.values(event).join(' ').toLocaleLowerCase('pl').includes(query)));
  eventsCount.textContent = visible.length + (visible.length === 1 ? ' wydarzenie' : ' wydarzenia');
  eventsResults.innerHTML = visible.length ? visible.map(event => `<article class="events-card"><time datetime="${event.date}">${event.displayDate}</time><div><span class="events-tag ${event.theme}">${event.label}</span><h2>${event.title}</h2><p>${event.description}</p></div><button type="button" class="events-expand" data-event-expand="${event.number}" aria-expanded="false" aria-controls="event-details-${event.number}" aria-label="Rozwiń opis wydarzenia: ${event.title}">›</button><div class="event-card-details" id="event-details-${event.number}" hidden>${event.highlights.map(item => `<p>${item}</p>`).join('')}</div></article>`).join('') : `<div class="events-empty"><strong>Brak pasujących wydarzeń</strong><span>Zmień wyszukiwanie lub wybierz inny filtr.</span></div>`;
}
eventsSearch?.addEventListener('input', renderEventsPage);
eventsResults?.addEventListener('click', event => {
  const button = event.target.closest('[data-event-expand]');
  if (!button) return;
  const details = eventsResults.querySelector(`#event-details-${button.dataset.eventExpand}`);
  const expanded = button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', String(expanded));
  button.setAttribute('aria-label', `${expanded ? 'Zwiń' : 'Rozwiń'} opis wydarzenia`);
  button.closest('.events-card').classList.toggle('expanded', expanded);
  details.hidden = !expanded;
});
document.querySelector('#events-filters')?.addEventListener('click', event => {
  const button = event.target.closest('[data-events-filter]');
  if (!button) return;
  eventsFilter = button.dataset.eventsFilter;
  document.querySelectorAll('[data-events-filter]').forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  renderEventsPage();
});
renderEventsPage();

document.querySelector('#open-settings').addEventListener('click', () => {
  document.querySelector('#settings-dialog').showModal();
});

const preferenceKey = 'btkj-drl-preferences-v1';
const defaults = {theme:'dark', oled:true, brightness:3, tint:false, 'compact-timeline':false, 'text-size':'normal', 'sticky-nav':false, 'smooth-scroll':true, 'hide-decorations':false, 'reduce-motion':false};
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
  document.documentElement.style.setProperty('--accent-rgb', '55,232,188');
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
document.addEventListener('click', async event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const hash = link.getAttribute('href');
  const target = hash === '#' ? document.documentElement : hash === '#aktorzy' ? document.querySelector('#actors-view') : document.getElementById(hash.slice(1));
  if (!target) return;
  event.preventDefault();
  await updatePageView(hash);
  const headerHeight = preferences['sticky-nav'] ? document.querySelector('.archive-topbar').offsetHeight : 0;
  const isPage = ['#wydarzenia','#obietnice','#vody','#media','#klipy','#aktorzy','#wazne','#info'].includes(hash);
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

const vodSearch = document.querySelector('#vod-search');
const vodSeasonCards = [...document.querySelectorAll('.vod-season-card')];
const vodEmpty = document.querySelector('#vod-empty');
vodSearch?.addEventListener('input', () => {
  const query = vodSearch.value.trim().toLocaleLowerCase('pl');
  let visible = 0;
  vodSeasonCards.forEach(card => {
    const matches = !query || card.dataset.vodSearch.toLocaleLowerCase('pl').includes(query);
    card.hidden = !matches;
    if (matches) visible += 1;
  });
  vodEmpty.hidden = visible > 0;
});

const promiseEntries = [{
  id: 'outlast-1k', date: '12 Kwietnia 2021r', promiseDate: '2021-04-12', time: '', title: 'Outlast na 1k obserwujących Twitch', status: 'done',
  priority: 3, source: 'brak źródła', details: 'obietnica na stream', platform: 'stream', pinned: false, modifiedRecently: false, resolvedAt: '2021-04-12', archived: false
}];
let promiseBalances = null;
const promiseStateKey = 'btkj-drl-promise-panel-v1';
let promiseState = {query:'', compact:false, remember:false, archive:false, sortBy:'promiseDate', sort:'desc', status:'all', priority:'all', platform:'all', pinned:false, modifiedRecently:false, dateType:'promiseDate', dateFrom:'', dateTo:'', calendar:'', stats:false, openFilter:''};
try {
  const saved = JSON.parse(localStorage.getItem(promiseStateKey) || '{}');
  if (saved.remember) promiseState = {...promiseState, ...saved, remember:true};
} catch {}
if (!['all','done','failed'].includes(promiseState.status)) promiseState.status = 'all';
const promisesView = document.querySelector('#obietnice');
promisesView.innerHTML = `<div class="archive-page-heading"><h1 id="obietnice-title"><span aria-hidden="true">▣</span>Obietnice</h1><small>Aktualizowana na bieżąco lista obietnic BTKJ <span aria-hidden="true">›</span></small></div>
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
    <div class="promise-search-row"><label class="archive-search"><span aria-hidden="true">⌕</span><input type="search" data-promise-search placeholder="Szukaj w obietnicach..." aria-label="Szukaj w obietnicach"></label><div class="promise-view-actions" aria-label="Widok i filtry"><button type="button" data-promise-action="open-filter" data-filter-panel="status" aria-label="Wybierz status" title="Status" aria-expanded="false">⌘</button><button type="button" data-promise-action="open-filter" data-filter-panel="priority" aria-label="Wybierz priorytet" title="Priorytet" aria-expanded="false">▥</button><button type="button" data-promise-action="open-filter" data-filter-panel="sort" aria-label="Wybierz sortowanie" title="Sortowanie" aria-expanded="false">⇅</button><button type="button" data-promise-action="open-filter" data-filter-panel="more" aria-label="Więcej filtrów" title="Więcej filtrów" aria-expanded="false">▽</button><button type="button" data-promise-action="reset" aria-label="Resetuj wszystkie filtry" title="Resetuj wszystkie filtry">↻</button></div></div>
    <div class="promise-filter-popover" data-promise-popover hidden></div>
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
    const matchesPriority = promiseState.priority === 'all' || entry.priority === Number(promiseState.priority);
    const matchesPlatform = promiseState.platform === 'all' || entry.platform === promiseState.platform;
    const matchesPinned = !promiseState.pinned || entry.pinned;
    const matchesRecent = !promiseState.modifiedRecently || entry.modifiedRecently;
    const matchesCalendar = !promiseState.calendar || entry.promiseDate === promiseState.calendar;
    const dateValue = promiseState.dateType === 'resolvedAt' ? entry.resolvedAt : entry.promiseDate;
    const matchesFrom = !promiseState.dateFrom || dateValue >= promiseState.dateFrom;
    const matchesTo = !promiseState.dateTo || dateValue <= promiseState.dateTo;
    return matchesQuery && matchesArchive && matchesStatus && matchesPriority && matchesPlatform && matchesPinned && matchesRecent && matchesCalendar && matchesFrom && matchesTo;
  });
  const compare = (a, b) => promiseState.sortBy === 'priority' ? a.priority - b.priority : (a[promiseState.sortBy] || '').localeCompare(b[promiseState.sortBy] || '');
  return rows.sort((a, b) => promiseState.sort === 'asc' ? compare(a, b) : compare(b, a));
}
function renderPromisePopover() {
  const popover = promisesView.querySelector('[data-promise-popover]');
  const panel = promiseState.openFilter;
  popover.hidden = !panel;
  promisesView.querySelectorAll('[data-filter-panel]').forEach(button => {
    const active = button.dataset.filterPanel === panel;
    button.classList.toggle('active', active);
    button.setAttribute('aria-expanded', String(active));
  });
  if (!panel) return;
  const selected = (key, value) => promiseState[key] === value ? ' selected' : '';
  if (panel === 'status') popover.innerHTML = `<div class="filter-popover-heading"><span>⌘</span><div><strong>Status</strong><small>Statusy w toku (żółte) można łączyć. Pozostałe działają pojedynczo.</small></div></div><div class="filter-option-grid status-options"><button class="${selected('status','all')}" data-filter-key="status" data-filter-value="all"><i class="dot-all"></i>Wszystkie</button><button class="${selected('status','pending_short')}" data-filter-key="status" data-filter-value="pending_short"><i class="dot-pending"></i>Do wykonania<br>niedługo</button><button class="${selected('status','pending_long')}" data-filter-key="status" data-filter-value="pending_long"><i class="dot-pending"></i>Do wykonania<br>długoterminowo</button><button class="${selected('status','conditional')}" data-filter-key="status" data-filter-value="conditional"><i class="dot-pending"></i>Warunkowe</button><button class="${selected('status','important')}" data-filter-key="status" data-filter-value="important"><i class="dot-important"></i>Ważne do<br>odwołania</button><button class="${selected('status','done')}" data-filter-key="status" data-filter-value="done"><i class="dot-done"></i>Wykonane</button><button class="${selected('status','failed')}" data-filter-key="status" data-filter-value="failed"><i class="dot-failed"></i>Niewykonane</button><button class="${selected('status','unknown')}" data-filter-key="status" data-filter-value="unknown"><i class="dot-all"></i>Nie wiadomo<br>czy wykonane</button></div>`;
  if (panel === 'priority') popover.innerHTML = `<div class="filter-popover-heading"><span>▥</span><div><strong>Priorytet</strong><small>Wybierz poziom ważności obietnic.</small></div></div><div class="filter-option-grid priority-options"><button class="${selected('priority','all')}" data-filter-key="priority" data-filter-value="all">Każdy</button>${[1,2,3,4,5].map(level => `<button class="${selected('priority',String(level))}" data-filter-key="priority" data-filter-value="${level}">${level}/5<span>${Array.from({length:5},(_,index)=>`<i${index<level?' class="active"':''}></i>`).join('')}</span></button>`).join('')}</div>`;
  if (panel === 'sort') popover.innerHTML = `<div class="filter-popover-heading"><span>⇅</span><div><strong>Sortowanie</strong><small>Kliknij aktywną opcję ponownie, aby odwrócić kolejność.</small></div></div><div class="filter-option-grid sort-options"><button class="${selected('sortBy','promiseDate')}" data-sort-field="promiseDate">Data obietnicy<small>${promiseState.sort === 'desc' ? 'Najnowsza' : 'Najstarsza'}</small></button><button class="${selected('sortBy','createdAt')}" data-sort-field="createdAt">Data dodania<small>${promiseState.sort === 'desc' ? 'Najnowsza' : 'Najstarsza'}</small></button><button class="${selected('sortBy','modifiedAt')}" data-sort-field="modifiedAt">Data modyfikacji<small>${promiseState.sort === 'desc' ? 'Najnowsza' : 'Najstarsza'}</small></button><button class="${selected('sortBy','resolvedAt')}" data-sort-field="resolvedAt">Data wykonania<small>${promiseState.sort === 'desc' ? 'Najnowsza' : 'Najstarsza'}</small></button><button class="${selected('sortBy','priority')}" data-sort-field="priority">Priorytet<small>${promiseState.sort === 'desc' ? 'Najwyższy' : 'Najniższy'}</small></button></div>`;
  if (panel === 'more') popover.innerHTML = `<div class="filter-popover-heading"><span>▽</span><div><strong>Więcej filtrów</strong><small>Wyróżnienia, platformy oraz zakres dat.</small></div></div><p class="filter-group-label">WYRÓŻNIENIA</p><div class="filter-option-grid"><button class="${promiseState.pinned?'selected':''}" data-filter-toggle="pinned">📌 Przypięte</button><button class="${promiseState.modifiedRecently?'selected':''}" data-filter-toggle="modifiedRecently">🔄 Niedawno<br>zmodyfikowane</button></div><p class="filter-group-label">GDZIE PADŁA OBIETNICA</p><div class="filter-option-grid platform-options"><button class="${selected('platform','stream')}" data-filter-key="platform" data-filter-value="stream">▣ na live</button><button class="${selected('platform','tiktok')}" data-filter-key="platform" data-filter-value="tiktok">◉ na TikToku</button><button class="${selected('platform','discord')}" data-filter-key="platform" data-filter-value="discord">♩ na VC Discord</button><button class="${selected('platform','text')}" data-filter-key="platform" data-filter-value="text">▤ w formie<br>tekstowej</button></div><p class="filter-group-label">ZAKRES DAT</p><div class="filter-option-grid"><button class="${selected('dateType','promiseDate')}" data-filter-key="dateType" data-filter-value="promiseDate">▣ Data obietnicy</button><button class="${selected('dateType','resolvedAt')}" data-filter-key="dateType" data-filter-value="resolvedAt">▣ Data wykonania</button></div><div class="filter-date-range"><label>OD<input type="date" data-promise-date="dateFrom" value="${promiseState.dateFrom}"></label><label>DO<input type="date" data-promise-date="dateTo" value="${promiseState.dateTo}"></label></div>`;
  const close = document.createElement('button');
  close.className = 'filter-popover-close';
  close.type = 'button';
  close.dataset.promiseAction = 'close-filter';
  close.setAttribute('aria-label', 'Zamknij filtry');
  close.textContent = '×';
  popover.querySelector('.filter-popover-heading').append(close);
}
function renderPromisePanel() {
  const rows = visiblePromiseEntries();
  const results = promisesView.querySelector('[data-promise-results]');
  promisesView.classList.toggle('promise-compact', promiseState.compact);
  const statusLabels = {done:'WYKONANE',failed:'NIEWYKONANE',testowe:'TESTOWE'};
  results.innerHTML = rows.length ? rows.map(entry => `<article class="promise-entry" data-promise-id="${entry.id}"><div class="promise-entry-top"><span><strong>${entry.date}</strong>${entry.time ? ` ${entry.time}` : ''}<small><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="14" height="14" rx="3"/><path d="m17 10 4-2v8l-4-2z"/></svg>${entry.details}</small></span><b class="status-${entry.status}">${statusLabels[entry.status] || entry.status}<i></i></b></div><h2>${entry.title}</h2><div class="promise-entry-bottom"><span class="promise-priority">Priorytet: <strong aria-label="${entry.priority} na 5">${Array.from({length:5}, (_, index) => `<i${index < entry.priority ? ' class="active"' : ''}></i>`).join('')}</strong></span><span>${entry.source}</span><div><button type="button" aria-label="Historia obietnicy" title="Historia">↻</button><button type="button" aria-label="Kopiuj link" title="Kopiuj link" data-copy-promise>↗</button></div></div></article>`).join('') : `<div class="promise-empty"><strong>Brak pasujących obietnic</strong><span>Zmień wyszukiwanie lub wyczyść filtry.</span></div>`;
  promisesView.querySelector('[data-promise-count]').textContent = rows.length + (rows.length === 1 ? ' wpis' : ' wpisów');
  const filterLabels = {all:'wszystkie',done:'wykonane',failed:'niewykonane',pending_short:'do wykonania niedługo',pending_long:'do wykonania długoterminowo',conditional:'warunkowe',important:'ważne do odwołania',unknown:'nie wiadomo'};
  promisesView.querySelector('[data-promise-status]').textContent = promiseState.archive ? 'archiwum' : filterLabels[promiseState.status] || promiseState.status;
  promisesView.querySelector('[data-stat="visible"]').textContent = rows.length;
  promisesView.querySelector('[data-promise-search]').value = promiseState.query;
  promisesView.querySelector('[data-promise-toggle="compact"]').checked = promiseState.compact;
  promisesView.querySelector('[data-promise-toggle="remember"]').checked = promiseState.remember;
  promisesView.querySelector('[data-promise-calendar]').value = promiseState.calendar;
  promisesView.querySelector('[data-promise-action="archive"]').setAttribute('aria-pressed', String(promiseState.archive));
  promisesView.querySelector('.promise-statistics').hidden = !promiseState.stats;
  promisesView.querySelectorAll('[data-promise-action="stats"]').forEach(button => button.setAttribute('aria-expanded', String(promiseState.stats)));
  renderPromisePopover();
  if (promiseBalances) refreshPromiseBalances(true);
  savePromiseState();
}
promisesView.addEventListener('input', event => {
  if (event.target.matches('[data-promise-search]')) promiseState.query = event.target.value;
  if (event.target.matches('[data-promise-calendar]')) promiseState.calendar = event.target.value;
  if (event.target.matches('[data-promise-date]')) promiseState[event.target.dataset.promiseDate] = event.target.value;
  if (event.target.matches('[data-promise-toggle]')) promiseState[event.target.dataset.promiseToggle] = event.target.checked;
  renderPromisePanel();
});
promisesView.addEventListener('click', async event => {
  const button = event.target.closest('[data-promise-action], [data-copy-promise], [data-filter-key], [data-filter-toggle], [data-sort-field]');
  if (!button) return;
  if (button.hasAttribute('data-copy-promise')) {
    try { await navigator.clipboard.writeText(location.href.split('#')[0] + '#obietnice'); button.textContent = '✓'; } catch {}
    return;
  }
  if (button.hasAttribute('data-filter-key')) {
    promiseState[button.dataset.filterKey] = button.dataset.filterValue;
    if (matchMedia('(max-width:700px)').matches) promiseState.openFilter = '';
    renderPromisePanel();
    return;
  }
  if (button.hasAttribute('data-filter-toggle')) {
    promiseState[button.dataset.filterToggle] = !promiseState[button.dataset.filterToggle];
    if (matchMedia('(max-width:700px)').matches) promiseState.openFilter = '';
    renderPromisePanel();
    return;
  }
  if (button.hasAttribute('data-sort-field')) {
    if (promiseState.sortBy === button.dataset.sortField) promiseState.sort = promiseState.sort === 'desc' ? 'asc' : 'desc';
    else {
      promiseState.sortBy = button.dataset.sortField;
      promiseState.sort = 'desc';
    }
    if (matchMedia('(max-width:700px)').matches) promiseState.openFilter = '';
    renderPromisePanel();
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
  if (action === 'stats') promiseState.stats = !promiseState.stats;
  if (action === 'open-filter') {
    promiseState.openFilter = promiseState.openFilter === button.dataset.filterPanel ? '' : button.dataset.filterPanel;
    renderPromisePanel();
    return;
  }
  if (action === 'close-filter') {
    promiseState.openFilter = '';
    renderPromisePanel();
    return;
  }
  if (action === 'reset') promiseState = {...promiseState, query:'', archive:false, sortBy:'promiseDate', sort:'desc', status:'all', priority:'all', platform:'all', pinned:false, modifiedRecently:false, dateType:'promiseDate', dateFrom:'', dateTo:'', calendar:'', openFilter:''};
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
document.addEventListener('click', event => {
  const filterInteraction = event.target.closest('[data-promise-popover], [data-filter-panel], [data-filter-key], [data-filter-toggle], [data-sort-field]');
  if (!promiseState.openFilter || filterInteraction) return;
  promiseState.openFilter = '';
  renderPromisePanel();
});
renderPromisePanel();

let currentPageKey;
let pageTransitionId = 0;
async function updatePageView(hash = location.hash, animate = true) {
  const pages = {wydarzenia:'Wydarzenia',obietnice:'Obietnice',vody:'VODy',media:'Media',klipy:'Klipy',aktorzy:'Aktorzy',wazne:'Ważne wydarzenia',info:'Informacje i kontakt'};
  const requested = hash.replace('#', '');
  const activePage = pages[requested] ? requested : 'home';
  const changingPage = Boolean(currentPageKey && currentPageKey !== activePage);
  const transition = changingPage && animate && motionAllowed();
  const transitionId = ++pageTransitionId;
  if (transition) {
    boostStarfield();
    document.body.classList.remove('page-entering');
    document.body.classList.add('page-leaving');
    await new Promise(resolve => setTimeout(resolve, 210));
    if (transitionId !== pageTransitionId) return;
  }
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
  document.title = activePage === 'home' ? 'BTKJ × DRL — Nasza historia zostaje' : pages[activePage] + ' — BTKJ Archive';
  if (transition) {
    document.body.classList.remove('page-leaving');
    document.body.classList.add('page-entering');
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    if (transitionId !== pageTransitionId) return;
    document.body.classList.remove('page-entering');
  }
}
window.addEventListener('popstate', () => updatePageView(location.hash));
window.addEventListener('hashchange', () => updatePageView(location.hash));
updatePageView(location.hash, false);

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

// Every promise card and both home-page balances use this same promiseEntries array.
function calculatePromiseBalance(records, now = new Date()) {
  const end = now.toISOString().slice(0, 10);
  const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 6, 1));
  month.setUTCDate(Math.min(now.getUTCDate(), new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate()));
  const start = month.toISOString().slice(0, 10);
  const summarize = rows => {
    const done = rows.filter(row => ['done','wykonane'].includes(row.status)).length;
    const failed = rows.filter(row => ['failed','niewykonane'].includes(row.status)).length;
    const resolved = done + failed;
    const total = rows.length;
    return {done, failed, resolved, total, percent: resolved ? Math.round(done / resolved * 100) : null};
  };
  return {all: summarize(records), recent: summarize(records.filter(row => /^\d{4}-\d{2}-\d{2}$/.test(row.resolvedAt) && row.resolvedAt >= start && row.resolvedAt <= end))};
}
function refreshPromiseBalances(applyWidths = false) {
  promiseBalances = calculatePromiseBalance(promiseEntries);
  document.querySelectorAll('[data-balance]').forEach(card => {
    const balance = promiseBalances[card.dataset.balance];
    const percent = card.querySelector('.balance-percent');
    const completed = card.querySelector('.balance-completed');
    const uncompleted = card.querySelector('.balance-uncompleted');
    const total = card.querySelector('.balance-total');
    percent.dataset.countTo = balance.percent ?? '';
    completed.dataset.countTo = balance.done;
    uncompleted.dataset.countTo = balance.failed;
    total.dataset.countTo = balance.total;
    percent.textContent = balance.percent === null ? '—' : balance.percent + '%';
    completed.textContent = '✓ ' + balance.done + ' Wykonane';
    uncompleted.textContent = balance.failed + ' Niewykonane ×';
    total.textContent = balance.total + ' łącznie';
    const track = card.querySelector('.balance-track');
    track.classList.toggle('is-empty', !balance.resolved);
    track.classList.toggle('is-all-done', balance.resolved > 0 && balance.done === balance.resolved);
    track.classList.toggle('is-all-failed', balance.resolved > 0 && balance.failed === balance.resolved);
    track.setAttribute('aria-label', `${balance.total} łącznie, ${balance.done} wykonane, ${balance.failed} niewykonane${balance.percent === null ? '' : `; ${balance.percent}% wykonanych`}`);
    const doneWidth = balance.resolved ? balance.done / balance.resolved * 100 : 0;
    const failedWidth = balance.resolved ? balance.failed / balance.resolved * 100 : 0;
    card.querySelector('.balance-done').dataset.width = doneWidth;
    card.querySelector('.balance-failed').dataset.width = failedWidth;
    if (applyWidths) {
      card.querySelector('.balance-done').style.width = doneWidth + '%';
      card.querySelector('.balance-failed').style.width = failedWidth + '%';
    }
  });
}
refreshPromiseBalances();

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
