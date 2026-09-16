import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const canvas = document.querySelector('#game');
const lapElement = document.querySelector('#lap');
const timeElement = document.querySelector('#time');
const speedElement = document.querySelector('#speed');
const bestElement = document.querySelector('#best');
const messageElement = document.querySelector('#message');

const keys = new Set();
const lapsToWin = 3;
const roadWidth = 14;
const trackSamples = 180;
const trackPoints = [
  new THREE.Vector3(0, 1, -78), new THREE.Vector3(42, 5, -62),
  new THREE.Vector3(67, 8, -24), new THREE.Vector3(58, 10, 26),
  new THREE.Vector3(22, 6, 62), new THREE.Vector3(-20, 3, 70),
  new THREE.Vector3(-63, 8, 42), new THREE.Vector3(-70, 13, -10),
  new THREE.Vector3(-42, 7, -55)
];
const trackCurve = new THREE.CatmullRomCurve3(trackPoints, true, 'catmullrom', .28);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, 1, .1, 900);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
const car = { progress: 0, lateral: 0, speed: 0 };
const carGroup = new THREE.Group();
let roadMesh;
let raceTime = 0;
let bestTime = Number(localStorage.getItem('vector-run-best') || 0);
let completedLaps = 0;
let raceStarted = false;
let finished = false;
let paused = false;
let lastFrame = 0;

function makeMaterial(color, roughness = .8) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: .08 });
}

function addLighting() {
  scene.add(new THREE.HemisphereLight(0xdbe5d6, 0x263936, 2.2));
  const sun = new THREE.DirectionalLight(0xffe8bd, 3.2);
  sun.position.set(-60, 100, 35);
  sun.castShadow = true;
  scene.add(sun);
}

function makeRoad() {
  const positions = [];
  const indices = [];
  for (let index = 0; index < trackSamples; index += 1) {
    const progress = index / trackSamples;
    const point = trackCurve.getPointAt(progress);
    const tangent = trackCurve.getTangentAt(progress).normalize();
    const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const left = point.clone().addScaledVector(side, roadWidth / 2);
    const right = point.clone().addScaledVector(side, -roadWidth / 2);
    positions.push(left.x, left.y, left.z, right.x, right.y, right.z);
  }
  for (let index = 0; index < trackSamples; index += 1) {
    const next = (index + 1) % trackSamples;
    indices.push(index * 2, next * 2, index * 2 + 1, index * 2 + 1, next * 2, next * 2 + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  roadMesh = new THREE.Mesh(geometry, makeMaterial(0x52615a, .95));
  roadMesh.receiveShadow = true;
  scene.add(roadMesh);

  const shoulder = new THREE.Mesh(
    new THREE.TubeGeometry(trackCurve, trackSamples, roadWidth / 2 + 1.8, 6, true),
    makeMaterial(0x263936)
  );
  shoulder.scale.y = .16;
  shoulder.position.y -= .35;
  shoulder.receiveShadow = true;
  scene.add(shoulder);

  const centerLine = new THREE.Mesh(
    new THREE.TubeGeometry(trackCurve, trackSamples, .12, 5, true),
    makeMaterial(0xe7d98e)
  );
  centerLine.position.y += .08;
  scene.add(centerLine);
}

function addStartLine() {
  const group = new THREE.Group();
  const start = trackCurve.getPointAt(0);
  const tangent = trackCurve.getTangentAt(0).normalize();
  group.position.copy(start);
  group.rotation.y = Math.atan2(tangent.x, tangent.z);
  for (let index = -5; index < 5; index += 1) {
    const tile = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, .08, 2.4),
      makeMaterial(index % 2 ? 0x17221f : 0xe7d98e)
    );
    tile.position.set(index * 1.4, .08, 0);
    group.add(tile);
  }
  scene.add(group);
}

function addScenery() {
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), makeMaterial(0x81927f));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.2;
  ground.receiveShadow = true;
  scene.add(ground);

  const markerMaterial = makeMaterial(0xee7148);
  for (let index = 0; index < 42; index += 1) {
    const progress = index / 42;
    const point = trackCurve.getPointAt(progress);
    const tangent = trackCurve.getTangentAt(progress).normalize();
    const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const marker = new THREE.Mesh(new THREE.CylinderGeometry(.25, .35, 2.4, 8), markerMaterial);
    marker.position.copy(point).addScaledVector(side, index % 2 ? 11 : -11);
    marker.position.y += 1;
    marker.castShadow = true;
    scene.add(marker);
  }

  const treeMaterials = [makeMaterial(0x31564d), makeMaterial(0x3f705c)];
  for (let index = 0; index < 30; index += 1) {
    const angle = index * 2.41;
    const radius = 92 + (index % 4) * 15;
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.6, .8, 4, 7), makeMaterial(0x694e39));
    trunk.position.y = 1.1;
    const leaves = new THREE.Mesh(new THREE.ConeGeometry(3.5 + index % 3, 9, 8), treeMaterials[index % 2]);
    leaves.position.y = 6;
    tree.add(trunk, leaves);
    tree.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    tree.scale.setScalar(.8 + (index % 3) * .18);
    tree.castShadow = true;
    scene.add(tree);
  }
}

function makeCar() {
  const bodyMaterial = makeMaterial(0xee7148, .45);
  const darkMaterial = makeMaterial(0x17221f, .35);
  const glassMaterial = new THREE.MeshStandardMaterial({ color: 0xa4d6bd, roughness: .2, metalness: .25 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.7, .7, 4.6), bodyMaterial);
  body.position.y = 1.05;
  body.castShadow = true;
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.05, .72, 2.15), glassMaterial);
  cabin.position.set(0, 1.55, -.15);
  cabin.castShadow = true;
  carGroup.add(body, cabin);
  for (const x of [-1.3, 1.3]) {
    for (const z of [-1.45, 1.45]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.46, .46, .3, 12), darkMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, .65, z);
      carGroup.add(wheel);
    }
  }
  const spoiler = new THREE.Mesh(new THREE.BoxGeometry(2.5, .16, .35), darkMaterial);
  spoiler.position.set(0, 1.55, -2.05);
  carGroup.add(spoiler);
  carGroup.castShadow = true;
  scene.add(carGroup);
}

function resetCar() {
  car.progress = 0;
  car.lateral = 0;
  car.speed = 0;
  completedLaps = 0;
  raceTime = 0;
  raceStarted = false;
  finished = false;
  paused = false;
  messageElement.textContent = 'READY?';
  messageElement.style.opacity = '1';
  updateHud();
  updateCarTransform(0);
}

function updateCarTransform(progress) {
  const point = trackCurve.getPointAt(progress);
  const tangent = trackCurve.getTangentAt(progress).normalize();
  const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
  carGroup.position.copy(point).addScaledVector(side, car.lateral);
  carGroup.position.y += .25;
  carGroup.rotation.y = Math.atan2(tangent.x, tangent.z);
}

function updateCamera(delta) {
  const point = trackCurve.getPointAt(car.progress);
  const tangent = trackCurve.getTangentAt(car.progress).normalize();
  const desired = point.clone().addScaledVector(tangent, -13).add(new THREE.Vector3(0, 7.5, 0));
  camera.position.lerp(desired, 1 - Math.pow(.001, delta));
  camera.lookAt(point.clone().addScaledVector(tangent, 8).add(new THREE.Vector3(0, 1.2, 0)));
}

function update(delta) {
  const accelerating = keys.has('w') || keys.has('arrowup');
  const braking = keys.has('s') || keys.has('arrowdown') || keys.has(' ');
  const steering = (keys.has('a') || keys.has('arrowleft') ? -1 : 0) + (keys.has('d') || keys.has('arrowright') ? 1 : 0);
  const maximumSpeed = 49;
  const acceleration = 35;
  if (accelerating) {
    car.speed = Math.min(maximumSpeed, car.speed + acceleration * delta);
    raceStarted = true;
    messageElement.style.opacity = '0';
  } else {
    car.speed = Math.max(0, car.speed - 9 * delta);
  }
  if (braking) car.speed = Math.max(0, car.speed - 48 * delta);
  car.lateral += steering * (10 + car.speed * .12) * delta;
  car.lateral = THREE.MathUtils.clamp(car.lateral, -roadWidth * .43, roadWidth * .43);
  if (Math.abs(car.lateral) > roadWidth * .34) car.speed = Math.max(0, car.speed - 18 * delta);

  const previousProgress = car.progress;
  car.progress = (car.progress + car.speed * delta / trackCurve.getLength()) % 1;
  if (previousProgress > .8 && car.progress < .2 && car.speed > 5) {
    completedLaps += 1;
    if (completedLaps >= lapsToWin) finishRace();
  }
  if (raceStarted && !finished) raceTime += delta;
  updateCarTransform(car.progress);
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

function togglePause() {
  if (finished || (!raceStarted && !paused)) return;
  paused = !paused;
  messageElement.textContent = paused ? 'PAUSED' : '';
  messageElement.style.opacity = paused ? '1' : '0';
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainder = (seconds % 60).toFixed(3).padStart(6, '0');
  return `${minutes}:${remainder}`;
}

function updateHud() {
  lapElement.textContent = `${Math.min(completedLaps + 1, lapsToWin)} / ${lapsToWin}`;
  timeElement.textContent = formatTime(raceTime);
  speedElement.textContent = Math.round(car.speed * 3.6);
  bestElement.textContent = bestTime ? formatTime(bestTime) : '--:--.---';
}

function resize() {
  const bounds = canvas.getBoundingClientRect();
  renderer.setSize(bounds.width, bounds.height, false);
  camera.aspect = bounds.width / bounds.height;
  camera.updateProjectionMatrix();
}

function frame(timestamp) {
  const delta = Math.min(.04, (timestamp - lastFrame) / 1000 || 0);
  lastFrame = timestamp;
  if (!finished && !paused) update(delta);
  updateCamera(delta);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
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

scene.background = new THREE.Color(0xb7c8bd);
scene.fog = new THREE.Fog(0xb7c8bd, 120, 280);
addLighting();
makeRoad();
addStartLine();
addScenery();
makeCar();
resize();
resetCar();
requestAnimationFrame(frame);
