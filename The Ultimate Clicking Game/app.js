const SAVE_KEY = 'ucg-save-v1';
const startingState = { balance: 0, totalEarned: 0, clicks: 0, clickPower: 1, upgrades: 0, helpers: 0, places: ['bedroom'], activePlace: 'bedroom', sound: false, compact: false };
const places = [
  { id: 'bedroom', name: 'Bedroom desk', detail: 'A humble start. Every empire begins somewhere.', threshold: 0, multiplier: 1 },
  { id: 'garage', name: 'The garage', detail: 'A little more room to grow.', threshold: 250, multiplier: 2 },
  { id: 'highrise', name: 'High-rise office', detail: 'The view is nice. So is the income.', threshold: 2500, multiplier: 4 },
  { id: 'moon', name: 'The moon', detail: 'One small click for you. A giant leap for your wallet.', threshold: 25000, multiplier: 10 }
];
const achievements = [
  { title: 'Breaking the ice', detail: 'Make your first click.', goal: 1, key: 'clicks' },
  { title: 'Spare change', detail: 'Earn your first dollar.', goal: 100, key: 'totalEarned', money: true },
  { title: 'Busy hands', detail: 'Click 100 times.', goal: 100, key: 'clicks' },
  { title: 'Team player', detail: 'Hire your first helper.', goal: 1, key: 'helpers' },
  { title: 'Out of the house', detail: 'Visit the garage.', goal: 1, key: 'garage' },
  { title: 'Big league', detail: 'Earn $100 in total.', goal: 10000, key: 'totalEarned', money: true }
];

const moneyButton = document.querySelector('#money-button');
const panel = document.querySelector('#tab-panel');
const tabs = [...document.querySelectorAll('.tab')];
let state;
let activeTab = 'clickers';
let audioContext;

try {
  state = { ...startingState, ...JSON.parse(localStorage.getItem(SAVE_KEY)) };
} catch {
  state = { ...startingState };
}

function money(cents) {
  if (state.compact && cents >= 100000) return `$${(cents / 100000).toFixed(1)}k`;
  return `$${(cents / 100).toFixed(2)}`;
}

function placeMultiplier() {
  return places.find((place) => place.id === state.activePlace)?.multiplier || 1;
}

function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    document.querySelector('#save-status').textContent = 'GAME SAVED';
  } catch {
    document.querySelector('#save-status').textContent = 'SAVE UNAVAILABLE';
  }
}

function refreshBalance() {
  document.querySelector('#balance').textContent = money(state.balance);
  document.querySelector('#rate').textContent = `+${money(state.clickPower * placeMultiplier())}`;
  document.querySelector('#income-rate').textContent = money(state.helpers * placeMultiplier());
  document.querySelector('#lifetime-earned').textContent = money(state.totalEarned);
  document.querySelector('#run-count').textContent = String(Math.max(1, Math.floor(state.totalEarned / 10000) + 1)).padStart(3, '0');
}

function earn(amount, event) {
  state.balance += amount;
  state.totalEarned += amount;
  refreshBalance();
  save();
  if (event) {
    const popup = document.createElement('span');
    popup.className = 'float-coin';
    popup.textContent = `+${money(amount)}`;
    popup.style.left = `${event.clientX}px`;
    popup.style.top = `${event.clientY}px`;
    document.body.append(popup);
    popup.addEventListener('animationend', () => popup.remove(), { once: true });
  }
  if (activeTab === 'achievements') renderPanel();
  updatePurchaseButtons();
}

function clickSound() {
  if (!state.sound) return;
  audioContext ||= new AudioContext();
  if (audioContext.state === 'suspended') audioContext.resume();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.frequency.value = 620;
  gain.gain.setValueAtTime(.08, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + .09);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + .09);
}

function renderClickers() {
  const cost = 10 * (state.upgrades + 1);
  panel.innerHTML = `<p class="section-kicker">UPGRADE YOUR CLICK / ${String(state.upgrades + 1).padStart(2, '0')}</p>
    <article class="upgrade-row"><span class="item-icon" aria-hidden="true">↗</span><div class="item-copy"><h2>Better button</h2><p>Earn one extra cent with every click. Level ${state.upgrades} owned.</p></div><button class="buy-button" id="buy-clicker" type="button" ${state.balance < cost ? 'disabled' : ''}>${money(cost)}<br>BUY</button></article>
    <p class="empty-note">A stronger click is the simplest way to get ahead. Your current boost is <strong>${money(state.clickPower * placeMultiplier())}</strong> per click.</p>`;
  document.querySelector('#buy-clicker').addEventListener('click', () => {
    if (state.balance < cost) return;
    state.balance -= cost;
    state.upgrades += 1;
    state.clickPower += 1;
    save();
    render();
  });
}

function renderHelpers() {
  const cost = 50 * (state.helpers + 1);
  panel.innerHTML = `<p class="section-kicker">YOUR LITTLE WORKFORCE / ${String(state.helpers).padStart(2, '0')} HIRED</p>
    <article class="upgrade-row"><span class="item-icon" aria-hidden="true">✳</span><div class="item-copy"><h2>Helpful friend</h2><p>Earn one cent every second. Cost rises with each hire.</p></div><button class="buy-button" id="hire-helper" type="button" ${state.balance < cost ? 'disabled' : ''}>${money(cost)}<br>HIRE</button></article>
    <p class="empty-note">${state.helpers ? `${state.helpers} helper${state.helpers === 1 ? '' : 's'} earning ${money(state.helpers * placeMultiplier())} every second.` : 'Helpers keep the money coming while your hands are busy elsewhere.'}</p>`;
  document.querySelector('#hire-helper').addEventListener('click', () => {
    if (state.balance < cost) return;
    state.balance -= cost;
    state.helpers += 1;
    save();
    render();
  });
}

function renderAchievements() {
  const progressFor = (item) => item.key === 'garage' ? Number(state.places.includes('garage')) : state[item.key] || 0;
  const completed = achievements.filter((item) => progressFor(item) >= item.goal).length;
  panel.innerHTML = `<p class="section-kicker">MILESTONES / ${completed} OF ${achievements.length} COMPLETE</p>${achievements.map((item) => {
    const progress = Math.min(progressFor(item), item.goal);
    const percent = Math.round(progress / item.goal * 100);
    const earned = progress >= item.goal;
    const count = item.money ? `${money(progress)} / ${money(item.goal)}` : `${progress} / ${item.goal}`;
    return `<article class="achievement-row ${earned ? 'is-earned' : ''}"><span class="item-icon" aria-hidden="true">${earned ? '✓' : '○'}</span><div class="item-copy"><h3>${item.title}</h3><p>${item.detail} ${count}</p><div class="progress-track"><span style="width:${percent}%"></span></div></div></article>`;
  }).join('')}`;
}

function renderPlaces() {
  panel.innerHTML = `<p class="section-kicker">CHANGE YOUR SURROUNDINGS / ${state.places.length} UNLOCKED</p>${places.map((place) => {
    const owned = state.places.includes(place.id);
    const active = state.activePlace === place.id;
    const locked = !owned && state.totalEarned < place.threshold;
    const action = owned
      ? `<button class="buy-button" data-place="${place.id}" type="button" ${active ? 'disabled' : ''}>${active ? 'HERE' : 'VISIT'}</button>`
      : `<button class="buy-button" data-unlock="${place.id}" type="button" ${locked ? 'disabled' : ''}>${locked ? `EARN ${money(place.threshold)}` : 'UNLOCK'}</button>`;
    const icon = place.id === 'moon' ? '☾' : place.id === 'highrise' ? '▥' : place.id === 'garage' ? '⌂' : '⌖';
    return `<article class="place-row"><span class="item-icon" aria-hidden="true">${icon}</span><div class="item-copy"><h3>${place.name}${active ? ' / ACTIVE' : ''}</h3><p>${place.detail} ${place.multiplier}x click value.</p></div>${action}</article>`;
  }).join('')}`;
  panel.querySelectorAll('[data-place]').forEach((button) => button.addEventListener('click', () => {
    state.activePlace = button.dataset.place;
    save();
    render();
  }));
  panel.querySelectorAll('[data-unlock]').forEach((button) => button.addEventListener('click', () => {
    const place = places.find((item) => item.id === button.dataset.unlock);
    state.places.push(place.id);
    state.activePlace = place.id;
    save();
    render();
  }));
}

function renderSettings() {
  panel.innerHTML = `<p class="section-kicker">MAKE YOURSELF AT HOME</p>
    <label class="toggle-row" for="sound-toggle"><span>Click sound</span><input id="sound-toggle" type="checkbox" ${state.sound ? 'checked' : ''}></label>
    <label class="toggle-row" for="compact-toggle"><span>Compact large balances</span><input id="compact-toggle" type="checkbox" ${state.compact ? 'checked' : ''}></label>
    <button class="reset-button" id="reset-game" type="button">RESET ALL PROGRESS</button>`;
  document.querySelector('#sound-toggle').addEventListener('change', (event) => { state.sound = event.target.checked; save(); });
  document.querySelector('#compact-toggle').addEventListener('change', (event) => { state.compact = event.target.checked; save(); refreshBalance(); renderPanel(); });
  document.querySelector('#reset-game').addEventListener('click', () => {
    if (!window.confirm('Reset all your money, upgrades, and progress?')) return;
    state = { ...startingState, places: ['bedroom'] };
    save();
    render();
  });
}

function renderPanel() {
  panel.setAttribute('aria-labelledby', `tab-${activeTab}`);
  if (activeTab === 'clickers') renderClickers();
  if (activeTab === 'helpers') renderHelpers();
  if (activeTab === 'achievements') renderAchievements();
  if (activeTab === 'places') renderPlaces();
  if (activeTab === 'settings') renderSettings();
}

function updatePurchaseButtons() {
  const clicker = document.querySelector('#buy-clicker');
  if (clicker) clicker.disabled = state.balance < 10 * (state.upgrades + 1);
  const helper = document.querySelector('#hire-helper');
  if (helper) helper.disabled = state.balance < 50 * (state.helpers + 1);
  panel.querySelectorAll('[data-unlock]').forEach((button) => {
    const place = places.find((item) => item.id === button.dataset.unlock);
    button.disabled = state.totalEarned < place.threshold;
    if (!button.disabled) button.textContent = 'UNLOCK';
  });
}

function render() {
  refreshBalance();
  renderPanel();
}

function setTab(name) {
  activeTab = name;
  tabs.forEach((tab) => {
    const selected = tab.dataset.tab === name;
    tab.classList.toggle('is-active', selected);
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  renderPanel();
}

moneyButton.addEventListener('click', (event) => {
  state.clicks += 1;
  earn(state.clickPower * placeMultiplier(), event);
  clickSound();
});
tabs.forEach((tab) => tab.addEventListener('click', () => setTab(tab.dataset.tab)));
document.querySelector('.tabs').addEventListener('keydown', (event) => {
  const index = tabs.indexOf(document.activeElement);
  if (!['ArrowRight', 'ArrowLeft'].includes(event.key)) return;
  event.preventDefault();
  const next = tabs[(index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
  next.focus();
  setTab(next.dataset.tab);
});
document.addEventListener('keydown', (event) => {
  if (event.code !== 'Space' || event.repeat || event.target.matches('button, input')) return;
  event.preventDefault();
  moneyButton.click();
});
window.setInterval(() => {
  if (state.helpers) earn(state.helpers * placeMultiplier());
}, 1000);

render();
