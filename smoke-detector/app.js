const manualButton = document.querySelector('#manual-beep');
const autoToggle = document.querySelector('#auto-toggle');
const intervalInput = document.querySelector('#interval');
const statusText = document.querySelector('#status-text');
const statusLed = document.querySelector('#status-led');
const modeValue = document.querySelector('#mode-value');
const nextValue = document.querySelector('#next-value');
const beepCount = document.querySelector('#beep-count');
const alarmSound = new Audio('https://www.myinstants.com/media/sounds/smoke-detector-beep.mp3');
alarmSound.preload = 'auto';

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
  alarmSound.currentTime = 0;
  alarmSound.play().catch(() => undefined);
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
