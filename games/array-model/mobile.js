/* Array Model — Android viewport integration */
(function(){
  'use strict';
  if (!window.MMQMobile) return;

  function refit(){
    MMQMobile.setPlaying(true,'landscape');
    const practice = document.getElementById('practiceScreen');
    const practiceVisible = practice && !practice.classList.contains('hidden');

    if (practiceVisible && PRACTICE_STATE.rows && PRACTICE_STATE.cols){
      requestAnimationFrame(() => {
        const grid = document.getElementById('practiceArrayModel');
        const wrap = document.getElementById('practiceArrayContainer');
        fitGridPlain(grid, wrap, PRACTICE_STATE.rows, PRACTICE_STATE.cols);
      });
    } else if (LEARN_STATE.rows && LEARN_STATE.cols){
      requestAnimationFrame(() => {
        const grid = document.getElementById('arrayModel');
        const wrap = document.getElementById('arrayContainer');
        fitGridWithLabels(grid, wrap, LEARN_STATE.rows, LEARN_STATE.cols);
      });
    }
  }

  const oldPractice = switchToPractice;
  switchToPractice = function(){ oldPractice(); setTimeout(refit,0); };
  const oldLearning = switchToLearning;
  switchToLearning = function(){ oldLearning(); setTimeout(refit,0); };

  window.addEventListener('mmqviewportchange', refit);
  window.addEventListener('load', () => setTimeout(refit,0), { once:true });
})();
