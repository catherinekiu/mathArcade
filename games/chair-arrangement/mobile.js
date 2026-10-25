/* Chair Arrangement — Android touch placement + viewport integration */
(function(){
  'use strict';
  if (!window.MMQMobile) return;

  let selectedChair = null;

  function clearSelected(){
    document.querySelectorAll('.chair.touch-selected').forEach(el => el.classList.remove('touch-selected'));
    document.querySelectorAll('.grid-cell.touch-target').forEach(el => el.classList.remove('touch-target'));
    selectedChair = null;
  }

  function selectChair(chair){
    clearSelected();
    selectedChair = chair;
    chair.classList.add('touch-selected');
    document.querySelectorAll('#arrayGridPractice .grid-cell:empty').forEach(el => el.classList.add('touch-target'));
  }

  function installTouchPlacement(){
    const tray = document.getElementById('dragArea');
    const grid = document.getElementById('arrayGridPractice');
    if (!tray || !grid) return;

    tray.addEventListener('click', e => {
      if (!MMQMobile.isTouch) return;
      const chair = e.target.closest('.chair');
      if (!chair) return;
      e.preventDefault();
      selectChair(chair);
    });

    grid.addEventListener('click', e => {
      if (!MMQMobile.isTouch) return;
      const chair = e.target.closest('.chair');
      if (chair){
        e.preventDefault();
        tray.appendChild(chair);
        clearSelected();
        return;
      }

      const cell = e.target.closest('.grid-cell');
      if (!cell || !selectedChair || cell.children.length) return;
      e.preventDefault();
      cell.appendChild(selectedChair);
      clearSelected();
    });
  }

  function syncPlayingState(){
    const mode = document.getElementById('mode')?.value || 'learning';
    MMQMobile.setPlaying(true,'landscape');
    document.body.dataset.chairMode = mode;
  }

  const originalSwitchMode = switchMode;
  switchMode = function(){
    clearSelected();
    originalSwitchMode();
    syncPlayingState();
  };

  const originalGeneratePracticeMode = generatePracticeMode;
  generatePracticeMode = function(){
    clearSelected();
    originalGeneratePracticeMode();
  };

  const originalRevealAnswer = revealAnswer;
  revealAnswer = function(){
    clearSelected();
    originalRevealAnswer();
  };

  window.addEventListener('load', () => {
    installTouchPlacement();
    syncPlayingState();
  }, { once:true });

  window.addEventListener('mmqviewportchange', syncPlayingState);
})();
