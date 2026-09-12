const imageInput = document.querySelector('#image-input');
const dropZone = document.querySelector('#drop-zone');
const imageStack = document.querySelector('#image-stack');
const scanButton = document.querySelector('#scan-button');
const chatForm = document.querySelector('#chat-form');
const promptInput = document.querySelector('#prompt');
const webToggle = document.querySelector('#web-toggle');
const conversation = document.querySelector('#conversation');
const scope = document.querySelector('#scope');
const scopeStatus = document.querySelector('#scope-status');
const voiceCaption = document.querySelector('#voice-caption');
const clock = document.querySelector('#clock');

const scopeContext = scope.getContext('2d');
const imageContext = { files: [], previews: [], ocrText: '' };
let speaking = false;
let speechStartedAt = 0;
let animationFrame;

function updateClock() {
  clock.textContent = new Date().toLocaleTimeString([], { hour12: false });
}
setInterval(updateClock, 1000);
updateClock();

function renderImages() {
  imageStack.innerHTML = '';
  if (!imageContext.previews.length) {
    imageStack.innerHTML = '<div class="empty-state">No images loaded.<br><span>Your visual context will appear here.</span></div>';
  } else {
    imageContext.previews.forEach((preview, index) => {
      const card = document.createElement('div');
      card.className = 'image-card';
      card.innerHTML = `<img src="${preview.url}" alt="Imported image ${index + 1}"><span>IMG ${String(index + 1).padStart(2, '0')}</span>`;
      imageStack.append(card);
    });
  }
  scanButton.disabled = !imageContext.files.length;
}

function loadImages(files) {
  const validFiles = [...files].filter((file) => file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024);
  imageContext.files = validFiles;
  imageContext.previews.forEach((preview) => URL.revokeObjectURL(preview.url));
  imageContext.previews = validFiles.map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));
  imageContext.ocrText = '';
  renderImages();
}

imageInput.addEventListener('change', () => loadImages(imageInput.files));
['dragenter', 'dragover'].forEach((eventName) => dropZone.addEventListener(eventName, (event) => {
  event.preventDefault();
  dropZone.classList.add('is-dragging');
}));
['dragleave', 'drop'].forEach((eventName) => dropZone.addEventListener(eventName, (event) => {
  event.preventDefault();
  dropZone.classList.remove('is-dragging');
}));
dropZone.addEventListener('drop', (event) => loadImages(event.dataTransfer.files));

async function scanImages() {
  if (!imageContext.files.length || !window.Tesseract) return;
  scanButton.disabled = true;
  scanButton.innerHTML = '<span>◌</span> Scanning...';
  try {
    const results = await Promise.all(imageContext.files.map((file) => Tesseract.recognize(file, 'eng')));
    imageContext.ocrText = results.map((result) => result.data.text.trim()).filter(Boolean).join('\n');
    addMessage('assistant', imageContext.ocrText ? `I found this text in the image:\n\n${imageContext.ocrText}` : 'I could not find readable text in the imported image, but I can still help describe or reason about it.');
    speak(imageContext.ocrText ? `I found readable text in the image. ${imageContext.ocrText}` : 'I could not find readable text in the imported image.');
  } catch (error) {
    addMessage('assistant', 'The scan could not finish. The image is still loaded and ready to view.');
  } finally {
    scanButton.disabled = false;
    scanButton.innerHTML = '<span>◎</span> Scan visible text';
  }
}
scanButton.addEventListener('click', scanImages);

function addMessage(role, text, label = role === 'user' ? 'YOU / NOW' : 'DT-GPT / NOW') {
  const article = document.createElement('article');
  article.className = `message message--${role}`;
  const safeText = text.replace(/[&<>]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character]);
  article.innerHTML = `<div class="avatar">${role === 'user' ? 'YOU' : 'DT'}</div><div class="message-body"><span class="message-label">${label}</span><p>${safeText.replace(/\n/g, '<br>')}</p></div>`;
  conversation.append(article);
  conversation.scrollTop = conversation.scrollHeight;
}

function answerQuestion(question) {
  const lowerQuestion = question.toLowerCase();
  const hasImage = imageContext.files.length > 0;
  if (lowerQuestion.includes('describe') || lowerQuestion.includes('see') || lowerQuestion.includes('image')) {
    return hasImage ? `I can see ${imageContext.files.length === 1 ? 'one imported image' : `${imageContext.files.length} imported images`}. ${imageContext.ocrText ? `The readable context includes: ${imageContext.ocrText.slice(0, 260)}.` : 'Run “Scan visible text” if you want me to inspect words inside it.'}` : 'I do not have an image in context yet. Import one on the left and I will use it in our conversation.';
  }
  if (lowerQuestion.includes('text') || lowerQuestion.includes('read')) {
    return imageContext.ocrText ? `The latest scan found: ${imageContext.ocrText}` : hasImage ? 'There is an image ready, but I have not scanned it yet. Press “Scan visible text” to run OCR.' : 'Import an image first, then I can scan its visible text.';
  }
  if (lowerQuestion.includes('who are you') || lowerQuestion.includes('what are you')) return 'I am DT-GPT, a browser-based visual assistant. I can hold image context, answer questions, and speak responses aloud without storing a session on a server.';
  if (lowerQuestion.includes('idea') || lowerQuestion.includes('creative')) return 'Try asking me to turn the image into a color palette, a caption, a design critique, or three unexpected story prompts.';
  if (lowerQuestion.includes('help')) return 'Try “describe the image,” “what text can you read?”, or ask a normal question. The yellow send button and suggestion chips are ready when you are.';
  return `I’m tracking that question locally. My read is: ${question.replace(/[?.!]+$/, '')}. Add an image or ask for a description, text scan, idea, or explanation and I can make the response more specific.`;
}

async function searchWeb(question) {
  const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(question)}&srlimit=3&srprop=snippet&format=json&origin=*`;
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error('Web lookup failed');
  const data = await response.json();
  const results = data.query?.search || [];
  if (!results.length) return 'I searched the web but did not find a useful result for that question.';
  const sourceLines = results.map((result) => {
    const snippet = result.snippet.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
    const link = `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title.replaceAll(' ', '_'))}`;
    return `${result.title}: ${snippet} [${link}]`;
  });
  return `I found live web context for “${question}”:\n\n${sourceLines.join('\n\n')}\n\nThese are search results, so check the linked sources for the full context.`;
}

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = .96;
  utterance.pitch = .9;
  utterance.onstart = () => { speaking = true; speechStartedAt = performance.now(); scopeStatus.textContent = 'SPEAKING'; voiceCaption.textContent = 'Response in progress'; };
  utterance.onend = () => { speaking = false; scopeStatus.textContent = 'STANDBY'; voiceCaption.textContent = 'Waiting for a question'; };
  utterance.onerror = utterance.onend;
  speechSynthesis.speak(utterance);
}

function drawScope(time = 0) {
  const width = scope.clientWidth * window.devicePixelRatio;
  const height = scope.clientHeight * window.devicePixelRatio;
  if (scope.width !== width || scope.height !== height) { scope.width = width; scope.height = height; }
  scopeContext.clearRect(0, 0, width, height);
  scopeContext.beginPath();
  scopeContext.lineWidth = 2 * window.devicePixelRatio;
  scopeContext.strokeStyle = speaking ? '#7ee5d0' : 'rgba(126, 229, 208, .25)';
  const phase = speaking ? (time - speechStartedAt) / 170 : time / 900;
  for (let x = 0; x <= width; x += 3) {
    const normalized = x / width;
    const envelope = speaking ? .12 + Math.sin(normalized * Math.PI) * .88 : .08;
    const noise = Math.sin(normalized * 38 + phase * 4) * .22 + Math.sin(normalized * 92 - phase * 7) * .1;
    const y = height / 2 + (speaking ? Math.sin(normalized * 22 + phase * 2) * envelope * height * .25 + noise * height * envelope : Math.sin(normalized * 12 + phase) * height * .04);
    if (x === 0) scopeContext.moveTo(x, y); else scopeContext.lineTo(x, y);
  }
  scopeContext.stroke();
  animationFrame = requestAnimationFrame(drawScope);
}
drawScope();

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const question = promptInput.value.trim();
  if (!question) return;
  addMessage('user', question);
  promptInput.value = '';
  const answer = webToggle.checked
    ? await searchWeb(question).catch(() => 'I could not reach the web right now. I can still answer from the local conversation context.')
    : answerQuestion(question);
  window.setTimeout(() => { addMessage('assistant', answer); speak(answer); }, 260);
});
promptInput.addEventListener('input', () => { promptInput.style.height = 'auto'; promptInput.style.height = `${Math.min(promptInput.scrollHeight, 112)}px`; });
promptInput.addEventListener('keydown', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); chatForm.requestSubmit(); } });
document.querySelectorAll('[data-prompt]').forEach((button) => button.addEventListener('click', () => {
  promptInput.value = button.dataset.prompt;
  if (button.dataset.web === 'true') webToggle.checked = true;
  promptInput.focus();
}));

window.addEventListener('beforeunload', () => {
  cancelAnimationFrame(animationFrame);
  imageContext.previews.forEach((preview) => URL.revokeObjectURL(preview.url));
});
