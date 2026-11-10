import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const canvas = document.querySelector('#room');
const frame = document.querySelector('.game-frame');
const startScreen = document.querySelector('#start-screen');
const pauseScreen = document.querySelector('#pause-screen');
const startButton = document.querySelector('#start-button');
const resumeButton = document.querySelector('#resume-button');
const prompt = document.querySelector('#interaction-prompt');
const interactionLabel = document.querySelector('#interaction-label');
const hiddenIndicator = document.querySelector('#hidden-indicator');
const sceneCaption = document.querySelector('#scene-caption');
const roomStatus = document.querySelector('#room-status');
const statusLight = document.querySelector('.status-light');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x171714);
scene.fog = new THREE.Fog(0x171714, 13, 35);

const camera = new THREE.PerspectiveCamera(73, 1, 0.1, 70);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;

const bedroom = new THREE.Group();
scene.add(bedroom);

const materials = {
  plaster: new THREE.MeshStandardMaterial({ color: 0xaaa18f, roughness: 0.94 }),
  shadowPlaster: new THREE.MeshStandardMaterial({ color: 0x68675d, roughness: 0.96 }),
  ceiling: new THREE.MeshStandardMaterial({ color: 0xb7af9c, roughness: 1 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x715741, roughness: 0.78 }),
  darkWood: new THREE.MeshStandardMaterial({ color: 0x3c3028, roughness: 0.78 }),
  trim: new THREE.MeshStandardMaterial({ color: 0xc3b7a3, roughness: 0.82 }),
  brass: new THREE.MeshStandardMaterial({ color: 0x9d8159, metalness: 0.55, roughness: 0.38 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x4c4941, metalness: 0.58, roughness: 0.42 }),
  bedding: new THREE.MeshStandardMaterial({ color: 0x7d8171, roughness: 1 }),
  blanket: new THREE.MeshStandardMaterial({ color: 0x484b43, roughness: 1 }),
  rug: new THREE.MeshStandardMaterial({ color: 0x665b4b, roughness: 1 }),
  black: new THREE.MeshStandardMaterial({ color: 0x171613, roughness: 0.7 }),
  switchFace: new THREE.MeshStandardMaterial({ color: 0xbfb6a4, roughness: 0.55 }),
  switchOn: new THREE.MeshStandardMaterial({ color: 0xd4df97, emissive: 0x8c9b50, emissiveIntensity: 1.1 }),
  switchOff: new THREE.MeshStandardMaterial({ color: 0x625e54, roughness: 0.75 }),
  glass: new THREE.MeshStandardMaterial({
    color: 0x8999a0,
    emissive: 0x29323a,
    emissiveIntensity: 0.8,
    roughness: 0.35,
    metalness: 0.12
  }),
  lamp: new THREE.MeshStandardMaterial({ color: 0xead8a9, emissive: 0x9d7139, emissiveIntensity: 0.85 }),
  fan: new THREE.MeshStandardMaterial({ color: 0x39362f, roughness: 0.6, metalness: 0.35 }),
  fanBlade: new THREE.MeshStandardMaterial({ color: 0x514638, roughness: 0.8 })
};

const interactive = [];
const solids = [];
const raycaster = new THREE.Raycaster();
const screenCenter = new THREE.Vector2(0, 0);
const keys = new Set();
const clock = new THREE.Clock();

const state = {
  playing: false,
  hidden: false,
  lightsOn: true,
  fanOn: false,
  yaw: 0,
  pitch: 0,
  target: null,
  captionTimer: 0
};

function box(parent, name, size, position, material, options = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  parent.add(mesh);
  return mesh;
}

function cylinder(parent, name, radiusTop, radiusBottom, height, position, material, segments = 16) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments),
    material
  );
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function plane(parent, name, width, height, position, rotation, material) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addRoom() {
  box(bedroom, 'wooden floor', [20, 0.16, 25], new THREE.Vector3(0, -0.08, 0), materials.darkWood, { castShadow: false });
  plane(bedroom, 'wood floor surface', 20, 25, [0, 0.005, 0], [-Math.PI / 2, 0, 0], materials.wood);
  box(bedroom, 'ceiling', [20, 0.2, 25], [0, 8, 0], materials.ceiling, { castShadow: false });

  const rearWall = box(bedroom, 'rear wall', [20, 8, 0.18], [0, 4, -12.5], materials.plaster);
  const frontWall = box(bedroom, 'entry wall', [20, 8, 0.18], [0, 4, 12.5], materials.shadowPlaster);
  const leftWall = box(bedroom, 'left wall', [0.18, 8, 25], [-10, 4, 0], materials.plaster);
  const rightWall = box(bedroom, 'right wall', [0.18, 8, 25], [10, 4, 0], materials.plaster);
  [rearWall, frontWall, leftWall, rightWall].forEach((wall) => solids.push(wall));

  for (const z of [-11.9, 11.9]) {
    box(bedroom, 'baseboard', [20, 0.34, 0.16], [0, 0.17, z], materials.trim, { castShadow: false });
  }
  for (const x of [-9.9, 9.9]) {
    box(bedroom, 'baseboard', [0.16, 0.34, 25], [x, 0.17, 0], materials.trim, { castShadow: false });
  }

  addWindow();
  addEntrance();
  addBed();
  addNightstands();
  addDresser();
  addCeilingFan();
  addSwitchPanel();
  addAccentDetails();
}

function addWindow() {
  const z = -12.37;
  box(bedroom, 'window frame', [5.4, 3.5, 0.24], [-3.9, 5.1, z], materials.darkWood);
  box(bedroom, 'window opening', [5.08, 3.17, 0.12], [-3.9, 5.1, z + 0.12], materials.black);
  box(bedroom, 'window night glass', [4.84, 2.93, 0.06], [-3.9, 5.1, z + 0.22], materials.glass, { castShadow: false });
  for (const x of [-5.48, -3.9, -2.32]) {
    box(bedroom, 'window muntin', [0.09, 3.05, 0.1], [x, 5.1, z + 0.3], materials.trim, { castShadow: false });
  }
  box(bedroom, 'window crossbar', [5.05, 0.09, 0.1], [-3.9, 5.1, z + 0.3], materials.trim, { castShadow: false });
  box(bedroom, 'window sill', [5.75, 0.18, 0.58], [-3.9, 3.31, -12.08], materials.trim);

  const nightGlow = new THREE.PointLight(0x8097a0, 1.1, 14, 2);
  nightGlow.position.set(-4.3, 5.2, -11.2);
  bedroom.add(nightGlow);
}

function addEntrance() {
  const x = 5.3;
  const z = 12.44;
  box(bedroom, 'bedroom door', [3.1, 6.7, 0.16], [x, 3.42, z], materials.darkWood);
  box(bedroom, 'door panel upper', [2.4, 2.6, 0.07], [x, 4.65, z - 0.11], materials.wood);
  box(bedroom, 'door panel lower', [2.4, 1.8, 0.07], [x, 1.75, z - 0.11], materials.wood);
  cylinder(bedroom, 'door handle', 0.12, 0.12, 0.08, [6.45, 3.3, 12.28], materials.brass, 12)
    .rotation.z = Math.PI / 2;
}

function addBed() {
  const bed = new THREE.Group();
  bed.position.set(-2.2, 0, -3.2);
  bed.name = 'bed';
  bedroom.add(bed);

  box(bed, 'bed frame', [7.2, 0.42, 9.1], [0, 0.65, 0], materials.darkWood);
  box(bed, 'mattress', [6.9, 0.52, 8.8], [0, 0.99, 0], materials.bedding);
  box(bed, 'bed blanket', [6.86, 0.14, 5.4], [0, 1.33, 1.45], materials.blanket);
  box(bed, 'blanket drape', [6.85, 0.8, 0.15], [0, 0.92, 4.1], materials.blanket);

  for (const x of [-3.25, 3.25]) {
    box(bed, 'pillow', [2.45, 0.22, 1.25], [x, 1.39, -3.27], materials.trim);
  }
  for (const x of [-3.25, 3.25]) {
    for (const z of [-4.12, 4.12]) {
      box(bed, 'bed leg', [0.34, 0.9, 0.34], [x, 0.48, z], materials.darkWood);
    }
  }
  box(bed, 'under-bed shadow', [6.2, 0.09, 7.6], [0, 0.15, 0], materials.black, { castShadow: false });
  solids.push(bed);
  bed.userData.hideSpot = new THREE.Vector3(-2.2, 0, 1.35);

  const rug = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 11.2), materials.rug);
  rug.name = 'rug';
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(-2.2, 0.015, 0);
  bedroom.add(rug);
  for (const offset of [-4.8, 4.8]) {
    const runner = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 10.1), materials.trim);
    runner.rotation.x = -Math.PI / 2;
    runner.position.set(-2.2 + offset, 0.021, 0);
    bedroom.add(runner);
  }
}

function addNightstands() {
  for (const x of [-6.65, 2.25]) {
    box(bedroom, 'nightstand', [1.75, 1.8, 1.85], [x, 0.9, -6.45], materials.darkWood);
    box(bedroom, 'nightstand top', [1.9, 0.14, 2], [x, 1.83, -6.45], materials.wood);
    box(bedroom, 'drawer', [1.25, 0.58, 0.07], [x, 1.33, -5.49], materials.wood);
    const knob = cylinder(bedroom, 'drawer knob', 0.075, 0.075, 0.06, [x, 1.33, -5.43], materials.brass, 10);
    knob.rotation.x = Math.PI / 2;

    cylinder(bedroom, 'lamp base', 0.32, 0.38, 0.12, [x, 1.98, -6.45], materials.brass);
    cylinder(bedroom, 'lamp stem', 0.055, 0.065, 0.44, [x, 2.25, -6.45], materials.metal);
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.38, 0.43, 16, 1, true), materials.lamp);
    shade.position.set(x, 2.68, -6.45);
    shade.castShadow = true;
    bedroom.add(shade);
    const bulb = new THREE.PointLight(0xe9c786, 1.15, 8, 2);
    bulb.position.set(x, 2.58, -6.45);
    bulb.userData.originalIntensity = 1.15;
    bedroom.add(bulb);
    bedroom.userData.bulbs ??= [];
    bedroom.userData.bulbs.push(bulb);
  }
}

function addDresser() {
  box(bedroom, 'dresser', [5.2, 3.4, 1.8], [2.8, 1.7, -10.7], materials.darkWood);
  box(bedroom, 'dresser top', [5.35, 0.18, 1.95], [2.8, 3.48, -10.7], materials.wood);
  for (const y of [2.65, 1.8, 0.95]) {
    box(bedroom, 'dresser drawer', [4.35, 0.58, 0.08], [2.8, y, -9.76], materials.wood);
    for (const x of [1.55, 4.05]) {
      const handle = cylinder(bedroom, 'dresser pull', 0.07, 0.07, 0.1, [x, y, -9.68], materials.brass, 10);
      handle.rotation.x = Math.PI / 2;
    }
  }
}

function addCeilingFan() {
  const fan = new THREE.Group();
  fan.name = 'ceiling fan';
  fan.position.set(0.3, 7.35, -0.8);
  bedroom.add(fan);

  cylinder(fan, 'fan downrod', 0.07, 0.07, 1, [0, 0.35, 0], materials.metal);
  const rotor = new THREE.Group();
  rotor.name = 'fan rotor';
  fan.add(rotor);
  cylinder(rotor, 'fan motor', 0.26, 0.29, 0.46, [0, -0.18, 0], materials.fan);
  cylinder(rotor, 'fan cap', 0.2, 0.2, 0.12, [0, -0.44, 0], materials.brass);
  const blades = new THREE.Group();
  blades.name = 'fan blades';
  blades.position.y = -0.05;
  rotor.add(blades);

  for (let index = 0; index < 4; index += 1) {
    const arm = new THREE.Group();
    arm.rotation.y = index * Math.PI / 2;
    blades.add(arm);
    const blade = box(arm, 'fan blade', [0.32, 0.09, 1.9], [0, -0.1, -1.02], materials.fanBlade);
    blade.rotation.y = Math.PI / 12;
    const tip = box(arm, 'fan blade tip', [0.4, 0.1, 0.12], [0, -0.1, -1.91], materials.brass);
    tip.rotation.y = Math.PI / 12;
  }

  const bulb = new THREE.PointLight(0xffddb0, 38, 23, 1.65);
  bulb.position.set(0, -0.74, 0);
  rotor.add(bulb);
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0xffe6bc, emissive: 0xffd18a, emissiveIntensity: 2.2 })
  );
  globe.name = 'fan light';
  globe.position.copy(bulb.position);
  rotor.add(globe);

  const ceilingCap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), materials.brass);
  ceilingCap.position.set(0, 0.89, 0);
  fan.add(ceilingCap);
  bedroom.userData.fan = { fan, rotor, blades, bulb, globe };
  bedroom.userData.roomLights = [];

  const ceilingLight = new THREE.PointLight(0xf5ddb7, 82, 32, 1.7);
  ceilingLight.position.set(-2.4, 7.25, 1.2);
  ceilingLight.userData.originalIntensity = ceilingLight.intensity;
  ceilingLight.castShadow = true;
  ceilingLight.shadow.mapSize.set(1024, 1024);
  ceilingLight.shadow.camera.near = 0.5;
  ceilingLight.shadow.camera.far = 28;
  bedroom.add(ceilingLight);
  bedroom.userData.roomLights.push(ceilingLight);

  const fillLight = new THREE.PointLight(0xc9bd9e, 22, 24, 1.7);
  fillLight.position.set(5.5, 5.8, -3.5);
  fillLight.userData.originalIntensity = fillLight.intensity;
  bedroom.add(fillLight);
  bedroom.userData.roomLights.push(fillLight);

  const ambient = new THREE.AmbientLight(0xe6d6ba, 0.28);
  scene.add(ambient);
}

function makeSwitch(name, z, y, label, initialState, toggle) {
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.72, 0.72), materials.switchFace);
  plate.name = `${label.toLowerCase()} switch plate`;
  plate.position.set(9.78, y, z);
  bedroom.add(plate);

  const rocker = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.37, 0.23),
    initialState ? materials.switchOn : materials.switchOff
  );
  rocker.name = name;
  rocker.position.set(9.68, y, z);
  rocker.castShadow = true;
  rocker.userData = { label, state: initialState, toggle, plate };
  bedroom.add(rocker);
  interactive.push(rocker);

  const indicator = new THREE.PointLight(
    initialState ? 0xd4df97 : 0x47443d,
    initialState ? 0.14 : 0,
    1.5,
    2
  );
  indicator.position.set(9.48, y, z);
  bedroom.add(indicator);
  rocker.userData.indicator = indicator;
  return rocker;
}

function addSwitchPanel() {
  makeSwitch(
    'wall light switch',
    2.15,
    4.75,
    'LIGHTS',
    state.lightsOn,
    () => {
      state.lightsOn = !state.lightsOn;
      bedroom.userData.roomLights.forEach((light) => {
        light.intensity = state.lightsOn ? light.userData.originalIntensity : 0;
      });
      bedroom.userData.bulbs.forEach((light) => {
        light.intensity = state.lightsOn ? light.userData.originalIntensity : 0.12;
      });
      updateSwitches();
      refreshStatus();
      setCaption(state.lightsOn ? 'The light wakes the room.' : 'The room returns to the dark.');
    }
  );
  makeSwitch(
    'fan switch',
    3.16,
    4.75,
    'FAN',
    state.fanOn,
    () => {
      state.fanOn = !state.fanOn;
      updateSwitches();
      refreshStatus();
      setCaption(state.fanOn ? 'A soft whir begins above you.' : 'The fan settles into silence.');
    }
  );
  box(bedroom, 'switch label', [0.03, 0.04, 0.9], [9.62, 5.27, 2.65], materials.brass, { castShadow: false });
}

function addAccentDetails() {
  for (const x of [-9.86, 9.86]) {
    for (const y of [7.85]) {
      box(bedroom, 'ceiling edge trim', [0.1, 0.12, 24.7], [x, y, 0], materials.trim, { castShadow: false });
    }
  }

  for (let index = 0; index < 18; index += 1) {
    const seam = new THREE.Mesh(
      new THREE.PlaneGeometry(0.018, 24.6),
      new THREE.MeshBasicMaterial({ color: 0x291e16 })
    );
    seam.rotation.x = -Math.PI / 2;
    seam.position.set(-9.8 + index * 1.15, 0.012, 0);
    bedroom.add(seam);
  }
}

function updateSwitches() {
  for (const control of interactive) {
    const on = control.userData.label === 'LIGHTS' ? state.lightsOn : state.fanOn;
    control.userData.state = on;
    control.material = on ? materials.switchOn : materials.switchOff;
    control.position.y = on ? 4.81 : 4.69;
    control.userData.indicator.color.setHex(on ? 0xd4df97 : 0x47443d);
    control.userData.indicator.intensity = on ? 0.14 : 0;
  }
}

function refreshStatus() {
  if (state.hidden) {
    roomStatus.textContent = 'HIDDEN UNDER THE BED';
  } else if (state.lightsOn && state.fanOn) {
    roomStatus.textContent = 'LIGHTS ON / FAN TURNING';
  } else if (state.lightsOn) {
    roomStatus.textContent = 'THE HOUSE IS QUIET';
  } else if (state.fanOn) {
    roomStatus.textContent = 'THE FAN TURNS IN THE DARK';
  } else {
    roomStatus.textContent = 'LIGHTS OUT / ALL IS STILL';
  }
  statusLight.classList.toggle('is-dark', !state.lightsOn);
}

function setCaption(text) {
  sceneCaption.textContent = text;
  state.captionTimer = 4;
}

function resize() {
  const { width, height } = canvas.getBoundingClientRect();
  if (!width || !height) return;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function getLookingAt() {
  camera.updateMatrixWorld();
  raycaster.setFromCamera(screenCenter, camera);
  const hits = raycaster.intersectObjects(interactive, false);
  if (!hits.length || hits[0].distance > 5.5) return null;
  return hits[0].object;
}

function updatePrompt() {
  if (!state.playing || state.hidden) {
    prompt.hidden = true;
    state.target = null;
    return;
  }
  state.target = getLookingAt();
  prompt.hidden = !state.target;
  if (state.target) {
    const isOn = state.target.userData.state;
    interactionLabel.textContent = state.target.userData.label === 'LIGHTS'
      ? `TURN ${isOn ? 'OFF' : 'ON'} THE LIGHTS`
      : `TURN ${isOn ? 'OFF' : 'ON'} THE FAN`;
  }
}

function updateLook() {
  camera.rotation.order = 'YXZ';
  camera.rotation.y = state.yaw;
  camera.rotation.x = state.pitch;
}

function movePlayer(delta) {
  if (!state.playing || state.hidden) return;
  const speed = keys.has('shift') ? 3.8 : 2.65;
  const forward = Number(keys.has('w') || keys.has('arrowup')) - Number(keys.has('s') || keys.has('arrowdown'));
  const sideways = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'));
  if (!forward && !sideways) return;

  const length = Math.hypot(forward, sideways);
  const normalForward = forward / length;
  const normalSideways = sideways / length;
  const dx = (Math.sin(state.yaw) * normalForward + Math.cos(state.yaw) * normalSideways) * speed * delta;
  const dz = (-Math.cos(state.yaw) * normalForward + Math.sin(state.yaw) * normalSideways) * speed * delta;
  const nextX = THREE.MathUtils.clamp(camera.position.x + dx, -9.1, 9.1);
  const nextZ = THREE.MathUtils.clamp(camera.position.z + dz, -11.6, 11.4);

  const bedBounds = { minX: -5.9, maxX: 1.5, minZ: -7.75, maxZ: 1.35 };
  const insideBed = nextX > bedBounds.minX && nextX < bedBounds.maxX
    && nextZ > bedBounds.minZ && nextZ < bedBounds.maxZ;
  const nearDresser = nextX > 0.1 && nextX < 5.5 && nextZ < -9.45;
  const nearDoor = nextX > 3.65 && nextX < 6.95 && nextZ > 11.05;

  if (!insideBed && !nearDresser && !nearDoor) {
    camera.position.x = nextX;
    camera.position.z = nextZ;
  }
}

function enterRoom() {
  state.playing = true;
  state.hidden = false;
  startScreen.hidden = true;
  pauseScreen.hidden = true;
  frame.classList.add('is-playing');
  frame.classList.remove('is-hidden');
  if (document.pointerLockElement !== canvas) canvas.requestPointerLock?.();
  canvas.focus({ preventScroll: true });
  setCaption('The room is still. The fan waits above you.');
  refreshStatus();
}

function pauseRoom() {
  if (!state.playing) return;
  state.playing = false;
  keys.clear();
  frame.classList.remove('is-playing');
  prompt.hidden = true;
  pauseScreen.hidden = false;
}

function toggleHide() {
  if (!state.playing) return;
  if (state.hidden) {
    state.hidden = false;
    frame.classList.remove('is-hidden');
    hiddenIndicator.hidden = true;
    camera.position.copy(state.savedPosition);
    setCaption('You are back in the room.');
  } else {
    const hideSpot = bedroom.children.find((child) => child.name === 'bed')?.userData.hideSpot;
    if (!hideSpot || Math.hypot(camera.position.x - hideSpot.x, camera.position.z - hideSpot.z) > 2.8) {
      setCaption('Get closer to the bed to hide beneath it.');
      return;
    }
    state.savedPosition = camera.position.clone();
    state.hidden = true;
    camera.position.set(-2.2, 0.38, 0.75);
    state.pitch = -0.1;
    state.yaw = Math.PI;
    updateLook();
    frame.classList.add('is-hidden');
    hiddenIndicator.hidden = false;
    setCaption('Under the bed, the room feels very far away.');
  }
  refreshStatus();
}

function animate() {
  const delta = Math.min(clock.getDelta(), 0.05);
  movePlayer(delta);
  updatePrompt();

  const fan = bedroom.userData.fan;
  if (state.fanOn) fan.blades.rotation.y += delta * 3.2;
  fan.bulb.intensity = state.lightsOn ? 38 : 0;
  fan.globe.material.emissiveIntensity = state.lightsOn ? 2.2 : 0;

  if (state.captionTimer > 0) {
    state.captionTimer -= delta;
  } else if (state.playing && !state.hidden) {
    sceneCaption.textContent = 'The room is still. The fan waits above you.';
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

addRoom();
camera.position.set(0.8, 5.25, 9.35);
updateLook();
resize();
window.addEventListener('resize', resize);

startButton.addEventListener('click', enterRoom);
resumeButton.addEventListener('click', enterRoom);

canvas.addEventListener('click', () => {
  if (state.playing && document.pointerLockElement !== canvas) {
    canvas.requestPointerLock?.();
  }
});

document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement === canvas) {
    startScreen.hidden = true;
    pauseScreen.hidden = true;
    state.playing = true;
    frame.classList.add('is-playing');
    return;
  }
  if (state.playing) pauseRoom();
});

document.addEventListener('mousemove', (event) => {
  if (!state.playing || document.pointerLockElement !== canvas || state.hidden) return;
  state.yaw -= event.movementX * 0.002;
  state.pitch -= event.movementY * 0.002;
  state.pitch = THREE.MathUtils.clamp(state.pitch, -1.25, 1.15);
  updateLook();
});

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(key)) {
    keys.add(key);
    if (state.playing && document.pointerLockElement === canvas) event.preventDefault();
  }
  if (event.repeat || !state.playing) return;

  if (key === 'e' && state.target && !state.hidden) {
    state.target.userData.toggle();
  } else if (key === 'h') {
    toggleHide();
  }
});

window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
window.addEventListener('blur', () => keys.clear());

renderer.setAnimationLoop(animate);
