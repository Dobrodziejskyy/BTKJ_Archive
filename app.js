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

const sectionDialog = document.querySelector('#section-dialog');
document.querySelectorAll('[data-section]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelector('#section-dialog-title').textContent = button.dataset.section;
    sectionDialog.showModal();
  });
});
document.querySelector('#open-settings').addEventListener('click', () => {
  document.querySelector('#settings-dialog').showModal();
});

const preferenceKey = 'btkj-drl-preferences-v1';
const defaults = {theme:'dark', oled:true, brightness:3, accent:'blue', tint:false, background:'space', 'compact-timeline':false, 'text-size':'normal', 'sticky-nav':false, 'smooth-scroll':true, 'hide-decorations':false, 'reduce-motion':false};
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
  document.body.classList.toggle('no-stars', preferences.background === 'none');
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
  const top = hash === '#' || hash === '#aktorzy' ? 0 : target.getBoundingClientRect().top + window.scrollY - headerHeight - 24;
  window.scrollTo({top: Math.max(0, top), behavior: navigationBehavior()});
  if (location.hash !== hash) {
    try { history.pushState(null, '', hash); } catch {}
  }
});

const actors = [{
  name: 'crisuuubtkj', role: 'pierwszoplanowa', initials: 'C', image: './assets/images/pfp-crisuuubtkj.png',
  description: 'Magazynier, Legenda sceny mta, muzyk. Od niego wszystko się zaczęło.',
  detail: 'Pierwszy zapisany moment naszej społeczności jest związany z tym kanałem. Tutaj będziemy zbierać kolejne informacje i wspomnienia.',
  url: 'https://www.twitch.tv/crisuuubtkj'
}];
function renderActors() {
  const query = document.querySelector('#actor-search').value.trim().toLocaleLowerCase('pl');
  const results = actors.filter(actor => [actor.name, actor.role, actor.description].join(' ').toLocaleLowerCase('pl').includes(query));
  const container = document.querySelector('#actors-list');
  container.replaceChildren();
  document.querySelector('#actors-count').textContent = results.length === 1 ? '1 wpis' : results.length + ' wpisów';
  for (const actor of results) {
    const card = document.createElement('article');
    card.className = 'actor-card featured-actor';
    card.innerHTML = `<details><summary>${actor.image ? `<img class="actor-avatar actor-photo" src="${actor.image}" alt="${actor.name}" width="96" height="96">` : `<span class="actor-avatar" aria-hidden="true">${actor.initials}</span>`}<span class="actor-overview"><strong>${actor.name}</strong><span class="actor-role">${actor.role}</span><span class="actor-description">${actor.description}</span></span><span class="actor-chevron" aria-hidden="true">›</span></summary><div class="actor-detail"><p>${actor.detail}</p><a class="actor-link" href="${actor.url}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">●</span> Profil (Twitch) ↗</a></div></details>`;
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
function updatePageView(hash = location.hash) {
  const isActors = hash === '#aktorzy';
  document.querySelector('#home-view').hidden = isActors;
  document.querySelector('#actors-view').hidden = !isActors;
  document.querySelectorAll('.archive-nav .topbar-item').forEach(item => {
    const current = isActors ? item.id === 'actors-nav' : item.getAttribute('href') === '#';
    item.classList.toggle('is-current', current);
    if (current) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
  });
  document.title = isActors ? 'Aktorzy — BTKJ × DRL Archive' : 'BTKJ × DRL — Nasza historia zostaje';
}
window.addEventListener('popstate', () => updatePageView());
window.addEventListener('hashchange', () => updatePageView());
updatePageView();

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
  card.querySelector('.balance-percent').textContent = balance.percent === null ? '—' : balance.percent + '%';
  card.querySelector('.balance-completed').textContent = '✓ ' + balance.done + ' Wykonane';
  card.querySelector('.balance-uncompleted').textContent = balance.failed + ' Niewykonane ×';
  card.querySelector('.balance-total').textContent = balance.total + ' łącznie';
  const track = card.querySelector('.balance-track');
  track.classList.toggle('is-empty', !balance.total);
  track.setAttribute('aria-label', balance.total ? `${balance.done} wykonane, ${balance.failed} niewykonane; ${balance.percent}% wykonanych` : 'Brak rozliczonych obietnic');
  card.querySelector('.balance-done').style.width = (balance.total ? balance.done / balance.total * 100 : 0) + '%';
  card.querySelector('.balance-failed').style.width = (balance.total ? balance.failed / balance.total * 100 : 0) + '%';
});
