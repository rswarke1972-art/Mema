// music.js – loads ambient tracks, handles mute/unmute, and provides Web Audio synthesis fallback
import { playAudio, stopAudio } from './utils.js';

let currentAudio = null;
let currentSynth = null;
let currentTrackName = null;
let isMuted = false;

// Default tracks unlocked
export const TRACKS_INFO = [
  { id: 'piano', name: 'Hartfield Soiree (Piano)', icon: '🎹' },
  { id: 'violin', name: 'English Garden (Violin)', icon: '🎻' },
  { id: 'ballroom', name: 'Crown Ballroom (Waltz)', icon: '💃' },
  { id: 'garden', name: 'Summer Stroll (Acoustic)', icon: '🌿' },
  { id: 'rain', name: 'Rosemere Drizzle (Ambient)', icon: '🌧️' }
];

export function initMusic() {
  const musicToggle = document.getElementById('toggle-music');
  if (musicToggle) {
    // Read preference
    isMuted = localStorage.getItem('toggle-music') === 'false';
    musicToggle.checked = !isMuted;
    
    musicToggle.addEventListener('change', e => {
      isMuted = !e.target.checked;
      localStorage.setItem('toggle-music', (!isMuted).toString());
      if (isMuted) {
        stopAll();
      } else {
        if (currentTrackName) {
          playAmbient(currentTrackName);
        } else {
          playAmbient('piano'); // Default starting track
        }
      }
    });
  }
}

/** Play track, falling back to procedural synthesizer if files are missing */
export function playAmbient(name) {
  currentTrackName = name;
  stopAll();
  
  if (isMuted) return;

  const url = window.MEMA?.CONFIG?.AUDIO?.[name.toUpperCase()];
  if (url) {
    // Attempt physical play
    try {
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = 0.3;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          currentAudio = audio;
          updateVisualizerUI(true);
        }).catch(err => {
          // File missing or blocked, fall back to procedural synthesis
          startSynthTrack(name);
        });
      } else {
        currentAudio = audio;
        updateVisualizerUI(true);
      }
    } catch (e) {
      startSynthTrack(name);
    }
  } else {
    startSynthTrack(name);
  }
}

/** Stop all playback, clean up physical audio and synthesized audio */
export function stopAll() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {}
    currentAudio = null;
  }
  stopSynth();
  updateVisualizerUI(false);
}

function stopSynth() {
  if (currentSynth) {
    try { currentSynth.stop(); } catch (e) {}
    currentSynth = null;
  }
}

/** Procedural Web Audio Synth for ambient tracks */
function startSynthTrack(name) {
  try {
    const audioCtx = window.MEMA?.AUDIO_CONTEXT || new (window.AudioContext || window.webkitAudioContext)();
    if (!window.MEMA.AUDIO_CONTEXT) {
      window.MEMA.AUDIO_CONTEXT = audioCtx;
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    stopSynth();

    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.04, audioCtx.currentTime); // quiet background levels
    masterGain.connect(audioCtx.destination);

    let activeNotes = [];
    let intervalId = null;

    if (name === 'rain') {
      // 🌧️ Generate white noise for rain weather sound effect
      const bufferSize = 2 * audioCtx.sampleRate;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter to simulate lowpass frequency sweeps
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, audioCtx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(masterGain);
      whiteNoise.start();

      activeNotes.push(whiteNoise);
    } else {
      // 🎹/🎻/💃 Procedural arpeggiator
      let scale = [261.63, 329.63, 392.00, 523.25]; // C major triad arpeggio
      let tempo = 400; // ms between notes
      let synthType = 'sine';

      if (name === 'piano') {
        // Slow soft arpeggiator
        scale = [261.63, 329.63, 392.00, 523.25, 440.00, 349.23, 392.00, 329.63];
        synthType = 'sine';
        tempo = 380;
      } else if (name === 'violin') {
        // Broad swell chords
        scale = [220.00, 261.63, 329.63, 440.00, 392.00, 349.23];
        synthType = 'triangle';
        tempo = 1500;
      } else if (name === 'ballroom') {
        // Waltz rhythm chord step: bass, chord, chord
        scale = [261.63, 329.63, 392.00];
        synthType = 'sine';
        tempo = 500;
      } else if (name === 'garden') {
        // Lively acoustic plucks
        scale = [293.66, 329.63, 392.00, 440.00, 587.33];
        synthType = 'sine';
        tempo = 300;
      }

      let step = 0;
      const playStep = () => {
        try {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = synthType;

          let freq = scale[step % scale.length];

          if (name === 'ballroom') {
            const beat = step % 3;
            if (beat === 0) {
              freq = freq / 2; // low bass note
              gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
            } else {
              freq = scale[(step + 1) % scale.length] * 1.5; // high chord
              gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
            }
          } else if (name === 'violin') {
            // Swell envelope
            gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.025, audioCtx.currentTime + 0.5);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.4);
          } else {
            // Piano decay envelope
            gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
          }

          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          osc.connect(gain);
          gain.connect(masterGain);

          osc.start();
          osc.stop(audioCtx.currentTime + (name === 'violin' ? 1.5 : 0.45));
          step++;
        } catch (e) {}
      };

      playStep();
      intervalId = setInterval(playStep, tempo);
    }

    currentSynth = {
      stop: () => {
        if (intervalId) clearInterval(intervalId);
        activeNotes.forEach(node => {
          try { node.stop(); } catch(e) {}
        });
      }
    };
    updateVisualizerUI(true);
  } catch (err) {
    console.warn('Procedural synth start failed:', err);
  }
}

/** Switch ambient based on scene context */
export function setLocationAmbient(location) {
  if (location === 'garden') {
    playAmbient('garden');
  } else if (location === 'ballroom') {
    playAmbient('ballroom');
  } else if (location === 'rain') {
    playAmbient('rain');
  } else {
    playAmbient('piano');
  }
}

/** Toggle UI visualizer bars */
function updateVisualizerUI(playing) {
  const vis = document.getElementById('audio-visualizer');
  const playBtn = document.getElementById('music-play-pause-btn');
  const nowPlayingText = document.getElementById('now-playing-title');
  
  if (!vis) return;

  if (playing) {
    vis.classList.remove('hidden');
    if (playBtn) playBtn.textContent = 'Mute';
    if (nowPlayingText && currentTrackName) {
      const info = TRACKS_INFO.find(t => t.id === currentTrackName);
      nowPlayingText.textContent = info ? `Now Playing: ${info.name}` : 'Now Playing';
    }
  } else {
    vis.classList.add('hidden');
    if (playBtn) playBtn.textContent = 'Play';
    if (nowPlayingText) nowPlayingText.textContent = 'Music Room Paused';
  }
}

// Export references
export { isMuted, currentTrackName };
export default playAmbient;

/**
 * Render the Music Room UI tab, setting up track listing and play actions
 */
export function renderMusicRoomTab() {
  const container = document.getElementById('music-track-list');
  const playPauseBtn = document.getElementById('music-play-pause-btn');
  
  if (!container) return;
  container.innerHTML = '';
  
  const unlocked = window.gameState?.unlockedMusic || ['piano', 'violin'];
  
  TRACKS_INFO.forEach(track => {
    const isUnlocked = unlocked.includes(track.id);
    const row = document.createElement('div');
    row.className = `track-row ${isUnlocked ? '' : 'locked'} ${currentTrackName === track.id && !isMuted ? 'playing' : ''}`;
    
    row.innerHTML = `
      <span class="track-name-left">${track.icon} ${isUnlocked ? track.name : 'Locked Track'}</span>
      <span class="track-status-right">${isUnlocked ? (currentTrackName === track.id && !isMuted ? 'Now Playing' : 'Click to Play') : '🔒 Locked'}</span>
    `;
    
    if (isUnlocked) {
      row.addEventListener('click', () => {
        playAmbient(track.id);
        renderMusicRoomTab(); // Refresh row active states
      });
    }
    container.appendChild(row);
  });
  
  // Re-bind main play/pause toggle button
  if (playPauseBtn) {
    const newBtn = playPauseBtn.cloneNode(true);
    playPauseBtn.parentNode.replaceChild(newBtn, playPauseBtn);
    
    // Set label based on current mute state
    newBtn.textContent = (currentTrackName && !isMuted) ? 'Mute' : 'Play default';
    
    newBtn.addEventListener('click', () => {
      if (currentTrackName && !isMuted) {
        // Mute active track
        isMuted = true;
        stopAll();
      } else {
        // Unmute and play
        isMuted = false;
        playAmbient(currentTrackName || 'piano');
      }
      renderMusicRoomTab();
    });
  }
}
