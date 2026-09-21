const directoryForm = document.querySelector('#directory-form');
const directoryInput = document.querySelector('#directory-input');
const directoryStatus = document.querySelector('#directory-status');
const rickOutput = document.querySelector('#rick-output');

let rickFrames = [];
let rickFrameIndex = 0;

async function loadRickStream() {
  try {
    const response = await fetch('cmd-library/assets/rick-ascii-stream.txt');
    const stream = await response.text();
    rickFrames = stream.split('\x1b[2J\x1b[H').map((frame) => frame.trim()).filter(Boolean);
    if (rickFrames.length) {
      rickOutput.textContent = rickFrames[0];
      window.setInterval(() => {
        rickFrameIndex = (rickFrameIndex + 1) % rickFrames.length;
        rickOutput.textContent = rickFrames[rickFrameIndex];
      }, 90);
    }
  } catch {
    rickOutput.textContent = 'Unable to connect. Try: curl ascii.live/rick';
  }
}

const projectDirectories = new Map([
  ['cmd-library', 'cmd-library'],
  ['polytrack-inspiration', 'Polytrack-Inspiration'],
  ['dt-gpt', 'DT-GPT'],
  ['smoke-detector', 'smoke-detector'],
  ['3d space', '3D Space'],
  ['assignments/01-this-is-me', 'assignments/01-this-is-me']
]);

directoryForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const requestedDirectory = directoryInput.value.trim().replace(/^\/+|\/+$/g, '').toLowerCase();
  const directory = projectDirectories.get(requestedDirectory);

  if (!directory) {
    directoryStatus.textContent = 'Directory not found. Choose a project from the list.';
    directoryStatus.classList.add('is-error');
    directoryInput.focus();
    return;
  }

  window.location.href = `${directory}/`;
});

directoryInput.addEventListener('input', () => {
  directoryStatus.textContent = 'Type a project directory and press Enter.';
  directoryStatus.classList.remove('is-error');
});

loadRickStream();
