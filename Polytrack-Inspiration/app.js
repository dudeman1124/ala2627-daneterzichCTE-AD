const canvas = document.querySelector('#game');
const context = canvas.getContext('2d');
const lapElement = document.querySelector('#lap');
const timeElement = document.querySelector('#time');
const speedElement = document.querySelector('#speed');
const bestElement = document.querySelector('#best');
const messageElement = document.querySelector('#message');

const keys = new Set();
const track = [];
const trackCount = 180;
const trackWidth = 88;
const lapsToWin = 3;
let width = 0;
let height = 0;
let scale = 1;
let lastFrame = 0;
let raceTime = 0;
let bestTime = Number(localStorage.getItem('vector-run-best') || 0);
let completedLaps = 0;
let raceStarted = false;
let finished = false;
let paused = false;

const car = {
  x: 0, y: 0, angle: 0, speed: 0, progress: 0
};

function makeTrack() {
  for (let index = 0; index < trackCount; index += 1) {
    const angle = (index / trackCount) * Math.PI * 2;
    const radiusX = 360 + Math.sin(angle * 3) * 45 + Math.cos(angle * 5) * 22;
    const radiusY = 230 + Math.cos(angle * 2) * 34 + Math.sin(angle * 4) * 18;
    track.push({ x: Math.cos(angle) * radiusX, y: Math.sin(angle) * radiusY });
  }
  resetCar();
}

function resetCar() {
  const start = track[0];
  const next = track[1];
  car.x = start.x;
  car.y = start.y;
  car.angle = Math.atan2(next.y - start.y, next.x - start.x);
  car.speed = 0;
  car.progress = 0;
  completedLaps = 0;
  raceTime = 0;
  raceStarted = false;
  finished = false;
  paused = false;
  messageElement.textContent = 'READY?';
  messageElement.style.opacity = '1';
  updateHud();
}

function resize() {
  const ratio = window.devicePixelRatio || 1;
  const bounds = canvas.getBoundingClientRect();
  width = bounds.width;
  height = bounds.height;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  scale = Math.min(width / 980, height / 640);
}

function nearestTrackPoint() {
  let nearest = track[0];
  let nearestIndex = 0;
  let nearestDistance = Infinity;
  track.forEach((point, index) => {
    const distance = Math.hypot(car.x - point.x, car.y - point.y);
    if (distance < nearestDistance) {
      nearest = point;
      nearestIndex = index;
      nearestDistance = distance;
    }
  });
  return { nearest, nearestIndex, nearestDistance };
}

function update(delta) {
  const accelerating = keys.has('w') || keys.has('arrowup');
  const braking = keys.has('s') || keys.has('arrowdown') || keys.has(' ');
  const steering = (keys.has('a') || keys.has('arrowleft') ? -1 : 0) + (keys.has('d') || keys.has('arrowright') ? 1 : 0);
  const maximumSpeed = 470;
  const acceleration = 300;

  if (accelerating) {
    car.speed += acceleration * delta;
    raceStarted = true;
    paused = false;
    messageElement.style.opacity = '0';
  } else {
    car.speed -= 80 * delta;
  }
  if (braking) car.speed -= 430 * delta;
  car.speed = Math.max(0, Math.min(maximumSpeed, car.speed));

  const grip = Math.min(1, car.speed / 120);
  car.angle += steering * (1.8 + grip * 1.5) * delta;
  car.x += Math.cos(car.angle) * car.speed * delta;
  car.y += Math.sin(car.angle) * car.speed * delta;

  const location = nearestTrackPoint();
  if (location.nearestDistance > trackWidth * .72) {
    car.speed *= Math.max(0, 1 - delta * 3.5);
  }

  const previousProgress = car.progress;
  car.progress = location.nearestIndex / trackCount;
  if (previousProgress > .8 && car.progress < .2 && car.speed > 80) {
    completedLaps += 1;
    if (completedLaps >= lapsToWin) finishRace();
  }
  if (raceStarted && !finished) raceTime += delta;
  updateHud();
}

function finishRace() {
  finished = true;
  raceStarted = false;
  paused = false;
  messageElement.textContent = 'COURSE CLEAR';
  messageElement.style.opacity = '1';
  if (!bestTime || raceTime < bestTime) {
    bestTime = raceTime;
    localStorage.setItem('vector-run-best', String(bestTime));
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainder = (seconds % 60).toFixed(3).padStart(6, '0');
  return `${minutes}:${remainder}`;
}

function updateHud() {
  lapElement.textContent = `${Math.min(completedLaps + 1, lapsToWin)} / ${lapsToWin}`;
  timeElement.textContent = formatTime(raceTime);
  speedElement.textContent = Math.round(car.speed * .38);
  bestElement.textContent = bestTime ? formatTime(bestTime) : '--:--.---';
}

function drawTrack() {
  context.save();
  context.translate(width / 2 - car.x * scale, height / 2 - car.y * scale);
  context.scale(scale, scale);

  context.fillStyle = '#81927f';
  context.fillRect(-1000, -800, 2000, 1600);
  context.strokeStyle = 'rgba(219,229,214,.16)';
  context.lineWidth = 2;
  for (let grid = -900; grid < 900; grid += 42) {
    context.beginPath(); context.moveTo(grid, -800); context.lineTo(grid, 800); context.stroke();
    context.beginPath(); context.moveTo(-1000, grid); context.lineTo(1000, grid); context.stroke();
  }

  drawTrackPath(trackWidth + 30, '#263936');
  drawTrackPath(trackWidth, '#52615a');
  drawTrackPath(3, '#e7d98e', true);
  drawStartLine();
  drawCar();
  context.restore();
}

function drawTrackPath(lineWidth, color, dashed = false) {
  context.beginPath();
  track.forEach((point, index) => {
    if (index === 0) context.moveTo(point.x, point.y);
    else context.lineTo(point.x, point.y);
  });
  context.closePath();
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  if (dashed) context.setLineDash([16, 18]);
  context.stroke();
  context.setLineDash([]);
}

function drawStartLine() {
  const start = track[0];
  const next = track[1];
  const angle = Math.atan2(next.y - start.y, next.x - start.x) + Math.PI / 2;
  context.save();
  context.translate(start.x, start.y);
  context.rotate(angle);
  for (let index = -4; index < 5; index += 1) {
    context.fillStyle = index % 2 ? '#17221f' : '#e7d98e';
    context.fillRect(index * 11, -trackWidth / 2, 11, trackWidth);
  }
  context.restore();
}

function drawCar() {
  context.save();
  context.translate(car.x, car.y);
  context.rotate(car.angle);
  context.fillStyle = 'rgba(23,34,31,.38)';
  context.fillRect(-20, -12, 48, 28);
  context.fillStyle = '#ee7148';
  context.fillRect(-22, -10, 42, 20);
  context.fillStyle = '#dbe5d6';
  context.fillRect(-2, -7, 14, 14);
  context.fillStyle = '#17221f';
  context.fillRect(12, -7, 10, 14);
  context.fillRect(-18, -14, 9, 4); context.fillRect(-18, 10, 9, 4);
  context.fillRect(11, -14, 9, 4); context.fillRect(11, 10, 9, 4);
  context.restore();
}

function frame(timestamp) {
  const delta = Math.min(.04, (timestamp - lastFrame) / 1000 || 0);
  lastFrame = timestamp;
  if (!finished && !paused) update(delta);
  drawTrack();
  requestAnimationFrame(frame);
}

function togglePause() {
  if (finished || (!raceStarted && !paused)) return;
  paused = !paused;
  messageElement.textContent = paused ? 'PAUSED' : '';
  messageElement.style.opacity = paused ? '1' : '0';
}

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
    event.preventDefault();
    keys.add(key);
  }
  if (key === 'escape') {
    event.preventDefault();
    togglePause();
  }
  if (key === 'r') resetCar();
});
document.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
window.addEventListener('blur', () => keys.clear());
document.addEventListener('visibilitychange', () => {
  if (document.hidden) keys.clear();
});
canvas.addEventListener('click', () => canvas.focus());
window.addEventListener('resize', resize);

makeTrack();
resize();
requestAnimationFrame(frame);
