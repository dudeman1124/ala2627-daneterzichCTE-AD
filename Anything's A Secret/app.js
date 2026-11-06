import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const canvas = document.querySelector('#world');
const startScreen = document.querySelector('#start-screen');
const enterButton = document.querySelector('#enter-world');
const startStatus = document.querySelector('#start-status');
const settingsPanel = document.querySelector('#settings-panel');
const closeSettingsButton = document.querySelector('#close-settings');
const remotePanel = document.querySelector('#remote-panel');
const closeRemoteButton = document.querySelector('#remote-close');
const remotePowerButton = document.querySelector('#tv-power');
const remoteChannelDisplay = document.querySelector('#tv-channel-display');
const remoteStatus = document.querySelector('#remote-status');
const remoteKeypad = document.querySelector('#remote-keypad');
const remoteTuneButton = document.querySelector('#remote-tune');
const timeOfDayInputs = document.querySelectorAll('input[name="time-of-day"]');
const mouseToggle = document.querySelector('#mouse-toggle');
const mouseLabel = document.querySelector('#mouse-label');
const passwordForm = document.querySelector('#password-form');
const passwordInput = document.querySelector('#password-input');
const passwordHint = document.querySelector('#password-hint');
const secretCount = document.querySelector('#secret-count');
const toast = document.querySelector('#toast');
const passwordIndexToggle = document.querySelector('#password-index-toggle');
const passwordIndexPanel = document.querySelector('#password-index-panel');
const passwordFilters = document.querySelector('#password-filters');
const passwordList = document.querySelector('#password-list');

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

const nightStars = new THREE.Group();
scene.add(nightStars);

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

const house = {
  centerX: 75,
  centerZ: 0,
  width: 50,
  depth: 50,
  floorHeight: 0.28,
  wallHeight: 12
};
const houseMinX = house.centerX - house.width / 2;
const houseMaxX = house.centerX + house.width / 2;
const houseMinZ = house.centerZ - house.depth / 2;
const houseMaxZ = house.centerZ + house.depth / 2;
const houseWallTop = house.floorHeight + house.wallHeight;

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
  } while (
    (Math.abs(x) < 18 && Math.abs(z) < 18) ||
    (x > houseMinX - 2 && x < houseMaxX + 2 && z > houseMinZ - 2 && z < houseMaxZ + 2)
  );

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

const platformTop = 0.62;
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

addBlock(36, 0.4, 36, stoneDark, [0, 0.2, 0]);
addBlock(34, 0.22, 34, stoneLight, [0, 0.51, 0]);

const spawnPlanterPositions = [[-12, -10], [12, -10], [-12, 10], [12, 10]];
const planterMaterial = new THREE.MeshStandardMaterial({ color: '#596c58', roughness: 0.92 });
const planterGreenery = new THREE.MeshStandardMaterial({ color: '#547b48', roughness: 1 });
for (const [x, z] of spawnPlanterPositions) {
  addBlock(4.5, 0.9, 4.5, planterMaterial, [x, platformTop + 0.45, z]);
  const shrub = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), planterGreenery);
  shrub.position.set(x, platformTop + 1.35, z);
  shrub.scale.set(1.65, 0.82, 1.65);
  shrub.castShadow = true;
  shrub.receiveShadow = true;
  scene.add(shrub);
}

for (const x of [22, 28, 34, 40, 46]) {
  addBlock(5, 0.14, 6, stoneLight, [x, 0.07, 0], false);
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
addBlock(13.3, 4.8, 0.55, stoneDark, [0, 4, -13.25]);
const signFace = new THREE.Mesh(
  new THREE.PlaneGeometry(12.8, 4.4),
  new THREE.MeshBasicMaterial({ map: signTexture })
);
signFace.position.set(0, 4, -12.96);
scene.add(signFace);
addBlock(0.65, 2, 0.65, stoneLight, [-5.2, 1.62, -13.05]);
addBlock(0.65, 2, 0.65, stoneLight, [5.2, 1.62, -13.05]);

const houseWallMaterial = new THREE.MeshStandardMaterial({ color: '#d1b58d', roughness: 0.88 });
const houseTrimMaterial = new THREE.MeshStandardMaterial({ color: '#39271e', roughness: 0.72 });
const houseRoofMaterial = new THREE.MeshStandardMaterial({ color: '#b8453d', roughness: 0.76 });
const houseWindowMaterial = new THREE.MeshPhysicalMaterial({
  color: '#a9d8ed',
  transparent: true,
  opacity: 0.25,
  roughness: 0.2,
  depthWrite: false,
  side: THREE.DoubleSide
});

function addHouseWallPanel(axis, fixed, start, end, bottom, top) {
  const length = end - start;
  const height = top - bottom;
  const thickness = 0.72;
  const dimensions = axis === 'z'
    ? [thickness, height, length]
    : [length, height, thickness];
  const position = axis === 'z'
    ? [fixed, (bottom + top) / 2, (start + end) / 2]
    : [(start + end) / 2, (bottom + top) / 2, fixed];
  addBlock(...dimensions, houseWallMaterial, position);
}

function addHouseWall(axis, fixed, start, end, openings = []) {
  const horizontalCuts = [start, end];
  for (const opening of openings) {
    horizontalCuts.push(opening.center - opening.width / 2, opening.center + opening.width / 2);
  }
  horizontalCuts.sort((left, right) => left - right);

  const cuts = horizontalCuts.filter((value, index) => index === 0 || value - horizontalCuts[index - 1] > 0.001);
  for (let index = 0; index < cuts.length - 1; index += 1) {
    const segmentStart = Math.max(start, cuts[index]);
    const segmentEnd = Math.min(end, cuts[index + 1]);
    if (segmentEnd <= segmentStart) continue;

    const segmentCenter = (segmentStart + segmentEnd) / 2;
    const segmentOpenings = openings.filter((opening) =>
      segmentCenter > opening.center - opening.width / 2 &&
      segmentCenter < opening.center + opening.width / 2
    );
    const verticalCuts = [house.floorHeight, houseWallTop];
    for (const opening of segmentOpenings) verticalCuts.push(opening.bottom, opening.top);
    verticalCuts.sort((left, right) => left - right);

    const uniqueVerticalCuts = verticalCuts.filter((value, cutIndex) =>
      cutIndex === 0 || value - verticalCuts[cutIndex - 1] > 0.001
    );
    for (let cutIndex = 0; cutIndex < uniqueVerticalCuts.length - 1; cutIndex += 1) {
      const bottom = uniqueVerticalCuts[cutIndex];
      const top = uniqueVerticalCuts[cutIndex + 1];
      const centerY = (bottom + top) / 2;
      const isOpening = segmentOpenings.some((opening) => centerY > opening.bottom && centerY < opening.top);
      if (!isOpening) addHouseWallPanel(axis, fixed, segmentStart, segmentEnd, bottom, top);
    }
  }
}

function addHouseWindow(axis, fixed, center, width, bottom, height) {
  const centerY = bottom + height / 2;
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), houseWindowMaterial);
  if (axis === 'z') {
    pane.position.set(fixed, centerY, center);
    pane.rotation.y = Math.PI / 2;
    const frameX = fixed < house.centerX ? fixed - 0.42 : fixed + 0.42;
    for (const y of [bottom - 0.16, bottom + height + 0.16, centerY]) {
      addBlock(0.32, 0.3, width + 0.42, houseTrimMaterial, [frameX, y, center]);
    }
    for (const z of [center - width / 2 - 0.16, center + width / 2 + 0.16]) {
      addBlock(0.32, height + 0.58, 0.32, houseTrimMaterial, [frameX, centerY, z]);
    }
  } else {
    pane.position.set(center, centerY, fixed);
    const frameZ = fixed < house.centerZ ? fixed - 0.42 : fixed + 0.42;
    for (const y of [bottom - 0.16, bottom + height + 0.16, centerY]) {
      addBlock(width + 0.42, 0.3, 0.32, houseTrimMaterial, [center, y, frameZ]);
    }
    for (const x of [center - width / 2 - 0.16, center + width / 2 + 0.16]) {
      addBlock(0.32, height + 0.58, 0.32, houseTrimMaterial, [x, centerY, frameZ]);
    }
  }
  pane.castShadow = false;
  scene.add(pane);
}

const windowHeight = 4.5;
const windowBottom = house.floorHeight + 4.1;
const windowWidth = 6;
const frontOpenings = [
  { center: house.centerZ, width: 4, bottom: house.floorHeight, top: house.floorHeight + 7 },
  ...[-13, 13].map((center) => ({
    center,
    width: windowWidth,
    bottom: windowBottom,
    top: windowBottom + windowHeight
  }))
];
const backOpenings = [-13, 13].map((center) => ({
  center,
  width: windowWidth,
  bottom: windowBottom,
  top: windowBottom + windowHeight
}));
const sideOpenings = [-13, 13].map((center) => ({
  center: house.centerX + center,
  width: windowWidth,
  bottom: windowBottom,
  top: windowBottom + windowHeight
}));

addBlock(house.width - 1, 0.28, house.depth - 1,
  new THREE.MeshStandardMaterial({ color: '#4e86a2', roughness: 0.82 }),
  [house.centerX, house.floorHeight / 2, house.centerZ]);
addHouseWall('z', houseMinX, houseMinZ, houseMaxZ, frontOpenings);
addHouseWall('z', houseMaxX, houseMinZ, houseMaxZ, backOpenings);
addHouseWall('x', houseMinZ, houseMinX, houseMaxX, sideOpenings);
addHouseWall('x', houseMaxZ, houseMinX, houseMaxX, sideOpenings);

for (const center of [-13, 13]) {
  addHouseWindow('z', houseMinX, house.centerZ + center, windowWidth, windowBottom, windowHeight);
  addHouseWindow('z', houseMaxX, house.centerZ + center, windowWidth, windowBottom, windowHeight);
  addHouseWindow('x', houseMinZ, house.centerX + center, windowWidth, windowBottom, windowHeight);
  addHouseWindow('x', houseMaxZ, house.centerX + center, windowWidth, windowBottom, windowHeight);
}

const gableShape = new THREE.Shape();
gableShape.moveTo(0, 0);
gableShape.lineTo(house.width, 0);
gableShape.lineTo(house.width / 2, 4.5);
gableShape.closePath();
const gableGeometry = new THREE.ShapeGeometry(gableShape);
for (const z of [houseMinZ - 0.37, houseMaxZ + 0.37]) {
  const gable = new THREE.Mesh(gableGeometry, new THREE.MeshStandardMaterial({
    color: '#d1b58d',
    roughness: 0.88,
    side: THREE.DoubleSide
  }));
  gable.position.set(houseMinX, houseWallTop, z);
  gable.castShadow = true;
  gable.receiveShadow = true;
  scene.add(gable);
}

const roofRun = house.width / 2;
const roofRise = 4.5;
const roofAngle = Math.atan2(roofRise, roofRun);
const roofLength = Math.hypot(roofRun, roofRise) + 1.2;
const leftRoof = addBlock(roofLength, 0.62, house.depth + 1.8, houseRoofMaterial,
  [house.centerX - roofRun / 2, houseWallTop + roofRise / 2, house.centerZ]);
leftRoof.rotation.z = roofAngle;
const rightRoof = addBlock(roofLength, 0.62, house.depth + 1.8, houseRoofMaterial,
  [house.centerX + roofRun / 2, houseWallTop + roofRise / 2, house.centerZ]);
rightRoof.rotation.z = -roofAngle;

const chimneyMaterial = new THREE.MeshStandardMaterial({ color: '#a84a40', roughness: 0.9 });
const fireplaceStone = new THREE.MeshStandardMaterial({ color: '#756e61', roughness: 0.9 });
const fireplaceDark = new THREE.MeshStandardMaterial({ color: '#171716', roughness: 1 });
const fireMaterial = new THREE.MeshStandardMaterial({
  color: '#ff762f',
  emissive: '#e33d12',
  emissiveIntensity: 1.8,
  roughness: 0.45
});
addBlock(2, 12.2, 10, chimneyMaterial,
  [houseMaxX - 1.2, house.floorHeight + 6.1, house.centerZ]);
addBlock(4.8, 0.38, 4.6, houseTrimMaterial,
  [houseMaxX - 1.2, houseWallTop + 0.18, house.centerZ]);

const fireplaceFrontX = houseMaxX - 2.25;
addBlock(2.8, 0.52, 7.8, fireplaceStone,
  [fireplaceFrontX - 0.5, house.floorHeight + 0.26, house.centerZ]);
addBlock(0.7, 3.5, 0.72, fireplaceStone,
  [fireplaceFrontX, house.floorHeight + 2.05, house.centerZ - 3.1]);
addBlock(0.7, 3.5, 0.72, fireplaceStone,
  [fireplaceFrontX, house.floorHeight + 2.05, house.centerZ + 3.1]);
addBlock(0.75, 0.7, 7.1, fireplaceStone,
  [fireplaceFrontX, house.floorHeight + 3.75, house.centerZ]);
addBlock(0.22, 2.55, 5.55, fireplaceDark,
  [fireplaceFrontX - 0.38, house.floorHeight + 2.08, house.centerZ], false);
addBlock(2.7, 0.36, 8, houseTrimMaterial,
  [fireplaceFrontX - 0.6, house.floorHeight + 4.28, house.centerZ]);

const fireplaceFlames = new THREE.Group();
fireplaceFlames.position.set(fireplaceFrontX - 0.53, house.floorHeight + 0.68, house.centerZ);
for (const [z, scale] of [[-1.35, 0.78], [-0.55, 1], [0.35, 0.88], [1.25, 0.68]]) {
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.75, 7), fireMaterial);
  flame.position.set(0, 0.92, z);
  flame.scale.set(0.72, scale, 0.72);
  fireplaceFlames.add(flame);
}
scene.add(fireplaceFlames);
const fireplaceLight = new THREE.PointLight('#ff7537', 8, 15, 2);
fireplaceLight.position.set(fireplaceFrontX - 1.4, house.floorHeight + 2, house.centerZ);
scene.add(fireplaceLight);

const doorFrameMaterial = new THREE.MeshStandardMaterial({ color: '#b83f3c', roughness: 0.75 });
for (const z of [house.centerZ - 2.2, house.centerZ + 2.2]) {
  addBlock(0.42, 7.25, 0.42, doorFrameMaterial, [houseMinX - 0.48, house.floorHeight + 3.55, z]);
}
addBlock(0.42, 0.42, 4.8, doorFrameMaterial,
  [houseMinX - 0.48, house.floorHeight + 7.2, house.centerZ]);
addBlock(2, 0.2, 6, stoneLight, [houseMinX - 1.1, 0.1, house.centerZ], false);

const ceilingFixtureMaterial = new THREE.MeshStandardMaterial({
  color: '#d8c49a',
  emissive: '#f7d9a1',
  emissiveIntensity: 0.35,
  roughness: 0.58
});
const ceilingBulbMaterial = new THREE.MeshBasicMaterial({ color: '#fff1d2' });
for (const [offsetX, offsetZ] of [[-14, -14], [14, -14], [-14, 14], [14, 14]]) {
  const fixtureX = house.centerX + offsetX;
  const fixtureY = house.floorHeight + 10.2;
  const fixtureZ = house.centerZ + offsetZ;
  const fixture = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.6, 0.16, 16), ceilingFixtureMaterial);
  fixture.position.set(fixtureX, fixtureY + 0.12, fixtureZ);
  scene.add(fixture);

  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), ceilingBulbMaterial);
  bulb.position.set(fixtureX, fixtureY - 0.08, fixtureZ);
  scene.add(bulb);

  const interiorLight = new THREE.PointLight('#ffe2b6', 22, 36, 1.5);
  interiorLight.position.set(fixtureX, fixtureY - 0.18, fixtureZ);
  scene.add(interiorLight);
}

const tvBodyMaterial = new THREE.MeshStandardMaterial({ color: '#111820', roughness: 0.35, metalness: 0.3 });
const tvScreenMaterial = new THREE.MeshStandardMaterial({
  color: '#ffffff',
  emissive: '#ffffff',
  emissiveIntensity: 0.08,
  roughness: 0.22
});
const tvCanvas = document.createElement('canvas');
tvCanvas.width = 1024;
tvCanvas.height = 576;
const tvContext = tvCanvas.getContext('2d');
const tvTexture = new THREE.CanvasTexture(tvCanvas);
tvTexture.colorSpace = THREE.SRGBColorSpace;
let tvPoweredOn = false;
let tvChannel = '';
let tvImageVisible = false;
let youtubePlayer = null;

window.onYouTubeIframeAPIReady = () => {
  youtubePlayer = new window.YT.Player('tv-youtube-player', {
    videoId: 'U7pvasP4sOI',
    playerVars: { autoplay: 0, controls: 0, playsinline: 1 },
    events: {
      onReady: () => {
        if (tvImageVisible) youtubePlayer.playVideo();
      },
      onStateChange: (event) => {
        if (event.data === window.YT.PlayerState.ENDED) {
          tvPoweredOn = false;
          updateTv();
          remoteStatus.textContent = 'The broadcast ended. Television off.';
        }
      }
    }
  });
};

const youtubeApiScript = document.createElement('script');
youtubeApiScript.src = 'https://www.youtube.com/iframe_api';
document.head.append(youtubeApiScript);

function drawTvScreen(showPicture) {
  const { width, height } = tvCanvas;
  tvContext.fillStyle = '#090d10';
  tvContext.fillRect(0, 0, width, height);

  if (showPicture) {
    tvContext.fillStyle = '#344b50';
    tvContext.fillRect(0, 0, width, height * 0.68);
    tvContext.fillStyle = '#9b6849';
    tvContext.fillRect(0, height * 0.68, width, height * 0.32);
    tvContext.fillStyle = '#d5b78d';
    tvContext.beginPath();
    tvContext.ellipse(width * 0.5, height * 0.72, width * 0.28, height * 0.13, 0, 0, Math.PI * 2);
    tvContext.fill();
    tvContext.fillStyle = '#a64c27';
    tvContext.beginPath();
    tvContext.ellipse(width * 0.5, height * 0.69, width * 0.235, height * 0.105, 0, 0, Math.PI * 2);
    tvContext.fill();
    for (let index = 0; index < 38; index += 1) {
      const x = width * (0.32 + ((index * 37) % 360) / 1000);
      const y = height * (0.62 + ((index * 23) % 75) / 1000);
      tvContext.fillStyle = ['#e5bf68', '#73914b', '#e3d59b', '#c95f38'][index % 4];
      tvContext.beginPath();
      tvContext.ellipse(x, y, 10 + (index % 4) * 2, 5 + (index % 3) * 2, index * 0.4, 0, Math.PI * 2);
      tvContext.fill();
    }
    tvContext.fillStyle = 'rgba(255, 231, 184, 0.34)';
    tvContext.fillRect(0, 0, width, height);
    tvContext.fillStyle = 'rgba(20, 23, 18, 0.2)';
    for (let y = 0; y < height; y += 5) tvContext.fillRect(0, y, width, 1);
  } else {
    tvContext.fillStyle = '#b6d2d7';
    tvContext.font = '500 30px monospace';
    tvContext.textAlign = 'center';
    tvContext.fillText(tvPoweredOn ? (tvChannel ? 'NO SIGNAL' : 'ENTER CHANNEL') : '', width / 2, height / 2);
  }

  tvTexture.needsUpdate = true;
}

addBlock(0.42, 4.2, 7.6, tvBodyMaterial,
  [fireplaceFrontX - 0.21, house.floorHeight + 7.55, house.centerZ]);
const tvScreen = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 3.65), tvScreenMaterial);
tvScreen.position.set(fireplaceFrontX - 0.5, house.floorHeight + 7.55, house.centerZ);
tvScreen.rotation.y = -Math.PI / 2;
scene.add(tvScreen);

drawTvScreen(false);

function updateTv() {
  tvImageVisible = tvPoweredOn && tvChannel === '10312020';
  drawTvScreen(tvImageVisible);
  tvScreenMaterial.map = tvTexture;
  tvScreenMaterial.emissiveIntensity = tvPoweredOn ? 0.38 : 0.02;
  if (youtubePlayer) {
    if (tvImageVisible) youtubePlayer.playVideo();
    else youtubePlayer.pauseVideo();
  }
  remotePowerButton.setAttribute('aria-pressed', String(tvPoweredOn));
  remotePowerButton.dataset.powered = String(tvPoweredOn);
  remotePowerButton.querySelector('.power-label').textContent = tvPoweredOn ? 'ON' : 'OFF';
}

const remoteRoot = new THREE.Group();
remoteRoot.position.set(house.centerX + 11, house.floorHeight + 2.12, house.centerZ + 3);
scene.add(remoteRoot);
const remoteBody = new THREE.Mesh(
  new THREE.BoxGeometry(0.48, 0.2, 1.55),
  new THREE.MeshStandardMaterial({ color: '#252a2b', roughness: 0.4 })
);
remoteBody.castShadow = true;
remoteRoot.add(remoteBody);
const remotePower = new THREE.Mesh(
  new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12),
  new THREE.MeshStandardMaterial({ color: '#d7483f', roughness: 0.42 })
);
remotePower.position.set(0, 0.14, -0.52);
remoteRoot.add(remotePower);
for (let row = 0; row < 3; row += 1) {
  for (let column = 0; column < 3; column += 1) {
    const key = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.035, 0.09),
      new THREE.MeshStandardMaterial({ color: '#c4c6bf', roughness: 0.48 })
    );
    key.position.set((column - 1) * 0.13, 0.12, -0.16 + row * 0.2);
    remoteRoot.add(key);
  }
}
const remoteInteractionPosition = remoteRoot.position.clone();
remoteInteractionPosition.y += 0.2;
let remoteReturnFocus = null;
let channelEntry = '';

function renderChannelEntry() {
  remoteChannelDisplay.textContent = channelEntry || '------';
}

function setRemoteOpen(isOpen) {
  if (isOpen) {
    remoteReturnFocus = document.activeElement;
    remotePanel.hidden = false;
    keys.clear();
    if (document.pointerLockElement === canvas) document.exitPointerLock();
    renderChannelEntry();
    remoteStatus.textContent = 'Enter a channel, then tune the television.';
    remotePowerButton.focus();
    return;
  }

  remotePanel.hidden = true;
  keys.clear();
  if (remoteReturnFocus instanceof HTMLElement && remoteReturnFocus.isConnected) remoteReturnFocus.focus();
}

remoteKeypad.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-digit]');
  if (!button || channelEntry.length >= 12) return;
  channelEntry += button.dataset.digit;
  renderChannelEntry();
});

document.querySelector('#remote-clear').addEventListener('click', () => {
  channelEntry = '';
  renderChannelEntry();
  remoteStatus.textContent = 'Channel cleared.';
});

remoteTuneButton.addEventListener('click', () => {
  tvChannel = channelEntry;
  updateTv();
  remoteStatus.textContent = tvImageVisible
    ? 'Channel 10312020: picture received.'
    : tvChannel === '10312020'
      ? 'Channel 10312020 is ready. Turn the television on.'
      : 'No picture on this channel.';
});

remotePowerButton.addEventListener('click', () => {
  tvPoweredOn = !tvPoweredOn;
  updateTv();
  remoteStatus.textContent = tvPoweredOn
    ? (tvImageVisible ? 'Television on. Picture received.' : 'Television on.')
    : 'Television off.';
});

closeRemoteButton.addEventListener('click', () => setRemoteOpen(false));
updateTv();

const sofaMaterial = new THREE.MeshStandardMaterial({ color: '#557660', roughness: 0.96 });
const sofaCushionMaterial = new THREE.MeshStandardMaterial({ color: '#89a58c', roughness: 0.98 });
addBlock(5.2, 1.15, 11, sofaMaterial, [house.centerX + 1, house.floorHeight + 0.95, house.centerZ + 3]);
addBlock(1.25, 2.5, 11, sofaMaterial, [house.centerX - 1.45, house.floorHeight + 2.1, house.centerZ + 3]);
for (const z of [house.centerZ - 2.65, house.centerZ + 8.65]) {
  addBlock(5.2, 1.8, 0.9, sofaMaterial, [house.centerX + 1, house.floorHeight + 1.45, z]);
}
for (const z of [house.centerZ + 0.5, house.centerZ + 5.5]) {
  addBlock(3.6, 0.38, 4.2, sofaCushionMaterial, [house.centerX + 1.5, house.floorHeight + 1.72, z]);
}

const tableMaterial = new THREE.MeshStandardMaterial({ color: '#79543c', roughness: 0.72 });
addBlock(3.6, 0.3, 6.8, tableMaterial, [house.centerX + 11, house.floorHeight + 1.8, house.centerZ + 3]);
for (const x of [house.centerX + 9.6, house.centerX + 12.4]) {
  for (const z of [house.centerZ + 0.5, house.centerZ + 5.5]) {
    addBlock(0.24, 1.65, 0.24, tableMaterial, [x, house.floorHeight + 0.84, z]);
  }
}

const fridgeWidth = 3.6;
const fridgeHeight = 6.25;
const fridgeDepth = 3.7;
const fridgePosition = new THREE.Vector3(house.centerX - 10, house.floorHeight, house.centerZ - 21.5);
const fridgeRoot = new THREE.Group();
fridgeRoot.position.copy(fridgePosition);
scene.add(fridgeRoot);
const fridgeShellMaterial = new THREE.MeshStandardMaterial({ color: '#d8dfe0', roughness: 0.38, metalness: 0.16 });
const fridgeDoorMaterial = new THREE.MeshStandardMaterial({
  color: '#d8dfe0', roughness: 0.38, metalness: 0.16, transparent: true, opacity: 0.18, depthWrite: false
});
const fridgeInteriorMaterial = new THREE.MeshStandardMaterial({ color: '#69777a', roughness: 0.9 });
function addFridgeBox(width, height, depth, material, position, parent = fridgeRoot) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

addFridgeBox(fridgeWidth - 0.2, fridgeHeight - 0.2, 0.18, fridgeInteriorMaterial,
  [0, fridgeHeight / 2, -fridgeDepth / 2 + 0.12]);
addFridgeBox(0.22, fridgeHeight, fridgeDepth, fridgeShellMaterial, [-fridgeWidth / 2 + 0.11, fridgeHeight / 2, 0]);
addFridgeBox(0.22, fridgeHeight, fridgeDepth, fridgeShellMaterial, [fridgeWidth / 2 - 0.11, fridgeHeight / 2, 0]);
addFridgeBox(fridgeWidth, 0.22, fridgeDepth, fridgeShellMaterial, [0, 0.11, 0]);
addFridgeBox(fridgeWidth, 0.22, fridgeDepth, fridgeShellMaterial, [0, fridgeHeight - 0.11, 0]);
const fridgeShelfLevels = { bottom: 0.35, middle: 1.5, top: 2.85 };
for (const shelfY of Object.values(fridgeShelfLevels)) {
  addFridgeBox(fridgeWidth - 0.35, 0.12, fridgeDepth - 0.45, fridgeShellMaterial,
    [0, shelfY, -0.1]);
}
addFridgeBox(fridgeWidth - 0.35, 2.08, 0.16, fridgeShellMaterial, [0, 5.17, fridgeDepth / 2 + 0.04]);

const appleMaterial = new THREE.MeshStandardMaterial({ color: '#c83236', roughness: 0.38 });
const pearMaterial = new THREE.MeshStandardMaterial({ color: '#68a442', roughness: 0.42 });
const blueberryMaterial = new THREE.MeshStandardMaterial({ color: '#355dc3', roughness: 0.38 });
const appleShelfY = fridgeShelfLevels.top + 0.12 / 2;
const apple = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 14), appleMaterial);
apple.scale.set(0.92, 1, 0.9);
apple.position.set(-0.75, appleShelfY + 0.42, 0.35);
fridgeRoot.add(apple);
const appleStem = new THREE.Mesh(
  new THREE.CylinderGeometry(0.035, 0.045, 0.2, 7),
  new THREE.MeshStandardMaterial({ color: '#49351f', roughness: 0.8 })
);
appleStem.position.set(-0.75, appleShelfY + 0.84, 0.35);
fridgeRoot.add(appleStem);
const pearShelfY = fridgeShelfLevels.middle + 0.12 / 2;
const pearGeometry = new THREE.LatheGeometry([
  new THREE.Vector2(0, 0), new THREE.Vector2(0.16, 0.02), new THREE.Vector2(0.28, 0.14),
  new THREE.Vector2(0.34, 0.34), new THREE.Vector2(0.31, 0.5), new THREE.Vector2(0.2, 0.66),
  new THREE.Vector2(0.12, 0.82), new THREE.Vector2(0.08, 0.9), new THREE.Vector2(0, 0.9)
], 18);
const pear = new THREE.Mesh(pearGeometry, pearMaterial);
pear.position.set(0, pearShelfY, 0.35);
fridgeRoot.add(pear);
const pearStem = new THREE.Mesh(
  new THREE.CylinderGeometry(0.035, 0.045, 0.16, 7),
  new THREE.MeshStandardMaterial({ color: '#49351f', roughness: 0.8 })
);
pearStem.position.set(0, pearShelfY + 0.96, 0.35);
fridgeRoot.add(pearStem);

const blueberryGeometry = new THREE.SphereGeometry(0.16, 12, 10);
for (const [x, z] of [
  [-0.38, 0.12], [-0.12, 0.22], [0.16, 0.12], [0.42, 0.22],
  [-0.25, 0.48], [0.04, 0.52], [0.32, 0.48]
]) {
  const blueberry = new THREE.Mesh(blueberryGeometry, blueberryMaterial);
  blueberry.position.set(x, fridgeShelfLevels.bottom + 0.12 / 2 + 0.16, z);
  fridgeRoot.add(blueberry);
}

const fridgeDoorPivot = new THREE.Group();
fridgeDoorPivot.position.set(-fridgeWidth / 2 + 0.12, 0.18, fridgeDepth / 2 + 0.08);
fridgeRoot.add(fridgeDoorPivot);
addFridgeBox(fridgeWidth - 0.3, 3.75, 0.2, fridgeDoorMaterial,
  [(fridgeWidth - 0.3) / 2, 2.03, 0], fridgeDoorPivot);
addFridgeBox(0.14, 0.9, 0.22, houseTrimMaterial,
  [fridgeWidth - 0.58, 2.03, 0.13], fridgeDoorPivot);
let fridgeDoorOpen = false;

const portraitFrameMaterial = new THREE.MeshStandardMaterial({ color: '#423126', roughness: 0.62 });
const portraitFrameX = houseMaxX - 0.36;
const portraitY = house.floorHeight + 7.8;
const portraitZ = house.centerZ + 7.25;
addBlock(0.2, 3.35, 3.35, portraitFrameMaterial, [portraitFrameX, portraitY, portraitZ]);
const portraitTexture = new THREE.Texture();
portraitTexture.colorSpace = THREE.SRGBColorSpace;
const portraitMaterial = new THREE.MeshStandardMaterial({
  color: '#ffffff',
  emissive: '#ffffff',
  emissiveIntensity: 0.08,
  map: portraitTexture,
  roughness: 0.72
});
const portrait = new THREE.Mesh(new THREE.PlaneGeometry(2.95, 2.95), portraitMaterial);
portrait.position.set(portraitFrameX - 0.12, portraitY, portraitZ);
portrait.rotation.y = -Math.PI / 2;
scene.add(portrait);
fetch('https://en.wikipedia.org/w/api.php?action=query&titles=MF_Doom&prop=pageimages&format=json&pithumbsize=600&origin=*')
  .then((response) => response.json())
  .then((data) => {
    const imageUrl = Object.values(data.query.pages)[0]?.thumbnail?.source;
    if (!imageUrl) return;
    const portraitImage = new Image();
    portraitImage.crossOrigin = 'anonymous';
    portraitImage.onload = () => {
      portraitTexture.image = portraitImage;
      portraitTexture.needsUpdate = true;
    };
    portraitImage.src = imageUrl;
  })
  .catch(() => {});

const fridgeInteractionPosition = new THREE.Vector3(
  fridgePosition.x,
  fridgePosition.y + fridgeHeight / 2,
  fridgePosition.z + fridgeDepth / 2 + 1
);

function createWordSprite(text, options = {}) {
  const {
    fillStyle = '#f5f0d7',
    font = '700 180px Georgia, serif',
    opacity = 1,
    scale = [14, 3.8, 1]
  } = options;

  const canvasTexture = document.createElement('canvas');
  canvasTexture.width = 1600;
  canvasTexture.height = 420;
  const context = canvasTexture.getContext('2d');

  context.clearRect(0, 0, canvasTexture.width, canvasTexture.height);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = fillStyle;
  context.font = font;
  context.fillText(text, canvasTexture.width / 2, canvasTexture.height / 2);

  const texture = new THREE.CanvasTexture(canvasTexture);
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity,
    depthWrite: false
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(...scale);
  return sprite;
}

const sunGlow = new THREE.Mesh(
  new THREE.SphereGeometry(34.5, 36, 36),
  new THREE.MeshBasicMaterial({ color: '#ffd778', transparent: true, opacity: 0.96 })
);
sunGlow.position.set(68, 34, -130);
scene.add(sunGlow);

const sunWord = createWordSprite('sunc0d3', {
  fillStyle: 'rgba(255, 187, 89, 0.52)',
  font: '700 220px Georgia, serif',
  opacity: 0.7,
  scale: [42, 14.4, 1]
});
sunWord.position.set(68, 34, -118.5);
scene.add(sunWord);

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(30, 32, 24),
  new THREE.MeshBasicMaterial({ color: '#b9c3cf' })
);
moon.position.set(68, 34, -130);
moon.visible = false;
scene.add(moon);

const moonWord = createWordSprite('FU11M00N', {
  fillStyle: 'rgba(125, 139, 154, 0.58)',
  font: '700 190px Georgia, serif',
  opacity: 0.56,
  scale: [42, 12.6, 1]
});
moonWord.position.set(68, 34, -118.5);
moonWord.visible = false;
scene.add(moonWord);

const crossGroup = new THREE.Group();
const crossMaterial = new THREE.MeshStandardMaterial({
  color: '#705037',
  roughness: 0.88
});
const crossStem = new THREE.Mesh(new THREE.BoxGeometry(1.6, 14, 1.6), crossMaterial);
crossStem.position.y = 7;
const crossArm = new THREE.Mesh(new THREE.BoxGeometry(7.5, 1.5, 1.6), crossMaterial);
crossArm.position.y = 9.6;
crossGroup.add(crossStem, crossArm);
crossGroup.position.set(0, 0.35, -50);
scene.add(crossGroup);

const starGeometry = new THREE.SphereGeometry(0.8, 8, 6);
const starMaterial = new THREE.MeshBasicMaterial({ color: '#f6f1d8' });
for (let index = 0; index < 15; index += 1) {
  const star = new THREE.Mesh(starGeometry, starMaterial);
  star.position.set((random() - 0.5) * 520, 145 + random() * 155, (random() - 0.5) * 520);
  star.scale.setScalar(0.55 + random() * 1.15);
  star.visible = false;
  nightStars.add(star);
}

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

const spawnStructureMaterial = new THREE.MeshStandardMaterial({ color: '#797b70', roughness: 1 });
const spawnPillarHeight = 18;
const spawnPillarPositions = [[-16, -16], [-16, 16], [16, -16], [16, 16]];
for (const [x, z] of spawnPillarPositions) {
  addBlock(1.2, spawnPillarHeight, 1.2, spawnStructureMaterial,
    [x, platformTop + spawnPillarHeight / 2, z]);
}
addBlock(36, 1, 36, spawnStructureMaterial,
  [0, platformTop + spawnPillarHeight + 0.5, 0]);

const spawnFlagCanvasSize = { width: 480, height: 300 };
function makeSpawnFlagTexture(drawFlag) {
  const flagCanvas = document.createElement('canvas');
  flagCanvas.width = spawnFlagCanvasSize.width;
  flagCanvas.height = spawnFlagCanvasSize.height;
  const context = flagCanvas.getContext('2d');
  drawFlag(context, flagCanvas.width, flagCanvas.height);
  const texture = new THREE.CanvasTexture(flagCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function drawGeorgiaCross(context, x, y, size, color) {
  context.fillStyle = color;
  context.fillRect(x - size * 0.1, y - size * 0.5, size * 0.2, size);
  context.fillRect(x - size * 0.5, y - size * 0.1, size, size * 0.2);
}

function drawMoroccoStar(context, centerX, centerY, radius) {
  context.beginPath();
  for (let point = 0; point < 10; point += 1) {
    const pointRadius = point % 2 === 0 ? radius : radius * 0.42;
    const angle = -Math.PI / 2 + point * Math.PI / 5;
    const x = centerX + Math.cos(angle) * pointRadius;
    const y = centerY + Math.sin(angle) * pointRadius;
    if (point === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
  context.stroke();
}

const spawnFlags = [
  {
    name: 'Switzerland',
    width: 2.9,
    texture: makeSpawnFlagTexture((context, width, height) => {
      context.fillStyle = '#d52b1e';
      context.fillRect(0, 0, width, height);
      context.fillStyle = '#fff';
      context.fillRect(width * 0.42, height * 0.2, width * 0.16, height * 0.6);
      context.fillRect(width * 0.2, height * 0.42, width * 0.6, height * 0.16);
    })
  },
  {
    name: 'Georgia',
    width: 4.1,
    texture: makeSpawnFlagTexture((context, width, height) => {
      context.fillStyle = '#fff';
      context.fillRect(0, 0, width, height);
      drawGeorgiaCross(context, width / 2, height / 2, height * 0.9, '#d62828');
      for (const [x, y] of [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]]) {
        drawGeorgiaCross(context, width * x, height * y, height * 0.25, '#d62828');
      }
    })
  },
  {
    name: 'Morocco',
    width: 4.1,
    texture: makeSpawnFlagTexture((context, width, height) => {
      context.fillStyle = '#c1272d';
      context.fillRect(0, 0, width, height);
      context.strokeStyle = '#006233';
      context.lineWidth = 12;
      drawMoroccoStar(context, width / 2, height / 2, height * 0.27);
    })
  },
  {
    name: 'New York',
    width: 4.1,
    texture: makeSpawnFlagTexture((context, width, height) => {
      context.fillStyle = '#164b8a';
      context.fillRect(0, 0, width, height);
      context.fillStyle = '#e6c65b';
      context.beginPath();
      context.arc(width / 2, height * 0.3, height * 0.1, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = '#d5ba69';
      context.fillRect(width * 0.39, height * 0.4, width * 0.22, height * 0.34);
      context.fillStyle = '#fff0bd';
      context.fillRect(width * 0.43, height * 0.46, width * 0.14, height * 0.22);
      context.fillStyle = '#164b8a';
      context.fillRect(width * 0.48, height * 0.48, width * 0.04, height * 0.18);
      context.fillStyle = '#e6c65b';
      context.font = 'bold 28px Georgia, serif';
      context.textAlign = 'center';
      context.fillText('EXCELSIOR', width / 2, height * 0.9);
    })
  }
];

const spawnFlagHeight = 2.8;
const spawnFlagGap = 0.6;
const spawnFlagTotalWidth = spawnFlags.reduce((total, flag) => total + flag.width, 0) +
  spawnFlagGap * (spawnFlags.length - 1);
const spawnFlagCenterOffsets = [];
let spawnFlagCursor = -spawnFlagTotalWidth / 2;
for (const flag of spawnFlags) {
  spawnFlagCenterOffsets.push(spawnFlagCursor + flag.width / 2);
  spawnFlagCursor += flag.width + spawnFlagGap;
}
const spawnFlagFrameMaterial = new THREE.MeshStandardMaterial({ color: '#b18a57', roughness: 0.82 });
const spawnFlagHeightPosition = platformTop + 10.3;

function addSpawnFlagRow(axis, fixed, coordinates, rotationY) {
  for (let index = 0; index < spawnFlags.length; index += 1) {
    const flag = spawnFlags[index];
    const position = axis === 'z'
      ? [coordinates[index], spawnFlagHeightPosition, fixed]
      : [fixed, spawnFlagHeightPosition, coordinates[index]];
    const holder = new THREE.Group();
    holder.position.set(...position);
    holder.rotation.y = rotationY;

    const cloth = new THREE.Mesh(
      new THREE.PlaneGeometry(flag.width, spawnFlagHeight),
      new THREE.MeshStandardMaterial({
        map: flag.texture,
        roughness: 0.84,
        side: THREE.DoubleSide
      })
    );
    cloth.castShadow = true;
    holder.add(cloth);

    const topBar = new THREE.Mesh(
      new THREE.BoxGeometry(flag.width + 0.12, 0.09, 0.1),
      spawnFlagFrameMaterial
    );
    topBar.position.y = spawnFlagHeight / 2;
    holder.add(topBar);
    const bottomBar = topBar.clone();
    bottomBar.position.y = -spawnFlagHeight / 2;
    holder.add(bottomBar);

    holder.userData.flagName = flag.name;
    scene.add(holder);
  }
}

const spawnFlagWallEdge = 15.34;
const reverseFlagOffsets = spawnFlagCenterOffsets.map((offset) => -offset);
addSpawnFlagRow('z', -spawnFlagWallEdge, spawnFlagCenterOffsets, 0);
addSpawnFlagRow('z', spawnFlagWallEdge, reverseFlagOffsets, Math.PI);
addSpawnFlagRow('x', -spawnFlagWallEdge, spawnFlagCenterOffsets, Math.PI / 2);
addSpawnFlagRow('x', spawnFlagWallEdge, reverseFlagOffsets, -Math.PI / 2);

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

const flashlightDirection = new THREE.Vector3();
const flashlight = new THREE.SpotLight('#fff1d2', 380, 110, Math.atan(2 * Math.tan(Math.PI / 7)), 0.55, 1.6);
flashlight.visible = false;
scene.add(flashlight, flashlight.target);

const keys = new Set();
const unlockedPasswords = new Set();
let playing = false;
let toastTimeout;
let lastFrameTime = performance.now();
let activePasswordRank = 'All';
let expandedPasswordId = null;
let starCount = Math.floor(Math.random() * 15) + 1;

const passwordRanks = ['Surface', 'Easy', 'Mediocre', 'Difficult', 'Obscure', 'Unique'];
const passwordIndex = [
  {
    phrase: 'anything',
    title: 'Genius',
    description: 'A bold beginning, hidden in plain sight.',
    id: 'anything',
    rank: 'Surface'
  },
  {
    phrase: 'welcome',
    title: 'Howdy!',
    description: 'Every journey begins by arriving.',
    id: 'welcome',
    rank: 'Surface'
  },
  {
    phrase: '45',
    title: 'Addition',
    description: "You got bored, didn't you?",
    id: '45',
    rank: 'Easy'
  },
  {
    phrase: '362880',
    title: 'Multiplication',
    description: "You got bored, didn't you? (chapter 2)",
    id: '362880',
    rank: 'Easy'
  },
  {
    phrase: 'sunc0d3',
    title: 'High Noon',
    description: 'Brighter than the sun.',
    id: 'sunc0d3',
    rank: 'Mediocre'
  },
  {
    phrase: '',
    title: 'Astronomer',
    description: 'Count the stars in the night sky, then enter the number followed by ST4RS.',
    id: 'stars',
    rank: 'Difficult'
  },
  {
    phrase: 'fu11m00n',
    title: 'Shiny Night',
    description: 'A quiet message is written across the moon.',
    id: 'fullmoon',
    rank: 'Mediocre'
  },
  {
    phrase: 'mm..food',
    title: 'MF DOOM',
    description: 'Definitely not the last of him.',
    id: 'food',
    rank: 'Obscure'
  },
  {
    phrase: 'rgbfruit',
    title: 'Colors',
    description: 'The first letters of the fridge fruits, read from top to bottom, reveal the code.',
    id: 'rgbfruit',
    rank: 'Difficult'
  },
  {
    phrase: 'hegemony',
    title: 'Geopolitics',
    description: 'You little geopolitical genius, you. Most people don\'t even know the flag of New York!',
    id: 'hegemony',
    rank: 'Difficult'
  },
  {
    phrase: 'enricopucci',
    title: 'Stone Ocean',
    description: 'Is that a JoJo reference?',
    id: 'enricopucci',
    rank: 'Unique'
  }
];
const passwordSecrets = new Map(passwordIndex.filter(({ phrase }) => phrase).map(({ phrase, id }) => [phrase, id]));
const crossRadius = 50;
const celestialOrbitRadius = 420;
const celestialOrbitAnchor = new THREE.Vector3(player.position.x, platformTop, player.position.z);
const celestialOrbitDepth = celestialOrbitAnchor.z;
const celestialLabelDepth = celestialOrbitDepth + 36;
const idleCelestialSpinSpeed = 0.18 / 20;
const madeInHeavenDurationMs = 30000;
const madeInHeavenPhrase = 'madeinheaven';
let timeOfDay = 'day';
let activeStarPhrase = null;
let celestialOrbitAngle = 0;
let madeInHeavenActive = false;
let madeInHeavenActivated = false;
let madeInHeavenStartedAt = 0;

function updateCelestialPositions() {
  const xOffset = Math.cos(celestialOrbitAngle) * celestialOrbitRadius;
  const yOffset = Math.sin(celestialOrbitAngle) * celestialOrbitRadius;
  const x = celestialOrbitAnchor.x + xOffset;
  const y = celestialOrbitAnchor.y + yOffset;
  const oppositeX = celestialOrbitAnchor.x - xOffset;
  const oppositeY = celestialOrbitAnchor.y - yOffset;

  sunGlow.position.set(x, y, celestialOrbitDepth);
  sunWord.position.set(x, y, celestialLabelDepth);
  moon.position.set(oppositeX, oppositeY, celestialOrbitDepth);
  moonWord.position.set(oppositeX, oppositeY, celestialLabelDepth);
  sun.position.set(x, y + 76, celestialOrbitDepth);
}

function advanceCelestialOrbit(delta, speed) {
  const previousHalf = Math.floor(celestialOrbitAngle / Math.PI);
  celestialOrbitAngle += delta * speed;
  const currentHalf = Math.floor(celestialOrbitAngle / Math.PI);

  updateCelestialPositions();
  if (currentHalf !== previousHalf) {
    timeOfDay = currentHalf % 2 === 0 ? 'day' : 'night';
    updateWorldSettings();
  }
}

function updateWorldSettings() {
  const isNight = timeOfDay === 'night';
  const starEntry = passwordIndex.find(({ id }) => id === 'stars');
  if (activeStarPhrase) passwordSecrets.delete(activeStarPhrase);
  starEntry.phrase = `${starCount}st4rs`;
  activeStarPhrase = starEntry.phrase;
  passwordSecrets.delete('fu11m00n');
  if (isNight) {
    passwordSecrets.set(starEntry.phrase, 'stars');
    passwordSecrets.set('fu11m00n', 'fullmoon');
  }

  scene.background.set(isNight ? '#09111d' : '#a9c5af');
  scene.fog.color.set(isNight ? '#09111d' : '#a9c5af');
  ambient.color.set(isNight ? '#63758e' : '#e8f4df');
  ambient.groundColor.set(isNight ? '#20272b' : '#6a704a');
  ambient.intensity = isNight ? 0.52 : 2.1;
  sun.intensity = isNight ? 0 : 2.6;
  ground.material.color.set(isNight ? '#1b2926' : '#78965e');
  grassMaterial.color.set(isNight ? '#26352b' : '#79a252');
  sunGlow.visible = !isNight;
  sunWord.visible = !isNight;
  moon.visible = isNight;
  moonWord.visible = isNight;
  nightStars.children.forEach((star, index) => {
    star.visible = isNight && index < starCount;
  });
}

function activateMadeInHeaven() {
  if (madeInHeavenActive) return;
  madeInHeavenActive = true;
  madeInHeavenActivated = true;
  madeInHeavenStartedAt = performance.now();
  celestialOrbitAngle = 0;
  timeOfDay = 'day';
  updateCelestialPositions();
  updateWorldSettings();
  showToast('Made In Heaven');
}

function updateMadeInHeavenEffect(delta) {
  if (!madeInHeavenActive) {
    advanceCelestialOrbit(delta, idleCelestialSpinSpeed);
    sunGlow.rotation.y += delta * idleCelestialSpinSpeed;
    moon.rotation.y -= delta * idleCelestialSpinSpeed;
    return;
  }

  const elapsedMs = performance.now() - madeInHeavenStartedAt;
  if (elapsedMs >= madeInHeavenDurationMs) {
    madeInHeavenActive = false;
    timeOfDay = Math.floor(celestialOrbitAngle / Math.PI) % 2 === 0 ? 'day' : 'night';
    updateWorldSettings();
    showToast('The heavens reset.');
    return;
  }

  const phaseSpeed = Math.pow(2.25, elapsedMs / 9000);
  const spinSpeed = 1.2 * phaseSpeed + 0.8;
  advanceCelestialOrbit(delta, spinSpeed);
  sunGlow.rotation.y += delta * spinSpeed;
  moon.rotation.y -= delta * spinSpeed;
}

for (const input of timeOfDayInputs) {
  input.addEventListener('change', () => {
    const currentHalf = Math.floor(celestialOrbitAngle / Math.PI);
    const isCurrentNight = currentHalf % 2 !== 0;
    const isRequestedNight = input.value === 'night';
    if (isCurrentNight !== isRequestedNight) {
      celestialOrbitAngle += Math.PI;
      updateCelestialPositions();
    }
    timeOfDay = input.value;
    updateWorldSettings();
  });
}

updateCelestialPositions();
updateWorldSettings();

function renderPasswordIndex(rank = activePasswordRank) {
  passwordList.replaceChildren();
  const entries = passwordIndex.filter((entry) => rank === 'All' || entry.rank === rank);

  for (const entry of entries) {
    const item = document.createElement('li');
    item.className = 'password-index-entry';
    item.dataset.rank = entry.rank;

    const isUnlocked = unlockedPasswords.has(entry.id);
    const isExpanded = expandedPasswordId === entry.id;
    const select = document.createElement('button');
    select.className = 'password-index-select';
    select.type = 'button';
    select.setAttribute('aria-expanded', String(isExpanded));
    select.setAttribute('aria-controls', `password-description-${entry.id}`);

    const titleRow = document.createElement('span');
    titleRow.className = 'password-index-title';

    const title = document.createElement('span');
    title.textContent = entry.title;

    const check = document.createElement('span');
    check.className = 'password-index-check';
    check.textContent = '✓';
    check.hidden = !isUnlocked;

    titleRow.append(title, check);

    const tier = document.createElement('span');
    tier.className = 'password-index-rank';
    tier.textContent = entry.rank;

    select.append(titleRow, tier);
    select.addEventListener('click', () => {
      expandedPasswordId = isExpanded ? null : entry.id;
      renderPasswordIndex();
    });

    const description = document.createElement('p');
    description.className = 'password-index-description';
    description.id = `password-description-${entry.id}`;
    description.hidden = !isExpanded;
    description.textContent = isUnlocked
      ? entry.description
      : 'get the password to find its description';

    if (isUnlocked) item.classList.add('is-unlocked');

    item.append(select, description);
    passwordList.append(item);
  }
}

for (const rank of ['All', ...passwordRanks]) {
  const filter = document.createElement('button');
  filter.className = 'password-filter';
  filter.type = 'button';
  filter.textContent = rank;
  filter.setAttribute('aria-pressed', String(rank === 'All'));
  if (rank !== 'All') filter.dataset.rank = rank;
  filter.addEventListener('click', () => {
    activePasswordRank = rank;
    for (const button of passwordFilters.querySelectorAll('button')) {
      button.setAttribute('aria-pressed', String(button === filter));
    }
    renderPasswordIndex(rank);
  });
  passwordFilters.append(filter);
}

renderPasswordIndex();

passwordIndexToggle.addEventListener('click', () => {
  const isExpanded = passwordIndexToggle.getAttribute('aria-expanded') === 'true';
  passwordIndexToggle.setAttribute('aria-expanded', String(!isExpanded));
  passwordIndexPanel.hidden = isExpanded;
});

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

let settingsReturnFocus = null;

function setSettingsOpen(isOpen) {
  if (isOpen) {
    settingsReturnFocus = document.activeElement;
    settingsPanel.hidden = false;
    keys.clear();
    if (document.pointerLockElement === canvas) document.exitPointerLock();
    closeSettingsButton.focus();
    return;
  }

  settingsPanel.hidden = true;
  if (settingsReturnFocus instanceof HTMLElement && settingsReturnFocus.isConnected) {
    settingsReturnFocus.focus();
  }
}

function toggleSettings() {
  setSettingsOpen(settingsPanel.hidden);
}

closeSettingsButton.addEventListener('click', () => setSettingsOpen(false));

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

document.addEventListener('wheel', (event) => {
  if (!playing || !settingsPanel.hidden || !remotePanel.hidden) return;
  event.preventDefault();
  camera.zoom = THREE.MathUtils.clamp(camera.zoom * Math.exp(-event.deltaY * 0.001), 1, 50);
  camera.updateProjectionMatrix();
}, { passive: false });

document.addEventListener('keydown', (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

  if (event.code === 'Escape' && !settingsPanel.hidden) {
    event.preventDefault();
    setSettingsOpen(false);
    return;
  }

  if (event.code === 'Escape' && !remotePanel.hidden) {
    event.preventDefault();
    setRemoteOpen(false);
    return;
  }

  if (isTyping) return;

  if (!remotePanel.hidden) {
    if (event.code === 'KeyE') {
      event.preventDefault();
      setRemoteOpen(false);
    }
    return;
  }

  if (event.code === 'Tab' && playing) {
    event.preventDefault();
    toggleSettings();
    return;
  }

  if (!playing) return;

  if (!settingsPanel.hidden) return;

  if (event.code === 'KeyF') {
    event.preventDefault();
    if (!event.repeat) {
      flashlight.visible = !flashlight.visible;
      showToast(flashlight.visible ? 'Flashlight on' : 'Flashlight off');
    }
    return;
  }

  if (event.code === 'KeyE') {
    event.preventDefault();
    const distanceToRemote = Math.hypot(
      player.position.x - remoteInteractionPosition.x,
      player.position.z - remoteInteractionPosition.z
    );
    const distanceToFridge = Math.hypot(
      player.position.x - fridgeInteractionPosition.x,
      player.position.z - fridgeInteractionPosition.z
    );
    if (distanceToRemote <= 7) {
      setRemoteOpen(true);
    } else if (distanceToFridge <= 7) {
      fridgeDoorOpen = !fridgeDoorOpen;
      fridgeDoorPivot.rotation.y = fridgeDoorOpen ? -Math.PI / 2 : 0;
      showToast(fridgeDoorOpen ? 'Refrigerator opened' : 'Refrigerator closed');
    }
    return;
  }

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
  const phrase = passwordInput.value.trim().toLowerCase().replace(/\s+/g, '');
  passwordInput.value = '';

  if (phrase === madeInHeavenPhrase) {
    if (!isNearCross()) {
      passwordInput.setAttribute('aria-invalid', 'true');
      passwordHint.textContent = 'The cross is too far away.';
      return;
    }

    activateMadeInHeaven();
    passwordInput.removeAttribute('aria-invalid');
    passwordHint.textContent = 'The heavens answer your name.';
    return;
  }

  if (phrase === 'enricopucci' && !madeInHeavenActivated) {
    passwordInput.setAttribute('aria-invalid', 'true');
    passwordHint.textContent = 'The world is not ready for that name yet.';
    return;
  }

  const passwordId = passwordSecrets.get(phrase);

  if (passwordId === 'food' && !tvImageVisible) {
    passwordInput.setAttribute('aria-invalid', 'true');
    passwordHint.textContent = "You're missing something.";
    return;
  }

  if (!passwordId) {
    passwordInput.setAttribute('aria-invalid', 'true');
    passwordHint.textContent = 'No match yet. Keep searching.';
    return;
  }

  passwordInput.removeAttribute('aria-invalid');
  passwordHint.textContent = 'The world keeps what you type.';
  if (unlockedPasswords.has(passwordId)) {
    showToast('Password already redeemed');
    return;
  }

  unlockedPasswords.add(passwordId);
  secretCount.textContent = `SECRETS FOUND  ${unlockedPasswords.size}`;
  renderPasswordIndex();
  showToast(phrase === 'anything' ? 'Congratulations, jackass' : 'Secret Unlocked');
});

passwordInput.addEventListener('input', () => {
  passwordInput.removeAttribute('aria-invalid');
  passwordHint.textContent = 'The world keeps what you type.';
});

function isNearCross() {
  return Math.hypot(player.position.x - crossGroup.position.x, player.position.z - crossGroup.position.z) <= crossRadius;
}

function groundHeightAt(x, z) {
  const insideHouse = x > houseMinX && x < houseMaxX && z > houseMinZ && z < houseMaxZ;
  if (insideHouse) return house.floorHeight;

  const platformHalfWidth = platformWidth / 2 - 0.18;
  return Math.abs(x) < platformHalfWidth && Math.abs(z) < platformHalfWidth ? platformTop : 0;
}

function collidesWithStructure(x, z) {
  const planterCollision = spawnPlanterPositions.some(([planterX, planterZ]) =>
    Math.abs(x - planterX) < 2.45 && Math.abs(z - planterZ) < 2.45
  );
  const pillarCollision = spawnPillarPositions.some(([pillarX, pillarZ]) =>
    Math.abs(x - pillarX) < 0.8 && Math.abs(z - pillarZ) < 0.8
  );
  const feetHeight = player.position.y - eyeHeight;
  const overlapsSignHeight = feetHeight < 6.5 + 2.7 && feetHeight + player.height > 6.5 - 2.7;
  const signCollision = overlapsSignHeight && Math.abs(x) < 7.1 && Math.abs(z + 13.25) < 0.9;
  const overlapsHouse = x > houseMinX - 0.6 && x < houseMaxX + 0.6 &&
    z > houseMinZ - 0.6 && z < houseMaxZ + 0.6;
  const westWall = overlapsHouse && x > houseMinX - 0.6 && x < houseMinX + 0.6 &&
    Math.abs(z - house.centerZ) >= 1.4;
  const eastWall = overlapsHouse && x > houseMaxX - 0.6 && x < houseMaxX + 0.6;
  const northWall = overlapsHouse && z > houseMinZ - 0.6 && z < houseMinZ + 0.6;
  const southWall = overlapsHouse && z > houseMaxZ - 0.6 && z < houseMaxZ + 0.6;
  return planterCollision || pillarCollision || signCollision || westWall || eastWall || northWall || southWall;
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

  updateMadeInHeavenEffect(delta);

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
        !collidesWithStructure(boundedX, player.position.z) &&
        canReachGroundAt(boundedX, player.position.z)
      ) {
        player.position.x = boundedX;
      }
      if (
        !collidesWithStructure(player.position.x, boundedZ) &&
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

  camera.getWorldDirection(flashlightDirection);
  flashlightDirection.y -= 0.06;
  flashlightDirection.normalize();
  flashlight.position.copy(camera.position).addScaledVector(flashlightDirection, 0.3);
  flashlight.target.position.copy(camera.position).addScaledVector(flashlightDirection, 38);

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
