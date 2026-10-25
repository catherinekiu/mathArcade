/* Popubbles! — Android viewport integration */
(function(){
  'use strict';
  if (!window.MMQMobile) return;

  const originalShowScreen = showScreen;
  showScreen = function(screenId){
    originalShowScreen(screenId);
    MMQMobile.setPlaying(screenId === 'game','landscape');
  };

  window.addEventListener('mmqviewportchange', () => {
    if (document.getElementById('game')?.classList.contains('active')) {
      MMQMobile.setPlaying(true,'landscape');
    }
  });
})();
