import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const canvas = document.querySelector('#world');
const startScreen = document.querySelector('#start-screen');
const enterButton = document.querySelector('#enter-world');
const startStatus = document.querySelector('#start-status');
const mouseToggle = document.querySelector('#mouse-toggle');
const mouseLabel = document.querySelector('#mouse-label');
const passwordForm = document.querySelector('#password-form');
const passwordInput = document.querySelector('#password-input');
const passwordHint = document.querySelector('#password-hint');
const secretCount = document.querySelector('#secret-count');
const toast = document.querySelector('#toast');

const scene = new THREE.Scene();
scene.background = new THREE.Color('#a9c5af');
scene.fog = new THREE.Fog('#a9c5af', 175, 900);

const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 1400);
camera.rotation.order = 'YXZ';
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const ambient = new THREE.HemisphereLight('#e8f4df', '#6a704a', 2.1);
scene.add(ambient);

const sun = new THREE.DirectionalLight('#fff1cf', 2.6);
sun.position.set(-65, 110, -45);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -42;
sun.shadow.camera.right = 42;
sun.shadow.camera.top = 42;
sun.shadow.camera.bottom = -42;
sun.shadow.normalBias = 0.03;
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(2000, 2000),
  new THREE.MeshStandardMaterial({ color: '#78965e', roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

const random = seededRandom(263701);
const grassCount = 4200;
const grassGeometry = new THREE.ConeGeometry(0.105, 0.58, 4);
grassGeometry.translate(0, 0.29, 0);
const grassMaterial = new THREE.MeshStandardMaterial({ color: '#79a252', roughness: 1 });
const grass = new THREE.InstancedMesh(grassGeometry, grassMaterial, grassCount);
const grassTransform = new THREE.Object3D();
const grassPalette = [new THREE.Color('#688c49'), new THREE.Color('#7fa45a'), new THREE.Color('#91ab62')];

for (let index = 0; index < grassCount; index += 1) {
  let x;
  let z;

  do {
    x = (random() - 0.5) * 390;
    z = (random() - 0.5) * 390;
  } while (Math.abs(x) < 18 && Math.abs(z) < 18);

  grassTransform.position.set(x, -0.02, z);
  grassTransform.rotation.y = random() * Math.PI;
  grassTransform.scale.setScalar(0.55 + random() * 0.85);
  grassTransform.updateMatrix();
  grass.setMatrixAt(index, grassTransform.matrix);
  grass.setColorAt(index, grassPalette[Math.floor(random() * grassPalette.length)]);
}

grass.receiveShadow = true;
grass.instanceMatrix.needsUpdate = true;
scene.add(grass);

const platformTop = 1.42;
const platformWidth = 34;
const stoneMaterial = new THREE.MeshStandardMaterial({ color: '#92928a', roughness: 0.93 });
const stoneLight = new THREE.MeshStandardMaterial({ color: '#b2ada0', roughness: 0.88 });
const stoneDark = new THREE.MeshStandardMaterial({ color: '#676d69', roughness: 0.96 });
const goldMaterial = new THREE.MeshStandardMaterial({
  color: '#ddbb77',
  metalness: 0.34,
  roughness: 0.43,
  emissive: '#382716',
  emissiveIntensity: 0.38
});

function addBlock(width, height, depth, material, position, castShadow = true) {
  const block = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  block.position.set(...position);
  block.castShadow = castShadow;
  block.receiveShadow = true;
  scene.add(block);
  return block;
}

addBlock(platformWidth, 1.2, platformWidth, stoneDark, [0, 0.6, 0]);
addBlock(platformWidth - 1.4, 0.24, platformWidth - 1.4, stoneMaterial, [0, 1.32, 0]);

for (let xIndex = 0; xIndex < 6; xIndex += 1) {
  for (let zIndex = 0; zIndex < 6; zIndex += 1) {
    const x = (xIndex - 2.5) * 5.1;
    const z = (zIndex - 2.5) * 5.1;
    const isTrim = Math.abs(xIndex - 2.5) > 1.5 || Math.abs(zIndex - 2.5) > 1.5;
    addBlock(4.95, 0.075, 4.95, isTrim ? stoneLight : stoneMaterial, [x, platformTop - 0.015, z], false);
  }
}

const pillarPositions = [
  [-13.2, -13.2],
  [13.2, -13.2],
  [-13.2, 13.2],
  [13.2, 13.2]
];
const pillarHeight = 9.2;
const pillarTop = platformTop + pillarHeight;

for (const [x, z] of pillarPositions) {
  addBlock(2.9, 0.55, 2.9, stoneDark, [x, platformTop + 0.26, z]);
  addBlock(2.25, pillarHeight, 2.25, stoneMaterial, [x, platformTop + pillarHeight / 2, z]);
  addBlock(2.7, 0.38, 2.7, stoneLight, [x, pillarTop, z]);
  addBlock(2.5, 0.16, 2.5, stoneDark, [x, pillarTop + 0.27, z]);
  addBlock(0.14, 0.26, 0.14, goldMaterial, [x, pillarTop + 0.5, z], false);
}

const signCanvas = document.createElement('canvas');
signCanvas.width = 1200;
signCanvas.height = 420;
const signContext = signCanvas.getContext('2d');
signContext.fillStyle = '#27362d';
signContext.fillRect(0, 0, signCanvas.width, signCanvas.height);
signContext.strokeStyle = '#d9bd83';
signContext.lineWidth = 12;
signContext.strokeRect(20, 20, signCanvas.width - 40, signCanvas.height - 40);
signContext.textAlign = 'center';
signContext.textBaseline = 'middle';
signContext.fillStyle = '#d9bd83';
signContext.font = '500 37px Georgia, serif';
signContext.fillText('A PLACE FOR THE CURIOUS', signCanvas.width / 2, 92);
signContext.fillStyle = '#fbf6e9';
signContext.font = '600 65px Georgia, serif';
signContext.fillText('Welcome to', signCanvas.width / 2, 193);
signContext.font = 'italic 600 66px Georgia, serif';
signContext.fillText("'Anything's A Secret'!", signCanvas.width / 2, 285);
signContext.fillStyle = '#d9bd83';
signContext.font = '400 25px monospace';
signContext.fillText('EVERYTHING HAS A STORY', signCanvas.width / 2, 363);

const signTexture = new THREE.CanvasTexture(signCanvas);
signTexture.colorSpace = THREE.SRGBColorSpace;
addBlock(13.3, 5.4, 0.55, stoneDark, [0, 6.5, -13.25]);
const signFace = new THREE.Mesh(
  new THREE.PlaneGeometry(12.8, 4.9),
  new THREE.MeshBasicMaterial({ map: signTexture })
);
signFace.position.set(0, 6.5, -12.96);
scene.add(signFace);
addBlock(0.65, 3.1, 0.65, stoneLight, [-5.2, 3.05, -13.05]);
addBlock(0.65, 3.1, 0.65, stoneLight, [5.2, 3.05, -13.05]);

for (const x of [-6.9, 6.9]) {
  const lantern = new THREE.PointLight('#ffdfa1', 11, 17, 2);
  lantern.position.set(x, 7.1, -11.4);
  scene.add(lantern);
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 12, 10),
    new THREE.MeshBasicMaterial({ color: '#ffe4a4' })
  );
  lamp.position.copy(lantern.position);
  scene.add(lamp);
}

const edgeMaterial = new THREE.MeshStandardMaterial({ color: '#797b70', roughness: 1 });
for (const [x, z, rotation] of [
  [0, -16.62, 0],
  [0, 16.62, 0],
  [-16.62, 0, Math.PI / 2],
  [16.62, 0, Math.PI / 2]
]) {
  const edge = addBlock(1, 0.23, 33.2, edgeMaterial, [x, platformTop + 0.13, z]);
  edge.rotation.y = rotation;
}

const eyeHeight = 5.5;
const player = {
  position: new THREE.Vector3(0, platformTop + eyeHeight, 0),
  height: 6,
  verticalVelocity: 0,
  grounded: true,
  yaw: 0,
  pitch: 0,
  walkSpeed: 13,
  jumpHeight: 2
};
camera.position.copy(player.position);
camera.rotation.set(player.pitch, player.yaw, 0);

const keys = new Set();
const unlockedPasswords = new Set();
let playing = false;
let toastTimeout;
let lastFrameTime = performance.now();

const passwordSecrets = new Map([
  ["anything's a secret", 'title'],
  ['welcome', 'welcome'],
  ['look closer', 'look closer']
]);

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove('is-visible'), 5000);
}

function updateMouseStatus() {
  const isLocked = document.pointerLockElement === canvas;
  mouseToggle.setAttribute('aria-pressed', String(isLocked));
  mouseLabel.textContent = isLocked ? 'MOUSE CAPTURED' : 'MOUSE FREE';
}

function requestMouseCapture() {
  if (!playing) return;

  startStatus.textContent = '';
  const request = canvas.requestPointerLock();
  if (request && typeof request.catch === 'function') {
    request.catch(() => {
      showMouseCaptureError();
    });
  }
}

function showMouseCaptureError() {
  const message = 'Mouse capture blocked · click the world to retry';
  if (startScreen.classList.contains('is-hidden')) {
    showToast(message);
  } else {
    startStatus.textContent = 'Mouse capture was blocked. Click the world or use the ; key to try again.';
  }
}

enterButton.addEventListener('click', () => {
  playing = true;
  startScreen.classList.add('is-hidden');
  requestMouseCapture();
});

mouseToggle.addEventListener('click', () => {
  if (!playing) {
    startStatus.textContent = 'Step into the world first to move around.';
    return;
  }

  if (document.pointerLockElement === canvas) {
    document.exitPointerLock();
  } else {
    requestMouseCapture();
  }
});

document.addEventListener('pointerlockchange', updateMouseStatus);
document.addEventListener('pointerlockerror', showMouseCaptureError);

document.addEventListener('mousemove', (event) => {
  if (document.pointerLockElement !== canvas || !playing) return;
  player.yaw -= event.movementX * 0.0022;
  player.pitch = THREE.MathUtils.clamp(player.pitch - event.movementY * 0.0022, -1.35, 1.35);
});

document.addEventListener('keydown', (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

  if (isTyping || !playing) return;

  if (event.code === 'Semicolon') {
    event.preventDefault();
    if (document.pointerLockElement === canvas) {
      document.exitPointerLock();
    } else {
      requestMouseCapture();
    }
    return;
  }

  if (event.code === 'Space') {
    event.preventDefault();
    if (!event.repeat && player.grounded) {
      player.verticalVelocity = Math.sqrt(2 * 32 * player.jumpHeight);
      player.grounded = false;
    }
    return;
  }

  if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
    keys.add(event.code);
  }
});

document.addEventListener('keyup', (event) => keys.delete(event.code));
window.addEventListener('blur', () => keys.clear());

canvas.addEventListener('click', () => {
  if (playing && document.pointerLockElement !== canvas) requestMouseCapture();
});

passwordForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const phrase = passwordInput.value.trim().toLowerCase();
  passwordInput.value = '';

  if (!passwordSecrets.has(phrase)) {
    passwordInput.setAttribute('aria-invalid', 'true');
    passwordHint.textContent = 'No match yet. Keep searching.';
    return;
  }

  passwordInput.removeAttribute('aria-invalid');
  passwordHint.textContent = 'The world keeps what you type.';
  unlockedPasswords.add(passwordSecrets.get(phrase));
  secretCount.textContent = `SECRETS FOUND  ${unlockedPasswords.size}`;
  showToast('Secret Unlocked');
});

passwordInput.addEventListener('input', () => {
  passwordInput.removeAttribute('aria-invalid');
  passwordHint.textContent = 'The world keeps what you type.';
});

function groundHeightAt(x, z) {
  const platformHalfWidth = platformWidth / 2 - 0.18;
  return Math.abs(x) < platformHalfWidth && Math.abs(z) < platformHalfWidth ? platformTop : 0;
}

function collidesWithPillar(x, z) {
  const pillarCollision = pillarPositions.some(([pillarX, pillarZ]) =>
    Math.abs(x - pillarX) < 1.75 && Math.abs(z - pillarZ) < 1.75
  );
  const feetHeight = player.position.y - eyeHeight;
  const overlapsSignHeight = feetHeight < 6.5 + 2.7 && feetHeight + player.height > 6.5 - 2.7;
  const signCollision = overlapsSignHeight && Math.abs(x) < 7.1 && Math.abs(z + 13.25) < 0.9;
  return pillarCollision || signCollision;
}

function canReachGroundAt(x, z) {
  const feetHeight = player.position.y - eyeHeight;
  return groundHeightAt(x, z) <= feetHeight + 0.04;
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

window.addEventListener('resize', resize);
resize();

function animate(now) {
  requestAnimationFrame(animate);
  const delta = Math.min((now - lastFrameTime) / 1000, 0.05);
  lastFrameTime = now;

  if (playing) {
    const forwardInput = Number(keys.has('KeyW')) - Number(keys.has('KeyS'));
    const sidewaysInput = Number(keys.has('KeyD')) - Number(keys.has('KeyA'));
    const inputLength = Math.hypot(forwardInput, sidewaysInput);

    if (inputLength > 0) {
      const forwardX = -Math.sin(player.yaw);
      const forwardZ = -Math.cos(player.yaw);
      const rightX = Math.cos(player.yaw);
      const rightZ = -Math.sin(player.yaw);
      const nextX = player.position.x +
        (forwardX * forwardInput + rightX * sidewaysInput) / inputLength * player.walkSpeed * delta;
      const nextZ = player.position.z +
        (forwardZ * forwardInput + rightZ * sidewaysInput) / inputLength * player.walkSpeed * delta;

      const boundedX = THREE.MathUtils.clamp(nextX, -998, 998);
      const boundedZ = THREE.MathUtils.clamp(nextZ, -998, 998);

      if (
        !collidesWithPillar(boundedX, player.position.z) &&
        canReachGroundAt(boundedX, player.position.z)
      ) {
        player.position.x = boundedX;
      }
      if (
        !collidesWithPillar(player.position.x, boundedZ) &&
        canReachGroundAt(player.position.x, boundedZ)
      ) {
        player.position.z = boundedZ;
      }
    }

    if (player.grounded && player.position.y - eyeHeight > groundHeightAt(player.position.x, player.position.z) + 0.04) {
      player.grounded = false;
      player.verticalVelocity = 0;
    }

    player.position.y += player.verticalVelocity * delta - 0.5 * 32 * delta * delta;
    player.verticalVelocity -= 32 * delta;

    const floorY = groundHeightAt(player.position.x, player.position.z) + eyeHeight;
    if (player.position.y <= floorY) {
      player.position.y = floorY;
      player.verticalVelocity = 0;
      player.grounded = true;
    }

    camera.position.copy(player.position);
    camera.rotation.set(player.pitch, player.yaw, 0);
  }

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
