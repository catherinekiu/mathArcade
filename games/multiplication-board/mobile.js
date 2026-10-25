/* Multiplication Board — Android viewport integration */
(function(){
  'use strict';
  if (!window.MMQMobile) return;

  function sync(){
    MMQMobile.setPlaying(document.body?.dataset?.page === 'game','landscape');
  }

  window.addEventListener('load', sync, { once:true });
  window.addEventListener('mmqviewportchange', sync);
})();
