// music.js – loads ambient tracks, handles mute/unmute based on settings

import { playAudio, stopAudio } from './utils.js';

const tracks = {
  piano: new Audio(MEMA.CONFIG.AUDIO.PIANO),
  violin: new Audio(MEMA.CONFIG.AUDIO.VIOLIN),
  ballroom: new Audio(MEMA.CONFIG.AUDIO.BALLROOM),
  garden: new Audio(MEMA.CONFIG.AUDIO.GARDEN),
  rain: new Audio(MEMA.CONFIG.AUDIO.RAIN),
};

// Loop each track and set volume
Object.values(tracks).forEach(t => {
  t.loop = true;
  t.volume = 0.4;
  t.addEventListener('error', () => {}); // silence missing audio errors
});

let currentTrack = null;

// initMusic – attach toggle handler but do NOT auto‑play on load
export function initMusic() {
  const musicToggle = document.getElementById('toggle-music');
  if (musicToggle) {
    musicToggle.addEventListener('change', e => {
      if (e.target.checked) {
        playAmbient('piano');
      } else {
        stopAll();
      }
    });
    // Do NOT start music automatically; user must toggle on
  }
}

// Wrap playAmbient to catch NotAllowedError when called without interaction
export function playAmbient(name) {
  if (!tracks[name]) return;
  stopAll();
  currentTrack = tracks[name];
  const playPromise = currentTrack.play();
  if (playPromise !== undefined) {
    playPromise.catch(err => {
      console.warn('Audio play failed (likely no user interaction):', err);
    });
  }
}

export function stopAll() {
  Object.values(tracks).forEach(t => t.pause());
}

// Example: switch ambient based on location
export function setLocationAmbient(location) {
  switch (location) {
    case 'garden':
      playAmbient('garden');
      break;
    case 'ballroom':
      playAmbient('ballroom');
      break;
    case 'rain':
      playAmbient('rain');
      break;
    default:
      playAmbient('piano');
  }
}
