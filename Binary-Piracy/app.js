const fileInput = document.querySelector('#movie-files');
const movieSearch = document.querySelector('#movie-search');
const movieList = document.querySelector('#movie-list');
const libraryEmpty = document.querySelector('#library-empty');
const movieCount = document.querySelector('#movie-count');
const video = document.querySelector('#source-video');
const screen = document.querySelector('#screen');
const asciiFrame = document.querySelector('#ascii-frame');
const sampleCanvas = document.querySelector('#sample-canvas');
const sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });
const playButton = document.querySelector('#play-button');
const seekBar = document.querySelector('#seek-bar');
const currentTime = document.querySelector('#current-time');
const duration = document.querySelector('#duration');
const volume = document.querySelector('#volume');
const density = document.querySelector('#density');
const densityValue = document.querySelector('#density-value');
const nowPlaying = document.querySelector('#now-playing');
const playerStatus = document.querySelector('#player-status');
const playerMessage = document.querySelector('#player-message');
const screenResolution = document.querySelector('#screen-resolution');
const movies = [];
const glyphs = ' .,:;irsXA253hMHGS#9B&@';
let selectedMovie;
let frameRequest;
let lastFrame = 0;
let nextMovieId = 0;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function renderLibrary() {
  const query = movieSearch.value.trim().toLowerCase();
  const visibleMovies = movies.filter((movie) => movie.file.name.toLowerCase().includes(query));
  movieList.replaceChildren();
  movieCount.textContent = String(movies.length).padStart(2, '0');
  libraryEmpty.hidden = movies.length > 0;

  for (const movie of visibleMovies) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `movie-row${movie === selectedMovie ? ' is-active' : ''}`;
    button.setAttribute('aria-current', movie === selectedMovie ? 'true' : 'false');

    const icon = document.createElement('span');
    icon.className = 'movie-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '▶';

    const copy = document.createElement('span');
    copy.className = 'movie-row-copy';
    const title = document.createElement('span');
    title.className = 'movie-row-title';
    title.textContent = movie.file.name;
    const meta = document.createElement('span');
    meta.className = 'movie-row-meta';
    meta.textContent = `${formatSize(movie.file.size)} / LOCAL`;
    copy.append(title, meta);
    button.append(icon, copy);
    button.addEventListener('click', () => selectMovie(movie));
    movieList.append(button);
  }

  if (movies.length && !visibleMovies.length) {
    const emptyResult = document.createElement('p');
    emptyResult.className = 'library-footnote';
    emptyResult.textContent = 'No titles match that search.';
    movieList.append(emptyResult);
  }
}

function addFiles(fileList) {
  const acceptedFiles = [...fileList].filter((file) => file.type.startsWith('video/'));
  const skippedCount = fileList.length - acceptedFiles.length;

  for (const file of acceptedFiles) {
    movies.push({ id: nextMovieId++, file, url: URL.createObjectURL(file) });
  }

  renderLibrary();
  if (acceptedFiles.length) {
    playerMessage.textContent = `${acceptedFiles.length} VIDEO${acceptedFiles.length === 1 ? '' : 'S'} ADDED. SELECT ONE FROM YOUR SHELF.`;
  } else if (skippedCount) {
    playerMessage.textContent = 'That selection did not contain a supported video file.';
  }
  fileInput.value = '';
}

function selectMovie(movie) {
  selectedMovie = movie;
  video.src = movie.url;
  video.load();
  nowPlaying.textContent = movie.file.name;
  playerStatus.textContent = 'LOADING FILM';
  playerMessage.textContent = 'Decoding local video frames...';
  playButton.disabled = false;
  seekBar.disabled = false;
  renderLibrary();
  video.play().catch(() => {
    playerMessage.textContent = 'Video ready. Press play to start.';
  });
}

function renderAsciiFrame() {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth) return;

  const screenWidth = screen.clientWidth - 20;
  const fontSize = window.innerWidth <= 620 ? 6 : 8;
  const densityRatio = Number(density.value) / 100;
  const columns = Math.max(32, Math.min(220, Math.floor(screenWidth / (fontSize * 0.61) * densityRatio)));
  const rows = Math.max(12, Math.round(columns * (video.videoHeight / video.videoWidth) * 0.62));
  sampleCanvas.width = columns;
  sampleCanvas.height = rows;
  sampleContext.drawImage(video, 0, 0, columns, rows);
  const pixels = sampleContext.getImageData(0, 0, columns, rows).data;
  const output = new Array(rows);

  for (let row = 0; row < rows; row += 1) {
    let line = '';
    for (let column = 0; column < columns; column += 1) {
      const pixel = (row * columns + column) * 4;
      const luminance = (pixels[pixel] * 0.2126 + pixels[pixel + 1] * 0.7152 + pixels[pixel + 2] * 0.0722) / 255;
      const characterIndex = Math.min(glyphs.length - 1, Math.floor(luminance * (glyphs.length - 1)));
      line += glyphs[characterIndex];
    }
    output[row] = line;
  }

  asciiFrame.textContent = output.join('\n');
  screenResolution.textContent = `ASCII / ${String(columns).padStart(3, '0')} × ${String(rows).padStart(2, '0')}`;
  asciiFrame.style.fontSize = `${screenWidth / (columns * 0.61)}px`;
}

function drawFrames(timestamp) {
  if (video.paused || video.ended) return;
  frameRequest = window.requestAnimationFrame(drawFrames);
  if (timestamp - lastFrame < 1000 / 24) return;
  lastFrame = timestamp;
  renderAsciiFrame();
}

fileInput.addEventListener('change', () => addFiles(fileInput.files));
movieSearch.addEventListener('input', renderLibrary);
playButton.addEventListener('click', () => {
  if (video.paused) video.play().catch(() => {
    playerMessage.textContent = 'This video could not be played by your browser.';
  });
  else video.pause();
});
video.addEventListener('loadedmetadata', () => {
  duration.textContent = formatTime(video.duration);
  currentTime.textContent = '00:00';
});
video.addEventListener('loadeddata', () => {
  playerStatus.textContent = 'FILM READY';
  playerMessage.textContent = 'Playing local media. Frames are rendered on this device.';
  renderAsciiFrame();
  video.play().catch(() => {
    playerMessage.textContent = 'Video ready. Press play to start.';
  });
});
video.addEventListener('play', () => {
  playButton.textContent = 'Ⅱ';
  playButton.setAttribute('aria-label', 'Pause');
  playerStatus.textContent = 'NOW PLAYING';
  window.cancelAnimationFrame(frameRequest);
  frameRequest = window.requestAnimationFrame(drawFrames);
});
video.addEventListener('pause', () => {
  playButton.textContent = '▶';
  playButton.setAttribute('aria-label', 'Play');
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) renderAsciiFrame();
});
video.addEventListener('ended', () => {
  playerStatus.textContent = 'FILM ENDED';
  playerMessage.textContent = 'End of reel.';
});
video.addEventListener('timeupdate', () => {
  currentTime.textContent = formatTime(video.currentTime);
  if (!seekBar.matches(':active') && video.duration) seekBar.value = String(Math.round(video.currentTime / video.duration * 1000));
});
video.addEventListener('error', () => {
  if (selectedMovie) {
    playerStatus.textContent = 'UNSUPPORTED FORMAT';
    playerMessage.textContent = 'This browser cannot decode that file. Try an MP4 or WebM video.';
  }
});
seekBar.addEventListener('input', () => {
  if (video.duration) video.currentTime = Number(seekBar.value) / 1000 * video.duration;
});
volume.addEventListener('input', () => { video.volume = Number(volume.value) / 100; });
density.addEventListener('input', () => {
  densityValue.value = `${density.value}%`;
  renderAsciiFrame();
});
document.querySelector('#fullscreen-button').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else screen.requestFullscreen?.();
});
document.addEventListener('fullscreenchange', renderAsciiFrame);
window.addEventListener('resize', renderAsciiFrame);
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    event.preventDefault();
    movieSearch.focus();
  }
  if (event.key === 'Escape' && document.activeElement === movieSearch) {
    movieSearch.value = '';
    renderLibrary();
    movieSearch.blur();
  }
});

document.addEventListener('dragover', (event) => event.preventDefault());
document.addEventListener('drop', (event) => {
  event.preventDefault();
  if (event.dataTransfer?.files.length) addFiles(event.dataTransfer.files);
});

video.volume = Number(volume.value) / 100;
renderLibrary();
