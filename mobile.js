// mobile.js – Touch‑friendly helpers, viewport locks and dynamic ripple delegation
const Mobile = (() => {
  const isPortrait = () => window.innerHeight > window.innerWidth;

  const fixViewport = () => {
    // iOS Safari safe‑area handling, prevent zoom on input focus
    const meta = document.querySelector('meta[name=viewport]');
    if (meta) {
      meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
    }
  };

  const init = () => {
    fixViewport();
    window.addEventListener('orientationchange', fixViewport);
    
    // Dynamic Event Delegation for Touch Ripples
    document.body.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn, .btn-primary, .choice-btn, .tab-btn, .icon-btn, .btn-sm');
      if (btn) {
        // Ensure parent style is positioned for absolute child placement
        const computed = window.getComputedStyle(btn);
        if (computed.position === 'static') {
          btn.style.position = 'relative';
        }
        
        const ripple = document.createElement('span');
        ripple.className = 'touch-ripple';
        
        // CSS properties for ripple animation inline (custom class matches styles.css)
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(216, 178, 110, 0.4)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple-effect 0.5s ease-out';
        ripple.style.pointerEvents = 'none';
        
        btn.style.overflow = 'hidden';
        
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        
        // Center the ripple on click coordinate
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 550);
      }
    });
  };

  return { init, isPortrait };
})();

export default Mobile;
export const initMobile = Mobile.init;
