const commands = [
  { page: 1, name: 'Get-ComputerInfo', category: 'discover', label: 'System', description: 'Read a broad snapshot of the Windows version, hardware, BIOS, and environment.', command: 'Get-ComputerInfo' },
  { page: 1, name: 'Get-Process', category: 'discover', label: 'Processes', description: 'List running processes, then sort or filter them by CPU, memory, or name.', command: 'Get-Process | Sort-Object CPU -Descending' },
  { page: 1, name: 'Get-Service', category: 'discover', label: 'Services', description: 'See services and their current state. Some service details may be restricted.', command: 'Get-Service | Sort-Object Status, DisplayName' },
  { page: 1, name: 'Get-WinEvent', category: 'discover', label: 'Events', description: 'Read Windows event logs you have permission to access, newest events first.', command: 'Get-WinEvent -LogName System -MaxEvents 20' },
  { page: 1, name: 'Get-CimInstance', category: 'discover', label: 'Inventory', description: 'Query useful management data such as memory, disks, and operating-system details.', command: 'Get-CimInstance Win32_OperatingSystem' },
  { page: 1, name: 'Get-ChildItem', category: 'files', label: 'Files', description: 'List files and folders. The alias dir also works in PowerShell.', command: 'Get-ChildItem -Force' },
  { page: 1, name: 'Get-Content', category: 'files', label: 'Read', description: 'Read a text file without opening a separate editor.', command: 'Get-Content .\\notes.txt -Tail 20' },
  { page: 1, name: 'Select-String', category: 'files', label: 'Search', description: 'Search text inside files with a pattern and return matching lines.', command: 'Select-String -Path .\\*.log -Pattern "error"' },
  { page: 1, name: 'Get-FileHash', category: 'files', label: 'Verify', description: 'Create a SHA-256 fingerprint so you can compare file contents safely.', command: 'Get-FileHash .\\download.zip -Algorithm SHA256' },
  { page: 1, name: 'Get-NetIPConfiguration', category: 'network', label: 'Network', description: 'Inspect adapters, IP addresses, gateways, and DNS settings.', command: 'Get-NetIPConfiguration' },
  { page: 1, name: 'Test-NetConnection', category: 'network', label: 'Test', description: 'Check DNS and whether a host or TCP port can be reached from this PC.', command: 'Test-NetConnection example.com -Port 443' },
  { page: 1, name: 'Resolve-DnsName', category: 'network', label: 'DNS', description: 'Ask configured DNS servers to resolve a hostname or inspect a record.', command: 'Resolve-DnsName example.com' },
  { page: 1, name: 'Get-NetTCPConnection', category: 'network', label: 'Sockets', description: 'View current TCP connections and their owning process IDs.', command: 'Get-NetTCPConnection -State Established' },
  { page: 1, name: 'Get-Location', category: 'automate', label: 'Navigate', description: 'Print the current folder. The alias pwd is familiar to many shell users.', command: 'Get-Location' },
  { page: 1, name: 'Measure-Object', category: 'automate', label: 'Count', description: 'Count files, lines, or values as part of a pipeline.', command: 'Get-ChildItem | Measure-Object' },
  { page: 1, name: 'Export-Csv', category: 'automate', label: 'Export', description: 'Save structured command output as a CSV you can open in Excel.', command: 'Get-Process | Export-Csv .\\processes.csv -NoTypeInformation' },
  { page: 1, name: 'Get-Date', category: 'automate', label: 'Time', description: 'Get the local date and time, or format it for filenames and logs.', command: 'Get-Date -Format "yyyy-MM-dd HH:mm"' },
  { page: 1, name: 'Get-Clipboard', category: 'automate', label: 'Clipboard', description: 'Read the current user clipboard and pipe it into another command.', command: 'Get-Clipboard' },
  { page: 2, name: 'Get-Counter', category: 'discover', label: 'Performance', description: 'Sample Windows performance counters to inspect CPU, memory, disk, or network pressure.', command: 'Get-Counter "\\Processor(_Total)\\% Processor Time" -SampleInterval 2 -MaxSamples 5' },
  { page: 2, name: 'Get-ScheduledTask', category: 'discover', label: 'Tasks', description: 'Review scheduled tasks and their current state without changing them.', command: 'Get-ScheduledTask | Where-Object State -eq "Ready"' },
  { page: 2, name: 'Get-Volume', category: 'discover', label: 'Storage', description: 'Inspect mounted volumes, file systems, health, and available space.', command: 'Get-Volume | Select-Object DriveLetter, FileSystem, SizeRemaining, Size' },
  { page: 2, name: 'Get-Acl', category: 'files', label: 'Permissions', description: 'Read access-control entries on a file or folder to understand its permissions.', command: 'Get-Acl .\\reports | Format-List' },
  { page: 2, name: 'Get-ChildItem', category: 'files', label: 'Inventory', description: 'Build a recursive file inventory and sort it by size for cleanup work.', command: 'Get-ChildItem .\\logs -File -Recurse | Sort-Object Length -Descending' },
  { page: 2, name: 'Get-NetRoute', category: 'network', label: 'Routes', description: 'Inspect the local routing table and identify the path Windows will use.', command: 'Get-NetRoute -AddressFamily IPv4 | Sort-Object RouteMetric' },
  { page: 2, name: 'Get-DnsClientCache', category: 'network', label: 'Cache', description: 'Inspect locally cached DNS records while troubleshooting name resolution.', command: 'Get-DnsClientCache | Sort-Object Entry' },
  { page: 2, name: 'ForEach-Object', category: 'automate', label: 'Pipeline', description: 'Run an operation for each pipeline item and shape the output you need.', command: 'Get-ChildItem -File | ForEach-Object { $_.Name.ToUpper() }' },
  { page: 2, name: 'Where-Object', category: 'automate', label: 'Filter', description: 'Keep only objects matching a property or script condition in a pipeline.', command: 'Get-Process | Where-Object CPU -gt 60 | Sort-Object CPU -Descending' },
  { page: 3, name: 'Invoke-Command', category: 'network', label: 'Remote', description: 'Run a read-only diagnostic command on a permitted remote computer or session.', command: 'Invoke-Command -ComputerName SERVER01 -ScriptBlock { Get-Process }' },
  { page: 3, name: 'Get-WinEvent', category: 'discover', label: 'Query', description: 'Use a structured filter to search large event logs efficiently by provider and ID.', command: 'Get-WinEvent -FilterHashtable @{ LogName="System"; Id=6005,6006 }' },
  { page: 3, name: 'Get-CimAssociatedInstance', category: 'discover', label: 'Relations', description: 'Follow CIM relationships to connect devices, services, and system resources.', command: 'Get-CimInstance Win32_NetworkAdapter | Get-CimAssociatedInstance -ResultClassName Win32_NetworkAdapterConfiguration' },
  { page: 3, name: 'Compare-Object', category: 'files', label: 'Diff', description: 'Compare two command outputs or snapshots and surface what changed.', command: 'Compare-Object (Get-Content .\\before.txt) (Get-Content .\\after.txt)' },
  { page: 3, name: 'Group-Object', category: 'automate', label: 'Aggregate', description: 'Group pipeline results by a property to reveal patterns and outliers.', command: 'Get-WinEvent -LogName System -MaxEvents 100 | Group-Object ProviderName | Sort-Object Count -Descending' },
  { page: 3, name: 'Tee-Object', category: 'automate', label: 'Trace', description: 'Capture intermediate pipeline output while continuing to pass it onward.', command: 'Get-Process | Tee-Object .\\process-snapshot.txt | Sort-Object CPU -Descending' },
  { page: 3, name: 'Measure-Command', category: 'automate', label: 'Benchmark', description: 'Measure how long a command takes so you can compare approaches.', command: 'Measure-Command { Get-ChildItem -File -Recurse | Measure-Object }' }
];

const grid = document.querySelector('#command-grid');
const search = document.querySelector('#command-search');
const filters = document.querySelector('#filters');
const emptyState = document.querySelector('#empty-state');
const resultCount = document.querySelector('#result-count');
const pageNote = document.querySelector('#page-note');
const pageButtons = document.querySelector('#page-buttons');
const themeOptions = document.querySelector('#theme-options');
const matrixCanvas = document.querySelector('#matrix-rain');
const matrixContext = matrixCanvas.getContext('2d');
const glitchCanvas = document.querySelector('#glitch-background');
const glitchContext = glitchCanvas.getContext('2d');
const rickStream = document.querySelector('#rick-stream');
const futureCity = document.querySelector('#future-city');
let activeFilter = 'all';
let activePage = 1;
const pageNames = {
  1: 'Foundations / everyday inspection',
  2: 'Operator / diagnostics and pipelines',
  3: 'Advanced / remote and analytical work'
};
let matrixAnimation;
let glitchAnimation;
let rickAnimation;
let rickFrames = [];
let rickFrameIndex = 0;
let cityScrollFrame;

async function loadRickStream() {
  try {
    const response = await fetch('assets/rick-ascii-stream.txt');
    const stream = await response.text();
    rickFrames = stream.split('\x1b[2J\x1b[H').map((frame) => frame.trim()).filter(Boolean);
    if (rickFrames.length) rickStream.textContent = rickFrames[0];
  } catch {
    rickStream.textContent = 'curl ascii.live/rick';
  }
}

function setRickState(isActive) {
  if (isActive && !rickAnimation && rickFrames.length) {
    rickAnimation = window.setInterval(() => {
      rickFrameIndex = (rickFrameIndex + 1) % rickFrames.length;
      rickStream.textContent = rickFrames[rickFrameIndex];
    }, 90);
  }
  if (!isActive && rickAnimation) {
    clearInterval(rickAnimation);
    rickAnimation = undefined;
  }
}

function updateFutureCity() {
  cityScrollFrame = undefined;
  futureCity.style.setProperty('--city-scroll', `${window.scrollY * -.22}px`);
}

window.addEventListener('scroll', () => {
  if (!cityScrollFrame) cityScrollFrame = requestAnimationFrame(updateFutureCity);
}, { passive: true });

function resizeMatrix() {
  const ratio = window.devicePixelRatio || 1;
  matrixCanvas.width = window.innerWidth * ratio;
  matrixCanvas.height = window.innerHeight * ratio;
  matrixContext.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawMatrix() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  matrixContext.fillStyle = 'rgba(2, 11, 5, .11)';
  matrixContext.fillRect(0, 0, width, height);
  matrixContext.font = '13px Fira Code, monospace';
  matrixColumns.forEach((column, index) => {
    column.drops.forEach((drop, dropIndex) => {
      const character = Math.random() > .5 ? '1' : '0';
      matrixContext.fillStyle = (index + dropIndex) % 11 === 0 ? '#d8ffd8' : '#55ff70';
      matrixContext.fillText(character, index * matrixColumnWidth, drop.y);
      drop.y += drop.speed;
      if (drop.y > height + 20) drop.y = -Math.random() * height;
    });
  });
  matrixAnimation = requestAnimationFrame(drawMatrix);
}

const matrixColumnWidth = 20;
const matrixDropsPerLane = 10;
const matrixColumns = Array.from({ length: Math.ceil(window.innerWidth / matrixColumnWidth) }, () => ({
  drops: Array.from({ length: matrixDropsPerLane }, () => ({
    y: -Math.random() * window.innerHeight,
    speed: 1.5 + Math.random() * 3
  }))
}));

function setMatrixState(isActive) {
  if (isActive && !matrixAnimation) drawMatrix();
  if (!isActive && matrixAnimation) {
    cancelAnimationFrame(matrixAnimation);
    matrixAnimation = undefined;
    matrixContext.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
  }
}

function resizeGlitch() {
  const ratio = window.devicePixelRatio || 1;
  glitchCanvas.width = window.innerWidth * ratio;
  glitchCanvas.height = window.innerHeight * ratio;
  glitchContext.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawGlitch(time = 0) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const phase = time / 1000;
  glitchContext.clearRect(0, 0, width, height);

  for (let index = 0; index < 900; index += 1) {
    const shade = 80 + Math.floor(Math.random() * 150);
    glitchContext.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${Math.random() * .18})`;
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() > .92 ? 3 : 1;
    glitchContext.fillRect(x, y, size + Math.random() * 4, size);
  }

  glitchContext.fillStyle = 'rgba(255, 255, 255, .045)';
  for (let y = (phase * 38) % 8; y < height; y += 8) glitchContext.fillRect(0, y, width, 1);

  const scale = Math.min(width, height) / 650;
  const figureX = width * .72 + Math.sin(phase * 2.1) * 5;
  const figureY = height * .51;
  const jitter = () => (Math.random() - .5) * 7;
  glitchContext.lineWidth = Math.max(1, scale * 1.3);
  glitchContext.strokeStyle = 'rgba(235, 235, 235, .23)';
  glitchContext.shadowColor = 'rgba(255, 255, 255, .2)';
  glitchContext.shadowBlur = 7;

  const line = (points) => {
    glitchContext.beginPath();
    points.forEach(([x, y], index) => {
      const shiftedX = figureX + x * scale + jitter();
      const shiftedY = figureY + y * scale + jitter();
      if (Math.random() < .13) return;
      if (index === 0) glitchContext.moveTo(shiftedX, shiftedY);
      else glitchContext.lineTo(shiftedX, shiftedY);
    });
    glitchContext.stroke();
  };

  glitchContext.beginPath();
  glitchContext.arc(figureX + jitter(), figureY - 160 * scale + jitter(), 35 * scale, 0, Math.PI * 2);
  glitchContext.stroke();
  line([[-35, -120], [-72, -92], [-87, 0], [-68, 105]]);
  line([[35, -120], [72, -92], [87, 0], [68, 105]]);
  line([[-35, -120], [-15, -135], [15, -135], [35, -120], [44, 50], [31, 155]]);
  line([[-35, -120], [-44, 50], [-31, 155]]);
  line([[-35, -120], [-105, -45], [-135, 40]]);
  line([[35, -120], [105, -45], [135, 40]]);
  glitchContext.shadowBlur = 0;
  glitchAnimation = requestAnimationFrame(drawGlitch);
}

function setGlitchState(isActive) {
  if (isActive && !glitchAnimation) drawGlitch();
  if (!isActive && glitchAnimation) {
    cancelAnimationFrame(glitchAnimation);
    glitchAnimation = undefined;
    glitchContext.clearRect(0, 0, glitchCanvas.width, glitchCanvas.height);
  }
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeOptions.querySelectorAll('[data-theme]').forEach((button) => {
    const isActive = button.dataset.theme === theme;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  localStorage.setItem('cmd-library-theme', theme);
  setMatrixState(theme === 'matrix');
  setGlitchState(theme === 'greyscale');
  setRickState(theme === 'default');
}

function render() {
  const query = search.value.trim().toLowerCase();
  const pageCommands = commands.filter((item) => item.page === activePage);
  filters.querySelectorAll('[data-filter]').forEach((button) => {
    const filter = button.dataset.filter;
    const count = filter === 'all'
      ? pageCommands.length
      : pageCommands.filter((item) => item.category === filter).length;
    button.querySelector('span').textContent = String(count);
  });
  const visible = pageCommands.filter((item) => {
    const matchesFilter = activeFilter === 'all' || item.category === activeFilter;
    const searchable = `${item.name} ${item.label} ${item.description} ${item.command}`.toLowerCase();
    return matchesFilter && searchable.includes(query);
  });

  resultCount.textContent = String(visible.length).padStart(2, '0');
  emptyState.hidden = visible.length > 0;
  pageNote.textContent = pageNames[activePage];
  pageButtons.innerHTML = [1, 2, 3].map((page) => `
    <button class="page-button${page === activePage ? ' is-active' : ''}" data-page="${page}" type="button" aria-current="${page === activePage ? 'page' : 'false'}">
      <span>0${page}</span>${pageNames[page].split(' / ')[0]}
    </button>
  `).join('');
  grid.innerHTML = visible.map((item, index) => `
    <article class="command-card">
      <div class="card-top"><span class="tag">${item.label}</span><span class="card-number">${String(index + 1).padStart(2, '0')}</span></div>
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <div class="command-line"><span>${item.command}</span><button class="copy-button" type="button" data-command="${encodeURIComponent(item.command)}">COPY</button></div>
    </article>
  `).join('');
}

filters.addEventListener('click', (event) => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  activeFilter = button.dataset.filter;
  activePage = 1;
  filters.querySelectorAll('.filter-button').forEach((item) => item.classList.toggle('is-active', item === button));
  render();
});
pageButtons.addEventListener('click', (event) => {
  const button = event.target.closest('[data-page]');
  if (!button) return;
  activePage = Number(button.dataset.page);
  render();
  document.querySelector('.library-heading').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
search.addEventListener('input', render);
grid.addEventListener('click', async (event) => {
  const button = event.target.closest('.copy-button');
  if (!button) return;
  const command = decodeURIComponent(button.dataset.command);
  try {
    await navigator.clipboard.writeText(command);
    button.textContent = 'COPIED';
    setTimeout(() => { button.textContent = 'COPY'; }, 1300);
  } catch {
    button.textContent = 'SELECT';
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && document.activeElement !== search) {
    event.preventDefault();
    search.focus();
  }
});

themeOptions.addEventListener('click', (event) => {
  const button = event.target.closest('[data-theme]');
  if (button) setTheme(button.dataset.theme);
});

render();
setTheme(localStorage.getItem('cmd-library-theme') || 'default');
loadRickStream().then(() => setRickState(document.documentElement.dataset.theme === 'default'));
resizeMatrix();
resizeGlitch();
window.addEventListener('resize', () => {
  resizeMatrix();
  resizeGlitch();
});
