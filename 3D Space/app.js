import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const bodies = [
  { id: 'sun', name: 'The Sun', type: 'star', category: 'all', color: 0xffd36b, diameter: '1,392,700 km', orbit: '25-35 days rotation', moons: '8 planets in system', distance: '0 AU', description: 'The gravitational anchor of our system. Every orbit in this view is arranged around this ordinary, extraordinary star.', note: 'The Sun holds about 99.8% of the Solar System\'s mass.', size: 4.5, position: [0, 0, 0] },
  { id: 'mercury', name: 'Mercury', type: 'planet', category: 'planet', color: 0xb8a38f, diameter: '4,879 km', orbit: '88 days', moons: 'None', distance: '0.39 AU', description: 'A small, cratered world racing around the Sun faster than any other planet.', note: 'Mercury has the most extreme temperature swing of any planet.', size: .45, position: [7, 0, 0] },
  { id: 'venus', name: 'Venus', type: 'planet', category: 'planet', color: 0xe5b877, diameter: '12,104 km', orbit: '225 days', moons: 'None', distance: '0.72 AU', description: 'A cloud-shrouded world with a runaway greenhouse atmosphere and a surface hot enough to melt lead.', note: 'Venus rotates backwards compared with most planets.', size: .72, position: [10, 0, 0] },
  { id: 'earth', name: 'Earth', type: 'planet', category: 'planet', color: 0x4d9ec0, diameter: '12,742 km', orbit: '365.25 days', moons: '1 — Moon', distance: '1 AU', description: 'Our ocean world, the only place currently known to host life.', note: 'Earth is the only planet not named after a Greek or Roman god.', size: .76, position: [14, 0, 0], moonsList: ['Moon'] },
  { id: 'mars', name: 'Mars', type: 'planet', category: 'planet', color: 0xc8644c, diameter: '6,779 km', orbit: '687 days', moons: '2 — Phobos, Deimos', distance: '1.52 AU', description: 'The red planet, marked by ancient river valleys, giant volcanoes, and a thin atmosphere.', note: 'Olympus Mons is the tallest volcano in the Solar System.', size: .58, position: [18, 0, 0], moonsList: ['Phobos', 'Deimos'] },
  { id: 'jupiter', name: 'Jupiter', type: 'planet', category: 'planet', color: 0xd4a77b, diameter: '139,820 km', orbit: '11.86 years', moons: '95 known', distance: '5.2 AU', description: 'A giant of swirling storms and striped cloud bands, surrounded by a huge family of moons.', note: 'The Great Red Spot is a storm larger than Earth.', size: 1.9, position: [25, 0, 0], moonsList: ['Io', 'Europa', 'Ganymede', 'Callisto'] },
  { id: 'saturn', name: 'Saturn', type: 'planet', category: 'planet', color: 0xd9bd81, diameter: '116,460 km', orbit: '29.45 years', moons: '146 known', distance: '9.58 AU', description: 'A pale gas giant wearing the Solar System\'s most recognizable ring system.', note: 'Saturn is less dense than water.', size: 1.55, position: [34, 0, 0], ring: true, moonsList: ['Mimas', 'Enceladus', 'Tethys', 'Dione', 'Rhea', 'Titan', 'Iapetus', 'Phoebe'] },
  { id: 'uranus', name: 'Uranus', type: 'planet', category: 'planet', color: 0x9bd7e6, diameter: '50,724 km', orbit: '84 years', moons: '28 known', distance: '19.2 AU', description: 'An ice giant tipped dramatically on its side, with faint rings and a blue-green atmosphere.', note: 'A season on Uranus can last more than 20 Earth years.', size: 1.05, position: [44, 0, 0], ring: true, moonsList: ['Miranda', 'Ariel', 'Umbriel', 'Titania', 'Oberon'] },
  { id: 'neptune', name: 'Neptune', type: 'planet', category: 'planet', color: 0x547fc8, diameter: '49,244 km', orbit: '164.8 years', moons: '16 known', distance: '30.1 AU', description: 'The distant blue ice giant, where the fastest winds in the Solar System whip through the clouds.', note: 'Neptune was the first planet found through mathematical prediction.', size: 1.02, position: [55, 0, 0], moonsList: ['Triton', 'Nereid', 'Naiad', 'Thalassa', 'Despina', 'Galatea', 'Larissa', 'Proteus'] },
  { id: 'proxima', name: 'Proxima Centauri', type: 'nearby star', category: 'nearby', color: 0xff826d, diameter: '≈ 200,000 km', orbit: 'Red dwarf star', moons: '2 known planets', distance: '4.24 ly', description: 'The nearest known star to the Sun, a small red dwarf in the Alpha Centauri system.', note: 'Its planet Proxima b orbits in the star\'s habitable zone.', size: 1.2, position: [-26, 7, -17] },
  { id: 'sirius', name: 'Sirius', type: 'nearby star', category: 'nearby', color: 0xcde8ff, diameter: '2.38 × Sun', orbit: 'Binary system', moons: '1 companion star', distance: '8.6 ly', description: 'The brightest star in Earth\'s night sky, a blue-white star paired with a dense white dwarf.', note: 'Sirius B was the first white dwarf discovered.', size: 1.35, position: [-19, -8, 23] },
  { id: 'betelgeuse', name: 'Betelgeuse', type: 'nearby star', category: 'nearby', color: 0xff9671, diameter: '≈ 764 × Sun', orbit: 'Variable supergiant', moons: 'None known', distance: '642 ly', description: 'A red supergiant in Orion nearing the end of its stellar life.', note: 'Its radius would reach beyond the orbit of Mars if placed where our Sun is.', size: 2.2, position: [18, 15, -24] },
  { id: 'cygx1', name: 'Cygnus X-1', type: 'black hole', category: 'nearby', color: 0x9bd7e6, diameter: '≈ 60 km event horizon', orbit: '5.6 days binary orbit', moons: '1 companion star', distance: '7,200 ly', description: 'One of the first strong black-hole candidates, feeding on gas pulled from a nearby blue supergiant.', note: 'It is an X-ray binary: the black hole itself emits no light.', size: 1.1, position: [29, -13, 19], blackHole: true },
  { id: 'sgr-a', name: 'Sagittarius A*', type: 'black hole', category: 'nearby', color: 0xff7964, diameter: '≈ 24 million km', orbit: 'Galactic center', moons: 'Many orbiting stars', distance: '26,700 ly', description: 'The supermassive black hole at the center of the Milky Way, around which our galaxy turns.', note: 'Its mass is about four million times that of the Sun.', size: 1.7, position: [3, -18, -34], blackHole: true }
];

const textureBase = 'https://www.solarsystemscope.com/textures/download/';
const textureUrls = {
  sun: `${textureBase}2k_sun.jpg`, mercury: `${textureBase}2k_mercury.jpg`, venus: `${textureBase}2k_venus.jpg`,
  earth: `${textureBase}2k_earth.jpg`, mars: `${textureBase}2k_mars.jpg`, jupiter: `${textureBase}2k_jupiter.jpg`,
  saturn: `${textureBase}2k_saturn.jpg`, uranus: `${textureBase}2k_uranus.jpg`, neptune: `${textureBase}2k_neptune.jpg`, moon: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/moon_1024.jpg'
};
const planetMotion = {
  mercury: { semiMajorAU: .387, orbitalDays: 87.969, rotationHours: 1407.6, axialTilt: 0.034 },
  venus: { semiMajorAU: .723, orbitalDays: 224.701, rotationHours: -5832.5, axialTilt: 177.4 },
  earth: { semiMajorAU: 1, orbitalDays: 365.256, rotationHours: 23.934, axialTilt: 23.44 },
  mars: { semiMajorAU: 1.524, orbitalDays: 686.98, rotationHours: 24.623, axialTilt: 25.19 },
  jupiter: { semiMajorAU: 5.203, orbitalDays: 4332.59, rotationHours: 9.925, axialTilt: 3.13 },
  saturn: { semiMajorAU: 9.537, orbitalDays: 10759.22, rotationHours: 10.656, axialTilt: 26.73 },
  uranus: { semiMajorAU: 19.191, orbitalDays: 30688.5, rotationHours: -17.24, axialTilt: 97.77 },
  neptune: { semiMajorAU: 30.07, orbitalDays: 60182, rotationHours: 16.11, axialTilt: 28.32 }
};
const orbitScale = 1.83;
const daysPerSecond = 365.256 / 12;
const textureLoader = new THREE.TextureLoader();

const canvas = document.querySelector('#space-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, .1, 500);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const objectMeshes = [];
const orbitGroup = new THREE.Group();
let selectedBody = bodies[0];
let spin = { x: .3, y: -.25 };
let targetSpin = { x: .3, y: -.25 };
let distance = 83;
let targetDistance = 83;
let dragging = false;
let previousPointer = { x: 0, y: 0 };

function material(color, emissive = 0x000000) { return new THREE.MeshStandardMaterial({ color, roughness: .7, metalness: .04, emissive, emissiveIntensity: emissive ? 1.4 : 0 }); }
function makeStars() {
  const points = [];
  for (let index = 0; index < 1300; index += 1) {
    const radius = 170 + Math.random() * 100;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    points.push(radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
  }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xe8eee8, size: .32, sizeAttenuation: true })));
}
function makeObject(body) {
  const group = new THREE.Group(); group.position.set(...body.position); group.userData.body = body;
  if (body.blackHole) {
    const disk = new THREE.Mesh(new THREE.TorusGeometry(body.size * 1.6, body.size * .3, 12, 48), material(body.color, body.color)); disk.rotation.x = .35; group.add(disk);
    const core = new THREE.Mesh(new THREE.SphereGeometry(body.size, 20, 20), material(0x030303)); group.add(core);
  } else {
    const sphereMaterial = material(body.color, body.id === 'sun' ? body.color : 0x000000);
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(body.size, 32, 20), sphereMaterial); sphere.userData.body = body; group.add(sphere);
    if (textureUrls[body.id]) textureLoader.load(textureUrls[body.id], (texture) => { sphereMaterial.map = texture; sphereMaterial.emissiveMap = body.id === 'sun' ? texture : null; sphereMaterial.needsUpdate = true; });
    if (planetMotion[body.id]) { group.rotation.z = THREE.MathUtils.degToRad(planetMotion[body.id].axialTilt); group.userData.motion = planetMotion[body.id]; }
    if (body.ring) { const ring = new THREE.Mesh(new THREE.RingGeometry(body.size * 1.35, body.size * 2.2, 48), new THREE.MeshBasicMaterial({ color: 0xd6c497, side: THREE.DoubleSide, transparent: true, opacity: .72 })); ring.rotation.x = Math.PI / 2.5; group.add(ring); }
    if (body.id === 'earth') { const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(body.size * 1.08, 24, 16), new THREE.MeshBasicMaterial({ color: 0x8de4ff, transparent: true, opacity: .16 })); group.add(atmosphere); }
  }
  orbitGroup.add(group); objectMeshes.push(group); return group;
}
function makeOrbits() {
  Object.values(planetMotion).forEach((motion) => { const radius = motion.semiMajorAU * orbitScale; const ring = new THREE.Mesh(new THREE.RingGeometry(radius - .055, radius + .055, 128), new THREE.MeshBasicMaterial({ color: 0x596467, side: THREE.DoubleSide, transparent: true, opacity: .28 })); ring.rotation.x = -Math.PI / 2; orbitGroup.add(ring); });
}
function makeMoons() { bodies.filter((body) => body.moonsList).forEach((body) => body.moonsList.forEach((moonName, index) => { const moonMaterial = material(0xb8b6ac); const moon = new THREE.Mesh(new THREE.SphereGeometry(Math.max(.09, body.size * .11), 12, 8), moonMaterial); const angle = index * 1.9; moon.position.set(Math.cos(angle) * (body.size * 2.6 + index * .3), Math.sin(angle * .7) * body.size * .6, Math.sin(angle) * (body.size * 2.6 + index * .3)); if (moonName === 'Moon') textureLoader.load(textureUrls.moon, (texture) => { moonMaterial.map = texture; moonMaterial.needsUpdate = true; }); moon.userData.body = { name: moonName, type: `${body.name} moon`, category: body.category, color: 0xb8b6ac, diameter: 'Moon in catalogue', orbit: `orbits ${body.name}`, moons: 'None', distance: body.distance, description: `${moonName} is one of the named moons included in the ${body.name} system.`, note: 'Moon sizes and positions are enlarged for visibility.', size: .1, position: [0, 0, 0] }; const parent = objectMeshes.find((mesh) => mesh.userData.body?.id === body.id); (parent || orbitGroup).add(moon); objectMeshes.push(moon); })); }
function renderCatalogue(filter = 'all') { const list = document.querySelector('#catalogue-list'); list.innerHTML = ''; bodies.filter((body) => filter === 'all' || body.category === filter).forEach((body) => { const button = document.createElement('button'); button.className = `catalogue-item${body.id === selectedBody.id ? ' is-selected' : ''}`; button.style.setProperty('--dot', `#${body.color.toString(16).padStart(6, '0')}`); button.innerHTML = `<span class="item-dot"></span><span class="item-name">${body.name}</span><span class="item-type">${body.type}</span>`; button.addEventListener('click', () => selectBody(body)); list.append(button); }); }
function selectBody(body) { selectedBody = body; document.querySelector('#detail-type').textContent = body.type.toUpperCase(); document.querySelector('#detail-distance').textContent = body.distance; document.querySelector('#detail-name').textContent = body.name; document.querySelector('#detail-description').textContent = body.description; document.querySelector('#detail-diameter').textContent = body.diameter; document.querySelector('#detail-orbit').textContent = body.orbit; document.querySelector('#detail-moons').textContent = body.moons; document.querySelector('#detail-note').textContent = body.note; renderCatalogue(document.querySelector('.filter-button.is-active').dataset.filter); }
function resize() { const bounds = canvas.getBoundingClientRect(); renderer.setSize(bounds.width, bounds.height, false); camera.aspect = bounds.width / bounds.height; camera.updateProjectionMatrix(); }
function updateCamera() { camera.position.set(Math.sin(spin.y) * Math.cos(spin.x) * distance, Math.sin(spin.x) * distance, Math.cos(spin.y) * Math.cos(spin.x) * distance); camera.lookAt(orbitGroup.position); }
function animate(timestamp = 0) { requestAnimationFrame(animate); spin.x += (targetSpin.x - spin.x) * .08; spin.y += (targetSpin.y - spin.y) * .08; distance += (targetDistance - distance) * .08; const elapsedDays = timestamp / 1000 * daysPerSecond; bodies.filter((body) => planetMotion[body.id]).forEach((body) => { const motion = planetMotion[body.id]; const group = objectMeshes.find((mesh) => mesh.userData.body?.id === body.id); if (!group) return; const orbitalAngle = elapsedDays / motion.orbitalDays * Math.PI * 2; group.position.set(Math.cos(orbitalAngle) * motion.semiMajorAU * orbitScale, 0, Math.sin(orbitalAngle) * motion.semiMajorAU * orbitScale); group.rotation.y = elapsedDays / (motion.rotationHours / 24) * Math.PI * 2; }); updateCamera(); renderer.render(scene, camera); }

scene.background = new THREE.Color(0x07090a); scene.add(new THREE.AmbientLight(0x70838b, .55)); const sunLight = new THREE.PointLight(0xffd58b, 3.8, 180); sunLight.position.set(0, 0, 0); scene.add(sunLight); makeStars(); makeOrbits(); bodies.forEach(makeObject); makeMoons();
document.querySelector('#object-count').textContent = `${bodies.length} CATALOGUE OBJECTS`; renderCatalogue(); selectBody(selectedBody); resize(); animate();

document.querySelectorAll('.filter-button').forEach((button) => button.addEventListener('click', () => { document.querySelector('.filter-button.is-active').classList.remove('is-active'); button.classList.add('is-active'); renderCatalogue(button.dataset.filter); }));
document.querySelector('#reset-view').addEventListener('click', () => { targetSpin = { x: .3, y: -.25 }; targetDistance = 83; });
canvas.addEventListener('pointerdown', (event) => { dragging = true; previousPointer = { x: event.clientX, y: event.clientY }; canvas.setPointerCapture(event.pointerId); });
canvas.addEventListener('pointermove', (event) => { if (!dragging) return; targetSpin.y += (event.clientX - previousPointer.x) * .008; targetSpin.x = THREE.MathUtils.clamp(targetSpin.x + (event.clientY - previousPointer.y) * .008, -.95, .95); previousPointer = { x: event.clientX, y: event.clientY }; });
canvas.addEventListener('pointerup', () => { dragging = false; });
canvas.addEventListener('wheel', (event) => { event.preventDefault(); targetDistance = THREE.MathUtils.clamp(targetDistance + event.deltaY * .05, 32, 145); }, { passive: false });
canvas.addEventListener('click', (event) => { const rect = canvas.getBoundingClientRect(); pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1; raycaster.setFromCamera(pointer, camera); const hit = raycaster.intersectObjects(objectMeshes, true)[0]; if (hit?.object.userData.body) selectBody(hit.object.userData.body); });
window.addEventListener('resize', resize);
