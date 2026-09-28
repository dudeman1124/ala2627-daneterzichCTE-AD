const sounds = [
  { name: 'Airhorn', category: 'loud', kind: 'horn', description: 'A very public announcement.' },
  { name: 'Cartoon Boing', category: 'loud', kind: 'boing', description: 'Physics has left the chat.' },
  { name: 'Stadium Blast', category: 'loud', kind: 'blast', description: 'Big entrance energy.' },
  { name: 'Alarm Siren', category: 'loud', kind: 'siren', description: 'Something is probably happening.' },
  { name: 'Microwave Forever', category: 'annoying', kind: 'beep', description: 'It finished. It wants you to know.' },
  { name: 'Low Battery', category: 'annoying', kind: 'low-battery', description: 'Not now. Not now!' },
  { name: 'Dial-Up Modem', category: 'annoying', kind: 'modem', description: 'Connecting to 2004...' },
  { name: 'Tiny Desk Tap', category: 'annoying', kind: 'tap', description: 'A small sound with big persistence.' },
  { name: 'Alien Transmission', category: 'weird', kind: 'alien', description: 'Message received. Meaning unclear.' },
  { name: 'Rubber Duck Portal', category: 'weird', kind: 'duck', description: 'Quack, but make it interdimensional.' },
  { name: 'Ghost Elevator', category: 'weird', kind: 'ghost', description: 'Going down, apparently.' },
  { name: 'Mystery Goo', category: 'weird', kind: 'goo', description: 'Do not ask what it is.' }
];

const grid = document.querySelector('#sound-grid');
const searchInput = document.querySelector('#sound-search');
const categoryButtons = [...document.querySelectorAll('.category-tile')];
const resultCount = document.querySelector('#result-count');
const emptyState = document.querySelector('#empty-state');
const volumeInput = document.querySelector('#volume');
const volumeValue = document.querySelector('#volume-value');
const playStatus = document.querySelector('#play-status');
let activeCategory = 'all';
let audioContext;
let activeNodes = [];
let activeButton;
let pendingTimers = [];

function visibleSounds() {
  const query = searchInput.value.trim().toLowerCase();
  return sounds.filter((sound) => {
    const matchesCategory = activeCategory === 'all' || sound.category === activeCategory;
    const matchesQuery = `${sound.name} ${sound.category} ${sound.description}`.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });
}

function renderSounds() {
  const results = visibleSounds();
  resultCount.textContent = String(results.length).padStart(2, '0');
  emptyState.hidden = results.length > 0;
  grid.innerHTML = results.map((sound) => `
    <article class="sound-card">
      <button class="play-button" type="button" data-sound="${sound.kind}" aria-label="Play ${sound.name}" title="Play ${sound.name}">▶</button>
      <div class="sound-card-copy">
        <span class="sound-tag">${sound.category} / EFFECT ${String(sounds.indexOf(sound) + 1).padStart(2, '0')}</span>
        <h3>${sound.name}</h3>
        <p>${sound.description}</p>
      </div>
    </article>`).join('');
}

function updateCategoryCounts() {
  document.querySelector('[data-category-count="all"]').textContent = String(sounds.length).padStart(2, '0');
  for (const category of ['loud', 'annoying', 'weird']) {
    const count = sounds.filter((sound) => sound.category === category).length;
    document.querySelector(`[data-category-count="${category}"]`).textContent = String(count).padStart(2, '0');
  }
  document.querySelector('#sound-count').textContent = String(sounds.length).padStart(2, '0');
}

function stopSound() {
  pendingTimers.forEach(window.clearTimeout);
  pendingTimers = [];
  for (const node of activeNodes) {
    try { node.stop(); } catch {}
  }
  activeNodes = [];
  activeButton?.classList.remove('is-playing');
  activeButton = undefined;
}

function schedule(callback, delay) {
  const timer = window.setTimeout(() => {
    pendingTimers = pendingTimers.filter((pendingTimer) => pendingTimer !== timer);
    callback();
  }, delay);
  pendingTimers.push(timer);
}

function tone(frequency, duration, options = {}) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = options.type || 'sine';
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  if (options.endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, options.endFrequency), audioContext.currentTime + duration);
  }
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(Number(volumeInput.value) / 100 * (options.level || 0.45), audioContext.currentTime + 0.015);
  gain.gain.setTargetAtTime(0.0001, audioContext.currentTime + duration * 0.72, Math.max(0.02, duration * 0.12));
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
  activeNodes.push(oscillator);
}

function playPreset(kind) {
  if (audioContext.state === 'suspended') audioContext.resume();
  const patterns = {
    horn: () => [440, 554, 659].forEach((frequency) => tone(frequency, 0.75, { type: 'sawtooth', level: 0.23 })),
    boing: () => tone(680, 0.8, { type: 'triangle', endFrequency: 95, level: 0.7 }),
    blast: () => { tone(82, 0.9, { type: 'sawtooth', level: 0.7 }); tone(123, 0.85, { type: 'square', level: 0.38 }); },
    siren: () => { tone(390, 1.5, { type: 'sawtooth', endFrequency: 980, level: 0.38 }); tone(980, 1.5, { type: 'sawtooth', endFrequency: 390, level: 0.38 }); },
    beep: () => { [0, 0.22, 0.44, 0.66].forEach((delay) => schedule(() => tone(880, 0.16, { type: 'square', level: 0.32 }), delay * 1000)); },
    'low-battery': () => { tone(660, 0.22, { type: 'square', level: 0.22 }); schedule(() => tone(520, 0.45, { type: 'square', level: 0.22 }), 260); },
    modem: () => [380, 720, 510, 1100, 460, 880, 330].forEach((frequency, index) => schedule(() => tone(frequency, 0.11, { type: 'square', level: 0.2 }), index * 115)),
    tap: () => { tone(170, 0.07, { type: 'square', level: 0.45 }); schedule(() => tone(145, 0.07, { type: 'square', level: 0.45 }), 160); schedule(() => tone(170, 0.07, { type: 'square', level: 0.45 }), 320); },
    alien: () => { tone(310, 1.1, { type: 'sine', endFrequency: 1250, level: 0.3 }); tone(540, 0.75, { type: 'triangle', endFrequency: 180, level: 0.25 }); },
    duck: () => [410, 490, 390].forEach((frequency, index) => schedule(() => tone(frequency, 0.24, { type: 'triangle', endFrequency: frequency * 0.72, level: 0.45 }), index * 210)),
    ghost: () => { tone(520, 1.2, { type: 'sine', endFrequency: 180, level: 0.36 }); schedule(() => tone(290, 0.9, { type: 'sine', endFrequency: 110, level: 0.3 }), 350); },
    goo: () => tone(170, 1.05, { type: 'sawtooth', endFrequency: 48, level: 0.35 })
  };
  patterns[kind]?.();
}

grid.addEventListener('click', (event) => {
  const button = event.target.closest('.play-button');
  if (!button) return;
  stopSound();
  audioContext ||= new AudioContext();
  activeButton = button;
  button.classList.add('is-playing');
  playStatus.textContent = `NOW PLAYING / ${button.getAttribute('aria-label').replace('Play ', '').toUpperCase()}`;
  playPreset(button.dataset.sound);
  schedule(() => {
    if (activeButton === button) {
      button.classList.remove('is-playing');
      activeButton = undefined;
      playStatus.textContent = 'READY WHEN YOU ARE';
    }
  }, 1800);
});

document.querySelector('#categories').addEventListener('click', (event) => {
  const button = event.target.closest('.category-tile');
  if (!button) return;
  activeCategory = button.dataset.category;
  categoryButtons.forEach((categoryButton) => {
    const selected = categoryButton === button;
    categoryButton.classList.toggle('is-active', selected);
    categoryButton.setAttribute('aria-pressed', String(selected));
  });
  renderSounds();
});

searchInput.addEventListener('input', renderSounds);
volumeInput.addEventListener('input', () => { volumeValue.value = `${volumeInput.value}%`; });
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === 'Escape' && document.activeElement === searchInput) {
    searchInput.value = '';
    renderSounds();
    searchInput.blur();
  }
});

updateCategoryCounts();
renderSounds();
