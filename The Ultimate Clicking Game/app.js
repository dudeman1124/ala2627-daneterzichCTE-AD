const SAVE_KEY = 'ucg-save-v1';
const startingState = { balance: 0, totalEarned: 0, clicks: 0, clickPower: 1, upgrades: 0, poorMiners: 0, budgetMiners: 0, standardBitcoinMiners: 0, upgradedBitcoinMiners: 0, superButtons: 0, places: ['bedroom'], activePlace: 'bedroom', sound: false, compact: false };
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
  const savedState = JSON.parse(localStorage.getItem(SAVE_KEY)) || {};
  state = {
    ...startingState,
    ...savedState,
    poorMiners: savedState.poorMiners ?? savedState.helpers ?? 0
  };
  delete state.helpers;
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

function clickValue() {
  return (state.clickPower + state.superButtons * 20) * placeMultiplier();
}

function incomePerSecond() {
  return (state.poorMiners + state.budgetMiners * 100 + state.standardBitcoinMiners * 5000 + state.upgradedBitcoinMiners * 60000) * placeMultiplier();
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
  document.querySelector('#rate').textContent = `+${money(clickValue())}`;
  document.querySelector('#income-rate').textContent = money(incomePerSecond());
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
  const superButtonCost = 500 * (state.superButtons + 1);
  panel.innerHTML = `<p class="section-kicker">UPGRADE YOUR CLICK / ${String(state.upgrades + 1).padStart(2, '0')}</p>
    <article class="upgrade-row"><span class="item-icon" aria-hidden="true">↗</span><div class="item-copy"><h2>Better button</h2><p>Earn one extra cent with every click. Level ${state.upgrades} owned.</p></div><button class="buy-button" id="buy-clicker" type="button" ${state.balance < cost ? 'disabled' : ''}>${money(cost)}<br>BUY</button></article>
    <article class="upgrade-row"><span class="item-icon" aria-hidden="true">●</span><div class="item-copy"><h2>Super Button</h2><p>Adds $0.20 to every click. Place boosts increase its value.</p></div><button class="buy-button" id="buy-super-button" type="button" ${state.balance < superButtonCost ? 'disabled' : ''}>${money(superButtonCost)}<br>BUY</button></article>
    <p class="empty-note">Your current click earns <strong>${money(clickValue())}</strong>. Super Buttons add $0.20 per click.</p>`;
  document.querySelector('#buy-clicker').addEventListener('click', () => {
    if (state.balance < cost) return;
    state.balance -= cost;
    state.upgrades += 1;
    state.clickPower += 1;
    save();
    render();
  });
  document.querySelector('#buy-super-button').addEventListener('click', () => {
    if (state.balance < superButtonCost) return;
    state.balance -= superButtonCost;
    state.superButtons += 1;
    save();
    render();
  });
}

function renderHelpers() {
  const poorMinerCost = 50 * (state.poorMiners + 1);
  const budgetMinerCost = 2000 * (state.budgetMiners + 1);
  const standardMinerCost = 100000 * (state.standardBitcoinMiners + 1);
  const upgradedMinerCost = 1000000 * (state.upgradedBitcoinMiners + 1);
  const totalMiners = state.poorMiners + state.budgetMiners + state.standardBitcoinMiners + state.upgradedBitcoinMiners;
  const minerIncome = state.poorMiners + state.budgetMiners * 100 + state.standardBitcoinMiners * 5000 + state.upgradedBitcoinMiners * 60000;
  panel.innerHTML = `<p class="section-kicker">YOUR LITTLE WORKFORCE / ${String(totalMiners).padStart(2, '0')} HIRED</p>
    <article class="upgrade-row"><span class="item-icon" aria-hidden="true">₿</span><div class="item-copy"><h2>Very Poor Bitcoin Miner</h2><p>Earns $0.01 per second. Each one has a 0.1% chance each second to find $100.</p></div><button class="buy-button" id="hire-poor-miner" type="button" ${state.balance < poorMinerCost ? 'disabled' : ''}>${money(poorMinerCost)}<br>HIRE</button></article>
    <article class="upgrade-row"><span class="item-icon" aria-hidden="true">₿</span><div class="item-copy"><h2>Slightly Budgeted Bitcoin Miner</h2><p>Earns $1.00 per second. First miner costs $20.00.</p></div><button class="buy-button" id="hire-budget-miner" type="button" ${state.balance < budgetMinerCost ? 'disabled' : ''}>${money(budgetMinerCost)}<br>HIRE</button></article>
    <article class="upgrade-row"><span class="item-icon" aria-hidden="true">₿</span><div class="item-copy"><h2>Standard Bitcoin Miner</h2><p>Earns $50.00 per second.</p></div><button class="buy-button" id="hire-standard-miner" type="button" ${state.balance < standardMinerCost ? 'disabled' : ''}>${money(standardMinerCost)}<br>HIRE</button></article>
    <article class="upgrade-row"><span class="item-icon" aria-hidden="true">₿</span><div class="item-copy"><h2>Upgraded Bitcoin Miner</h2><p>Earns $600.00 per second.</p></div><button class="buy-button" id="hire-upgraded-miner" type="button" ${state.balance < upgradedMinerCost ? 'disabled' : ''}>${money(upgradedMinerCost)}<br>HIRE</button></article>
    <p class="empty-note">${totalMiners ? `${totalMiners} miner${totalMiners === 1 ? '' : 's'} earning ${money(minerIncome * placeMultiplier())} per second, plus jackpot chances.` : 'Hire miners to bring in cash while you do something else.'}</p>`;
  document.querySelector('#hire-poor-miner').addEventListener('click', () => {
    if (state.balance < poorMinerCost) return;
    state.balance -= poorMinerCost;
    state.poorMiners += 1;
    save();
    render();
  });
  document.querySelector('#hire-budget-miner').addEventListener('click', () => {
    if (state.balance < budgetMinerCost) return;
    state.balance -= budgetMinerCost;
    state.budgetMiners += 1;
    save();
    render();
  });
  document.querySelector('#hire-standard-miner').addEventListener('click', () => {
    if (state.balance < standardMinerCost) return;
    state.balance -= standardMinerCost;
    state.standardBitcoinMiners += 1;
    save();
    render();
  });
  document.querySelector('#hire-upgraded-miner').addEventListener('click', () => {
    if (state.balance < upgradedMinerCost) return;
    state.balance -= upgradedMinerCost;
    state.upgradedBitcoinMiners += 1;
    save();
    render();
  });
}

function renderAchievements() {
  const progressFor = (item) => item.key === 'garage'
    ? Number(state.places.includes('garage'))
    : item.key === 'helpers' ? state.poorMiners + state.budgetMiners + state.standardBitcoinMiners + state.upgradedBitcoinMiners : state[item.key] || 0;
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
  const superButton = document.querySelector('#buy-super-button');
  if (superButton) superButton.disabled = state.balance < 500 * (state.superButtons + 1);
  const poorMiner = document.querySelector('#hire-poor-miner');
  if (poorMiner) poorMiner.disabled = state.balance < 50 * (state.poorMiners + 1);
  const budgetMiner = document.querySelector('#hire-budget-miner');
  if (budgetMiner) budgetMiner.disabled = state.balance < 2000 * (state.budgetMiners + 1);
  const standardMiner = document.querySelector('#hire-standard-miner');
  if (standardMiner) standardMiner.disabled = state.balance < 100000 * (state.standardBitcoinMiners + 1);
  const upgradedMiner = document.querySelector('#hire-upgraded-miner');
  if (upgradedMiner) upgradedMiner.disabled = state.balance < 1000000 * (state.upgradedBitcoinMiners + 1);
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
  earn(clickValue(), event);
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
  const miners = state.poorMiners + state.budgetMiners + state.standardBitcoinMiners + state.upgradedBitcoinMiners;
  if (!miners) return;
  let jackpots = 0;
  for (let miner = 0; miner < state.poorMiners; miner += 1) {
    if (Math.random() < 1 - Math.pow(0.999, 0.1)) jackpots += 1;
  }
  const regularIncome = incomePerSecond() / 10;
  earn(regularIncome + jackpots * 10000);
  if (jackpots) {
    const saveStatus = document.querySelector('#save-status');
    const message = `MINER JACKPOT +${money(jackpots * 10000)}`;
    saveStatus.textContent = message;
    window.setTimeout(() => {
      if (saveStatus.textContent === message) saveStatus.textContent = 'GAME SAVED';
    }, 3500);
  }
}, 100);

render();
