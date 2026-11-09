import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const mfDoomImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/' +
  'MF_Doom_-_Hultsfred_2011_%28cropped%29.jpg/960px-MF_Doom_-_Hultsfred_2011_%28cropped%29.jpg';
const canvas = document.querySelector('#world');
const startScreen = document.querySelector('#start-screen');
const enterButton = document.querySelector('#enter-world');
const startStatus = document.querySelector('#start-status');
const loadingPanel = document.querySelector('.world-loading');
const loadingProgress = document.querySelector('#loading-progress');
const loadingProgressFill = document.querySelector('#loading-progress-fill');
const loadingPercent = document.querySelector('#loading-percent');
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
const worldLoadingManager = new THREE.LoadingManager();
let resolveWorldAssetsLoaded;
const worldAssetsLoaded = new Promise((resolve) => {
  resolveWorldAssetsLoaded = resolve;
});

function setLoadingProgress(percent, message) {
  const progress = Math.round(THREE.MathUtils.clamp(percent, 0, 100));
  loadingProgress.setAttribute('aria-valuenow', String(progress));
  loadingProgressFill.style.width = `${progress}%`;
  loadingPercent.textContent = `${progress}%`;
  if (message) startStatus.textContent = message;
}

worldLoadingManager.onProgress = (_url, loaded, total) => {
  setLoadingProgress((loaded / total) * 55, `Loading world assets… ${loaded} of ${total}`);
};
worldLoadingManager.onLoad = () => resolveWorldAssetsLoaded();

const scene = new THREE.Scene();
scene.background = new THREE.Color('#a9c5af');
scene.fog = new THREE.Fog('#a9c5af', 175, 900);

const skyUniforms = {
  dayHorizon: { value: new THREE.Color('#b8c9bc') },
  dayZenith: { value: new THREE.Color('#719ab2') },
  nightHorizon: { value: new THREE.Color('#252333') },
  nightZenith: { value: new THREE.Color('#09111d') },
  twilightColor: { value: new THREE.Color('#e85c3d') },
  moonSideColor: { value: new THREE.Color('#181a29') },
  moonDirection: { value: new THREE.Vector3(-1, 0, 0) },
  daylight: { value: 1 },
  twilight: { value: 0 },
  moonDarkening: { value: 0 }
};
const skyDome = new THREE.Mesh(
  new THREE.SphereGeometry(1300, 48, 32),
  new THREE.ShaderMaterial({
    uniforms: skyUniforms,
    vertexShader: `
      varying vec3 vSkyDirection;
      void main() {
        vSkyDirection = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 dayHorizon;
      uniform vec3 dayZenith;
      uniform vec3 nightHorizon;
      uniform vec3 nightZenith;
      uniform vec3 twilightColor;
      uniform vec3 moonSideColor;
      uniform vec3 moonDirection;
      uniform float daylight;
      uniform float twilight;
      uniform float moonDarkening;
      varying vec3 vSkyDirection;
      void main() {
        vec3 direction = normalize(vSkyDirection);
        float horizon = smoothstep(-0.2, 0.55, direction.y);
        vec3 dayColor = mix(dayHorizon, dayZenith, horizon);
        vec3 nightColor = mix(nightHorizon, nightZenith, horizon);
        vec3 color = mix(nightColor, dayColor, daylight);
        float horizonGlow = 1.0 - smoothstep(0.0, 0.42, max(direction.y, 0.0));
        color = mix(color, twilightColor, twilight * horizonGlow);
        float moonAlignment = max(dot(direction, normalize(moonDirection)), 0.0);
        float moonShade = pow(moonAlignment, 3.0) * moonDarkening * 0.72;
        color = mix(color, moonSideColor, moonShade);
        gl_FragColor = vec4(color, 1.0);
        #include <colorspace_fragment>
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
    toneMapped: false
  })
);
skyDome.frustumCulled = false;
skyDome.renderOrder = -1000;
scene.add(skyDome);

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
const upperFloorThickness = 0.5;
const upperFloorTop = houseWallTop + upperFloorThickness;
const upperWallTop = upperFloorTop + house.wallHeight;
const stairwell = {
  centerZ: houseMaxZ - 3.8,
  startX: houseMinX + 5,
  endX: house.centerX,
  width: 6,
  stepCount: 20
};
const stairStepHeightTolerance = 0.72;
const upperHall = {
  minX: house.centerX - 3.5,
  maxX: house.centerX + 3.5,
  minZ: houseMinZ + 6.5,
  maxZ: house.centerZ + 14
};
const loftMinZ = upperHall.maxZ;
const upperInteriorWallBounds = [];

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

function addHouseWall(axis, fixed, start, end, openings = [], bottom = house.floorHeight, top = houseWallTop) {
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
    const verticalCuts = [bottom, top];
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

function addUpperPartition(axis, fixed, start, end, doorways = []) {
  const wallThickness = 0.42;
  const wallHeight = house.wallHeight;
  const wallBottom = upperFloorTop;
  const wallTop = wallBottom + wallHeight;
  const cuts = [start, end];
  for (const doorway of doorways) {
    cuts.push(doorway.center - doorway.width / 2, doorway.center + doorway.width / 2);
  }
  cuts.sort((left, right) => left - right);

  for (let index = 0; index < cuts.length - 1; index += 1) {
    const segmentStart = Math.max(start, cuts[index]);
    const segmentEnd = Math.min(end, cuts[index + 1]);
    if (segmentEnd <= segmentStart) continue;
    const segmentCenter = (segmentStart + segmentEnd) / 2;
    const isDoorway = doorways.some((doorway) =>
      segmentCenter > doorway.center - doorway.width / 2 &&
      segmentCenter < doorway.center + doorway.width / 2
    );
    if (isDoorway) {
      const doorway = doorways.find((entry) =>
        segmentCenter > entry.center - entry.width / 2 && segmentCenter < entry.center + entry.width / 2
      );
      const doorwayHeight = doorway.height ?? 6.8;
      const headerHeight = Math.max(0, wallHeight - doorwayHeight);
      if (headerHeight > 0) {
        const dimensions = axis === 'x'
          ? [segmentEnd - segmentStart, headerHeight, wallThickness]
          : [wallThickness, headerHeight, segmentEnd - segmentStart];
        const position = axis === 'x'
          ? [(segmentStart + segmentEnd) / 2, wallBottom + wallHeight - headerHeight / 2, fixed]
          : [fixed, wallBottom + wallHeight - headerHeight / 2, (segmentStart + segmentEnd) / 2];
        addBlock(...dimensions, houseWallMaterial, position);
      }
      const casingHeight = Math.min(doorwayHeight, wallHeight);
      for (const edge of [doorway.center - doorway.width / 2, doorway.center + doorway.width / 2]) {
        const dimensions = axis === 'x'
          ? [0.18, casingHeight, wallThickness + 0.18]
          : [wallThickness + 0.18, casingHeight, 0.18];
        const position = axis === 'x'
          ? [edge, wallBottom + casingHeight / 2, fixed]
          : [fixed, wallBottom + casingHeight / 2, edge];
        addBlock(...dimensions, upperPartitionTrimMaterial, position);
      }
      const lintelDimensions = axis === 'x'
        ? [doorway.width + 0.18, 0.18, wallThickness + 0.18]
        : [wallThickness + 0.18, 0.18, doorway.width + 0.18];
      const lintelPosition = axis === 'x'
        ? [doorway.center, wallBottom + casingHeight, fixed]
        : [fixed, wallBottom + casingHeight, doorway.center];
      addBlock(...lintelDimensions, upperPartitionTrimMaterial, lintelPosition);
      continue;
    }

    const dimensions = axis === 'x'
      ? [segmentEnd - segmentStart, wallHeight, wallThickness]
      : [wallThickness, wallHeight, segmentEnd - segmentStart];
    const position = axis === 'x'
      ? [(segmentStart + segmentEnd) / 2, (wallBottom + wallTop) / 2, fixed]
      : [fixed, (wallBottom + wallTop) / 2, (segmentStart + segmentEnd) / 2];
    addBlock(...dimensions, houseWallMaterial, position);
    const trimDimensions = axis === 'x'
      ? [segmentEnd - segmentStart, 0.34, wallThickness + 0.12]
      : [wallThickness + 0.12, 0.34, segmentEnd - segmentStart];
    const baseboardPosition = axis === 'x'
      ? [(segmentStart + segmentEnd) / 2, wallBottom + 0.17, fixed]
      : [fixed, wallBottom + 0.17, (segmentStart + segmentEnd) / 2];
    const crownPosition = axis === 'x'
      ? [(segmentStart + segmentEnd) / 2, wallTop - 0.37, fixed]
      : [fixed, wallTop - 0.37, (segmentStart + segmentEnd) / 2];
    addBlock(...trimDimensions, upperPartitionTrimMaterial, baseboardPosition);
    addBlock(...trimDimensions, upperPartitionTrimMaterial, crownPosition);
    upperInteriorWallBounds.push(axis === 'x'
      ? { minX: segmentStart, maxX: segmentEnd, minZ: fixed - wallThickness / 2, maxZ: fixed + wallThickness / 2 }
      : { minX: fixed - wallThickness / 2, maxX: fixed + wallThickness / 2, minZ: segmentStart, maxZ: segmentEnd });
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
addHouseWall('z', houseMinX, houseMinZ, houseMaxZ, frontOpenings, house.floorHeight, upperFloorTop);
addHouseWall('z', houseMaxX, houseMinZ, houseMaxZ, backOpenings, house.floorHeight, upperFloorTop);
addHouseWall('x', houseMinZ, houseMinX, houseMaxX, sideOpenings, house.floorHeight, upperFloorTop);
addHouseWall('x', houseMaxZ, houseMinX, houseMaxX, sideOpenings, house.floorHeight, upperFloorTop);

for (const center of [-13, 13]) {
  addHouseWindow('z', houseMinX, house.centerZ + center, windowWidth, windowBottom, windowHeight);
  addHouseWindow('z', houseMaxX, house.centerZ + center, windowWidth, windowBottom, windowHeight);
  addHouseWindow('x', houseMinZ, house.centerX + center, windowWidth, windowBottom, windowHeight);
  addHouseWindow('x', houseMaxZ, house.centerX + center, windowWidth, windowBottom, windowHeight);
}

const upperFloorMaterial = new THREE.MeshStandardMaterial({ color: '#765d48', roughness: 0.88 });
const upperPartitionTrimMaterial = new THREE.MeshStandardMaterial({ color: '#e5d8bd', roughness: 0.82 });
const upperFloorY = houseWallTop + upperFloorThickness / 2;
const floorMinX = houseMinX + 0.5;
const floorMaxX = houseMaxX - 0.5;
const floorMinZ = houseMinZ + 0.5;
const floorMaxZ = houseMaxZ - 0.5;
const stairOpeningMinX = stairwell.startX - 0.02;
const stairOpeningMaxX = stairwell.endX + 0.02;
const stairOpeningMinZ = Math.max(floorMinZ, stairwell.centerZ - stairwell.width / 2);
const stairOpeningMaxZ = stairwell.centerZ + stairwell.width / 2;

function addUpperFloorTile(minX, maxX, minZ, maxZ) {
  if (maxX <= minX || maxZ <= minZ) return;
  addBlock(maxX - minX, upperFloorThickness, maxZ - minZ, upperFloorMaterial,
    [(minX + maxX) / 2, upperFloorY, (minZ + maxZ) / 2]);
}

addUpperFloorTile(floorMinX, stairOpeningMinX, floorMinZ, floorMaxZ);
addUpperFloorTile(stairOpeningMaxX, floorMaxX, floorMinZ, floorMaxZ);
addUpperFloorTile(stairOpeningMinX, stairOpeningMaxX, floorMinZ, stairOpeningMinZ);
addUpperFloorTile(stairOpeningMinX, stairOpeningMaxX, stairOpeningMaxZ, floorMaxZ);

const upperWindowBottom = upperFloorTop + 3.5;
const upperWindowOpenings = [-13, 13].map((center) => ({
  center: house.centerZ + center,
  width: windowWidth,
  bottom: upperWindowBottom,
  top: upperWindowBottom + windowHeight
}));
const upperSideOpenings = [-13, 13].map((center) => ({
  center: house.centerX + center,
  width: windowWidth,
  bottom: upperWindowBottom,
  top: upperWindowBottom + windowHeight
}));

addHouseWall('z', houseMinX, houseMinZ, houseMaxZ, upperWindowOpenings, upperFloorTop, upperWallTop);
addHouseWall('z', houseMaxX, houseMinZ, houseMaxZ, upperWindowOpenings, upperFloorTop, upperWallTop);
addHouseWall('x', houseMinZ, houseMinX, houseMaxX, upperSideOpenings, upperFloorTop, upperWallTop);
addHouseWall('x', houseMaxZ, houseMinX, houseMaxX, upperSideOpenings, upperFloorTop, upperWallTop);

for (const center of [-13, 13]) {
  addHouseWindow('z', houseMinX, house.centerZ + center, windowWidth, upperWindowBottom, windowHeight);
  addHouseWindow('z', houseMaxX, house.centerZ + center, windowWidth, upperWindowBottom, windowHeight);
  addHouseWindow('x', houseMinZ, house.centerX + center, windowWidth, upperWindowBottom, windowHeight);
  addHouseWindow('x', houseMaxZ, house.centerX + center, windowWidth, upperWindowBottom, windowHeight);
}

const northRoomDoorwayZ = upperHall.minZ + 8.5;
const southRoomDoorwayZ = upperHall.maxZ - 7;
const roomSplitZ = 0;
const westWingStart = houseMinX;
const eastWingEnd = houseMaxX;
const loftFrontRailZ = loftMinZ;

addUpperPartition('z', upperHall.minX, houseMinZ, loftMinZ + 3, [
  { center: northRoomDoorwayZ, width: 3.8 },
  { center: southRoomDoorwayZ, width: 3.8 }
]);
addUpperPartition('x', loftMinZ + 3, westWingStart, upperHall.minX);
addUpperPartition('z', upperHall.maxX, houseMinZ, loftMinZ, [
  { center: northRoomDoorwayZ, width: 3.8 },
  { center: southRoomDoorwayZ, width: 3.8 }
]);
addUpperPartition('z', upperHall.maxX, loftMinZ, loftMinZ + 3);
addUpperPartition('x', loftMinZ + 3, upperHall.maxX, eastWingEnd);
addUpperPartition('x', roomSplitZ, westWingStart, upperHall.minX, [
  { center: house.centerX - 11, width: 3.5 }
]);
addUpperPartition('x', roomSplitZ, upperHall.maxX, eastWingEnd, [
  { center: house.centerX + 11, width: 3.5 }
]);

for (const [label, isWestRoom, z] of [
  ['BATH', true, northRoomDoorwayZ],
  ['CLOSET', false, northRoomDoorwayZ],
  ['MF DOOM', true, southRoomDoorwayZ],
  ['PUTS', false, southRoomDoorwayZ]
]) {
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 512;
  labelCanvas.height = 128;
  const context = labelCanvas.getContext('2d');
  context.fillStyle = '#28251f';
  context.fillRect(0, 0, labelCanvas.width, labelCanvas.height);
  context.fillStyle = '#f5efdf';
  context.font = 'bold 58px Georgia, serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(label, labelCanvas.width / 2, labelCanvas.height / 2);
  const labelTexture = new THREE.CanvasTexture(labelCanvas);
  labelTexture.colorSpace = THREE.SRGBColorSpace;
  const labelSign = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.62),
    new THREE.MeshBasicMaterial({ map: labelTexture, side: THREE.DoubleSide }));
  const wallX = isWestRoom ? upperHall.minX : upperHall.maxX;
  const facing = isWestRoom ? Math.PI / 2 : -Math.PI / 2;
  labelSign.position.set(wallX + Math.sin(facing) * 0.3, upperFloorTop + 7.45, z);
  labelSign.rotation.y = facing;
  scene.add(labelSign);
}

const stairTreadDepth = (stairwell.endX - stairwell.startX) / stairwell.stepCount;
const stairRise = (upperFloorTop - house.floorHeight) / stairwell.stepCount;
const stairMaterial = new THREE.MeshStandardMaterial({ color: '#79543c', roughness: 0.78 });
for (let index = 0; index < stairwell.stepCount; index += 1) {
  const stepHeight = stairRise * (index + 1);
  addBlock(stairTreadDepth + 0.04, stepHeight, stairwell.width - 0.6, stairMaterial,
    [stairwell.startX + stairTreadDepth * (index + 0.5), house.floorHeight + stepHeight / 2, stairwell.centerZ]);
}

const stairRailingMaterial = new THREE.MeshStandardMaterial({ color: '#432f24', roughness: 0.74 });
const stairRailLength = Math.hypot(stairwell.endX - stairwell.startX, upperFloorTop - house.floorHeight);
const stairRailAngle = Math.atan2(upperFloorTop - house.floorHeight, stairwell.endX - stairwell.startX);
for (const side of [-1, 1]) {
  const railZ = stairwell.centerZ + side * (stairwell.width / 2 - 0.18);
  const rail = addBlock(stairRailLength, 0.22, 0.22, stairRailingMaterial,
    [(stairwell.startX + stairwell.endX) / 2,
      (house.floorHeight + upperFloorTop) / 2 + 3.1,
      railZ]);
  rail.rotation.z = stairRailAngle;

  for (let index = 0; index <= 5; index += 1) {
    const progress = index / 5;
    const postX = THREE.MathUtils.lerp(stairwell.startX, stairwell.endX, progress);
    const postFloor = THREE.MathUtils.lerp(house.floorHeight, upperFloorTop, progress);
    addBlock(0.18, 3.2, 0.18, stairRailingMaterial,
      [postX, postFloor + 1.6, railZ]);
  }
}

const loftRailingMaterial = new THREE.MeshStandardMaterial({ color: '#654631', roughness: 0.8 });
for (const x of [westWingStart, house.centerX - 10, house.centerX + 10, eastWingEnd]) {
  addBlock(0.18, 3.3, 0.18, loftRailingMaterial, [x, upperFloorTop + 1.65, loftFrontRailZ]);
}
addBlock(upperHall.minX - westWingStart, 0.18, 0.18, loftRailingMaterial,
  [(westWingStart + upperHall.minX) / 2, upperFloorTop + 3.3, loftFrontRailZ]);
addBlock(eastWingEnd - upperHall.maxX, 0.18, 0.18, loftRailingMaterial,
  [(upperHall.maxX + eastWingEnd) / 2, upperFloorTop + 3.3, loftFrontRailZ]);

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
  gable.position.set(houseMinX, upperWallTop, z);
  gable.castShadow = true;
  gable.receiveShadow = true;
  scene.add(gable);
}

const roofRun = house.width / 2;
const roofRise = 4.5;
const roofAngle = Math.atan2(roofRise, roofRun);
const roofLength = Math.hypot(roofRun, roofRise) + 1.2;
const leftRoof = addBlock(roofLength, 0.62, house.depth + 1.8, houseRoofMaterial,
  [house.centerX - roofRun / 2, upperWallTop + roofRise / 2, house.centerZ]);
leftRoof.rotation.z = roofAngle;
const rightRoof = addBlock(roofLength, 0.62, house.depth + 1.8, houseRoofMaterial,
  [house.centerX + roofRun / 2, upperWallTop + roofRise / 2, house.centerZ]);
rightRoof.rotation.z = -roofAngle;

const interiorCeilingMaterial = new THREE.MeshStandardMaterial({
  color: '#e8dfce',
  roughness: 0.94,
  side: THREE.DoubleSide
});
const interiorCeilingTrimMaterial = new THREE.MeshStandardMaterial({ color: '#8a6948', roughness: 0.82 });
for (const [direction, rotation] of [[-1, roofAngle], [1, -roofAngle]]) {
  const normalOffset = 0.42;
  const ceilingPanel = addBlock(roofLength - 0.8, 0.16, house.depth - 1.4, interiorCeilingMaterial,
    [
      house.centerX + direction * (roofRun / 2 + Math.sin(rotation) * normalOffset),
      upperWallTop + roofRise / 2 - Math.cos(rotation) * normalOffset,
      house.centerZ
    ],
    false
  );
  ceilingPanel.rotation.z = rotation;
}
addBlock(0.3, 0.32, house.depth - 0.8, interiorCeilingTrimMaterial,
  [house.centerX, upperWallTop + roofRise - 0.48, house.centerZ], false);

const chimneyMaterial = new THREE.MeshStandardMaterial({ color: '#a84a40', roughness: 0.9 });
const fireplaceStone = new THREE.MeshStandardMaterial({ color: '#756e61', roughness: 0.9 });
const fireplaceDark = new THREE.MeshStandardMaterial({ color: '#171716', roughness: 1 });
const fireMaterial = new THREE.MeshStandardMaterial({
  color: '#ff762f',
  emissive: '#e33d12',
  emissiveIntensity: 1.8,
  roughness: 0.45
});
addBlock(2, 26, 10, chimneyMaterial,
  [houseMaxX - 1.2, house.floorHeight + 13, house.centerZ]);
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

const lightSystems = [];
const lightSwitchPlateMaterial = new THREE.MeshStandardMaterial({ color: '#e5e0d2', roughness: 0.52 });
const lightSwitchOnMaterial = new THREE.MeshStandardMaterial({
  color: '#e8c67d', emissive: '#8b6422', emissiveIntensity: 0.5, roughness: 0.38
});
const lightSwitchOffMaterial = new THREE.MeshStandardMaterial({ color: '#59605e', roughness: 0.42 });

function setLightSystem(system, isOn) {
  system.isOn = isOn;
  for (const fixture of system.fixtures) {
    fixture.material.emissiveIntensity = isOn ? 0.35 : 0;
    fixture.material.color.set(isOn ? '#d8c49a' : '#68665e');
  }
  for (const bulb of system.bulbs) bulb.visible = isOn;
  for (const light of system.pointLights) light.visible = isOn;
  system.switchToggle.material = isOn ? lightSwitchOnMaterial : lightSwitchOffMaterial;
  system.switchToggle.position.set(
    system.switchPosition.x + system.switchNormal.x,
    system.switchPosition.y + (isOn ? 0.11 : -0.11),
    system.switchPosition.z + system.switchNormal.z
  );
}

function createLightSystem(name, fixturePositions, floorY, ceilingOffset, lightRange, switchPosition, switchRotation = 0) {
  const system = {
    name,
    isOn: true,
    fixtures: [],
    bulbs: [],
    pointLights: [],
    switchPosition: new THREE.Vector3(...switchPosition),
    switchNormal: new THREE.Vector3(Math.sin(switchRotation), 0, Math.cos(switchRotation)).multiplyScalar(0.09)
  };

  for (const [x, z] of fixturePositions) {
    const fixtureY = floorY + ceilingOffset;
    const fixture = new THREE.Mesh(
      new THREE.CylinderGeometry(0.46, 0.6, 0.16, 16),
      new THREE.MeshStandardMaterial({
        color: '#d8c49a', emissive: '#f7d9a1', emissiveIntensity: 0.35, roughness: 0.58
      })
    );
    fixture.position.set(x, fixtureY + 0.12, z);
    scene.add(fixture);
    system.fixtures.push(fixture);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10),
      new THREE.MeshBasicMaterial({ color: '#fff1d2' }));
    bulb.position.set(x, fixtureY - 0.08, z);
    scene.add(bulb);
    system.bulbs.push(bulb);

    const light = new THREE.PointLight('#ffe2b6', 22, lightRange, 1.5);
    light.position.set(x, fixtureY - 0.18, z);
    scene.add(light);
    system.pointLights.push(light);
  }

  const plate = addBlock(0.58, 0.78, 0.13, lightSwitchPlateMaterial,
    system.switchPosition.toArray(), false);
  plate.rotation.y = switchRotation;
  system.switchToggle = addBlock(0.22, 0.34, 0.11, lightSwitchOnMaterial,
    [system.switchPosition.x + system.switchNormal.x,
      system.switchPosition.y + 0.11,
      system.switchPosition.z + system.switchNormal.z], false);
  system.switchToggle.rotation.y = switchRotation;
  lightSystems.push(system);
  setLightSystem(system, true);
  return system;
}

const firstFloorFixtures = [-14, 14].flatMap((offsetX) =>
  [-14, 14].map((offsetZ) => [house.centerX + offsetX, house.centerZ + offsetZ])
);
createLightSystem('FIRST FLOOR', firstFloorFixtures, house.floorHeight, 10.2, 36,
  [houseMinX + 0.48, house.floorHeight + 4.4, house.centerZ + 3], Math.PI / 2);
createLightSystem('LOFT', [[house.centerX - 10, 19], [house.centerX + 10, 19]],
  upperFloorTop, 11.5, 24, [house.centerX, upperFloorTop + 4.4, houseMaxZ - 0.48], Math.PI);
createLightSystem('HALLWAY', [[house.centerX, -13], [house.centerX, -4], [house.centerX, 5], [house.centerX, 11]],
  upperFloorTop, 11.5, 24, [upperHall.minX + 0.45, upperFloorTop + 4.4, -2], Math.PI / 2);
createLightSystem('BATHROOM', [[house.centerX - 14, -13], [house.centerX - 7, -13]],
  upperFloorTop, 11.5, 22, [upperHall.minX + 0.45, upperFloorTop + 4.4, northRoomDoorwayZ - 2.4], Math.PI / 2);
createLightSystem('CLOSET', [[house.centerX + 7, -13], [house.centerX + 14, -13]],
  upperFloorTop, 11.5, 22, [upperHall.maxX - 0.45, upperFloorTop + 4.4, northRoomDoorwayZ - 2.4], -Math.PI / 2);
createLightSystem('MF DOOM BEDROOM', [[house.centerX - 14, 8], [house.centerX - 7, 8]],
  upperFloorTop, 11.5, 22, [upperHall.minX + 0.45, upperFloorTop + 4.4, southRoomDoorwayZ - 2.4], Math.PI / 2);
createLightSystem('PEOPLE UNDER THE STAIRS BEDROOM', [[house.centerX + 7, 8], [house.centerX + 14, 8]],
  upperFloorTop, 11.5, 22, [upperHall.maxX - 0.45, upperFloorTop + 4.4, southRoomDoorwayZ - 2.4], -Math.PI / 2);

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
const sofaPillowMaterial = new THREE.MeshStandardMaterial({ color: '#c4aa7b', roughness: 0.98 });
const sofaLegMaterial = new THREE.MeshStandardMaterial({ color: '#493728', roughness: 0.78 });
addBlock(5.2, 1.15, 11, sofaMaterial, [house.centerX + 1, house.floorHeight + 0.95, house.centerZ + 3]);
addBlock(1.25, 2.5, 11, sofaMaterial, [house.centerX - 1.45, house.floorHeight + 2.1, house.centerZ + 3]);
for (const z of [house.centerZ - 2.65, house.centerZ + 8.65]) {
  addBlock(5.2, 1.8, 0.9, sofaMaterial, [house.centerX + 1, house.floorHeight + 1.45, z]);
}
for (const z of [house.centerZ + 0.1, house.centerZ + 3, house.centerZ + 5.9]) {
  addBlock(3.75, 0.42, 3.1, sofaCushionMaterial, [house.centerX + 1.55, house.floorHeight + 1.72, z]);
  const pillow = addBlock(0.55, 1.1, 1.2, sofaPillowMaterial,
    [house.centerX - 0.5, house.floorHeight + 2.2, z]);
  pillow.rotation.x = -0.16;
}
for (const x of [house.centerX - 1.05, house.centerX + 3.05]) {
  for (const z of [house.centerZ - 1.25, house.centerZ + 7.25]) {
    addBlock(0.38, 0.5, 0.38, sofaLegMaterial,
      [x, house.floorHeight + 0.25, z]);
  }
}

const tableMaterial = new THREE.MeshStandardMaterial({ color: '#79543c', roughness: 0.72 });
addBlock(3.6, 0.3, 6.8, tableMaterial, [house.centerX + 11, house.floorHeight + 1.8, house.centerZ + 3]);
for (const x of [house.centerX + 9.6, house.centerX + 12.4]) {
  for (const z of [house.centerZ + 0.5, house.centerZ + 5.5]) {
    addBlock(0.24, 1.65, 0.24, tableMaterial, [x, house.floorHeight + 0.84, z]);
  }
}

const diningTableCenter = new THREE.Vector3(house.centerX - 10.5, house.floorHeight, house.centerZ + 3.5);
addBlock(7.4, 0.34, 4.8, tableMaterial,
  [diningTableCenter.x, diningTableCenter.y + 2.65, diningTableCenter.z]);
for (const x of [diningTableCenter.x - 3.1, diningTableCenter.x + 3.1]) {
  for (const z of [diningTableCenter.z - 1.75, diningTableCenter.z + 1.75]) {
    addBlock(0.24, 2.45, 0.24, tableMaterial, [x, diningTableCenter.y + 1.225, z]);
  }
}

const chairMaterial = new THREE.MeshStandardMaterial({ color: '#654631', roughness: 0.82 });
for (const [x, z, backX, backZ] of [
  [diningTableCenter.x - 5, diningTableCenter.z, diningTableCenter.x - 5.75, diningTableCenter.z],
  [diningTableCenter.x + 5, diningTableCenter.z, diningTableCenter.x + 5.75, diningTableCenter.z],
  [diningTableCenter.x, diningTableCenter.z - 3.6, diningTableCenter.x, diningTableCenter.z - 4.35],
  [diningTableCenter.x, diningTableCenter.z + 3.6, diningTableCenter.x, diningTableCenter.z + 4.35]
]) {
  addBlock(1.5, 0.38, 1.5, chairMaterial, [x, diningTableCenter.y + 1.25, z]);
  addBlock(1.5, 1.7, 0.22, chairMaterial, [backX, diningTableCenter.y + 2.1, backZ]);
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

const kitchenCenterX = house.centerX - 4.2;
const kitchenCenterZ = houseMinZ + 3.1;
const kitchenCabinetMaterial = new THREE.MeshStandardMaterial({ color: '#647a68', roughness: 0.84 });
const kitchenCounterMaterial = new THREE.MeshStandardMaterial({ color: '#c4c1b4', roughness: 0.36 });
const kitchenMetalMaterial = new THREE.MeshStandardMaterial({ color: '#b2bdba', metalness: 0.66, roughness: 0.3 });
const kitchenBlackMaterial = new THREE.MeshStandardMaterial({ color: '#242a29', roughness: 0.4 });
const kitchenWidth = 8.2;
const kitchenDepth = 3.8;

addBlock(kitchenWidth, 2.24, kitchenDepth, kitchenCabinetMaterial,
  [kitchenCenterX, house.floorHeight + 1.12, kitchenCenterZ]);
addBlock(kitchenWidth + 0.25, 0.32, kitchenDepth + 0.25, kitchenCounterMaterial,
  [kitchenCenterX, house.floorHeight + 2.42, kitchenCenterZ]);

for (const x of [kitchenCenterX - 2.75, kitchenCenterX, kitchenCenterX + 2.75]) {
  addBlock(2.55, 2.7, 1.15, kitchenCabinetMaterial,
    [x, house.floorHeight + 7.45, houseMinZ + 1.05]);
  addBlock(2.25, 2.35, 0.12, kitchenCounterMaterial,
    [x, house.floorHeight + 7.45, houseMinZ + 1.67]);
}
addBlock(kitchenWidth, 2.35, 0.22, kitchenCabinetMaterial,
  [kitchenCenterX, house.floorHeight + 4.15, houseMinZ + 0.28]);

const sinkX = kitchenCenterX - 2.55;
addBlock(1.9, 0.12, 1.6, kitchenMetalMaterial,
  [sinkX, house.floorHeight + 2.64, kitchenCenterZ]);
addBlock(1.55, 0.09, 1.25, kitchenBlackMaterial,
  [sinkX, house.floorHeight + 2.71, kitchenCenterZ]);
addBlock(0.12, 0.32, 0.12, kitchenMetalMaterial,
  [sinkX + 0.38, house.floorHeight + 2.98, kitchenCenterZ - 0.42]);

const cooktopX = kitchenCenterX + 1.45;
addBlock(2.5, 0.1, 2.4, kitchenBlackMaterial,
  [cooktopX, house.floorHeight + 2.66, kitchenCenterZ]);
for (const x of [cooktopX - 0.62, cooktopX + 0.62]) {
  for (const z of [kitchenCenterZ - 0.58, kitchenCenterZ + 0.58]) {
    const burner = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.08, 16), kitchenMetalMaterial);
    burner.position.set(x, house.floorHeight + 2.76, z);
    scene.add(burner);
  }
}

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
const portraitImage = new Image();
portraitImage.crossOrigin = 'anonymous';
portraitImage.onload = () => {
  portraitTexture.image = portraitImage;
  portraitTexture.needsUpdate = true;
};
portraitImage.onerror = () => console.warn(`Could not load MF DOOM portrait from ${mfDoomImageUrl}.`);
portraitImage.src = mfDoomImageUrl;

const fridgeInteractionPosition = new THREE.Vector3(
  fridgePosition.x,
  fridgePosition.y + fridgeHeight / 2,
  fridgePosition.z + fridgeDepth / 2 + 1
);

const bathroomMaterial = new THREE.MeshStandardMaterial({ color: '#d8e0de', roughness: 0.36 });
const bathroomTileMaterial = new THREE.MeshStandardMaterial({ color: '#6f9c9b', roughness: 0.72 });
const fixtureMetalMaterial = new THREE.MeshStandardMaterial({ color: '#aeb8b5', metalness: 0.62, roughness: 0.3 });
addBlock(8.5, 0.62, 4.2, bathroomMaterial,
  [house.centerX - 18, upperFloorTop + 0.31, -13]);
addBlock(7.7, 0.18, 3.45, bathroomTileMaterial,
  [house.centerX - 18, upperFloorTop + 0.72, -13]);
const toiletBase = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.82, 1.15, 20), bathroomMaterial);
toiletBase.position.set(house.centerX - 8, upperFloorTop + 0.58, -13);
scene.add(toiletBase);
const toiletBowl = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.13, 10, 24), bathroomMaterial);
toiletBowl.rotation.x = Math.PI / 2;
toiletBowl.position.set(house.centerX - 8, upperFloorTop + 1.2, -13);
scene.add(toiletBowl);
addBlock(1.55, 1.5, 0.82, bathroomMaterial,
  [house.centerX - 8, upperFloorTop + 2.05, -14.05]);
addBlock(0.32, 0.12, 0.1, fixtureMetalMaterial,
  [house.centerX - 7.6, upperFloorTop + 2.42, -13.6]);
addBlock(4.2, 1.1, 2.2, bathroomMaterial,
  [house.centerX - 14, upperFloorTop + 0.55, -4.5]);
addBlock(2.4, 0.16, 1.45, fixtureMetalMaterial,
  [house.centerX - 14, upperFloorTop + 1.15, -4.5]);

const closetWoodMaterial = new THREE.MeshStandardMaterial({ color: '#76553d', roughness: 0.82 });
const closetClothingMaterials = ['#a84f42', '#58768a', '#b69b54', '#526b4c'].map((color) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.94, side: THREE.DoubleSide })
);
const closetGarmentShape = new THREE.Shape();
closetGarmentShape.moveTo(-0.45, 0);
closetGarmentShape.lineTo(0.45, 0);
closetGarmentShape.lineTo(0.46, 0.24);
closetGarmentShape.lineTo(0.3, 0.46);
closetGarmentShape.lineTo(0.22, 0.36);
closetGarmentShape.lineTo(0.2, 1.42);
closetGarmentShape.lineTo(0.08, 1.62);
closetGarmentShape.lineTo(-0.08, 1.62);
closetGarmentShape.lineTo(-0.2, 1.42);
closetGarmentShape.lineTo(-0.22, 0.36);
closetGarmentShape.lineTo(-0.3, 0.46);
closetGarmentShape.lineTo(-0.46, 0.24);
closetGarmentShape.closePath();
const closetGarmentGeometry = new THREE.ShapeGeometry(closetGarmentShape);
const closetCabinetX = houseMaxX - 2.1;
const closetCabinetHeight = 8;

for (const centerZ of [-20.2, -4.7]) {
  const cabinetY = upperFloorTop + closetCabinetHeight / 2;
  const cabinetBack = closetCabinetX + 1.9;
  addBlock(0.24, closetCabinetHeight, 6.34, closetWoodMaterial,
    [cabinetBack, cabinetY, centerZ]);
  for (const z of [centerZ - 3.05, centerZ + 3.05]) {
    addBlock(3.8, closetCabinetHeight, 0.24, closetWoodMaterial,
      [closetCabinetX, cabinetY, z]);
  }
  for (const y of [upperFloorTop + 0.18, upperFloorTop + closetCabinetHeight - 0.18]) {
    addBlock(3.8, 0.24, 6.34, closetWoodMaterial,
      [closetCabinetX, y, centerZ]);
  }
  addBlock(3.8, closetCabinetHeight - 0.4, 0.2, closetWoodMaterial,
    [closetCabinetX, cabinetY, centerZ]);
  addBlock(3.8, 0.18, 6.1, closetWoodMaterial,
    [closetCabinetX, upperFloorTop + 7, centerZ]);

  for (const side of [-1, 1]) {
    const bayCenterZ = centerZ + side * 1.55;
    const hangingRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 2.7, 12),
      fixtureMetalMaterial
    );
    hangingRod.rotation.x = Math.PI / 2;
    hangingRod.position.set(closetCabinetX - 0.9, upperFloorTop + 6.15, bayCenterZ);
    scene.add(hangingRod);

    for (let index = 0; index < 3; index += 1) {
      const z = bayCenterZ + (index - 1) * 0.82;
      const garment = new THREE.Mesh(
        closetGarmentGeometry,
        closetClothingMaterials[(index + (side > 0 ? 1 : 0)) % closetClothingMaterials.length]
      );
      garment.position.set(closetCabinetX - 1.05, upperFloorTop + 3.95, z);
      garment.rotation.y = Math.PI / 2;
      garment.castShadow = true;
      scene.add(garment);
    }

    const drawerZ = centerZ + side * 1.55;
    addBlock(0.18, 1.35, 2.65, closetWoodMaterial,
      [closetCabinetX - 1.9, upperFloorTop + 0.9, drawerZ]);
    for (const y of [upperFloorTop + 0.65, upperFloorTop + 1.15]) {
      addBlock(0.12, 0.08, 0.54, fixtureMetalMaterial,
        [closetCabinetX - 2.02, y, drawerZ]);
    }
  }
}

const closetMirrorFrameMaterial = new THREE.MeshStandardMaterial({ color: '#76553d', roughness: 0.72 });
const closetMirrorMaterial = new THREE.MeshPhysicalMaterial({
  color: '#9eafb0',
  metalness: 0.72,
  roughness: 0.16,
  side: THREE.DoubleSide
});
const closetBenchMaterial = new THREE.MeshStandardMaterial({ color: '#8a9b91', roughness: 0.98 });
const closetRugMaterial = new THREE.MeshStandardMaterial({ color: '#a8987b', roughness: 0.98 });
addBlock(0.22, 5.2, 4.1, closetMirrorFrameMaterial,
  [upperHall.maxX + 0.32, upperFloorTop + 4.8, -13]);
const closetMirror = new THREE.Mesh(
  new THREE.PlaneGeometry(3.75, 4.85),
  closetMirrorMaterial
);
closetMirror.position.set(upperHall.maxX + 0.46, upperFloorTop + 4.8, -13);
closetMirror.rotation.y = Math.PI / 2;
scene.add(closetMirror);
addBlock(7, 0.9, 2.4, closetWoodMaterial,
  [house.centerX + 10, upperFloorTop + 0.45, -13]);
addBlock(6.7, 0.18, 2.1, closetBenchMaterial,
  [house.centerX + 10, upperFloorTop + 0.96, -13]);
addBlock(8, 0.06, 6, closetRugMaterial,
  [house.centerX + 10, upperFloorTop + 0.03, -13], false);

const bedroomWoodMaterial = new THREE.MeshStandardMaterial({ color: '#624633', roughness: 0.86 });
const bedroomFabricMaterial = new THREE.MeshStandardMaterial({ color: '#8a9b91', roughness: 0.98 });
const albumBedroomMaterial = new THREE.MeshStandardMaterial({ color: '#6d4d3c', roughness: 0.84 });
const bedroomRugMaterials = [
  new THREE.MeshStandardMaterial({ color: '#a8987b', roughness: 0.98 }),
  new THREE.MeshStandardMaterial({ color: '#796356', roughness: 0.98 })
];
const bedsideLampMaterial = new THREE.MeshStandardMaterial({
  color: '#f0d7a4',
  emissive: '#6b4c26',
  emissiveIntensity: 0.4,
  roughness: 0.72
});
for (const [bedroomIndex, [centerX, bedding]] of [
  [house.centerX - 12, bedroomFabricMaterial],
  [house.centerX + 12, albumBedroomMaterial]
].entries()) {
  addBlock(10.8, 0.08, 11, bedroomRugMaterials[bedroomIndex],
    [centerX, upperFloorTop + 0.04, 8], false);
  addBlock(8.8, 3.1, 0.42, bedroomWoodMaterial,
    [centerX, upperFloorTop + 1.7, 3.95]);
  addBlock(8.5, 0.8, 7.5, bedroomWoodMaterial,
    [centerX, upperFloorTop + 0.4, 8]);
  addBlock(8.1, 0.44, 7.1, bedding,
    [centerX, upperFloorTop + 1.02, 8]);
  addBlock(7.7, 0.18, 2.6, bedroomFabricMaterial,
    [centerX, upperFloorTop + 1.34, 10.1]);
  addBlock(3.2, 0.4, 2, bathroomMaterial,
    [centerX - 1.8, upperFloorTop + 1.42, 5.65]);
  addBlock(3.2, 0.4, 2, bathroomMaterial,
    [centerX + 1.8, upperFloorTop + 1.42, 5.65]);
  addBlock(4.2, 0.62, 1.2, bedroomWoodMaterial,
    [centerX, upperFloorTop + 0.31, 13]);

  for (const side of [-1, 1]) {
    const nightstandX = centerX + side * 4.75;
    addBlock(1.05, 1.35, 1.7, bedroomWoodMaterial,
      [nightstandX, upperFloorTop + 0.675, 6.1]);
    addBlock(1.35, 0.08, 1.58, closetWoodMaterial,
      [nightstandX, upperFloorTop + 1.36, 6.1]);
    const lampBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.26, 0.16, 16),
      fixtureMetalMaterial
    );
    lampBase.position.set(nightstandX, upperFloorTop + 1.48, 6.1);
    scene.add(lampBase);
    const lampShade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.38, 0.46, 16),
      bedsideLampMaterial
    );
    lampShade.position.set(nightstandX, upperFloorTop + 1.79, 6.1);
    scene.add(lampShade);
  }
}

const loftRugMaterial = new THREE.MeshStandardMaterial({ color: '#8a6948', roughness: 0.96 });
const loftSeatMaterial = new THREE.MeshStandardMaterial({ color: '#6d7f6d', roughness: 0.94 });
addBlock(12, 0.12, 6, loftRugMaterial, [house.centerX + 10, upperFloorTop + 0.08, 20]);
addBlock(7, 1.2, 2.2, loftSeatMaterial, [house.centerX + 10, upperFloorTop + 0.75, 20]);
addBlock(2.2, 2.8, 5, closetWoodMaterial,
  [house.centerX - 18, upperFloorTop + 1.4, 20]);
addBlock(2.2, 2.8, 5, closetWoodMaterial,
  [house.centerX + 18, upperFloorTop + 1.4, 20]);

const upstairsFrameMaterial = new THREE.MeshStandardMaterial({ color: '#423126', roughness: 0.62 });
const upstairsPhotoLoader = new THREE.TextureLoader(worldLoadingManager);
upstairsPhotoLoader.setCrossOrigin('anonymous');

function createFallbackWallArt(title) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const context = canvas.getContext('2d');
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#283d37');
  gradient.addColorStop(1, '#a66b4b');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'rgba(20, 23, 21, 0.55)';
  context.fillRect(0, 270, canvas.width, 114);
  context.fillStyle = '#f1ead6';
  context.font = 'bold 24px monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(title.toUpperCase(), canvas.width / 2, 302);
  context.font = '16px monospace';
  context.fillText('ARTWORK UNAVAILABLE', canvas.width / 2, 340);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function addUpstairsWallArt(imagePath, title, credit, license, position, width, height, rotationY) {
  const [x, y, z] = position;
  const facesX = Math.abs(Math.sin(rotationY)) > 0.5;
  const frameDimensions = facesX
    ? [0.24, height + 0.3, width + 0.3]
    : [width + 0.3, height + 0.3, 0.24];
  addBlock(...frameDimensions, upstairsFrameMaterial, position);

  let photoMaterial;
  const texture = upstairsPhotoLoader.load(new URL(imagePath, import.meta.url).href, undefined, undefined, (error) => {
    console.warn(`Could not load wall art "${title}" from ${imagePath}; using a placeholder.`, error);
    photoMaterial.map = createFallbackWallArt(title);
    photoMaterial.needsUpdate = true;
  });
  texture.colorSpace = THREE.SRGBColorSpace;
  photoMaterial = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide, roughness: 0.78 });
  const photo = new THREE.Mesh(new THREE.PlaneGeometry(width, height), photoMaterial);
  photo.position.set(
    x + (facesX ? Math.sin(rotationY) * 0.14 : 0),
    y,
    z + (facesX ? 0 : 0.14)
  );
  photo.rotation.y = rotationY;
  scene.add(photo);

  const captionCanvas = document.createElement('canvas');
  captionCanvas.width = 1200;
  captionCanvas.height = 120;
  const context = captionCanvas.getContext('2d');
  context.fillStyle = '#292722';
  context.fillRect(0, 0, captionCanvas.width, captionCanvas.height);
  context.fillStyle = '#f1ead6';
  context.font = '32px monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(`${title} | ${credit} | ${license}`, captionCanvas.width / 2, captionCanvas.height / 2);
  const captionTexture = new THREE.CanvasTexture(captionCanvas);
  captionTexture.colorSpace = THREE.SRGBColorSpace;
  const caption = new THREE.Mesh(new THREE.PlaneGeometry(width, 0.42),
    new THREE.MeshBasicMaterial({ map: captionTexture, side: THREE.DoubleSide }));
  caption.position.set(photo.position.x, y - height / 2 - 0.34, photo.position.z);
  caption.rotation.y = rotationY;
  scene.add(caption);
}

const westBedroomArtX = upperHall.minX - 0.5;
const eastBedroomArtX = upperHall.maxX + 0.5;
addUpstairsWallArt(mfDoomImageUrl, 'MF DOOM', 'Possan', 'CC BY-SA 3.0',
  [westBedroomArtX, upperFloorTop + 5.7, 3.2], 4.9, 3.2, -Math.PI / 2);
addUpstairsWallArt(mfDoomImageUrl, 'MF DOOM', 'Possan', 'CC BY-SA 3.0',
  [westBedroomArtX, upperFloorTop + 5.3, 11.1], 3.3, 4.8, -Math.PI / 2);
addUpstairsWallArt('./assets/people-under-the-stairs.jpg', 'People Under The Stairs', 'Piecelock70', 'CC BY-SA 3.0',
  [eastBedroomArtX, upperFloorTop + 5.5, 3.1], 4.2, 4.2, Math.PI / 2);
addUpstairsWallArt('./assets/people-under-the-stairs.jpg', 'People Under The Stairs', 'Piecelock70', 'CC BY-SA 3.0',
  [eastBedroomArtX, upperFloorTop + 5.5, 11.1], 4.2, 4.2, Math.PI / 2);

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
  new THREE.MeshBasicMaterial({ color: '#b9c3cf', transparent: true })
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
const starMaterial = new THREE.MeshBasicMaterial({
  color: '#f6f1d8',
  transparent: true,
  depthWrite: false
});
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
const spawnFlagRopeMaterial = new THREE.MeshStandardMaterial({ color: '#785e43', roughness: 0.94 });
const spawnFlagHeightPosition = platformTop + 10.3;

function addSpawnBannerRope(axis, fixed, coordinates) {
  const ropeAnchor = 15.4;
  const topBarTop = spawnFlagHeightPosition + spawnFlagHeight / 2 + 0.045;
  const anchorHeight = topBarTop + 0.65;
  const pointAt = (coordinate, height) => axis === 'z'
    ? new THREE.Vector3(coordinate, height, fixed)
    : new THREE.Vector3(fixed, height, coordinate);
  const curve = new THREE.QuadraticBezierCurve3(
    pointAt(-ropeAnchor, anchorHeight),
    pointAt(0, anchorHeight - 0.9),
    pointAt(ropeAnchor, anchorHeight)
  );
  const rope = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.045, 6, false), spawnFlagRopeMaterial);
  rope.castShadow = true;
  scene.add(rope);

  for (const coordinate of coordinates) {
    const ropeHeight = curve.getPoint((coordinate + ropeAnchor) / (ropeAnchor * 2)).y;
    const cordHeight = ropeHeight - topBarTop;
    const cord = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, cordHeight, 6),
      spawnFlagRopeMaterial
    );
    if (axis === 'z') cord.position.set(coordinate, topBarTop + cordHeight / 2, fixed);
    else cord.position.set(fixed, topBarTop + cordHeight / 2, coordinate);
    scene.add(cord);
  }
}

function addSpawnFlagRow(axis, fixed, coordinates, rotationY) {
  addSpawnBannerRope(axis, fixed, coordinates);
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
let worldReady = false;
let worldLoadFailed = false;
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
    phrase: 'mfdoom',
    title: 'MF DOOM',
    description: 'One of a kind. RIP',
    id: 'mfdoom',
    rank: 'Easy'
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
    phrase: 'peopleunderthestairs',
    title: 'People Under The Stairs',
    description: 'This is deep ball knowledge',
    id: 'peopleunderthestairs',
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
let timeOfDay = null;
let activeStarPhrase = null;
let celestialOrbitAngle = 0;
let madeInHeavenActive = false;
let madeInHeavenActivated = false;
let madeInHeavenStartedAt = 0;
const daySunColor = new THREE.Color('#fff1cf');
const duskSunColor = new THREE.Color('#ff6242');
const dayBackgroundColor = new THREE.Color('#a9c5af');
const nightBackgroundColor = new THREE.Color('#09111d');
const dayAmbientColor = new THREE.Color('#e8f4df');
const nightAmbientColor = new THREE.Color('#63758e');
const dayGroundAmbientColor = new THREE.Color('#6a704a');
const nightGroundAmbientColor = new THREE.Color('#20272b');
const dayGroundColor = new THREE.Color('#78965e');
const nightGroundColor = new THREE.Color('#1b2926');
const dayGrassColor = new THREE.Color('#79a252');
const nightGrassColor = new THREE.Color('#26352b');
const currentSunColor = new THREE.Color();

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
  celestialOrbitAngle += delta * speed;
  updateCelestialPositions();
  updateWorldSettings();
}

function updateWorldSettings() {
  const fullOrbit = Math.PI * 2;
  const angle = ((celestialOrbitAngle % fullOrbit) + fullOrbit) % fullOrbit;
  const sunset = THREE.MathUtils.smoothstep(angle, Math.PI * 0.8, Math.PI);
  const sunrise = THREE.MathUtils.smoothstep(angle, Math.PI * 1.8, fullOrbit);
  let daylight = 0;
  if (angle < Math.PI * 0.8) {
    daylight = 1;
  } else if (angle < Math.PI) {
    daylight = 1 - sunset;
  } else if (angle >= Math.PI * 1.8) {
    daylight = sunrise;
  }
  const sunsetTwilight = angle < Math.PI
    ? sunset
    : 1 - THREE.MathUtils.smoothstep(angle, Math.PI, Math.PI * 1.08);
  const sunriseTwilight = angle >= Math.PI * 1.8 ? 1 - sunrise : 0;
  const twilight = Math.max(sunsetTwilight, sunriseTwilight);
  const isNight = daylight < 0.5;
  currentSunColor.copy(duskSunColor).lerp(daySunColor, 1 - twilight);

  skyUniforms.daylight.value = daylight;
  skyUniforms.twilight.value = twilight;
  skyUniforms.moonDarkening.value = twilight;
  skyUniforms.moonDirection.value.copy(moon.position).sub(camera.position).normalize();
  scene.background.copy(nightBackgroundColor).lerp(dayBackgroundColor, daylight);
  scene.fog.color.copy(nightBackgroundColor).lerp(dayBackgroundColor, daylight);
  ambient.color.copy(nightAmbientColor).lerp(dayAmbientColor, daylight);
  ambient.groundColor.copy(nightGroundAmbientColor).lerp(dayGroundAmbientColor, daylight);
  ambient.intensity = THREE.MathUtils.lerp(0.52, 2.1, daylight);
  sun.color.copy(currentSunColor);
  sun.intensity = daylight * 2.6;
  ground.material.color.copy(nightGroundColor).lerp(dayGroundColor, daylight);
  grassMaterial.color.copy(nightGrassColor).lerp(dayGrassColor, daylight);
  sunGlow.material.color.copy(currentSunColor);
  sunGlow.material.opacity = 0.96 * daylight;
  sunGlow.visible = daylight > 0;
  sunWord.material.opacity = 0.7 * daylight;
  sunWord.visible = daylight > 0;
  moon.material.opacity = 1 - daylight;
  moon.visible = daylight < 1;
  moonWord.material.opacity = 0.56 * (1 - daylight);
  moonWord.visible = daylight < 1;
  starMaterial.opacity = 1 - daylight;
  nightStars.children.forEach((star, index) => {
    star.visible = index < starCount && daylight < 1;
  });

  if (timeOfDay !== (isNight ? 'night' : 'day')) {
    timeOfDay = isNight ? 'night' : 'day';
    const starEntry = passwordIndex.find(({ id }) => id === 'stars');
    if (activeStarPhrase) passwordSecrets.delete(activeStarPhrase);
    starEntry.phrase = `${starCount}st4rs`;
    activeStarPhrase = starEntry.phrase;
    passwordSecrets.delete('fu11m00n');
    if (isNight) {
      passwordSecrets.set(starEntry.phrase, 'stars');
      passwordSecrets.set('fu11m00n', 'fullmoon');
    }
  }
}

function activateMadeInHeaven() {
  if (madeInHeavenActive) return;
  madeInHeavenActive = true;
  madeInHeavenActivated = true;
  madeInHeavenStartedAt = performance.now();
  celestialOrbitAngle = 0;
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
    celestialOrbitAngle = input.value === 'night' ? Math.PI * 1.5 : Math.PI * 0.5;
    updateCelestialPositions();
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
  if (worldLoadFailed) {
    window.location.reload();
    return;
  }
  if (!worldReady) return;

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
    const nearestLightSystem = lightSystems
      .map((system) => ({ system, distance: system.switchPosition.distanceTo(player.position) }))
      .filter(({ distance }) => distance <= 5.5)
      .sort((left, right) => left.distance - right.distance)[0]?.system;
    if (nearestLightSystem) {
      setLightSystem(nearestLightSystem, !nearestLightSystem.isOn);
      showToast(`${nearestLightSystem.name} lights ${nearestLightSystem.isOn ? 'on' : 'off'}`);
      return;
    }

    const distanceToRemote = player.position.distanceTo(remoteInteractionPosition);
    const distanceToFridge = player.position.distanceTo(fridgeInteractionPosition);
    if (distanceToRemote <= 7.75) {
      setRemoteOpen(true);
    } else if (distanceToFridge <= 7.75) {
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
  if (insideHouse) {
    const feetHeight = player.position.y - eyeHeight;
    const insideStairwell = x >= stairwell.startX && x <= stairwell.endX &&
      z >= stairwell.centerZ - stairwell.width / 2 && z <= stairwell.centerZ + stairwell.width / 2;

    if (insideStairwell) {
      const progress = (x - stairwell.startX) / (stairwell.endX - stairwell.startX);
      const stairHeight = house.floorHeight + (upperFloorTop - house.floorHeight) * progress;
      return feetHeight >= stairHeight - stairStepHeightTolerance ? stairHeight : house.floorHeight;
    }

    return feetHeight >= upperFloorTop - player.height ? upperFloorTop : house.floorHeight;
  }

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
  const insideUpperLevel = feetHeight >= upperFloorTop - player.height &&
    feetHeight < upperFloorTop + house.wallHeight;
  const upperWallCollision = insideUpperLevel && upperInteriorWallBounds.some((wall) =>
    x > wall.minX - 0.35 && x < wall.maxX + 0.35 && z > wall.minZ - 0.35 && z < wall.maxZ + 0.35
  );
  const insideStairTreads = x >= stairwell.startX && x <= stairwell.endX &&
    z >= stairwell.centerZ - (stairwell.width - 0.6) / 2 &&
    z <= stairwell.centerZ + (stairwell.width - 0.6) / 2;
  const stairRise = (upperFloorTop - house.floorHeight) / stairwell.stepCount;
  const stairIndex = Math.min(
    stairwell.stepCount - 1,
    Math.floor(((x - stairwell.startX) / (stairwell.endX - stairwell.startX)) * stairwell.stepCount)
  );
  const stairTreadTop = house.floorHeight + stairRise * (stairIndex + 1);
  const stairBodyCollision = insideStairTreads &&
    feetHeight + player.height > house.floorHeight &&
    feetHeight < stairTreadTop - stairStepHeightTolerance;
  const stairRailCollision = insideStairwellBounds(x, z) &&
    [
      stairwell.centerZ - stairwell.width / 2 + 0.18,
      stairwell.centerZ + stairwell.width / 2 - 0.18
    ].some((railZ) => Math.abs(z - railZ) < 0.34);
  return planterCollision || pillarCollision || signCollision || westWall || eastWall || northWall || southWall ||
    upperWallCollision || stairBodyCollision || stairRailCollision;
}

function insideStairwellBounds(x, z) {
  return x >= stairwell.startX - 0.3 && x <= stairwell.endX + 0.3 &&
    z >= stairwell.centerZ - stairwell.width / 2 - 0.3 &&
    z <= stairwell.centerZ + stairwell.width / 2 + 0.3;
}

function canReachGroundAt(x, z) {
  const feetHeight = player.position.y - eyeHeight;
  const insideStairwell = x >= stairwell.startX && x <= stairwell.endX &&
    z >= stairwell.centerZ - stairwell.width / 2 && z <= stairwell.centerZ + stairwell.width / 2;
  return groundHeightAt(x, z) <= feetHeight + (insideStairwell ? stairStepHeightTolerance : 0.04);
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

async function prepareWorld() {
  await worldAssetsLoaded;

  setLoadingProgress(68, 'Preparing scene shaders…');
  await renderer.compileAsync(scene, camera);

  setLoadingProgress(84, 'Warming up the scene…');
  await new Promise((resolve) => requestAnimationFrame(resolve));
  renderer.render(scene, camera);
  setLoadingProgress(94, 'Finishing world setup…');
  await new Promise((resolve) => requestAnimationFrame(resolve));
  renderer.render(scene, camera);

  worldReady = true;
  loadingPanel.hidden = true;
  enterButton.disabled = false;
  enterButton.textContent = 'STEP INTO THE WORLD →';
  startStatus.textContent = 'The world is ready. Step in when you are.';
  lastFrameTime = performance.now();
  requestAnimationFrame(animate);
}

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
  skyDome.position.copy(camera.position);
  skyUniforms.moonDirection.value.copy(moon.position).sub(camera.position).normalize();

  renderer.render(scene, camera);
}

prepareWorld().catch((error) => {
  console.error('Unable to prepare the game world.', error);
  worldLoadFailed = true;
  loadingPanel.hidden = true;
  const message = error instanceof Error ? error.message : String(error);
  startStatus.textContent = `${message} Reload to try again.`;
  enterButton.disabled = false;
  enterButton.textContent = 'RELOAD TO RETRY';
});
