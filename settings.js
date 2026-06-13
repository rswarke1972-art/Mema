// settings.js – UI for settings modal, persist preferences, apply changes

import { applyTheme } from './config.js';
import { initMusic } from './music.js';

export function initUI() {
  const modal = document.getElementById('settings-modal');
  const btn = document.getElementById('settings-btn');
  const closeBtn = document.getElementById('close-settings');
  const themeSelect = document.getElementById('theme-select');
  const musicToggle = document.getElementById('toggle-music');
  const sfxToggle = document.getElementById('toggle-sfx');
  const animToggle = document.getElementById('toggle-animations');
  const speedRange = document.getElementById('text-speed');

  // Open modal
  btn.addEventListener('click', () => modal.classList.remove('hidden'));
  // Close modal
  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

  // Theme change
  themeSelect.value = localStorage.getItem('mema_theme') || MEMA.CONFIG.THEMES.LIGHT;
  themeSelect.addEventListener('change', e => {
    applyTheme(e.target.value);
  });

  // Music toggle – music.js already listens to this element
  // Persist toggles
  [musicToggle, sfxToggle, animToggle].forEach(cb => {
    cb.checked = localStorage.getItem(cb.id) !== 'false';
    cb.addEventListener('change', e => {
      localStorage.setItem(e.target.id, e.target.checked);
    });
  });

  // Text speed
  const savedSpeed = localStorage.getItem('mema_text_speed') || '30';
  speedRange.value = savedSpeed;
  window.MEMA = window.MEMA || {};
  window.MEMA.TEXT_SPEED = parseInt(savedSpeed, 10);
  
  speedRange.addEventListener('input', e => {
    localStorage.setItem('mema_text_speed', e.target.value);
    window.MEMA.TEXT_SPEED = parseInt(e.target.value, 10);
  });
}
