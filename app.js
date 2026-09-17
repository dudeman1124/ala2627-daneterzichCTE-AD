const directoryForm = document.querySelector('#directory-form');
const directoryInput = document.querySelector('#directory-input');
const directoryStatus = document.querySelector('#directory-status');

const projectDirectories = new Map([
  ['cmd-library', 'cmd-library'],
  ['polytrack-inspiration', 'Polytrack-Inspiration'],
  ['dt-gpt', 'DT-GPT'],
  ['smoke-detector', 'smoke-detector'],
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
