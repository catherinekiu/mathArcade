/* MMQ! shared Android/mobile viewport + orientation helper */
(function(){
  'use strict';

  const root = document.documentElement;
  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const ua = navigator.userAgent || '';
  const mobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);

  function viewport(){
    const vv = window.visualViewport;
    return {
      width: Math.round(vv?.width || window.innerWidth || root.clientWidth || 0),
      height: Math.round(vv?.height || window.innerHeight || root.clientHeight || 0)
    };
  }

  function sync(){
    const v = viewport();
    root.style.setProperty('--mmq-vw', `${v.width}px`);
    root.style.setProperty('--mmq-vh', `${v.height}px`);
    root.classList.toggle('mmq-touch', coarse || mobileUA);
    root.classList.toggle('mmq-phone', (coarse || mobileUA) && Math.min(v.width, v.height) <= 600);
    root.classList.toggle('mmq-landscape', v.width >= v.height);
    root.classList.toggle('mmq-portrait', v.height > v.width);
    window.dispatchEvent(new CustomEvent('mmqviewportchange', { detail:v }));
  }

  function ensureRotateOverlay(){
    if (document.querySelector('.mmq-rotate-overlay')) return;
    const overlay = document.createElement('div');
    overlay.className = 'mmq-rotate-overlay';
    overlay.setAttribute('aria-live','polite');
    overlay.innerHTML = `
      <div class="mmq-rotate-card">
        <div class="mmq-rotate-icon" aria-hidden="true">📱↻</div>
        <p class="mmq-rotate-title">Rotate your phone</p>
        <p class="mmq-rotate-text">Turn your device sideways to see the whole MMQ! gameplay screen.</p>
      </div>`;
    document.body.appendChild(overlay);
  }

  window.MMQMobile = {
    viewport,
    sync,
    setPlaying(isPlaying, orientation='landscape'){
      document.body.classList.toggle('mmq-playing', !!isPlaying);
      if (isPlaying) document.body.dataset.mmqOrientation = orientation;
      else delete document.body.dataset.mmqOrientation;
      ensureRotateOverlay();
      sync();
    },
    isTouch: coarse || mobileUA
  };

  sync();
  ensureRotateOverlay();
  window.addEventListener('resize', sync, { passive:true });
  window.addEventListener('orientationchange', () => setTimeout(sync, 80), { passive:true });
  window.visualViewport?.addEventListener('resize', sync, { passive:true });
  window.visualViewport?.addEventListener('scroll', sync, { passive:true });
})();
