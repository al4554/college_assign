// List of media items (2 videos and 2 audio files)
const mediaList = [
  { id: 1, title: 'Nature Exploration', type: 'video', src: 'assets/videos/video1.mp4', thumb: 'assets/images/video1_thumb.svg' },
  { id: 2, title: 'City Timelapse', type: 'video', src: 'assets/videos/video2.mp4', thumb: 'assets/images/video2_thumb.svg' },
  { id: 3, title: 'Morning Acoustic', type: 'audio', src: 'assets/audio/audio1.mp3', thumb: 'assets/images/audio1_cover.svg' },
  { id: 4, title: 'Lo-Fi Chill Beats', type: 'audio', src: 'assets/audio/audio2.mp3', thumb: 'assets/images/audio2_cover.svg' }
];

// DOM Elements
const videoElement = document.getElementById('video-element');
const audioElement = document.getElementById('audio-element');
const videoBox = document.getElementById('video-box');
const audioBox = document.getElementById('audio-box');
const audioCover = document.getElementById('audio-cover');
const mediaTitle = document.getElementById('media-title');
const mediaType = document.getElementById('media-type');
const statusMsg = document.getElementById('status-msg');

// Controls Elements
const playBtn = document.getElementById('play-btn');
const stopBtn = document.getElementById('stop-btn');
const seekBar = document.getElementById('seek-bar');
const timeDisplay = document.getElementById('time-display');
const muteBtn = document.getElementById('mute-btn');
const volumeBar = document.getElementById('volume-bar');

// Gallery Grids
const videoGrid = document.getElementById('video-grid');
const audioGrid = document.getElementById('audio-grid');

// State variables
let activeMedia = videoElement;
let currentItem = null;
let isSeeking = false;

// Format seconds into MM:SS format
function formatTime(seconds) {
  if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Select and load a media item
function selectMedia(item, autoPlay = false) {
  // Pause any currently playing media
  if (activeMedia) {
    activeMedia.pause();
    activeMedia.currentTime = 0;
  }

  currentItem = item;
  statusMsg.classList.add('hidden');
  playBtn.textContent = 'Play';

  // Update title & badge
  mediaTitle.textContent = item.title;
  mediaType.textContent = item.type === 'video' ? 'Video' : 'Audio';

  if (item.type === 'video') {
    activeMedia = videoElement;
    videoBox.classList.remove('hidden');
    audioBox.classList.add('hidden');
    videoElement.poster = item.thumb;
    videoElement.src = item.src;
    videoElement.load();
  } else {
    activeMedia = audioElement;
    videoBox.classList.add('hidden');
    audioBox.classList.remove('hidden');
    audioCover.src = item.thumb;
    audioElement.src = item.src;
    audioElement.load();
  }

  // Highlight active card
  document.querySelectorAll('.card').forEach(card => {
    card.classList.toggle('active', parseInt(card.dataset.id) === item.id);
  });

  // Reset seek bar
  seekBar.value = 0;
  timeDisplay.textContent = '00:00 / 00:00';

  if (autoPlay) {
    activeMedia.play().catch(err => {
      console.log('Autoplay handled:', err);
    });
  }
}

// Play / Pause Toggle
playBtn.addEventListener('click', () => {
  if (activeMedia.paused || activeMedia.ended) {
    activeMedia.play().catch(err => console.log('Playback error:', err));
  } else {
    activeMedia.pause();
  }
});

// Stop button
stopBtn.addEventListener('click', () => {
  activeMedia.pause();
  activeMedia.currentTime = 0;
  seekBar.value = 0;
  playBtn.textContent = 'Play';
});

// Update Play/Pause button text on media state change
[videoElement, audioElement].forEach(media => {
  media.addEventListener('play', () => playBtn.textContent = 'Pause');
  media.addEventListener('pause', () => playBtn.textContent = 'Play');
  media.addEventListener('ended', () => {
    playBtn.textContent = 'Play';
    seekBar.value = 0;
  });

  // When metadata loads, display duration
  media.addEventListener('loadedmetadata', () => {
    if (media === activeMedia) {
      timeDisplay.textContent = `${formatTime(media.currentTime)} / ${formatTime(media.duration)}`;
    }
  });

  // Continuously synchronize time and progress bar
  media.addEventListener('timeupdate', () => {
    if (media === activeMedia && !isSeeking) {
      timeDisplay.textContent = `${formatTime(media.currentTime)} / ${formatTime(media.duration)}`;
      if (media.duration > 0) {
        seekBar.value = (media.currentTime / media.duration) * 100;
      }
    }
  });

  // Gracefully handle placeholder / dummy file errors
  media.addEventListener('error', () => {
    if (media === activeMedia) {
      statusMsg.textContent = `Notice: "${currentItem.src}" is currently a dummy placeholder. Replace it in the assets folder to play.`;
      statusMsg.classList.remove('hidden');
      playBtn.textContent = 'Play';
    }
  });
});

// Seeking logic
seekBar.addEventListener('input', () => {
  isSeeking = true;
});

seekBar.addEventListener('change', () => {
  if (activeMedia.duration > 0) {
    activeMedia.currentTime = (seekBar.value / 100) * activeMedia.duration;
  }
  isSeeking = false;
});

// Volume control
volumeBar.addEventListener('input', (e) => {
  activeMedia.volume = e.target.value;
  if (activeMedia.volume > 0 && activeMedia.muted) {
    activeMedia.muted = false;
    muteBtn.textContent = 'Mute';
  }
});

// Mute / Unmute control
muteBtn.addEventListener('click', () => {
  activeMedia.muted = !activeMedia.muted;
  muteBtn.textContent = activeMedia.muted ? 'Unmute' : 'Mute';
});

// Render media cards into gallery
function renderGallery() {
  mediaList.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = item.id;
    card.innerHTML = `
      <img src="${item.thumb}" alt="${item.title}">
      <div class="card-content">
        <h4>${item.title}</h4>
        <button type="button">Select &amp; Play</button>
      </div>
    `;

    card.addEventListener('click', () => selectMedia(item, true));

    if (item.type === 'video') {
      videoGrid.appendChild(card);
    } else {
      audioGrid.appendChild(card);
    }
  });
}

// Initial setup on page load
renderGallery();
selectMedia(mediaList[0], false);
