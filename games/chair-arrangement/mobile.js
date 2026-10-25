/* Chair Arrangement — Android touch placement + responsive sizing */
(function(){
  'use strict';
  if (!window.MMQMobile) return;

  let selectedChair = null;
  const clamp = (n,min,max) => Math.max(min, Math.min(max,n));

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

  function fitLearningGrid(){
    const grid = document.getElementById('arrayGridLearning');
    const panel = document.getElementById('learningMode');
    const rowsInput = document.getElementById('rows');
    const colsInput = document.getElementById('columns');
    if (!grid || !panel || !rowsInput || !colsInput) return;

    const rows = clamp(parseInt(rowsInput.value,10) || 1, 1, 10);
    const cols = clamp(parseInt(colsInput.value,10) || 1, 1, 10);
    if (!grid.children.length) return;

    const availableW = Math.max(140, panel.clientWidth - 18);
    const topControls = panel.querySelector('.row')?.offsetHeight || 40;
    const statementH = document.getElementById('multiplicationStatementLearning')?.offsetHeight || 20;
    const availableH = Math.max(120, panel.clientHeight - topControls - statementH - 20);
    const gap = 3;

    let cell = Math.floor(Math.min(
      (availableW - gap * Math.max(0, cols - 1)) / cols,
      (availableH - gap * Math.max(0, rows - 1)) / rows,
      52
    ));
    cell = clamp(cell, 18, 52);

    grid.style.gap = `${gap}px`;
    grid.style.gridTemplateColumns = `repeat(${cols}, ${cell}px)`;
    grid.style.gridTemplateRows = `repeat(${rows}, ${cell}px)`;
    grid.querySelectorAll('.chair').forEach(chair => {
      chair.style.width = `${cell}px`;
      chair.style.height = `${cell}px`;
    });
  }

  function fitPracticeGrid(){
    const grid = document.getElementById('arrayGridPractice');
    const layout = document.querySelector('#practiceMode .practice-layout');
    if (!grid || !layout) return;
    const availableH = Math.max(220, layout.clientHeight - 20);
    const availableW = Math.max(220, (layout.clientWidth * .61) - 12);
    const gap = 2;
    let cell = Math.floor(Math.min(
      (availableW - gap * 9) / 10,
      (availableH - gap * 9) / 10,
      36
    ));
    cell = clamp(cell, 20, 36);
    document.body.style.setProperty('--chair-cell', `${cell}px`);
  }

  function refit(){
    const mode = document.getElementById('mode')?.value || 'learning';
    requestAnimationFrame(() => {
      if (mode === 'learning') fitLearningGrid();
      else fitPracticeGrid();
    });
  }

  function syncPlayingState(){
    const mode = document.getElementById('mode')?.value || 'learning';
    MMQMobile.setPlaying(true,'landscape');
    document.body.dataset.chairMode = mode;
    refit();
  }

  const originalSwitchMode = switchMode;
  switchMode = function(){
    clearSelected();
    originalSwitchMode();
    syncPlayingState();
  };

  const originalGenerateLearningMode = generateLearningMode;
  generateLearningMode = function(){
    originalGenerateLearningMode();
    requestAnimationFrame(fitLearningGrid);
  };

  const originalGeneratePracticeMode = generatePracticeMode;
  generatePracticeMode = function(){
    clearSelected();
    originalGeneratePracticeMode();
    requestAnimationFrame(fitPracticeGrid);
  };

  const originalRevealAnswer = revealAnswer;
  revealAnswer = function(){
    clearSelected();
    originalRevealAnswer();
    requestAnimationFrame(fitPracticeGrid);
  };

  window.addEventListener('load', () => {
    installTouchPlacement();
    syncPlayingState();
  }, { once:true });

  window.addEventListener('mmqviewportchange', syncPlayingState);
})();
