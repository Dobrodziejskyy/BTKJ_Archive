const siteLoader = document.querySelector('#site-loader');
const siteLoaderTip = document.querySelector('#site-loader-tip');
const siteLoaderTips = [
  'Wpisz BTKJ na stronie, aby odblokować sekretny motyw.',
  'Historia archiwum sięga pierwszego zachowanego streama z 23 maja 2020 roku.',
  'Zdjęcia w Mediach możesz wyszukiwać po nazwie, dacie i kategorii.',
  'Przycisk Losuj w Obietnicach uruchamia pełnoekranową ruletkę.',
  'Każdy aktor ma osobny profil z rolą w historii społeczności.'
];
const siteLoaderStartedAt = performance.now();
let siteLoaderDismissed = false;
let siteLoaderTipIndex = 0;
try {
  siteLoaderTipIndex = Math.max(0, Number(sessionStorage.getItem('btkj-loader-tip-v1')) || 0) % siteLoaderTips.length;
  sessionStorage.setItem('btkj-loader-tip-v1', String(siteLoaderTipIndex + 1));
} catch {}
if (siteLoaderTip) siteLoaderTip.textContent = siteLoaderTips[siteLoaderTipIndex];
function dismissSiteLoader() {
  if (!siteLoader || siteLoaderDismissed) return;
  siteLoaderDismissed = true;
  siteLoader.classList.add('is-leaving');
  document.body.classList.remove('is-loading');
  setTimeout(() => {
    siteLoader.remove();
    document.dispatchEvent(new Event('btkj:loader-hidden'));
  }, 420);
}
function queueSiteLoaderDismissal() {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const minimumDuration = reduceMotion ? 350 : 1450;
  setTimeout(dismissSiteLoader, Math.max(0, minimumDuration - (performance.now() - siteLoaderStartedAt)));
}
window.addEventListener('load', queueSiteLoaderDismissal, {once:true});
setTimeout(queueSiteLoaderDismissal, 5000);

const events = [
  { number: '00', date: '2020-05-23', displayDate: '23 maja 2020', category: 'poczatki', era: 'prequel', label: 'Prequel', title: 'Pierwszy dostępny stream na platformie Twitch.', description: 'Najstarszy dostępny zapis transmisji otwiera prequel historii BTKJ.', highlights: ['🎮 Epizod GTA V RP', '🤞 OG widownia. Nie do zobaczenia na aktualnych transmisjach.'], theme: 'prequel', detail: 'Ten stream rozpoczyna okres poprzedzający właściwą historię społeczności — sezon Prequel.', url: 'https://www.twitch.tv/crisuuubtkj', linkLabel: 'Kanał crisuuubtkj na Twitchu' },
  { number: '01', date: '2021-03-25', displayDate: '25 marca 2021', category: 'poczatki', era: 'beginnings', label: 'Początki', title: 'Wszystko zaczęło się na Twitchu.', description: '25 marca 2021 roku na kanale crisuuubtkj na Twitchu zaczęła się historia naszej społeczności.', highlights: ['🎮 Legendarny stream z Drug Dealer Simulator', '🥳 Stream tak dobry, że zapoczątkował ponad 6 lat historii'], theme: 'purple', detail: 'To właśnie tutaj zaczyna się historia BTKJ — OG społeczności minionych lat.', url: 'https://www.twitch.tv/crisuuubtkj', linkLabel: 'Kanał crisuuubtkj na Twitchu' }
];
const list = document.querySelector('#timeline-list');
function render(filter = 'all') {
  list.replaceChildren();
  const visibleEvents = events
    .filter(event => filter === 'all' || event.category === filter)
    .sort((first, second) => second.date.localeCompare(first.date));
  if (!visibleEvents.length) {
    const message = document.createElement('p');
    message.className = 'section-description';
    message.textContent = 'Nie dodaliśmy jeszcze wspomnień w tej kategorii.';
    list.append(message);
  }
  for (const event of visibleEvents) {
    const article = document.createElement('article');
    article.className = 'event';
    article.innerHTML = `<div class="event-date"><span>ROZDZIAŁ ${event.number}</span><small><time datetime="${event.date}">${event.displayDate}</time></small></div><div class="timeline-dot"></div><div class="event-card"><div class="event-text"><span class="category ${event.theme}">${event.label}</span><h3>${event.title}</h3><p>${event.description}</p><details><summary>O tym wspomnieniu <span>↗</span></summary><p>${event.detail}</p><p><a href="${event.url}" target="_blank" rel="noopener noreferrer">${event.linkLabel} ↗</a></p></details></div></div>`;
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
const btkjUnlockKey = 'btkj-theme-unlocked-v1';
let btkjThemeUnlocked = false;
try { btkjThemeUnlocked = localStorage.getItem(btkjUnlockKey) === 'true'; } catch {}
const themeControl = document.querySelector('#theme');
function revealBtkjThemeOption() {
  if (!themeControl.querySelector('option[value="btkj"]')) themeControl.add(new Option('BTKJ', 'btkj'));
  const description = themeControl.closest('.preference').querySelector('p');
  description.textContent = 'Wybierz ciemny, jasny lub odblokowany motyw BTKJ.';
}
if (btkjThemeUnlocked) revealBtkjThemeOption();
if (!['dark','light'].includes(preferences.theme) && !(btkjThemeUnlocked && preferences.theme === 'btkj')) preferences.theme = 'dark';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function navigationBehavior() {
  return preferences['smooth-scroll'] && !preferences['reduce-motion'] && !reducedMotion.matches ? 'smooth' : 'instant';
}
function applyPreferences() {
  const light = preferences.theme === 'light';
  document.body.classList.toggle('light-theme', light);
  document.body.classList.toggle('btkj-theme', preferences.theme === 'btkj');
  document.body.classList.toggle('oled-mode', preferences.theme === 'dark' && preferences.oled);
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
let btkjKeyboardSequence = '';
document.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey || event.repeat || event.key.length !== 1) return;
  btkjKeyboardSequence = (btkjKeyboardSequence + event.key.toUpperCase()).slice(-4);
  if (btkjKeyboardSequence !== 'BTKJ' || btkjThemeUnlocked) return;
  btkjThemeUnlocked = true;
  try { localStorage.setItem(btkjUnlockKey, 'true'); } catch {}
  revealBtkjThemeOption();
  preferences.theme = 'btkj';
  applyPreferences();
  const toast = document.createElement('div');
  toast.className = 'theme-unlock-toast';
  toast.setAttribute('role', 'status');
  toast.innerHTML = '<b>BTKJ</b><span>Odblokowano ukryty motyw</span>';
  document.body.append(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => { toast.classList.remove('visible'); setTimeout(() => toast.remove(), 250); }, 2600);
});
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
function drawStarfield(now) {
  const elapsed = Math.min(34, now - lastStarFrame);
  lastStarFrame = now;
  starContext.clearRect(0, 0, starWidth, starHeight);
  const centerX = starWidth / 2;
  const centerY = starHeight / 2;
  const depthStep = reducedMotion.matches ? 0 : .00022 * elapsed;
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
  const target = hash === '#' ? document.documentElement : hash === '#aktorzy' ? document.querySelector('#actors-view') : hash.startsWith('#aktorzy/') ? document.querySelector('#actor-detail-view') : hash.startsWith('#vody/') ? document.querySelector('#vod-season-view') : document.getElementById(hash.slice(1));
  if (!target) return;
  event.preventDefault();
  if (link.dataset.promiseStatusLink) {
    promiseState = {...promiseState, query:'', archive:false, status:link.dataset.promiseStatusLink, priority:'all', platform:'all', pinned:false, modifiedRecently:false, dateType:'promiseDate', dateFrom:'', dateTo:'', calendar:'', openFilter:''};
    renderPromisePanel();
  }
  const returningToActors = location.hash.startsWith('#aktorzy/') && hash === '#aktorzy';
  await updatePageView(hash);
  const headerHeight = preferences['sticky-nav'] ? document.querySelector('.archive-topbar').offsetHeight : 0;
  const isPage = hash.startsWith('#aktorzy/') || hash.startsWith('#vody/') || ['#wydarzenia','#obietnice','#vody','#media','#klipy','#aktorzy','#wazne','#info'].includes(hash);
  const top = returningToActors ? actorListScrollY : hash === '#' || isPage ? 0 : target.getBoundingClientRect().top + window.scrollY - headerHeight - 24;
  window.scrollTo({top: Math.max(0, top), behavior: navigationBehavior()});
  if (location.hash !== hash) {
    try { history.pushState(null, '', hash); } catch {}
  }
});

const actors = [{
  slug: 'crisuuubtkj', name: 'crisuuubtkj', role: 'pierwszoplanowa', initials: 'C', image: './assets/images/pfp-crisuuubtkj.png',
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
  slug: 'dobrodziejskyy', name: 'Dobrodziejskyy', role: 'drugoplanowa', initials: 'D', image: './assets/images/pfp-dobrodziejskyy.jpg',
  description: 'OG moderator.',
  detail: 'Dołączył dokładnie 25 marca podczas pierwszego streama legendarnego pierwszego sezonu streamerskiego crisa.<br><br>Późniejszy założyciel DRL, do którego przeszła spora liczba osób po zakończeniu systematycznego streamowania crisa.<br><br>Pomimo braku dalszych streamów oraz innych form aktywności społeczności dalej robi edity, udziela się na starych społecznościowych Discordach i robi to, co robił wcześniej, bez większej zmiany.',
  note: 'Outlast DLC HOPE', hopeIcon: true, socials: [], linksLabel: 'Brak linków'
}, {
  slug: 'nieczortm', name: 'NieczorTM', role: 'trzecioplanowa', initials: 'N', image: './assets/images/pfp-nieczortm.png',
  description: 'OG widz z czasów przed rozpoczęciem legendarnego okresu streamów crisa.',
  detail: 'Odciął się on od społeczności po incydencie z banowaniem i unbanowaniem toksycznych osób w 2025 roku.',
  socials: [], linksLabel: 'Brak linków'
}, {
  slug: 'ferdynant', name: 'Ferdynant', role: 'trzecioplanowa', initials: 'F', image: './assets/images/pfp-ferdynant.png',
  description: 'OG moderator.',
  detail: "Aktualnie przesiaduje u Svitalskiego i Randombruce'a. Nieaktywny od dłuższego czasu.",
  talentHunter: 'Parę razy zespotowany podczas przeglądu Twitch na streamach osób mało znanych, wyglądających i contentem przypominających Makajlera, Rafatusa i Rafonixa.',
  talentVideo: 'https://www.youtube-nocookie.com/embed/v08fNQY-97o?start=303&autoplay=1&rel=0',
  socials: [], linksLabel: 'Brak linków'
}];
const actorDetailView = document.querySelector('#actor-detail-view');
function actorAvatarMarkup(actor, size = 96) {
  return actor.image ? `<img class="actor-avatar actor-photo" src="${actor.image}" alt="${actor.name}" width="${size}" height="${size}">` : `<span class="actor-avatar" aria-hidden="true">${actor.initials}</span>`;
}
function actorSocialMarkup(actor) {
  const links = actor.socials?.map(social => `<a class="actor-link social-${social.type}" href="${social.url}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">●</span>${social.name} ↗</a>`).join('') || '';
  return links ? `<div class="actor-socials" aria-label="Profile społecznościowe">${links}</div>` : `<p class="actor-no-links">${actor.linksLabel || 'Brak linków'}</p>`;
}
function actorExtrasMarkup(actor) {
  const note = actor.note ? `<p class="actor-note">${actor.hopeIcon ? `<span class="hope-icon" role="img" aria-label="HOPE, nawiązanie do Half-Life 3" title="HOPE — Half-Life 3">λ³</span>` : ''}<span>${actor.note}</span></p>` : '';
  const talent = actor.talentHunter ? `<div class="talent-hunter"><span>🍺 TALENT HUNTER</span><details><summary aria-label="Więcej informacji o odznace Talent Hunter" title="Więcej informacji">i</summary><div class="talent-hunter-panel"><p>${actor.talentHunter}</p>${actor.talentVideo ? `<div class="talent-video"><iframe data-src="${actor.talentVideo}" title="Talent Hunter — Ferdynant" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>` : ''}</div></details></div>` : '';
  return note + talent;
}
function bindTalentPlayer(scope) {
  const details = scope.querySelector('.talent-hunter details');
  details?.addEventListener('toggle', () => {
    const player = details.querySelector('iframe');
    if (player) player.src = details.open ? player.dataset.src : '';
  });
}
function renderActorDetail(actor) {
  if (!actor) return;
  const actorIndex = actors.indexOf(actor);
  const previousActor = actors[actorIndex - 1];
  const nextActor = actors[actorIndex + 1];
  const previousLink = previousActor ? `<a href="#aktorzy/${previousActor.slug}" class="actor-profile-sibling previous"><span aria-hidden="true">←</span><small>Poprzedni aktor</small><strong>${previousActor.name}</strong></a>` : '<span></span>';
  const nextLink = nextActor ? `<a href="#aktorzy/${nextActor.slug}" class="actor-profile-sibling next"><small>Następny aktor</small><strong>${nextActor.name}</strong><span aria-hidden="true">→</span></a>` : '<span></span>';
  actorDetailView.innerHTML = `<div class="actor-profile-heading"><span>POSTAĆ ${actor.role.toLocaleUpperCase('pl')}</span><h1>${actor.name}</h1></div><div class="actor-profile-hero-row"><a href="#aktorzy" class="actor-profile-back" aria-label="Wróć do listy aktorów" title="Wróć do listy aktorów">←</a><article class="panel actor-profile-hero">${actorAvatarMarkup(actor, 112)}<div><span class="actor-role">${actor.role}</span><h2>${actor.name}</h2><p>${actor.description}</p></div></article></div><section class="actor-profile-section"><h2><span aria-hidden="true">◆</span> Kim jest</h2><div class="panel actor-profile-content"><p>${actor.detail}</p>${actorExtrasMarkup(actor)}</div></section><section class="actor-profile-section"><h2><span aria-hidden="true">↗</span> Linki</h2><div class="panel actor-profile-links">${actorSocialMarkup(actor)}</div></section><nav class="actor-profile-navigation" aria-label="Przejdź między aktorami">${previousLink}${nextLink}</nav>`;
  bindTalentPlayer(actorDetailView);
}
let actorFilter = 'all';
function renderActors() {
  const query = document.querySelector('#actor-search').value.trim().toLocaleLowerCase('pl');
  const results = actors.filter(actor => (actorFilter === 'all' || actor.role === actorFilter) && [actor.name, actor.role, actor.description, actor.detail, actor.note, actor.talentHunter].join(' ').toLocaleLowerCase('pl').includes(query));
  const container = document.querySelector('#actors-list');
  container.replaceChildren();
  document.querySelector('#actors-count').textContent = results.length + ' ' + (results.length === 1 ? 'wpis' : results.length % 10 >= 2 && results.length % 10 <= 4 && (results.length % 100 < 12 || results.length % 100 > 14) ? 'wpisy' : 'wpisów');
  for (const actor of results) {
    const card = document.createElement('article');
    card.className = actor.role === 'pierwszoplanowa' ? 'actor-card featured-actor' : 'actor-card supporting-actor';
    card.innerHTML = `<a class="actor-card-link" href="#aktorzy/${actor.slug}" aria-label="Otwórz profil aktora ${actor.name}">${actorAvatarMarkup(actor)}<span class="actor-overview"><strong>${actor.name}</strong><span class="actor-role">${actor.role}</span><span class="actor-description">${actor.description}</span></span><span class="actor-chevron" aria-hidden="true">›</span></a>`;
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
document.querySelector('#actor-filters').addEventListener('click', event => {
  const button = event.target.closest('[data-actor-filter]');
  if (!button) return;
  actorFilter = button.dataset.actorFilter;
  document.querySelectorAll('[data-actor-filter]').forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  renderActors();
});
renderActors();

const mediaItems = [
  {src:'./assets/images/media/btkj-gang-bmw-front.webp', alt:'Zielono-czarne BMW z malowaniem BTKJ Gang widziane od przodu', title:'BMW BTKJ Gang — przód', created:'24 lutego 2020', datetime:'2020-02-24', dateSearch:'24 lutego 2020 24.02.2020 2020-02-24', tags:'Forza Horizon 4 BTKJ Gang BMW samochód auto przód', type:'photo', category:'general', categoryLabel:'Ogólne'},
  {src:'./assets/images/media/btkj-gang-bmw-rear.webp', alt:'Zielono-czarne BMW z malowaniem BTKJ Gang widziane od tyłu', title:'BMW BTKJ Gang — tył', created:'24 lutego 2020', datetime:'2020-02-24', dateSearch:'24 lutego 2020 24.02.2020 2020-02-24', tags:'Forza Horizon 4 BTKJ Gang BMW samochód auto tył', type:'photo', category:'general', categoryLabel:'Ogólne'},
  {src:'./assets/images/media/minecraft-season-1.webp', alt:'Postać Steve przed drewnianym domem z pierwszego sezonu serwera Minecraft', title:'Minecraft — pierwszy sezon serwera', created:'8 października 2022', datetime:'2022-10-08', dateSearch:'8 października 2022 8.10.2022 08.10.2022 2022-10-08', tags:'Minecraft serwer sezon 1 pierwszy sezon Steve dom', type:'photo', category:'minecraft-season-1', categoryLabel:'Pierwszy sezon Minecraft'}
];
const mediaGrid = document.querySelector('#media-grid');
const mediaDialog = document.querySelector('#media-lightbox');
const mediaDialogImage = document.querySelector('#media-lightbox-image');
let activeMediaIndex = 0;
let mediaFilter = 'all';
let mediaCategory = 'all';
function showMediaItem(index) {
  activeMediaIndex = (index + mediaItems.length) % mediaItems.length;
  const item = mediaItems[activeMediaIndex];
  mediaDialogImage.src = item.src;
  mediaDialogImage.alt = item.alt;
  document.querySelector('#media-lightbox-title').textContent = item.title;
  const mediaDate = document.querySelector('#media-lightbox-date');
  mediaDate.textContent = item.created;
  mediaDate.dateTime = item.datetime;
  const visibleIndexes = [...mediaGrid.querySelectorAll('[data-media-index]:not([hidden])')].map(card => Number(card.dataset.mediaIndex));
  const visiblePosition = visibleIndexes.indexOf(activeMediaIndex);
  document.querySelector('#media-lightbox-position').textContent = `${visiblePosition + 1} / ${visibleIndexes.length}`;
}
mediaGrid?.addEventListener('click', event => {
  const card = event.target.closest('[data-media-index]');
  if (!card) return;
  showMediaItem(Number(card.dataset.mediaIndex));
  if (!mediaDialog.open) mediaDialog.showModal();
});
mediaDialog?.addEventListener('click', event => {
  const step = event.target.closest('[data-media-step]');
  if (step) stepVisibleMedia(Number(step.dataset.mediaStep));
});
mediaDialog?.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') stepVisibleMedia(-1);
  if (event.key === 'ArrowRight') stepVisibleMedia(1);
});
function stepVisibleMedia(step) {
  const visibleIndexes = [...mediaGrid.querySelectorAll('[data-media-index]:not([hidden])')].map(card => Number(card.dataset.mediaIndex));
  if (!visibleIndexes.length) return;
  const currentPosition = Math.max(0, visibleIndexes.indexOf(activeMediaIndex));
  showMediaItem(visibleIndexes[(currentPosition + step + visibleIndexes.length) % visibleIndexes.length]);
}
document.querySelector('#media-filters')?.addEventListener('click', event => {
  const button = event.target.closest('[data-media-filter]');
  if (!button) return;
  mediaFilter = button.dataset.mediaFilter;
  document.querySelectorAll('[data-media-filter]').forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  renderMediaCatalog();
  document.querySelector('#media-collection').scrollIntoView({behavior:navigationBehavior(), block:'start'});
});
document.querySelector('#media-categories')?.addEventListener('click', event => {
  const button = event.target.closest('[data-media-category]');
  if (!button) return;
  mediaCategory = button.dataset.mediaCategory;
  document.querySelectorAll('#media-categories [data-media-category]').forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  renderMediaCatalog();
  document.querySelector('#media-collection').scrollIntoView({behavior:navigationBehavior(), block:'start'});
});
function normalizeMediaSearch(value) {
  return String(value).toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l').replace(/[–—−]/g, '-').replace(/[./_\-]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function renderMediaCatalog() {
  const queryTokens = normalizeMediaSearch(document.querySelector('#media-search').value).split(' ').filter(Boolean);
  let visible = 0;
  const visibleItems = [];
  mediaGrid.querySelectorAll('[data-media-type]').forEach(card => {
    const item = mediaItems[Number(card.dataset.mediaIndex)];
    const matchesType = mediaFilter === 'all' || card.dataset.mediaType === mediaFilter;
    const matchesCategory = mediaCategory === 'all' || item.category === mediaCategory;
    const searchText = normalizeMediaSearch([item.title,item.dateSearch,item.categoryLabel,item.alt,item.tags].join(' '));
    const matchesQuery = queryTokens.every(token => searchText.includes(token));
    const matches = matchesType && matchesCategory && matchesQuery;
    card.hidden = !matches;
    if (matches) {
      visible += 1;
      visibleItems.push(item);
    }
  });
  mediaGrid.hidden = visible === 0;
  document.querySelector('#media-empty').hidden = visible !== 0;
  const labels = {all:'Obrazy',video:'Wideo',audio:'Audio',photo:'Obrazy',gif:'GIF-y'};
  const categoryLabels = {general:'Ogólne','minecraft-season-1':'Pierwszy sezon Minecraft'};
  document.querySelector('#media-group-title').textContent = mediaCategory === 'all' ? labels[mediaFilter] : categoryLabels[mediaCategory];
  document.querySelector('#media-visible-count').textContent = `${visible} ${visible === 1 ? 'plik' : visible >= 2 && visible <= 4 ? 'pliki' : 'plików'}`;
  const visibleYears = [...new Set(visibleItems.map(item => item.datetime.slice(0,4)))].sort();
  document.querySelector('#media-date-summary').textContent = !visibleItems.length ? 'brak materiałów' : visibleItems.length === 1 ? visibleItems[0].created : visibleYears.length === 1 ? visibleYears[0] : `${visibleYears[0]}–${visibleYears.at(-1)}`;
}
document.querySelector('#media-search')?.addEventListener('input', renderMediaCatalog);
renderMediaCatalog();

// Uzupełniając stream, dodaj: title, startedAt, durationMinutes, category
// ('music' lub 'games') oraz archiveStatus ('available' lub 'lost').
// Wszystkie wartości w panelu sezonu są liczone z tych rekordów.
const vodSeasons = [{
  slug: 'prequel', number: 1, title: 'Prequel', platform: 'Twitch',
  description: 'Pierwszy sezon archiwum', startDate: '2020-05-23', endDate: '2020-10-15',
  knownStreamCount: 8, streams: []
}];
const vodSearch = document.querySelector('#vod-search');
const vodSeasonList = document.querySelector('#vod-season-list');
const vodSeasonCount = document.querySelector('#vod-season-count');
const vodEmpty = document.querySelector('#vod-empty');
const vodSeasonView = document.querySelector('#vod-season-view');
const vodEscape = value => String(value ?? '').replace(/[&<>"]/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[character]));
const vodDateKey = stream => String(stream?.startedAt || stream?.date || '').slice(0, 10);
function parseVodDay(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? timestamp : null;
}
function vodStreamNoun(count) {
  const value = Number(count) || 0;
  return value === 1 ? 'stream' : value % 10 >= 2 && value % 10 <= 4 && (value % 100 < 12 || value % 100 > 14) ? 'streamy' : 'streamów';
}
function vodStreamCountLabel(count) {
  const value = Number(count) || 0;
  return `${value} ${vodStreamNoun(value)}`;
}
function vodSeasonCountLabel(count) {
  const value = Number(count) || 0;
  return `${value} ${value === 1 ? 'sezon' : value % 10 >= 2 && value % 10 <= 4 && (value % 100 < 12 || value % 100 > 14) ? 'sezony' : 'sezonów'}`;
}
function formatVodDate(value, capitalize = false) {
  const timestamp = parseVodDay(value);
  if (timestamp === null) return 'Brak daty';
  const label = new Intl.DateTimeFormat('pl-PL', {day:'numeric', month:'long', year:'numeric', timeZone:'UTC'}).format(timestamp);
  return capitalize ? label.replace(/^(\d+\s+)(\p{L})/u, (_, prefix, letter) => prefix + letter.toLocaleUpperCase('pl')) : label;
}
function formatVodDuration(value) {
  if (!Number.isFinite(value) || value <= 0) return '—';
  const minutes = Math.round(value);
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours ? `${hours}h${remainder ? `${remainder}min` : ''}` : `${remainder}min`;
}
function formatVodDays(value, prefix = '') {
  if (!Number.isFinite(value)) return '—';
  const rounded = Math.round(value * 10) / 10;
  const number = Number.isInteger(rounded) ? String(rounded) : rounded.toLocaleString('pl-PL', {maximumFractionDigits:1});
  const suffix = rounded === 1 ? 'dzień' : 'dni';
  return `${prefix}${number} ${suffix}`;
}
function circularVodMean(values) {
  if (!values.length) return null;
  const angle = values.reduce((sum, value) => sum + Math.sin(value / 1440 * Math.PI * 2), 0);
  const radius = values.reduce((sum, value) => sum + Math.cos(value / 1440 * Math.PI * 2), 0);
  const mean = Math.atan2(angle / values.length, radius / values.length);
  return Math.round(((mean < 0 ? mean + Math.PI * 2 : mean) / (Math.PI * 2)) * 1440) % 1440;
}
function formatVodClock(minutes) {
  if (!Number.isFinite(minutes)) return '—';
  const normalized = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(normalized % 60).padStart(2, '0')}`;
}
function vodArchiveStatus(stream) {
  if (stream?.archiveStatus === 'available' || stream?.archiveStatus === 'lost') return stream.archiveStatus;
  if (stream?.available === true) return 'available';
  if (stream?.available === false) return 'lost';
  return 'unknown';
}
function calculateVodStats(season) {
  const streams = Array.isArray(season?.streams) ? season.streams : [];
  const total = Math.max(Number(season?.knownStreamCount) || 0, streams.length);
  const music = streams.filter(stream => ['music','muzyka'].includes(stream.category)).length;
  const games = streams.filter(stream => ['games','gierki'].includes(stream.category)).length;
  const durationStreams = streams.filter(stream => Number.isFinite(stream.durationMinutes) && stream.durationMinutes > 0);
  const totalDuration = durationStreams.reduce((sum, stream) => sum + stream.durationMinutes, 0);
  const averageDuration = durationStreams.length ? totalDuration / durationStreams.length : null;
  const byDuration = [...durationStreams].sort((a, b) => a.durationMinutes - b.durationMinutes);
  const shortest = byDuration[0] || null;
  const longest = byDuration.at(-1) || null;
  const dated = streams.map(stream => ({stream, key:vodDateKey(stream), timestamp:parseVodDay(vodDateKey(stream))})).filter(item => item.timestamp !== null).sort((a, b) => a.timestamp - b.timestamp);
  const uniqueDays = [...new Set(dated.map(item => item.timestamp))].sort((a, b) => a - b);
  const averageFrequency = dated.length > 1 ? (dated.at(-1).timestamp - dated[0].timestamp) / 86400000 / (dated.length - 1) : null;
  let longestBreak = null;
  for (let index = 1; index < uniqueDays.length; index += 1) {
    const days = (uniqueDays[index] - uniqueDays[index - 1]) / 86400000;
    if (!longestBreak || days > longestBreak.days) longestBreak = {days, from:uniqueDays[index - 1], to:uniqueDays[index]};
  }
  let longestDaily = uniqueDays.length ? 1 : null;
  let currentDaily = uniqueDays.length ? 1 : 0;
  for (let index = 1; index < uniqueDays.length; index += 1) {
    currentDaily = uniqueDays[index] - uniqueDays[index - 1] === 86400000 ? currentDaily + 1 : 1;
    longestDaily = Math.max(longestDaily, currentDaily);
  }
  const starts = streams.map(stream => {
    const match = String(stream.startedAt || '').match(/T(\d{2}):(\d{2})/);
    return match ? {stream, minutes:Number(match[1]) * 60 + Number(match[2])} : null;
  }).filter(Boolean);
  const typicalStart = circularVodMean(starts.map(item => item.minutes));
  const typicalEnd = circularVodMean(starts.filter(item => Number.isFinite(item.stream.durationMinutes) && item.stream.durationMinutes > 0).map(item => item.minutes + item.stream.durationMinutes));
  const monthsByKey = new Map();
  dated.forEach(({stream, key}) => {
    const monthKey = key.slice(0, 7);
    const month = monthsByKey.get(monthKey) || {key:monthKey, count:0, duration:0};
    month.count += 1;
    if (Number.isFinite(stream.durationMinutes) && stream.durationMinutes > 0) month.duration += stream.durationMinutes;
    monthsByKey.set(monthKey, month);
  });
  const months = [...monthsByKey.values()].sort((a, b) => a.key.localeCompare(b.key));
  const available = streams.filter(stream => vodArchiveStatus(stream) === 'available');
  const lost = streams.filter(stream => vodArchiveStatus(stream) === 'lost');
  const unknownArchive = Math.max(0, total - available.length - lost.length);
  const detailed = streams.filter(stream => parseVodDay(vodDateKey(stream)) !== null && /T\d{2}:\d{2}/.test(String(stream.startedAt || '')) && Number.isFinite(stream.durationMinutes) && stream.durationMinutes > 0 && ['music','muzyka','games','gierki'].includes(stream.category) && vodArchiveStatus(stream) !== 'unknown').length;
  return {streams, total, music, games, durationStreams, totalDuration, averageDuration, shortest, longest, dated, averageFrequency, longestBreak, longestDaily, typicalStart, typicalEnd, months, available, lost, unknownArchive, detailed};
}
function vodSeasonRange(season) {
  const dates = [season.startDate, season.endDate, ...(season.streams || []).map(vodDateKey)].filter(value => parseVodDay(value) !== null).sort();
  return {start:dates[0] || '', end:dates.at(-1) || dates[0] || ''};
}
function renderVodSeasons() {
  if (!vodSeasonList) return;
  const query = (vodSearch?.value || '').trim().toLocaleLowerCase('pl');
  const visible = vodSeasons.filter(season => {
    const stats = calculateVodStats(season);
    const range = vodSeasonRange(season);
    const searchText = [season.title, season.platform, season.description, vodStreamCountLabel(stats.total), formatVodDate(range.start), formatVodDate(range.end), ...(season.streams || []).flatMap(stream => [stream.title, stream.category, vodDateKey(stream)])].join(' ').toLocaleLowerCase('pl');
    return !query || searchText.includes(query);
  });
  vodSeasonList.innerHTML = visible.map(season => {
    const stats = calculateVodStats(season);
    const range = vodSeasonRange(season);
    return `<a class="vod-season-card" href="#vody/${encodeURIComponent(season.slug)}" aria-label="Otwórz sezon ${vodEscape(season.title)}"><div class="vod-season-thumbnail" role="img" aria-label="Tymczasowa miniatura sezonu ${vodEscape(season.title)}"><span>${vodEscape(season.title)}</span></div><div class="vod-season-content"><div class="vod-season-title"><div><small>SEZON ${season.number}</small><h3>${vodEscape(season.title)}</h3></div><span aria-hidden="true">›</span></div><p class="vod-season-date"><time datetime="${range.start}">${formatVodDate(range.start, true)}</time><span>—</span><time datetime="${range.end}">${formatVodDate(range.end, true)}</time></p><div class="vod-season-meta"><strong>${vodStreamCountLabel(stats.total)}</strong><span>${vodEscape(season.description)}</span></div></div></a>`;
  }).join('');
  if (vodSeasonCount) vodSeasonCount.textContent = vodSeasonCountLabel(visible.length);
  if (vodEmpty) vodEmpty.hidden = visible.length > 0;
}
function vodStreamSummary(stream) {
  if (!stream) return 'Brak danych';
  const title = stream.title ? vodEscape(stream.title) : 'Stream';
  const date = vodDateKey(stream);
  return date ? `${title} · ${formatVodDate(date)}` : title;
}
const vodStatIcons = {
  chart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 18 5-5 4 3 7-8M15 8h5v5"/></svg>',
  total: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5v5h5M4.8 9A8 8 0 1 1 4 14"/><path d="M12 7v5l3 2"/></svg>',
  average: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M9 2h6M12 5v3M12 13l3-2"/></svg>',
  longest: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V5M7 10l5-5 5 5M5 20h14"/></svg>',
  shortest: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-7 12h6l-1 8 7-12h-6z"/></svg>',
  frequency: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h3l2-5 4 10 3-7 2 2h4"/></svg>',
  gap: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9 8v8M15 8v8"/></svg>',
  daily: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 10h18M8 14h3"/></svg>',
  hours: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/></svg>'
};
function vodStatTile(icon, value, label, detail = '') {
  return `<article class="vod-stat-tile"><span class="vod-stat-icon" aria-hidden="true">${vodStatIcons[icon] || ''}</span><strong>${value}</strong><small>${label}</small>${detail ? `<p>${detail}</p>` : ''}</article>`;
}
function formatVodTimestamp(timestamp) {
  if (!Number.isFinite(timestamp)) return 'Brak danych';
  return formatVodDate(new Date(timestamp).toISOString().slice(0, 10));
}
function renderVodSeasonDetail(season) {
  if (!vodSeasonView || !season) return;
  const stats = calculateVodStats(season);
  const range = vodSeasonRange(season);
  const maxMonthCount = Math.max(1, ...stats.months.map(month => month.count));
  const archiveKnown = stats.available.length + stats.lost.length;
  const availableWidth = stats.total ? stats.available.length / stats.total * 100 : 0;
  const lostWidth = stats.total ? stats.lost.length / stats.total * 100 : 0;
  const monthRows = stats.months.length ? stats.months.map(month => {
    const label = new Intl.DateTimeFormat('pl-PL', {month:'long', year:'numeric', timeZone:'UTC'}).format(parseVodDay(`${month.key}-01`));
    const width = month.count / maxMonthCount * 100;
    return `<div class="vod-month-row"><strong>${label}</strong><span class="vod-month-track" aria-hidden="true"><i style="width:${width}%"></i></span><b>${month.count}</b><small>${formatVodDuration(month.duration)}</small></div>`;
  }).join('') : '<p class="vod-month-empty">Miesiące pojawią się po dodaniu dat streamów.</p>';
  const durationDetail = stats.durationStreams.length ? `Na podstawie ${stats.durationStreams.length} z ${stats.total}` : 'Brak danych o czasie';
  const longestBreakDetail = stats.longestBreak ? `${formatVodTimestamp(stats.longestBreak.from)} → ${formatVodTimestamp(stats.longestBreak.to)}` : 'Brak danych o datach';
  const typicalHours = stats.typicalStart === null ? '—' : `${formatVodClock(stats.typicalStart)}${stats.typicalEnd === null ? '' : ` → ~${formatVodClock(stats.typicalEnd)}`}`;
  vodSeasonView.innerHTML = `<div class="vod-season-detail-header"><a class="vod-season-back" href="#vody" aria-label="Wróć do sezonów">←</a><div class="vod-season-identity"><small>PLATFORMA: ${vodEscape(season.platform).toLocaleUpperCase('pl')}</small><h1 id="vod-season-title">${vodEscape(season.title)}</h1><p>${vodStreamCountLabel(stats.total)} <span>·</span> ${formatVodDate(range.start)} — ${formatVodDate(range.end)}</p></div><aside><span>O sezonie</span><p>${vodEscape(season.description)}.</p></aside></div><div class="vod-season-detail-actions"><button class="vod-stats-toggle active" type="button" data-vod-stats-toggle aria-expanded="true" aria-controls="vod-season-stats"><span aria-hidden="true">${vodStatIcons.chart}</span> Statystyki</button></div><section class="panel vod-stats-panel" id="vod-season-stats" aria-labelledby="vod-stats-title"><div class="vod-stats-overview"><div><small id="vod-stats-title">STREAMY</small><p><strong>${stats.total}</strong> ${vodStreamNoun(stats.total)} <b class="vod-count-music">${stats.music}</b> muzyka <b class="vod-count-games">${stats.games}</b> gierki</p></div><span>Dane <strong>${stats.detailed}/${stats.total}</strong></span></div><div class="vod-archive-summary"><div class="vod-archive-heading"><span>DOSTĘPNOŚĆ ARCHIWUM</span><span>lost media <strong>${archiveKnown ? stats.lost.length : '—'}</strong></span></div><div class="vod-archive-track" role="img" aria-label="${stats.available.length} zachowanych, ${stats.lost.length} lost media, ${stats.unknownArchive} bez statusu"><i class="available" style="width:${availableWidth}%"></i><i class="lost" style="width:${lostWidth}%"></i></div><div class="vod-archive-labels"><span>${stats.available.length} zachowanych</span><span>${stats.lost.length} lost media · ${stats.unknownArchive} bez statusu</span></div></div>${stats.detailed < stats.total ? `<p class="vod-stats-notice"><span aria-hidden="true">i</span> Statystyki uzupełnią się automatycznie po dodaniu dat, godzin, kategorii i czasu streamów.</p>` : ''}<section class="vod-stat-section"><h2>CZAS STREAMÓW</h2><div class="vod-stat-grid">${vodStatTile('total', formatVodDuration(stats.totalDuration), 'ŁĄCZNIE NA STREAMIE', durationDetail)}${vodStatTile('average', formatVodDuration(stats.averageDuration), 'ŚREDNI CZAS STREAMA', durationDetail)}${vodStatTile('longest', formatVodDuration(stats.longest?.durationMinutes), 'NAJDŁUŻSZY STREAM', vodStreamSummary(stats.longest))}${vodStatTile('shortest', formatVodDuration(stats.shortest?.durationMinutes), 'NAJKRÓTSZY STREAM', vodStreamSummary(stats.shortest))}</div></section><section class="vod-stat-section"><h2>RYTM</h2><div class="vod-stat-grid">${vodStatTile('frequency', formatVodDays(stats.averageFrequency, 'co '), 'CZĘSTOTLIWOŚĆ', stats.dated.length > 1 ? `${formatVodDate(vodDateKey(stats.dated[0].stream))} → ${formatVodDate(vodDateKey(stats.dated.at(-1).stream))}` : 'Brak danych o datach')}${vodStatTile('gap', formatVodDays(stats.longestBreak?.days), 'NAJDŁUŻSZA PRZERWA', longestBreakDetail)}${vodStatTile('daily', formatVodDays(stats.longestDaily), 'NAJDŁUŻSZE DAILY', stats.longestDaily ? 'Kolejne dni ze streamem' : 'Brak danych o datach')}${vodStatTile('hours', typicalHours, 'TYPOWE GODZINY', stats.typicalStart === null ? 'Brak danych o godzinach' : 'Średnia pora rozpoczęcia i zakończenia')}</div></section><section class="vod-stat-section vod-months"><h2>STREAMY WG MIESIĘCY</h2>${monthRows}</section></section>`;
}
vodSearch?.addEventListener('input', renderVodSeasons);
vodSeasonView?.addEventListener('click', event => {
  const toggle = event.target.closest('[data-vod-stats-toggle]');
  if (!toggle) return;
  const panel = vodSeasonView.querySelector('#vod-season-stats');
  const expanded = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!expanded));
  toggle.classList.toggle('active', !expanded);
  panel.hidden = expanded;
});
renderVodSeasons();

const clipsSearch = document.querySelector('#clips-search');
const clipsList = document.querySelector('#clips-list');
const clipsEmpty = document.querySelector('#clips-empty');
const clipsVisibleCount = document.querySelector('#clips-visible-count');
const clipPlayerDialog = document.querySelector('#clip-player-dialog');
const clipPlayerFrame = document.querySelector('#clip-player-frame');
const normalizeClipSearch = value => String(value).toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l').replace(/[.+/_-]+/g, ' ').replace(/\s+/g, ' ').trim();
function getClipEmbedUrl(clipId, autoplay) {
  const embedUrl = new URL('https://clips.twitch.tv/embed');
  embedUrl.searchParams.set('clip', clipId);
  embedUrl.searchParams.set('parent', location.hostname || 'localhost');
  embedUrl.searchParams.set('autoplay', String(autoplay));
  return embedUrl;
}
function renderClips() {
  const queryTokens = normalizeClipSearch(clipsSearch?.value).split(' ').filter(Boolean);
  let visible = 0;
  clipsList?.querySelectorAll('[data-clip-search]').forEach(card => {
    const searchText = normalizeClipSearch(card.dataset.clipSearch);
    const matches = queryTokens.every(token => searchText.includes(token));
    card.hidden = !matches;
    if (matches) visible += 1;
  });
  if (clipsList) clipsList.hidden = visible === 0;
  if (clipsEmpty) clipsEmpty.hidden = visible !== 0;
  if (clipsVisibleCount) clipsVisibleCount.textContent = `${visible} ${visible === 1 ? 'klip' : visible >= 2 && visible <= 4 ? 'klipy' : 'klipów'}`;
}
clipsSearch?.addEventListener('input', renderClips);
clipsList?.querySelectorAll('[data-clip-id]').forEach(card => {
  const preview = card.querySelector('[data-clip-preview]');
  if (preview) preview.src = getClipEmbedUrl(card.dataset.clipId, false);
});
clipsList?.addEventListener('click', event => {
  const card = event.target.closest('[data-clip-id]');
  if (!card || !clipPlayerDialog || !clipPlayerFrame) return;
  clipPlayerFrame.src = getClipEmbedUrl(card.dataset.clipId, true);
  if (!clipPlayerDialog.open) clipPlayerDialog.showModal();
});
clipPlayerDialog?.addEventListener('close', () => clipPlayerFrame.removeAttribute('src'));
renderClips();

const promiseEntries = [{
  id: 'outlast-1k', date: '12 Kwietnia 2021r', promiseDate: '2021-04-12', time: '', title: 'Outlast na 1k obserwujących Twitch', status: 'done',
  priority: 3, source: 'brak źródła', details: 'obietnica na stream', platform: 'stream', pinned: false, modifiedRecently: false, resolvedAt: '2021-04-12', archived: false
}, {
  id: 'fortnite-42h', date: '11 listopada 2021r', promiseDate: '2021-11-11', time: '17:33', title: '42h stream z kolejnego sezonu fortnite', status: 'failed',
  priority: 3, source: 'Archive.org', sourceUrl: 'https://archive.org/details/obietnica-42h-z-fortnite', clipUrl: 'https://www.twitch.tv/crisuuubtkj/clip/SeductiveCourageousCiderWoofer-WSXlLQjD7HyOgKOG', details: 'obietnica na stream', platform: 'stream', pinned: false, modifiedRecently: false, resolvedAt: '2021-11-11', archived: false
}];
let promiseBalances = null;
const promiseStateKey = 'btkj-drl-promise-panel-v1';
let promiseState = {query:'', compact:false, remember:false, archive:false, sortBy:'promiseDate', sort:'desc', status:'all', priority:'all', platform:'all', pinned:false, modifiedRecently:false, dateType:'promiseDate', dateFrom:'', dateTo:'', calendar:'', openFilter:''};
try {
  const saved = JSON.parse(localStorage.getItem(promiseStateKey) || '{}');
  if (saved.remember) promiseState = {...promiseState, ...saved, remember:true};
} catch {}
if (!['all','pending','done','failed'].includes(promiseState.status)) promiseState.status = 'all';
const promisesView = document.querySelector('#obietnice');
promisesView.innerHTML = `<div class="archive-page-heading"><h1 id="obietnice-title"><svg class="page-title-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h8l4 4v16H6zM14 2v5h4M9 11h6M9 15h6M9 19h4"/></svg>Obietnice</h1><small>Aktualizowana na bieżąco lista obietnic BTKJ <span aria-hidden="true">›</span></small></div>
  <section class="panel promise-control-panel" aria-label="Narzędzia obietnic">
    <div class="promise-actions">
      <button type="button" data-promise-action="archive" aria-pressed="false"><span aria-hidden="true">▱</span>Archiwum</button>
      <button type="button" data-promise-action="random"><span aria-hidden="true">⚄</span>Losuj</button>
      <button type="button" data-promise-action="calendar" aria-expanded="false"><span aria-hidden="true">▣</span>Kalendarz</button>
      <label class="promise-switch">Widok kompaktowy <input type="checkbox" data-promise-toggle="compact" role="switch"><i></i></label>
      <label class="promise-switch">Pamiętaj filtry <input type="checkbox" data-promise-toggle="remember" role="switch"><i></i></label>
    </div>
    <div class="promise-calendar" hidden><label>Data <input type="date" data-promise-calendar></label><button type="button" data-promise-action="clear-calendar">Wyczyść</button></div>
    <div class="promise-search-row"><label class="archive-search"><span aria-hidden="true">⌕</span><input type="search" data-promise-search placeholder="Szukaj w obietnicach..." aria-label="Szukaj w obietnicach"></label><div class="promise-view-actions" aria-label="Widok i filtry"><button type="button" data-promise-action="open-filter" data-filter-panel="status" aria-label="Wybierz status" title="Status" aria-expanded="false">⌘</button><button type="button" data-promise-action="open-filter" data-filter-panel="priority" aria-label="Wybierz priorytet" title="Priorytet" aria-expanded="false">▥</button><button type="button" data-promise-action="open-filter" data-filter-panel="sort" aria-label="Wybierz sortowanie" title="Sortowanie" aria-expanded="false">⇅</button><button type="button" data-promise-action="open-filter" data-filter-panel="more" aria-label="Więcej filtrów" title="Więcej filtrów" aria-expanded="false">▽</button><button type="button" data-promise-action="reset" aria-label="Resetuj wszystkie filtry" title="Resetuj wszystkie filtry">↻</button></div></div>
    <div class="promise-filter-popover" data-promise-popover hidden></div>
  </section>
  <div class="promise-list-meta"><strong data-promise-count>2 wpisy</strong><span>STATUS: <b data-promise-status>wszystkie</b></span><span>↻ Ostatnia aktualizacja: <b><time datetime="2026-11-02T19:13">02.11.2026 19:13</time></b></span></div>
  <section class="panel promise-results" data-promise-results aria-live="polite"></section>`;
const promiseRandomDialog = document.querySelector('#promise-random-dialog');
const promiseRandomTitle = promiseRandomDialog.querySelector('#promise-random-title');
const promiseRandomReel = promiseRandomDialog.querySelector('[data-random-reel]');
const promiseRandomTrack = promiseRandomDialog.querySelector('[data-random-track]');
const promiseRandomEmpty = promiseRandomDialog.querySelector('[data-random-empty]');
const promiseRandomPrimary = promiseRandomDialog.querySelector('[data-random-action="primary"]');
const promiseRandomPrimaryLabel = promiseRandomDialog.querySelector('[data-random-primary-label]');
const promiseRandomReroll = promiseRandomDialog.querySelector('[data-random-action="reroll"]');
const promiseRandomActionLabel = promiseRandomDialog.querySelector('[data-random-action-label]');
const promiseRandomAnnouncement = promiseRandomDialog.querySelector('[data-random-announcement]');
let promiseRandomAnimation = null;
let promiseRandomTimers = [];
let promiseRandomRunId = 0;
let promiseRandomChosen = null;
let lastRandomPromiseId = '';
let promiseRandomSoundMuted = false;
let promiseRandomAudioContext = null;

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
    const matchesStatus = promiseState.status === 'all' || (promiseState.status === 'pending' ? !['done','failed'].includes(entry.status) : entry.status === promiseState.status);
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
function randomPromiseCardMarkup(entry) {
  const statusLabels = {done:'WYKONANE',failed:'NIEWYKONANE',pending_short:'NIEDŁUGO',pending_long:'DŁUGOTERMINOWA',conditional:'WARUNKOWA',important:'WAŻNA',unknown:'NIE WIADOMO'};
  const source = entry.clipUrl ? 'ARCHIVE · TWITCH' : entry.source;
  return `<article class="random-promise-card" data-random-promise-id="${entry.id}"><div class="random-promise-card-top"><span><strong>${entry.date}</strong>${entry.time ? ` <small>${entry.time}</small>` : ''}</span><b class="random-promise-status status-${entry.status}">${statusLabels[entry.status] || entry.status}<i></i></b></div><h2>${entry.title}</h2><div class="random-promise-card-bottom"><span class="promise-priority">Priorytet: <strong aria-label="${entry.priority} na 5">${Array.from({length:5}, (_, index) => `<i${index < entry.priority ? ' class="active"' : ''}></i>`).join('')}</strong></span><span>${source}</span></div></article>`;
}
function clearPromiseRandomTimers() {
  promiseRandomTimers.forEach(timer => clearTimeout(timer));
  promiseRandomTimers = [];
}
function cancelPromiseRandomRun() {
  promiseRandomRunId += 1;
  clearPromiseRandomTimers();
  promiseRandomAnimation?.cancel();
  promiseRandomAnimation = null;
}
function playPromiseRandomTone(final = false) {
  if (promiseRandomSoundMuted) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  try {
    promiseRandomAudioContext ||= new AudioContextClass();
    promiseRandomAudioContext.resume?.();
    const now = promiseRandomAudioContext.currentTime;
    const oscillator = promiseRandomAudioContext.createOscillator();
    const gain = promiseRandomAudioContext.createGain();
    oscillator.type = final ? 'sine' : 'triangle';
    oscillator.frequency.setValueAtTime(final ? 660 : 230, now);
    if (final) oscillator.frequency.exponentialRampToValueAtTime(880, now + .14);
    gain.gain.setValueAtTime(final ? .035 : .018, now);
    gain.gain.exponentialRampToValueAtTime(.0001, now + (final ? .24 : .055));
    oscillator.connect(gain).connect(promiseRandomAudioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + (final ? .25 : .06));
  } catch {}
}
function promiseRandomScopeLabel() {
  const hasDetailedFilter = Boolean(
    promiseState.query.trim() || promiseState.priority !== 'all' || promiseState.platform !== 'all' ||
    promiseState.pinned || promiseState.modifiedRecently || promiseState.calendar ||
    promiseState.dateFrom || promiseState.dateTo
  );
  if (hasDetailedFilter) return 'aktywny filtr';
  if (promiseState.archive) return 'archiwum';
  return {all:'wszystkie',pending:'do wykonania',done:'wykonane',failed:'niewykonane'}[promiseState.status] || 'aktywny filtr';
}
function buildPromiseRandomSequence(pool, chosen) {
  const sequence = [];
  let previous = null;
  for (let index = 0; index < 20; index += 1) {
    const candidates = pool.length > 1 ? pool.filter(entry => entry.id !== previous?.id) : pool;
    const next = candidates[Math.floor(Math.random() * candidates.length)];
    sequence.push(next);
    previous = next;
  }
  if (pool.length > 1 && sequence.at(-1).id === chosen.id) sequence[sequence.length - 1] = pool.find(entry => entry.id !== chosen.id);
  sequence.push(chosen);
  const trailing = pool.length > 1 ? pool.filter(entry => entry.id !== chosen.id) : pool;
  sequence.push(trailing[Math.floor(Math.random() * trailing.length)]);
  return sequence;
}
function showPromiseRandomResult(chosen, runId) {
  if (runId !== promiseRandomRunId || !chosen) return;
  const statusLabels = {done:'wykonane',failed:'niewykonane',pending_short:'niedługo',pending_long:'długoterminowa',conditional:'warunkowa',important:'ważna',unknown:'nie wiadomo'};
  lastRandomPromiseId = chosen.id;
  promiseRandomDialog.dataset.phase = 'result';
  promiseRandomTrack.setAttribute('aria-hidden', 'false');
  promiseRandomPrimaryLabel.textContent = 'Otwórz';
  promiseRandomReroll.hidden = false;
  promiseRandomReroll.disabled = false;
  promiseRandomActionLabel.textContent = 'Losuj ponownie';
  promiseRandomAnnouncement.textContent = `Wylosowano: ${chosen.title}. Data: ${chosen.date}${chosen.time ? `, ${chosen.time}` : ''}. Status: ${statusLabels[chosen.status] || chosen.status}. Priorytet: ${chosen.priority} na 5.`;
  playPromiseRandomTone(true);
}
function settlePromiseRandom(chosen, runId, immediate = false) {
  if (runId !== promiseRandomRunId || !chosen) return;
  clearPromiseRandomTimers();
  promiseRandomAnimation?.cancel();
  promiseRandomAnimation = null;
  promiseRandomDialog.dataset.phase = immediate ? 'result' : 'settling';
  promiseRandomReel.classList.add('is-result');
  promiseRandomTrack.style.transform = '';
  promiseRandomTrack.innerHTML = randomPromiseCardMarkup(chosen);
  if (immediate) showPromiseRandomResult(chosen, runId);
  else promiseRandomTimers.push(setTimeout(() => showPromiseRandomResult(chosen, runId), 1050));
}
function startPromiseRandom() {
  cancelPromiseRandomRun();
  const runId = promiseRandomRunId;
  const pool = visiblePromiseEntries();
  promiseRandomChosen = null;
  promiseRandomTrack.style.transform = '';
  promiseRandomTrack.setAttribute('aria-hidden', 'true');
  promiseRandomTrack.replaceChildren();
  promiseRandomReel.classList.remove('is-result','is-empty');
  promiseRandomEmpty.hidden = true;
  promiseRandomPrimary.disabled = false;
  promiseRandomPrimaryLabel.textContent = 'Pomiń animację';
  promiseRandomReroll.hidden = false;
  promiseRandomReroll.disabled = true;
  promiseRandomActionLabel.textContent = 'Losowanie';
  promiseRandomAnnouncement.textContent = '';
  if (!promiseRandomDialog.open) promiseRandomDialog.showModal();
  if (!pool.length) {
    promiseRandomDialog.dataset.phase = 'empty';
    promiseRandomTitle.textContent = 'Brak obietnic do losowania';
    promiseRandomReel.classList.add('is-empty');
    promiseRandomEmpty.hidden = false;
    promiseRandomPrimaryLabel.textContent = 'Zamknij';
    promiseRandomReroll.hidden = true;
    promiseRandomAnnouncement.textContent = 'Brak obietnic pasujących do aktualnych filtrów.';
    requestAnimationFrame(() => promiseRandomPrimary.focus());
    return;
  }
  const candidates = pool.length > 1 ? pool.filter(entry => entry.id !== lastRandomPromiseId) : pool;
  promiseRandomChosen = candidates[Math.floor(Math.random() * candidates.length)];
  const countLabel = pool.length === 1 ? 'obietnicy' : 'obietnic';
  promiseRandomTitle.textContent = `Losowanie z ${pool.length} ${countLabel} (${promiseRandomScopeLabel()})`;
  promiseRandomDialog.dataset.phase = 'rolling';
  const sequence = buildPromiseRandomSequence(pool, promiseRandomChosen);
  promiseRandomTrack.innerHTML = sequence.map(randomPromiseCardMarkup).join('');
  requestAnimationFrame(() => promiseRandomPrimary.focus());
  if (!motionAllowed() || pool.length === 1) {
    settlePromiseRandom(promiseRandomChosen, runId, true);
    return;
  }
  const tickDelays = [170,310,450,590,730,870,1010,1160,1320,1490,1680,1890,2120,2380,2670,3010,3400,3840,4310,4740];
  tickDelays.forEach(delay => promiseRandomTimers.push(setTimeout(() => {
    if (runId === promiseRandomRunId) playPromiseRandomTone();
  }, delay)));
  requestAnimationFrame(() => {
    if (runId !== promiseRandomRunId) return;
    const firstCard = promiseRandomTrack.querySelector('.random-promise-card');
    const gap = parseFloat(getComputedStyle(promiseRandomTrack).rowGap) || 12;
    const cardHeight = firstCard.getBoundingClientRect().height;
    const step = cardHeight + gap;
    const chosenIndex = sequence.length - 2;
    const centeredOffset = Math.max(0, (promiseRandomReel.clientHeight - cardHeight) / 2);
    const distance = Math.max(0, chosenIndex * step - centeredOffset);
    promiseRandomAnimation = promiseRandomTrack.animate([
      {transform:'translateY(0)'},
      {transform:`translateY(-${distance}px)`}
    ], {duration:5000, easing:'cubic-bezier(.08,.72,.12,1)', fill:'forwards'});
    promiseRandomAnimation.finished.then(() => settlePromiseRandom(promiseRandomChosen, runId)).catch(() => {});
  });
}
function openPromiseRandomResult() {
  const chosenId = promiseRandomChosen?.id;
  if (!chosenId) return;
  promiseRandomDialog.close();
  renderPromisePanel();
  const card = promisesView.querySelector(`[data-promise-id="${chosenId}"]`);
  if (!card) return;
  card.tabIndex = -1;
  card.classList.add('is-random');
  card.focus({preventScroll:true});
  requestAnimationFrame(() => {
    card.scrollIntoView({behavior:navigationBehavior(), block:'center'});
    setTimeout(() => card.classList.remove('is-random'), 1200);
  });
}
promiseRandomDialog.addEventListener('click', event => {
  const button = event.target.closest('[data-random-action]');
  if (!button) return;
  const action = button.dataset.randomAction;
  if (action === 'close') promiseRandomDialog.close();
  if (action === 'sound') {
    promiseRandomSoundMuted = !promiseRandomSoundMuted;
    button.classList.toggle('is-muted', promiseRandomSoundMuted);
    button.setAttribute('aria-pressed', String(promiseRandomSoundMuted));
    button.setAttribute('aria-label', promiseRandomSoundMuted ? 'Włącz dźwięk losowania' : 'Wycisz dźwięk losowania');
    if (!promiseRandomSoundMuted) playPromiseRandomTone();
  }
  if (action === 'primary') {
    const phase = promiseRandomDialog.dataset.phase;
    if (phase === 'rolling' || phase === 'settling') settlePromiseRandom(promiseRandomChosen, promiseRandomRunId, true);
    else if (phase === 'result') openPromiseRandomResult();
    else promiseRandomDialog.close();
  }
  if (action === 'reroll' && !button.disabled) startPromiseRandom();
});
promiseRandomDialog.addEventListener('close', cancelPromiseRandomRun);
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
  if (panel === 'status') popover.innerHTML = `<div class="filter-popover-heading"><span>⌘</span><div><strong>Status</strong><small>Statusy w toku (żółte) można łączyć. Pozostałe działają pojedynczo.</small></div></div><div class="filter-option-grid status-options"><button class="${selected('status','all')}" data-filter-key="status" data-filter-value="all"><i class="dot-all"></i>Wszystkie</button><button class="${selected('status','pending')}" data-filter-key="status" data-filter-value="pending"><i class="dot-pending"></i>Do wykonania<br>wszystkie</button><button class="${selected('status','pending_short')}" data-filter-key="status" data-filter-value="pending_short"><i class="dot-pending"></i>Do wykonania<br>niedługo</button><button class="${selected('status','pending_long')}" data-filter-key="status" data-filter-value="pending_long"><i class="dot-pending"></i>Do wykonania<br>długoterminowo</button><button class="${selected('status','conditional')}" data-filter-key="status" data-filter-value="conditional"><i class="dot-pending"></i>Warunkowe</button><button class="${selected('status','important')}" data-filter-key="status" data-filter-value="important"><i class="dot-important"></i>Ważne do<br>odwołania</button><button class="${selected('status','done')}" data-filter-key="status" data-filter-value="done"><i class="dot-done"></i>Wykonane</button><button class="${selected('status','failed')}" data-filter-key="status" data-filter-value="failed"><i class="dot-failed"></i>Niewykonane</button><button class="${selected('status','unknown')}" data-filter-key="status" data-filter-value="unknown"><i class="dot-all"></i>Nie wiadomo<br>czy wykonane</button></div>`;
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
  results.innerHTML = rows.length ? rows.map(entry => `<article class="promise-entry" data-promise-id="${entry.id}"><div class="promise-entry-top"><span><strong>${entry.date}</strong>${entry.time ? ` ${entry.time}` : ''}<small><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="14" height="14" rx="3"/><path d="m17 10 4-2v8l-4-2z"/></svg>${entry.details}</small></span><b class="status-${entry.status}">${statusLabels[entry.status] || entry.status}<i></i></b></div><h2>${entry.title}</h2><div class="promise-entry-bottom"><span class="promise-priority">Priorytet: <strong aria-label="${entry.priority} na 5">${Array.from({length:5}, (_, index) => `<i${index < entry.priority ? ' class="active"' : ''}></i>`).join('')}</strong></span>${entry.sourceUrl ? `<a class="promise-source-link" href="${entry.sourceUrl}" target="_blank" rel="noopener noreferrer" aria-label="${entry.source} — otwórz w nowej karcie">${entry.source} ↗</a>` : `<span>${entry.source}</span>`}${entry.clipUrl ? `<a class="promise-source-link promise-source-twitch" href="${entry.clipUrl}" target="_blank" rel="noopener noreferrer" aria-label="Klip Twitch — otwórz w nowej karcie">Klip Twitch ↗</a>` : ''}<div><button type="button" aria-label="Historia obietnicy" title="Historia">↻</button><button type="button" aria-label="Kopiuj link" title="Kopiuj link" data-copy-promise>↗</button></div></div></article>`).join('') : `<div class="promise-empty"><strong>Brak pasujących obietnic</strong><span>Zmień wyszukiwanie lub wyczyść filtry.</span></div>`;
  const countLabel = rows.length === 1 ? 'wpis' : rows.length >= 2 && rows.length <= 4 ? 'wpisy' : 'wpisów';
  promisesView.querySelector('[data-promise-count]').textContent = `${rows.length} ${countLabel}`;
  const filterLabels = {all:'wszystkie',pending:'do wykonania',done:'wykonane',failed:'niewykonane',pending_short:'do wykonania niedługo',pending_long:'do wykonania długoterminowo',conditional:'warunkowe',important:'ważne do odwołania',unknown:'nie wiadomo'};
  promisesView.querySelector('[data-promise-status]').textContent = promiseState.archive ? 'archiwum' : filterLabels[promiseState.status] || promiseState.status;
  promisesView.querySelector('[data-promise-search]').value = promiseState.query;
  promisesView.querySelector('[data-promise-toggle="compact"]').checked = promiseState.compact;
  promisesView.querySelector('[data-promise-toggle="remember"]').checked = promiseState.remember;
  promisesView.querySelector('[data-promise-calendar]').value = promiseState.calendar;
  promisesView.querySelector('[data-promise-action="archive"]').setAttribute('aria-pressed', String(promiseState.archive));
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
    startPromiseRandom();
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
let actorListScrollY = 0;
async function updatePageView(hash = location.hash, animate = true) {
  const pages = {wydarzenia:'Wydarzenia',obietnice:'Obietnice',vody:'VODy',media:'Media',klipy:'Klipy',aktorzy:'Aktorzy',wazne:'Ważne wydarzenia',info:'Informacje i kontakt'};
  const requested = hash.replace(/^#/, '');
  const actorSlug = requested.startsWith('aktorzy/') ? requested.slice('aktorzy/'.length) : '';
  const selectedActor = actorSlug ? actors.find(actor => actor.slug === actorSlug) : null;
  const encodedVodSeasonSlug = requested.startsWith('vody/') ? requested.slice('vody/'.length) : '';
  let vodSeasonSlug = encodedVodSeasonSlug;
  try { vodSeasonSlug = decodeURIComponent(encodedVodSeasonSlug); } catch {}
  const selectedVodSeason = vodSeasonSlug ? vodSeasons.find(season => season.slug === vodSeasonSlug) : null;
  const activePage = selectedActor ? 'aktor-szczegoly' : selectedVodSeason ? 'vod-sezon' : pages[requested] ? requested : actorSlug ? 'aktorzy' : vodSeasonSlug ? 'vody' : 'home';
  const previousPage = currentPageKey;
  if (previousPage === 'aktorzy' && activePage === 'aktor-szczegoly') actorListScrollY = window.scrollY;
  const returningToActorList = previousPage === 'aktor-szczegoly' && activePage === 'aktorzy';
  if (activePage !== 'aktor-szczegoly') actorDetailView.querySelectorAll('iframe').forEach(player => { player.src = ''; });
  const changingPage = Boolean(currentPageKey && currentPageKey !== activePage);
  const transition = changingPage && animate && motionAllowed();
  const transitionId = ++pageTransitionId;
  if (transition) {
    document.body.classList.remove('page-entering');
    document.body.classList.add('page-leaving');
    await new Promise(resolve => setTimeout(resolve, 210));
    if (transitionId !== pageTransitionId) return;
  }
  if (selectedActor) renderActorDetail(selectedActor);
  if (selectedVodSeason) renderVodSeasonDetail(selectedVodSeason);
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
    const current = activePage === 'home' ? item.getAttribute('href') === '#' : activePage === 'aktor-szczegoly' ? item.getAttribute('href') === '#aktorzy' : activePage === 'vod-sezon' ? item.getAttribute('href') === '#vody' : item.getAttribute('href') === '#' + activePage;
    item.classList.toggle('is-current', current);
    if (current) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
  });
  document.title = activePage === 'home' ? 'BTKJ Archive' : selectedActor ? selectedActor.name + ' — Aktorzy — BTKJ Archive' : selectedVodSeason ? selectedVodSeason.title + ' — VODy — BTKJ Archive' : pages[activePage] + ' — BTKJ Archive';
  if (transition) {
    document.body.classList.remove('page-leaving');
    document.body.classList.add('page-entering');
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    if (transitionId !== pageTransitionId) return;
    document.body.classList.remove('page-entering');
  }
  if (returningToActorList) requestAnimationFrame(() => window.scrollTo({top:actorListScrollY, behavior:'auto'}));
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
function refreshPromiseBalances(applyWidths = false, applyValues = true) {
  promiseBalances = calculatePromiseBalance(promiseEntries);
  const all = promiseBalances.all;
  const promiseStats = {pending: all.total - all.resolved, done: all.done, failed: all.failed, total: all.total};
  document.querySelectorAll('[data-promise-stat]').forEach(element => {
    const value = promiseStats[element.dataset.promiseStat] ?? 0;
    if (applyValues) element.textContent = value;
    element.dataset.countTo = value;
    element.setAttribute('aria-label', String(value));
  });
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
    if (applyValues) {
      percent.textContent = balance.percent === null ? '—' : balance.percent + '%';
      completed.textContent = '✓ ' + balance.done + ' Wykonane';
      uncompleted.textContent = balance.failed + ' Niewykonane ×';
      total.textContent = balance.total + ' łącznie';
    }
    const track = card.querySelector('.balance-track');
    card.classList.toggle('is-empty', !balance.resolved);
    track.classList.toggle('is-empty', !balance.resolved);
    track.classList.toggle('is-all-done', balance.resolved > 0 && balance.done === balance.resolved);
    track.classList.toggle('is-all-failed', balance.resolved > 0 && balance.failed === balance.resolved);
    track.setAttribute('aria-label', `${balance.total} łącznie, ${balance.done} wykonane, ${balance.failed} niewykonane${balance.percent === null ? '' : `; ${balance.percent}% wykonanych`}`);
    const doneWidth = balance.resolved ? balance.done / balance.resolved * 100 : 0;
    const failedWidth = balance.resolved ? balance.failed / balance.resolved * 100 : 0;
    card.querySelector('.balance-done').dataset.width = doneWidth;
    card.querySelector('.balance-failed').dataset.width = failedWidth;
    if (applyWidths) {
      track.classList.add('balance-values-visible');
      card.querySelector('.balance-done').style.width = doneWidth + '%';
      card.querySelector('.balance-failed').style.width = failedWidth + '%';
    }
  });
}
refreshPromiseBalances(false, false);

function motionAllowed() {
  return !preferences['reduce-motion'] && !reducedMotion.matches;
}
document.querySelector('.archive-topbar')?.addEventListener('click', event => {
  const item = event.target.closest('.topbar-item');
  if (!item || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !motionAllowed()) return;
  const icon = item.querySelector('svg');
  if (!icon) return;
  icon.classList.remove('nav-icon-activated');
  void icon.offsetWidth;
  icon.classList.add('nav-icon-activated');
  icon.addEventListener('animationend', () => icon.classList.remove('nav-icon-activated'), {once:true});
});
function animateNumber(element, target, format, duration = 900) {
  if (!motionAllowed() || target === 0) {
    element.textContent = format(target);
    return;
  }
  element.textContent = format(0);
  let start;
  const step = now => {
    start ??= now;
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = format(Math.round(target * eased));
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function startPageAnimations() {
  if (startPageAnimations.started) return;
  startPageAnimations.started = true;
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

  document.querySelectorAll('.stats .stat-card>strong').forEach((number, index) => {
    const target = Number(number.dataset.countTo) || 0;
    number.setAttribute('aria-label', String(target));
    setTimeout(() => animateNumber(number, target, value => String(value), 1000), motionAllowed() ? 180 + index * 70 : 0);
  });
  document.querySelectorAll('[data-balance]').forEach((card, index) => {
    const balance = promiseBalances[card.dataset.balance];
    setTimeout(() => {
      animateNumber(card.querySelector('.balance-percent'), balance.percent ?? 0, value => balance.percent === null ? '—' : value + '%');
      animateNumber(card.querySelector('.balance-completed'), balance.done, value => '✓ ' + value + ' Wykonane');
      animateNumber(card.querySelector('.balance-uncompleted'), balance.failed, value => value + ' Niewykonane ×');
      animateNumber(card.querySelector('.balance-total'), balance.total, value => value + ' łącznie');
    }, motionAllowed() ? 220 + index * 120 : 0);
    setTimeout(() => {
      const track = card.querySelector('.balance-track');
      track.classList.add('balance-values-visible');
      track.querySelectorAll(':scope>span').forEach(segment => { segment.style.width = segment.dataset.width + '%'; });
    }, motionAllowed() ? 420 + index * 140 : 0);
  });
}
if (siteLoader?.isConnected) document.addEventListener('btkj:loader-hidden', () => requestAnimationFrame(startPageAnimations), {once:true});
else requestAnimationFrame(startPageAnimations);
