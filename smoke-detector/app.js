const manualButton = document.querySelector('#manual-beep');
const autoToggle = document.querySelector('#auto-toggle');
const intervalInput = document.querySelector('#interval');
const statusText = document.querySelector('#status-text');
const statusLed = document.querySelector('#status-led');
const modeValue = document.querySelector('#mode-value');
const nextValue = document.querySelector('#next-value');
const beepCount = document.querySelector('#beep-count');

let audioContext;
let intervalId;
let countdownId;
let nextBeepAt;
let sessionBeeps = 0;

function getIntervalSeconds() {
  const value = Number(intervalInput.value);
  return Number.isFinite(value) ? Math.min(3600, Math.max(1, Math.round(value))) : 10;
}

function syncInterval(value) {
  const safeValue = Math.min(3600, Math.max(1, Math.round(Number(value) || 1)));
  intervalInput.value = safeValue;
}

function updateCountdown() {
  if (!nextBeepAt) {
    nextValue.textContent = '--';
    return;
  }
  const remaining = Math.max(0, Math.ceil((nextBeepAt - Date.now()) / 1000));
  nextValue.textContent = `${remaining}s`;
}

function setStatus(text, active = false) {
  statusText.textContent = text;
  statusLed.classList.toggle('led--green', !active);
  statusLed.style.color = active ? 'var(--red)' : 'var(--teal)';
}

function playBeep() {
  audioContext ??= new AudioContext();
  if (audioContext.state === 'suspended') audioContext.resume();

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const now = audioContext.currentTime;
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(3000, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.22, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.17);

  sessionBeeps += 1;
  beepCount.textContent = sessionBeeps;
}

function stopAutomatic() {
  clearInterval(intervalId);
  clearInterval(countdownId);
  intervalId = undefined;
  countdownId = undefined;
  nextBeepAt = undefined;
  autoToggle.checked = false;
  modeValue.textContent = 'MANUAL';
  setStatus('READY FOR TEST');
  updateCountdown();
}

function startAutomatic() {
  stopAutomatic();
  const intervalMs = getIntervalSeconds() * 1000;
  playBeep();
  nextBeepAt = Date.now() + intervalMs;
  intervalId = setInterval(() => {
    playBeep();
    nextBeepAt = Date.now() + intervalMs;
  }, intervalMs);
  countdownId = setInterval(updateCountdown, 250);
  autoToggle.checked = true;
  modeValue.textContent = `EVERY ${getIntervalSeconds()}S`;
  setStatus('INTERVAL ACTIVE', true);
  updateCountdown();
}

manualButton.addEventListener('click', () => {
  playBeep();
  if (!intervalId) setStatus('TEST BEEP PLAYED');
});
autoToggle.addEventListener('change', () => {
  if (autoToggle.checked) {
    startAutomatic();
  } else {
    stopAutomatic();
  }
});
intervalInput.addEventListener('change', () => {
  syncInterval(intervalInput.value);
  if (intervalId) {
    startAutomatic();
    autoToggle.checked = true;
  }
});
window.addEventListener('pagehide', stopAutomatic);
