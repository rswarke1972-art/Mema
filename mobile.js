// mobile.js – Touch‑friendly helpers and viewport fixes
const Mobile = (() => {
  const isPortrait = () => window.innerHeight > window.innerWidth;

  const fixViewport = () => {
    // iOS Safari safe‑area handling, prevent zoom on input focus
    const meta = document.querySelector('meta[name=viewport]');
    if (meta) {
      meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
    }
  };

  const addTouchRipple = (el) => {
    el.addEventListener('click', (e) => {
      const ripple = document.createElement('span');
      ripple.className = 'touch-ripple';
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      el.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  };

  const init = () => {
    fixViewport();
    window.addEventListener('orientationchange', fixViewport);
    // Apply ripple to all .btn elements
    document.querySelectorAll('.btn').forEach(addTouchRipple);
  };

  return { init, isPortrait };
})();

export default Mobile;
export const initMobile = Mobile.init;
