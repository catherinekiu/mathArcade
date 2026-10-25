/* Catch Me! — Android touch + responsive canvas */
(function(){
  'use strict';
  if (!window.MMQMobile) return;

  const clamp = (n,min,max) => Math.max(min,Math.min(max,n));
  const leftBtn = document.getElementById('touch-left');
  const rightBtn = document.getElementById('touch-right');
  const fastBtn = document.getElementById('touch-fast');

  function resizeGameSurface(){
    if (!canvas || !gameContainer || gameContainer.style.display === 'none') return;
    const v = MMQMobile.viewport();
    if (v.height > v.width) return;

    const w = Math.max(480, Math.floor(v.width - 12));
    const h = Math.max(250, Math.floor(v.height - 48));
    const oldW = canvas.width || w;
    const oldH = canvas.height || h;
    const rx = w / oldW;
    const ry = h / oldH;

    canvas.width = w;
    canvas.height = h;

    basket.width = clamp(Math.round(w * .16), 92, 132);
    basket.height = clamp(Math.round(basket.width * .66), 60, 86);
    basket.x = clamp(Math.round(basket.x * rx), 0, w - basket.width);
    basket.y = h - basket.height - 8;

    answers.forEach((a, i) => {
      a.y = clamp(a.y * ry, 42, h - 80);
      const margin = Math.max(52, Math.round(w * .10));
      const span = Math.max(1, answers.length - 1);
      a.x = answers.length === 1 ? w / 2 : margin + i * ((w - margin * 2) / span);
    });
  }

  const originalGenerateQuestion = generateQuestion;
  generateQuestion = function(){
    originalGenerateQuestion();
    const w = canvas.width;
    const margin = Math.max(52, Math.round(w * .10));
    const span = Math.max(1, answers.length - 1);
    answers.forEach((a,i) => {
      a.x = answers.length === 1 ? w / 2 : margin + i * ((w - margin * 2) / span);
      a.y = Math.max(44, Math.round(canvas.height * .12));
    });
  };

  const originalStartGame = startGame;
  startGame = function(){
    MMQMobile.setPlaying(true,'landscape');
    resizeGameSurface();
    originalStartGame();
    resizeGameSurface();
  };

  const originalEnd = displayEndScreen;
  displayEndScreen = function(){
    MMQMobile.setPlaying(false);
    originalEnd();
  };

  function moveBasket(delta){
    if (!gameRunning) return;
    basket.x = clamp(basket.x + delta, 0, canvas.width - basket.width);
  }

  function holdMove(btn, direction){
    if (!btn) return;
    let timer = null;
    const stop = () => { if (timer) clearInterval(timer); timer = null; };
    btn.addEventListener('pointerdown', e => {
      e.preventDefault();
      moveBasket(direction * Math.max(22, canvas.width * .035));
      timer = setInterval(() => moveBasket(direction * Math.max(16, canvas.width * .026)), 55);
      btn.setPointerCapture?.(e.pointerId);
    });
    ['pointerup','pointercancel','lostpointercapture'].forEach(type => btn.addEventListener(type, stop));
  }

  holdMove(leftBtn,-1);
  holdMove(rightBtn,1);

  if (fastBtn){
    const normal = () => { if (gameRunning) speed = baseSpeed; };
    fastBtn.addEventListener('pointerdown', e => {
      e.preventDefault();
      if (gameRunning) speed = baseSpeed * 4.5;
      fastBtn.setPointerCapture?.(e.pointerId);
    });
    ['pointerup','pointercancel','lostpointercapture'].forEach(type => fastBtn.addEventListener(type, normal));
  }

  canvas.addEventListener('pointerdown', e => {
    if (!gameRunning || e.pointerType === 'mouse') return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    basket.x = clamp(x - basket.width / 2, 0, canvas.width - basket.width);
    canvas.setPointerCapture?.(e.pointerId);
  });

  canvas.addEventListener('pointermove', e => {
    if (!gameRunning || e.pointerType === 'mouse' || !canvas.hasPointerCapture?.(e.pointerId)) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    basket.x = clamp(x - basket.width / 2, 0, canvas.width - basket.width);
  });

  window.addEventListener('mmqviewportchange', () => {
    if (document.body.classList.contains('mmq-playing')) resizeGameSurface();
  });
})();
