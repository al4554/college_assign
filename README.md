# HTML5 Audio and Video Multimedia Gallery

A modern, responsive, and accessible **Multimedia Gallery** web application built with **HTML5**, **CSS3**, and **Vanilla JavaScript**.

---

## 📁 Project Structure

```text
q3_assign/
├── index.html                   # Main HTML5 page structure & dual-mode players
├── style.css                    # Responsive CSS3 styling & dark studio UI theme
├── script.js                    # Vanilla JavaScript (HTML5 Media API logic)
├── README.md                    # Project documentation & execution guide
└── assets/
    ├── README.md                # Quick guide for replacing media assets
    ├── videos/
    │   ├── video1.mp4           # [Dummy] Video 1: Nature & Wildlife Sanctuary
    │   └── video2.mp4           # [Dummy] Video 2: Futuristic Cyberpunk Metropolis
    ├── audio/
    │   ├── audio1.mp3           # [Dummy] Audio 1: Morning Acoustic Serenade
    │   └── audio2.mp3           # [Dummy] Audio 2: Lo-Fi Chillhop Study Beats
    └── images/
        ├── video1_thumb.svg     # Vector thumbnail for Video 1
        ├── video2_thumb.svg     # Vector thumbnail for Video 2
        ├── audio1_cover.svg     # Vector album cover for Audio 1
        └── audio2_cover.svg     # Vector album cover for Audio 2
```

---

## 🎯 Key Features & Requirements Covered

### 1. Multimedia Gallery
- **4 Media Items Pre-configured**: 2 high-definition video slots and 2 high-fidelity audio slots.
- **Filter Tabs**: Toggle between **All Media**, **Videos**, and **Audio**.
- **Rich Media Cards**: Each card displays a title, category tag, author/artist, thumbnail, filename, and a "Select & Play" button.
- **Active State Indicator**: Highlights the currently playing card with a glowing border and a "Now Playing" badge.

### 2. Dual Shared Players (Video & Audio)
- Uses **one shared `<video>` element** and **one shared `<audio>` element**.
- Switches automatically between video theater mode and audio album mode depending on the selected media type.
- Switching resets playback position (`currentTime = 0`), calls `load()`, updates the title/metadata, and prevents overlapping audio.
- Initial page load selects the first item without autoplaying (respecting browser autoplay policies).

### 3. Custom Playback Control Deck
- **Play / Pause**: Unified button with dynamic SVG icons.
- **Stop**: Pauses media and rewinds directly to `00:00`.
- **Seek Scrubbing Bar**: Continuous real-time time scrubbing via clicking or dragging without jitter.
- **Time Display**: Formatted in `MM:SS / MM:SS` (guards against `NaN` or `Infinity`).
- **Skip -10s / +10s**: Fast-forward and rewind buttons for quick skimming.
- **Volume & Mute**: Smooth volume slider with dynamic mute/unmute toggle button and percentage indicator.
- **Playback Speed Selector**: Speed options from `0.5×` to `2.0×`.
- **Fullscreen Mode**: Toggle fullscreen viewing for videos.
- **Keyboard Shortcut**: Press `Spacebar` to play or pause.

### 4. HTML5 Media API Diagnostics & Error Handling
- Listens to native events: `loadedmetadata`, `timeupdate`, `play`, `pause`, `ended`, `volumechange`, `waiting`, `canplay`, and `error`.
- **Graceful Placeholder Handling**: If placeholder dummy files are loaded, an informative notification banner appears instead of breaking the UI.
- **Live Diagnostics Inspector**: A collapsible inspector showing live `currentTime`, `duration`, `readyState`, `networkState`, `volume`, and `playbackRate`.

---

## 🚀 How to Run the Project Locally

Because browsers enforce security restrictions (CORS) when loading local video and audio files directly via `file://`, it is recommended to run the project using a simple local web server.

### Option 1: Python Built-in Server (Recommended)
Open PowerShell or Command Prompt in the `q3_assign` folder and run:

```bash
python -m http.server 8000
```
Then open your browser and navigate to:
```
http://localhost:8000
```

### Option 2: Node.js `npx serve`
If you have Node.js installed:
```bash
npx serve .
```

### Option 3: VS Code Live Server Extension
1. Open the `q3_assign` folder in Visual Studio Code.
2. Right-click on `index.html` and select **"Open with Live Server"**.

---

## 🎵 Supplying Your Real Audio and Video Files

Dummy placeholder files are currently placed in `assets/videos/` and `assets/audio/`.

To use your actual audio and video files:

1. **For Videos**:
   - Place your MP4 video file into `assets/videos/` and name it `video1.mp4`.
   - Place your second MP4 video file into `assets/videos/` and name it `video2.mp4`.
2. **For Audio**:
   - Place your MP3/WAV audio file into `assets/audio/` and name it `audio1.mp3`.
   - Place your second MP3/WAV audio file into `assets/audio/` and name it `audio2.mp3`.

> **Note on Custom Filenames:** If you prefer different file names (e.g. `my_song.mp3` or `presentation.webm`), simply open `script.js` and update the `src` attribute in the `mediaLibrary` array at the top of the file.
