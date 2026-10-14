/**
 * OmniMedia Studio - HTML5 Audio & Video Multimedia Gallery
 * Pure Vanilla JavaScript implementation of HTML5 Media API
 * Supports media switching, custom playback deck, synchronized time/progress,
 * volume, rate, fullscreen, and graceful error handling.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. Media Library Data Definition
     ========================================================================== */
  const mediaLibrary = [
    {
      id: 'video-1',
      type: 'video',
      title: 'Nature & Wildlife Sanctuary',
      category: 'Documentary',
      author: 'Earth Cinematics',
      src: 'assets/videos/video1.mp4',
      thumbnail: 'assets/images/video1_thumb.svg',
      description: 'High-definition exploration of serene mountain valleys, pristine rivers, and alpine landscapes.'
    },
    {
      id: 'video-2',
      type: 'video',
      title: 'Futuristic Cyberpunk Metropolis',
      category: 'Urban Timelapse',
      author: 'Neon Horizons',
      src: 'assets/videos/video2.mp4',
      thumbnail: 'assets/images/video2_thumb.svg',
      description: 'Vibrant neon cityscapes, nighttime illuminated skyscrapers, and high-speed transit flow.'
    },
    {
      id: 'audio-1',
      type: 'audio',
      title: 'Morning Acoustic Serenade',
      category: 'Acoustic / Instrumental',
      author: 'Horizon Strings',
      src: 'assets/audio/audio1.mp3',
      thumbnail: 'assets/images/audio1_cover.svg',
      description: 'Peaceful fingerstyle acoustic guitar melody designed for morning calm and focused productivity.'
    },
    {
      id: 'audio-2',
      type: 'audio',
      title: 'Lo-Fi Chillhop Study Beats',
      category: 'Lo-Fi / Ambient',
      author: 'Midnight Producer',
      src: 'assets/audio/audio2.mp3',
      thumbnail: 'assets/images/audio2_cover.svg',
      description: 'Mellow vinyl crackles, jazzy electric piano chords, and a relaxing rhythm for studying or relaxing.'
    }
  ];

  /* ==========================================================================
     2. DOM Element Selectors
     ========================================================================== */
  // Media Elements
  const sharedVideo = document.getElementById('shared-video');
  const sharedAudio = document.getElementById('shared-audio');
  const videoStage = document.getElementById('video-stage');
  const audioStage = document.getElementById('audio-stage');
  const videoContainer = document.getElementById('video-container');

  // Header & Now Playing Elements
  const statusPill = document.getElementById('status-pill');
  const statusText = document.getElementById('status-text');
  const nowPlayingType = document.getElementById('now-playing-type');
  const nowPlayingTitle = document.getElementById('now-playing-title');
  const nowPlayingAuthor = document.getElementById('now-playing-author');
  const nowPlayingFile = document.getElementById('now-playing-file');

  // Notice Banner Elements
  const noticeBanner = document.getElementById('notice-banner');
  const noticeTitle = document.getElementById('notice-title');
  const noticeMessage = document.getElementById('notice-message');
  const noticeCloseBtn = document.getElementById('notice-close-btn');

  // Audio Showcase Elements
  const audioAlbumCover = document.getElementById('audio-album-cover');
  const audioTrackTitle = document.getElementById('audio-track-title');
  const audioTrackArtist = document.getElementById('audio-track-artist');
  const audioCategoryPill = document.getElementById('audio-category-pill');

  // Video Overlay Play
  const videoCenterPlay = document.getElementById('video-center-play');

  // Controls Deck Elements
  const seekSlider = document.getElementById('seek-slider');
  const currentTimeEl = document.getElementById('current-time');
  const totalDurationEl = document.getElementById('total-duration');
  const btnPlayPause = document.getElementById('btn-play-pause');
  const btnStop = document.getElementById('btn-stop');
  const btnSkipBackward = document.getElementById('btn-skip-backward');
  const btnSkipForward = document.getElementById('btn-skip-forward');
  const btnMuteUnmute = document.getElementById('btn-mute-unmute');
  const volumeSlider = document.getElementById('volume-slider');
  const volumeValText = document.getElementById('volume-val-text');
  const speedSelect = document.getElementById('speed-select');
  const btnFullscreen = document.getElementById('btn-fullscreen');

  // Gallery Elements
  const galleryGrid = document.getElementById('gallery-grid');
  const galleryCount = document.getElementById('gallery-count');
  const filterTabs = document.querySelectorAll('.tab-btn');

  // Diagnostics Inspector Elements
  const inspElement = document.getElementById('insp-element');
  const inspState = document.getElementById('insp-state');
  const inspCurrentTime = document.getElementById('insp-current-time');
  const inspDuration = document.getElementById('insp-duration');
  const inspVolume = document.getElementById('insp-volume');
  const inspReadyState = document.getElementById('insp-ready-state');
  const inspNetworkState = document.getElementById('insp-network-state');
  const inspRate = document.getElementById('insp-rate');

  /* ==========================================================================
     3. State Management
     ========================================================================== */
  let activeItem = null;
  let activeElement = sharedVideo; // Current active HTMLMediaElement (<video> or <audio>)
  let isDraggingSeek = false;
  let currentFilter = 'all';

  const READY_STATES = [
    'HAVE_NOTHING (0)',
    'HAVE_METADATA (1)',
    'HAVE_CURRENT_DATA (2)',
    'HAVE_FUTURE_DATA (3)',
    'HAVE_ENOUGH_DATA (4)'
  ];

  const NETWORK_STATES = [
    'NETWORK_EMPTY (0)',
    'NETWORK_IDLE (1)',
    'NETWORK_LOADING (2)',
    'NETWORK_NO_SOURCE (3)'
  ];

  /* ==========================================================================
     4. Helper Functions
     ========================================================================== */

  /**
   * Safely formats raw seconds into MM:SS format.
   * Handles NaN, Infinite, null, undefined, or negative values.
   */
  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
      return '00:00';
    }
    const totalSec = Math.floor(seconds);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  /**
   * Updates the top status indicator pill.
   */
  function setStatus(text, stateClass = '') {
    statusText.textContent = text;
    statusPill.className = 'status-indicator';
    if (stateClass) {
      statusPill.classList.add(stateClass);
    }
  }

  /**
   * Shows an informational or error notice banner.
   */
  function showNotice(title, message, isError = false) {
    noticeTitle.textContent = title;
    noticeMessage.innerHTML = message;
    noticeBanner.className = `notice-banner ${isError ? 'error' : ''}`;
    noticeBanner.classList.remove('hidden');
  }

  /**
   * Hides the notice banner.
   */
  function hideNotice() {
    noticeBanner.classList.add('hidden');
  }

  /**
   * Synchronizes UI Play/Pause button icons with playback state.
   */
  function updatePlayPauseIcons(isPlaying) {
    const deckPlayIcon = btnPlayPause.querySelector('.icon-play');
    const deckPauseIcon = btnPlayPause.querySelector('.icon-pause');
    const videoPlayIcon = videoCenterPlay.querySelector('.icon-play');
    const videoPauseIcon = videoCenterPlay.querySelector('.icon-pause');

    if (isPlaying) {
      deckPlayIcon.classList.add('hidden');
      deckPauseIcon.classList.remove('hidden');
      btnPlayPause.setAttribute('aria-label', 'Pause');
      btnPlayPause.setAttribute('title', 'Pause');

      videoPlayIcon.classList.add('hidden');
      videoPauseIcon.classList.remove('hidden');
      videoCenterPlay.setAttribute('aria-label', 'Pause video');

      videoContainer.classList.add('is-playing');
      audioStage.classList.add('is-playing');
    } else {
      deckPlayIcon.classList.remove('hidden');
      deckPauseIcon.classList.add('hidden');
      btnPlayPause.setAttribute('aria-label', 'Play');
      btnPlayPause.setAttribute('title', 'Play');

      videoPlayIcon.classList.remove('hidden');
      videoPauseIcon.classList.add('hidden');
      videoCenterPlay.setAttribute('aria-label', 'Play video');

      videoContainer.classList.remove('is-playing');
      audioStage.classList.remove('is-playing');
    }
  }

  /**
   * Synchronizes UI Volume/Mute controls with media state.
   */
  function updateVolumeUI() {
    const isMuted = activeElement.muted || activeElement.volume === 0;
    const volHighIcon = btnMuteUnmute.querySelector('.icon-vol-high');
    const volMuteIcon = btnMuteUnmute.querySelector('.icon-vol-mute');

    if (isMuted) {
      volHighIcon.classList.add('hidden');
      volMuteIcon.classList.remove('hidden');
      btnMuteUnmute.setAttribute('aria-label', 'Unmute');
      btnMuteUnmute.setAttribute('title', 'Unmute');
      volumeSlider.value = 0;
      volumeValText.textContent = '0%';
    } else {
      volHighIcon.classList.remove('hidden');
      volMuteIcon.classList.add('hidden');
      btnMuteUnmute.setAttribute('aria-label', 'Mute');
      btnMuteUnmute.setAttribute('title', 'Mute');
      volumeSlider.value = activeElement.volume;
      const pct = Math.round(activeElement.volume * 100);
      volumeValText.textContent = `${pct}%`;
    }
  }

  /**
   * Updates the HTML5 Media API Diagnostics Inspector Panel.
   */
  function updateDiagnostics() {
    if (!inspElement) return;

    inspElement.textContent = activeElement === sharedVideo ? '<video>' : '<audio>';
    inspState.textContent = activeElement.ended ? 'Ended' : (activeElement.paused ? 'Paused' : 'Playing');
    inspCurrentTime.textContent = `${activeElement.currentTime.toFixed(2)}s`;
    
    const dur = activeElement.duration;
    inspDuration.textContent = (isFinite(dur) && !isNaN(dur)) ? `${dur.toFixed(2)}s` : 'Unknown / Loading';

    const volPct = Math.round(activeElement.volume * 100);
    inspVolume.textContent = `${volPct}% ${activeElement.muted ? '(Muted)' : '(Unmuted)'}`;

    inspReadyState.textContent = READY_STATES[activeElement.readyState] || `Unknown (${activeElement.readyState})`;
    inspNetworkState.textContent = NETWORK_STATES[activeElement.networkState] || `Unknown (${activeElement.networkState})`;
    inspRate.textContent = `${activeElement.playbackRate}×`;
  }

  /* ==========================================================================
     5. Media Selection & Switching Logic
     ========================================================================== */

  /**
   * Selects a media item, updates player source, switches view, and optionally starts playback.
   * @param {Object} item - Media item from mediaLibrary.
   * @param {boolean} shouldAutoPlay - Whether to trigger play() immediately.
   */
  function selectMedia(item, shouldAutoPlay = false) {
    if (!item) return;

    // Reset current active player to prevent stale playback or overlapping sound
    if (activeElement) {
      activeElement.pause();
      activeElement.currentTime = 0;
    }

    activeItem = item;
    hideNotice();

    // Reset seek progress bar
    seekSlider.value = 0;
    seekSlider.style.setProperty('--seek-progress', '0%');
    currentTimeEl.textContent = '00:00';
    totalDurationEl.textContent = '00:00';

    // Update banner metadata
    nowPlayingTitle.textContent = item.title;
    nowPlayingAuthor.textContent = `${item.author} • ${item.category}`;
    nowPlayingFile.textContent = item.src;

    if (item.type === 'video') {
      activeElement = sharedVideo;
      nowPlayingType.textContent = 'Video';
      nowPlayingType.className = 'badge';

      // Switch stage visibility
      videoStage.classList.remove('hidden');
      audioStage.classList.add('hidden');
      btnFullscreen.style.display = 'inline-flex';

      // Set poster to matching thumbnail
      sharedVideo.poster = item.thumbnail;

      // Update source and reload
      sharedVideo.src = item.src;
      sharedVideo.load();

    } else {
      activeElement = sharedAudio;
      nowPlayingType.textContent = 'Audio';
      nowPlayingType.className = 'badge audio-badge';

      // Switch stage visibility
      videoStage.classList.add('hidden');
      audioStage.classList.remove('hidden');
      btnFullscreen.style.display = 'none';

      // Update audio card details
      audioAlbumCover.src = item.thumbnail;
      audioAlbumCover.alt = `${item.title} Album Cover`;
      audioTrackTitle.textContent = item.title;
      audioTrackArtist.textContent = item.author;
      audioCategoryPill.textContent = item.category;

      // Update source and reload
      sharedAudio.src = item.src;
      sharedAudio.load();
    }

    // Apply speed selection to newly active element
    activeElement.playbackRate = parseFloat(speedSelect.value) || 1.0;

    // Synchronize volume controls
    updateVolumeUI();
    updatePlayPauseIcons(false);
    setStatus('Ready', '');
    updateDiagnostics();
    highlightActiveCard(item.id);

    // Attempt playback if requested (e.g. user clicked selection)
    if (shouldAutoPlay) {
      playActiveMedia();
    }
  }

  /**
   * Highlights the active media card in the gallery list.
   */
  function highlightActiveCard(id) {
    const cards = galleryGrid.querySelectorAll('.media-card');
    cards.forEach(card => {
      if (card.dataset.id === id) {
        card.classList.add('is-active');
        const pill = card.querySelector('.card-active-pill');
        if (pill) pill.classList.remove('hidden');
        const btn = card.querySelector('.btn-select-media');
        if (btn) btn.textContent = 'Selected';
      } else {
        card.classList.remove('is-active');
        const pill = card.querySelector('.card-active-pill');
        if (pill) pill.classList.add('hidden');
        const btn = card.querySelector('.btn-select-media');
        if (btn) btn.textContent = 'Select & Play';
      }
    });
  }

  /* ==========================================================================
     6. Playback Control Actions
     ========================================================================== */

  /**
   * Safely plays the active media with Promise error handling.
   */
  function playActiveMedia() {
    if (!activeElement) return;

    setStatus('Loading...', '');
    const playPromise = activeElement.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setStatus('Playing', 'playing');
          updatePlayPauseIcons(true);
          updateDiagnostics();
        })
        .catch(err => {
          console.warn('Playback request was prevented or encountered an error:', err);
          updatePlayPauseIcons(false);
          setStatus('Ready to Play', 'paused');
          updateDiagnostics();
        });
    }
  }

  /**
   * Pauses the active media.
   */
  function pauseActiveMedia() {
    if (!activeElement) return;
    activeElement.pause();
    setStatus('Paused', 'paused');
    updatePlayPauseIcons(false);
    updateDiagnostics();
  }

  /**
   * Toggles between play and pause.
   */
  function togglePlayPause() {
    if (!activeElement) return;

    if (activeElement.paused || activeElement.ended) {
      playActiveMedia();
    } else {
      pauseActiveMedia();
    }
  }

  /**
   * Stops playback and resets to beginning.
   */
  function stopActiveMedia() {
    if (!activeElement) return;
    activeElement.pause();
    activeElement.currentTime = 0;
    seekSlider.value = 0;
    seekSlider.style.setProperty('--seek-progress', '0%');
    currentTimeEl.textContent = '00:00';
    updatePlayPauseIcons(false);
    setStatus('Stopped', '');
    updateDiagnostics();
  }

  /**
   * Seeks by offset in seconds (e.g., -10s or +10s).
   */
  function seekBy(secondsOffset) {
    if (!activeElement) return;
    const target = activeElement.currentTime + secondsOffset;
    const maxDur = isFinite(activeElement.duration) ? activeElement.duration : Infinity;
    activeElement.currentTime = Math.max(0, Math.min(target, maxDur));
    updateDiagnostics();
  }

  /**
   * Toggles mute state.
   */
  function toggleMute() {
    if (!activeElement) return;
    activeElement.muted = !activeElement.muted;
    updateVolumeUI();
    updateDiagnostics();
  }

  /**
   * Adjusts volume level.
   */
  function setVolume(value) {
    if (!activeElement) return;
    const val = parseFloat(value);
    activeElement.volume = Math.max(0, Math.min(1, val));
    if (val > 0 && activeElement.muted) {
      activeElement.muted = false;
    }
    updateVolumeUI();
    updateDiagnostics();
  }

  /**
   * Toggles browser Fullscreen mode for video.
   */
  function toggleFullscreen() {
    if (activeElement !== sharedVideo) return;

    if (!document.fullscreenElement) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      } else if (sharedVideo.requestFullscreen) {
        sharedVideo.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  /* ==========================================================================
     7. HTML5 Media API Event Handlers (Attached to both <video> and <audio>)
     ========================================================================== */

  function attachMediaEventListeners(mediaEl) {
    
    // Metadata loaded: duration is now available
    mediaEl.addEventListener('loadedmetadata', () => {
      if (mediaEl !== activeElement) return;
      if (isFinite(mediaEl.duration) && !isNaN(mediaEl.duration)) {
        totalDurationEl.textContent = formatTime(mediaEl.duration);
      } else {
        totalDurationEl.textContent = '00:00';
      }
      updateDiagnostics();
    });

    // Duration change (useful if variable stream or updated)
    mediaEl.addEventListener('durationchange', () => {
      if (mediaEl !== activeElement) return;
      if (isFinite(mediaEl.duration) && !isNaN(mediaEl.duration)) {
        totalDurationEl.textContent = formatTime(mediaEl.duration);
      }
      updateDiagnostics();
    });

    // Continuous time updates during playback
    mediaEl.addEventListener('timeupdate', () => {
      if (mediaEl !== activeElement) return;

      // Only update slider if user isn't currently dragging/scrubbing it
      if (!isDraggingSeek) {
        currentTimeEl.textContent = formatTime(mediaEl.currentTime);

        if (isFinite(mediaEl.duration) && mediaEl.duration > 0) {
          const progressPct = (mediaEl.currentTime / mediaEl.duration) * 100;
          seekSlider.value = progressPct;
          seekSlider.style.setProperty('--seek-progress', `${progressPct}%`);
        }
      }
      updateDiagnostics();
    });

    // Native play event
    mediaEl.addEventListener('play', () => {
      if (mediaEl !== activeElement) return;
      updatePlayPauseIcons(true);
      setStatus('Playing', 'playing');
      updateDiagnostics();
    });

    // Native pause event
    mediaEl.addEventListener('pause', () => {
      if (mediaEl !== activeElement) return;
      updatePlayPauseIcons(false);
      setStatus('Paused', 'paused');
      updateDiagnostics();
    });

    // Playback ended
    mediaEl.addEventListener('ended', () => {
      if (mediaEl !== activeElement) return;
      updatePlayPauseIcons(false);
      setStatus('Ended', '');
      seekSlider.value = 0;
      seekSlider.style.setProperty('--seek-progress', '0%');
      currentTimeEl.textContent = '00:00';
      updateDiagnostics();
    });

    // Volume changed
    mediaEl.addEventListener('volumechange', () => {
      if (mediaEl !== activeElement) return;
      updateVolumeUI();
      updateDiagnostics();
    });

    // Graceful error handling for missing/dummy media files
    mediaEl.addEventListener('error', (e) => {
      if (mediaEl !== activeElement) return;
      
      console.warn(`[HTML5 Media Error on ${mediaEl.tagName}]:`, mediaEl.error);
      updatePlayPauseIcons(false);
      setStatus('Dummy Placeholder File', 'error');

      const src = activeItem ? activeItem.src : 'media asset';
      const type = activeItem ? activeItem.type.toUpperCase() : 'media';

      showNotice(
        'Placeholder Dummy File Detected',
        `The file at <code>${src}</code> is a placeholder dummy. To hear audio or watch video, please copy your actual ${type} file into that path. The custom controls and HTML5 Media API remain fully connected.`,
        true
      );

      updateDiagnostics();
    });

    // Waiting / buffering
    mediaEl.addEventListener('waiting', () => {
      if (mediaEl !== activeElement) return;
      setStatus('Buffering...', '');
      updateDiagnostics();
    });

    // Can play
    mediaEl.addEventListener('canplay', () => {
      if (mediaEl !== activeElement) return;
      if (!mediaEl.paused) {
        setStatus('Playing', 'playing');
      } else {
        setStatus('Ready', '');
      }
      updateDiagnostics();
    });
  }

  // Attach events to both shared elements
  attachMediaEventListeners(sharedVideo);
  attachMediaEventListeners(sharedAudio);

  /* ==========================================================================
     8. Seek Bar & Dragging Events
     ========================================================================== */

  // While dragging (input event)
  seekSlider.addEventListener('input', (e) => {
    if (!activeElement) return;
    isDraggingSeek = true;

    const pct = parseFloat(e.target.value);
    seekSlider.style.setProperty('--seek-progress', `${pct}%`);

    if (isFinite(activeElement.duration) && activeElement.duration > 0) {
      const scrubbedTime = (pct / 100) * activeElement.duration;
      currentTimeEl.textContent = formatTime(scrubbedTime);
    }
  });

  // When released / committed (change event)
  seekSlider.addEventListener('change', (e) => {
    if (!activeElement) return;

    const pct = parseFloat(e.target.value);
    if (isFinite(activeElement.duration) && activeElement.duration > 0) {
      activeElement.currentTime = (pct / 100) * activeElement.duration;
    }
    isDraggingSeek = false;
    updateDiagnostics();
  });

  /* ==========================================================================
     9. Button Click & Input Event Listeners
     ========================================================================== */

  btnPlayPause.addEventListener('click', togglePlayPause);
  videoCenterPlay.addEventListener('click', togglePlayPause);
  btnStop.addEventListener('click', stopActiveMedia);
  btnSkipBackward.addEventListener('click', () => seekBy(-10));
  btnSkipForward.addEventListener('click', () => seekBy(10));
  btnMuteUnmute.addEventListener('click', toggleMute);
  volumeSlider.addEventListener('input', (e) => setVolume(e.target.value));
  btnFullscreen.addEventListener('click', toggleFullscreen);

  // Playback speed selector
  speedSelect.addEventListener('change', (e) => {
    if (!activeElement) return;
    activeElement.playbackRate = parseFloat(e.target.value);
    updateDiagnostics();
  });

  // Notice banner dismiss button
  noticeCloseBtn.addEventListener('click', hideNotice);

  // Keyboard shortcut: Spacebar toggles Play/Pause (when not focused on input/select/button)
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT' && e.target.tagName !== 'BUTTON') {
      e.preventDefault();
      togglePlayPause();
    }
  });

  /* ==========================================================================
     10. Gallery Rendering & Filtering
     ========================================================================== */

  function renderGallery() {
    galleryGrid.innerHTML = '';

    const filtered = mediaLibrary.filter(item => {
      if (currentFilter === 'all') return true;
      return item.type === currentFilter;
    });

    galleryCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'Item' : 'Items'}`;

    filtered.forEach(item => {
      const card = document.createElement('article');
      card.className = `media-card ${activeItem && activeItem.id === item.id ? 'is-active' : ''}`;
      card.dataset.id = item.id;
      card.tabIndex = 0; // Keyboard navigable

      const isVideo = item.type === 'video';

      card.innerHTML = `
        <div class="card-thumb-wrap">
          <img src="${item.thumbnail}" alt="${item.title} Preview" class="card-thumb" loading="lazy">
          <span class="card-type-badge ${isVideo ? 'badge-video' : 'badge-audio'}">
            ${isVideo ? '🎥 Video' : '🎵 Audio'}
          </span>
          <span class="card-active-pill ${activeItem && activeItem.id === item.id ? '' : 'hidden'}">
            Now Playing
          </span>
        </div>
        <div class="card-body">
          <div class="card-header-line">
            <span class="card-category">${item.category}</span>
            <span class="card-author">${item.author}</span>
          </div>
          <h3 class="card-title">${item.title}</h3>
          <p class="card-desc">${item.description}</p>
          <div class="card-footer">
            <span class="card-file-hint">${item.src.split('/').pop()}</span>
            <button type="button" class="btn-select-media">
              ${activeItem && activeItem.id === item.id ? 'Selected' : 'Select & Play'}
            </button>
          </div>
        </div>
      `;

      // Card click selects item and starts playback
      card.addEventListener('click', () => {
        selectMedia(item, true);
      });

      // Keyboard selection (Enter or Space)
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectMedia(item, true);
        }
      });

      galleryGrid.appendChild(card);
    });
  }

  // Filter Tabs Event Listeners
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      renderGallery();
    });
  });

  /* ==========================================================================
     11. Initial Application Setup
     ========================================================================== */

  // Load the first item into the player without autoplaying (as requested)
  if (mediaLibrary.length > 0) {
    selectMedia(mediaLibrary[0], false);
  }

  // Render gallery cards
  renderGallery();

});
