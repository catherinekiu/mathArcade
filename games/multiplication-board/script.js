// Shared script for all pages
// - Provides bilingual UI (English UK + Chinese Simplified)
// - Contains the game logic (guarded so non-game pages won't crash)

(function () {
  "use strict";

  // -----------------------------
  // i18n
  // -----------------------------
  const LANG_KEY = "lang";
  const DEFAULT_LANG = "en-GB";

  const TABLES_KEY = "selectedTables";      // JSON array, e.g. [2,5,7]
  const LEGACY_TABLE_KEY = "selectedTable"; // legacy single value

  const urlLangRaw = (new URLSearchParams(window.location.search).get("lang") || "").toLowerCase();
  if (["zh", "zh-cn", "zh-hans"].includes(urlLangRaw)) {
    localStorage.setItem(LANG_KEY, "zh-CN");
  } else if (["en", "en-gb", "en-us"].includes(urlLangRaw)) {
    localStorage.setItem(LANG_KEY, "en-GB");
  }

  const I18N = {
    "en-GB": {
      app_title: "Multiplication Bingo Game",
      page_menu: "Menu",
      page_game: "Game",
      page_result: "Result",
      page_history: "History",
      page_scoreboard: "Scoreboard",

      language_label: "Language",

      menu_subtitle: "Competition Mode • Fast thinking, sharp multiplying 😄",
      how_to_play: "How to play",
      rule_1: "Two players take turns.",
      rule_2: "On your turn, answer the question by clicking the correct number on your own board.",
      rule_3: "Correct answer: +10 points plus a time bonus.",
      rule_4: "Wrong answer: no penalty.",
      rule_5: "Complete 3 full lines (a row or column of 5 squares) to win and get +100 bonus.",

      choose_table: "Choose up to 3 times tables",
      pick_up_to_three: "Tap up to 3 tables. Questions will be mixed randomly.",
      selected_count: "Selected: {n}/3",
      max_three_tables: "You can only select up to 3 times tables.",
      please_select_one: "Pick at least 1 times table to start.",

      mixed_tables: "Mixed",
      scoreboard_btn: "Scoreboard",
      start_game_btn: "Start game",
      press_start_first: "Press Start game to begin.",
      clear_selection: "Clear selection",

      game_subtitle: "Competition Mode",
      question_default: "Question",
      player1_score_label: "Player 1 score",
      player2_score_label: "Player 2 score",
      player1: "Player 1",
      player2: "Player 2",
      type_your_name: "Type your name",
      player1_board: "Player 1 board",
      player2_board: "Player 2 board",
      timer: "Timer",
      seconds_per_question: "15 seconds per question",
      back_to_menu: "Back to menu",

      game_over_title: "Game Over!",
      result_subtitle: "Let’s see who cooked 🔥",
      score_label: "Score: {score}",
      play_again: "Play again",
      game_history: "Game history",

      top_scores: "Top scores (last 10 entries)",
      every_match: "Every match saved on this device",
      search_player: "Search player",
      all_tables: "All times tables",
      times_table_n: "Times Table {n}",
      date: "Date",
      rank: "Rank",
      player: "Player",
      score: "Score",
      times_table: "Times table",
      clear_history: "Clear history",
      history_cleared: "Game history cleared!",

      enter_p1_name: "Enter Player 1's name:",
      enter_p2_name: "Enter Player 2's name:",
      no_available_answers: "No available answers left! Ending game.",
      time_up: "Time's up! Moving to next player.",
      handover_title: "Next question starts in {sec}s",
      handover_message: "Pass the mouse/pointer to {name}.",
      own_board_only: "You can only pick an answer on your own board!",
      correct_popup: "Correct! +10 points + {bonus} bonus points.",
      incorrect_popup: "Incorrect! No points lost. Next player's turn.",
      wins_popup: "{name} wins the game! +100 bonus points!",
      game_over_popup: "Game Over! Check the results page.",

      turn_message: "It's {name}'s turn.",
      score_format: "{name}'s score: {score}",
      question_prompt: "{name}, {a} x {b} = ?",

      unknown: "Unknown"
    },

    "zh-CN": {
      app_title: "乘法宾果游戏",
      page_menu: "菜单",
      page_game: "游戏",
      page_result: "结果",
      page_history: "记录",
      page_scoreboard: "排行榜",

      language_label: "语言",

      menu_subtitle: "竞赛模式 • 反应快，乘法稳 😄",
      how_to_play: "玩法说明",
      rule_1: "两位玩家轮流作答。",
      rule_2: "轮到你时，只能在自己的棋盘上点击正确答案。",
      rule_3: "答对：+10 分，再加上剩余时间奖励分。",
      rule_4: "答错：不扣分。",
      rule_5: "完成 3 条完整连线（整行或整列 5 格）即可获胜，并额外 +100 分。",

      choose_table: "最多选择 3 个乘法表",
      pick_up_to_three: "最多点选 3 个乘法表，题目会随机混合出题。",
      selected_count: "已选择：{n}/3",
      max_three_tables: "最多只能选择 3 个乘法表。",
      please_select_one: "请至少选择 1 个乘法表再开始。",

      mixed_tables: "混合",
      scoreboard_btn: "排行榜",
      start_game_btn: "开始游戏",
      press_start_first: "请先点击“开始游戏”。",
      clear_selection: "清除选择",

      game_subtitle: "竞赛模式",
      question_default: "题目",
      player1_score_label: "玩家 1 分数",
      player2_score_label: "玩家 2 分数",
      player1: "玩家 1",
      player2: "玩家 2",
      type_your_name: "输入名字",
      player1_board: "玩家 1 棋盘",
      player2_board: "玩家 2 棋盘",
      timer: "倒计时",
      seconds_per_question: "每题 15 秒",
      back_to_menu: "返回菜单",

      game_over_title: "游戏结束！",
      result_subtitle: "来看看谁更强 🔥",
      score_label: "分数：{score}",
      play_again: "再玩一次",
      game_history: "对战记录",

      top_scores: "最高分（最近 10 条）",
      every_match: "本设备保存的所有对战",
      search_player: "搜索玩家",
      all_tables: "全部乘法表",
      times_table_n: "{n} 的乘法表",
      date: "日期",
      rank: "排名",
      player: "玩家",
      score: "分数",
      times_table: "乘法表",
      clear_history: "清除记录",
      history_cleared: "对战记录已清除！",

      enter_p1_name: "请输入玩家 1 名字：",
      enter_p2_name: "请输入玩家 2 名字：",
      no_available_answers: "没有可选答案了！游戏结束。",
      time_up: "时间到！轮到下一位。",
      handover_title: "下一题将在 {sec} 秒后开始",
      handover_message: "请把鼠标或触控笔交给 {name}。",
      own_board_only: "只能在自己的棋盘上选答案哦！",
      correct_popup: "答对！+10 分 + {bonus} 时间奖励分。",
      incorrect_popup: "答错了！不扣分。轮到下一位。",
      wins_popup: "{name} 获胜！额外 +100 分！",
      game_over_popup: "游戏结束！请查看结果页。",

      turn_message: "轮到 {name} 了。",
      score_format: "{name} 分数：{score}",
      question_prompt: "{name}，{a} x {b} = ?",

      unknown: "未知"
    }
  };

  function getLang() {
    return localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
  }

  function getLocale() {
    return getLang() === "zh-CN" ? "zh-CN" : "en-GB";
  }

  function setLang(lang) {
    const safeLang = I18N[lang] ? lang : DEFAULT_LANG;
    localStorage.setItem(LANG_KEY, safeLang);
    applyI18n();
  }

  function t(key, vars) {
    const lang = getLang();
    const dict = I18N[lang] || I18N[DEFAULT_LANG];
    let str = dict[key] ?? I18N[DEFAULT_LANG][key] ?? key;

    if (vars && typeof vars === "object") {
      Object.keys(vars).forEach((k) => {
        str = str.replaceAll(`{${k}}`, String(vars[k]));
      });
    }
    return str;
  }

  function applyI18n() {
    const lang = getLang();
    document.documentElement.lang = lang === "zh-CN" ? "zh-Hans" : "en";

    // Text nodes
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key);
    });

    // Placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      el.setAttribute("placeholder", t(key));
    });

    // Page title
    const page = document.body?.dataset?.page;
    const pageKeyMap = {
      menu: "page_menu",
      game: "page_game",
      result: "page_result",
      history: "page_history",
      scoreboard: "page_scoreboard"
    };
    if (page && pageKeyMap[page]) {
      document.title = `${t("app_title")} • ${t(pageKeyMap[page])}`;
    }

    // Sync language selector if present
    const langSelect = document.getElementById("langSelect");
    if (langSelect) {
      langSelect.value = lang;
    }

    // Menu: selected tables count pill is dynamic (needs {n} substitution)
    if (document.body?.dataset?.page === 'menu') {
      const countEl = document.getElementById('selectedCount');
      if (countEl) {
        const n = getStoredTables().length;
        countEl.textContent = t('selected_count', { n });
      }
    }

    // Rebuild any times-table filter selects (history/scoreboard)
    document.querySelectorAll("select[data-fill-tables]").forEach((sel) => {
      if (sel && sel.id) fillTimesTableOptions(sel.id);
    });

    // Repaint menu table-count label
    const countEl = document.getElementById("selectedCount");
    if (countEl) {
      const tables = getStoredTables();
      countEl.textContent = t("selected_count", { n: tables.length });
    }

    const hintEl = document.getElementById("tableHint");
    if (hintEl) hintEl.textContent = t("pick_up_to_three");
  }

  function initLanguageSelector() {
    const langSelect = document.getElementById("langSelect");
    if (!langSelect) return;

    langSelect.value = getLang();
    langSelect.addEventListener("change", () => {
      setLang(langSelect.value);
    });
  }

  function fillTimesTableOptions(selectId) {
    const sel = document.getElementById(selectId);
    if (!sel) return;

    const currentValue = sel.value || "all";
    sel.innerHTML = "";

    const allOpt = document.createElement("option");
    allOpt.value = "all";
    allOpt.textContent = t("all_tables");
    sel.appendChild(allOpt);

    // Extra filter for all mixed games
    const mixedOpt = document.createElement("option");
    mixedOpt.value = "mixed";
    mixedOpt.textContent = t("mixed_tables");
    sel.appendChild(mixedOpt);

    for (let n = 2; n <= 9; n++) {
      const opt = document.createElement("option");
      opt.value = String(n);
      opt.textContent = t("times_table_n", { n });
      sel.appendChild(opt);
    }

    sel.value = currentValue;
  }

  // Expose i18n helpers
  window.i18n = { t, getLang, setLang, applyI18n, initLanguageSelector, fillTimesTableOptions, getLocale };

  // -----------------------------
  // Tables selection helpers
  // -----------------------------
  function normaliseTables(arr) {
    const cleaned = (Array.isArray(arr) ? arr : [])
      .map((n) => parseInt(n, 10))
      .filter((n) => Number.isFinite(n) && n >= 2 && n <= 9);
    const unique = Array.from(new Set(cleaned));
    return unique.slice(0, 3);
  }

  function getStoredTables() {
    try {
      const raw = localStorage.getItem(TABLES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return normaliseTables(parsed);
      }
    } catch (_) {}

    // fallback: legacy single table
    const legacy = parseInt(localStorage.getItem(LEGACY_TABLE_KEY), 10);
    if (Number.isFinite(legacy) && legacy >= 2 && legacy <= 9) return [legacy];

    return [];
  }

  function getSelectedTables() {
    const stored = getStoredTables();
    return stored.length ? stored : [2];
  }

  function setSelectedTables(tables) {
    const norm = normaliseTables(tables);

    if (norm.length) {
      localStorage.setItem(TABLES_KEY, JSON.stringify(norm));
      localStorage.setItem(LEGACY_TABLE_KEY, String(norm[0]));
    } else {
      localStorage.removeItem(TABLES_KEY);
      // keep a sensible legacy default
      localStorage.setItem(LEGACY_TABLE_KEY, '2');
    }

    return norm;
  }

  // Menu selector logic
  function initTableSelector() {
    if (document.body?.dataset?.page !== "menu") return;

    const buttons = Array.from(document.querySelectorAll(".table-pick"));
    if (!buttons.length) return;

    let selected = getStoredTables();

    function syncUI() {
      buttons.forEach((btn) => {
        const n = parseInt(btn.dataset.table, 10);
        btn.classList.toggle("selected", selected.includes(n));
        btn.setAttribute("aria-pressed", selected.includes(n) ? "true" : "false");
      });

      const countEl = document.getElementById("selectedCount");
      if (countEl) countEl.textContent = t("selected_count", { n: selected.length });

      const startBtn = document.getElementById("startBtn");
      if (startBtn) startBtn.disabled = selected.length === 0;
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const n = parseInt(btn.dataset.table, 10);
        if (!Number.isFinite(n)) return;

        if (selected.includes(n)) {
          selected = selected.filter((x) => x != n);
        } else {
          if (selected.length >= 3) {
            showCustomPopup(t("max_three_tables"));
            return;
          }
          selected = [...selected, n];
        }

        selected = setSelectedTables(selected);
        syncUI();
      });
    });

    // Start button
    window.startGameFromSelection = function () {
      const tables = getStoredTables();
      if (!tables.length) {
        showCustomPopup(t("please_select_one"));
        return;
      }
      setSelectedTables(tables);
      window.location.href = "game.html";
    };

    // Backwards compatible: single table start
    window.startGame = function (table) {
      setSelectedTables([table]);
      window.location.href = "game.html";
    };


    window.clearTableSelection = function () {
      selected = [];
      setSelectedTables([]);
      syncUI();
    };

    // Initial paint
    selected = setSelectedTables(selected);
    syncUI();
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyI18n();
    initLanguageSelector();
    initTableSelector();
  });

  // -----------------------------
  // Game logic (guarded)
  // -----------------------------
  let timer;
  let timeLeft = 15;
  let currentPlayer = 1;
  let score1 = 0,
    score2 = 0;

  let selectedTables = getSelectedTables();

  let correctAnswer = 0;
  let questionA = 1;
  let questionB = selectedTables[0] || 2;

  const INTERMISSION_SECONDS = 5;
  let isIntermission = false;
  let intermissionInterval;

  // Game start gate (game page only)
  let gameStarted = false;

  // Set only on the game page
  let board1,
    board2,
    timerDisplay,
    score1Display,
    score2Display,
    questionDisplay,
    turnMessage,
    player1Input,
    player2Input;

  function isGamePage() {
    return !!(
      document.getElementById("board1") &&
      document.getElementById("board2") &&
      document.getElementById("question")
    );
  }

  // Start game only when the player clicks the Start button on game.html
  window.startPlay = function () {
    if (!isGamePage()) return;
    if (gameStarted) return;

    gameStarted = true;

    const startBtn = document.getElementById("playStartBtn");
    if (startBtn) {
      startBtn.disabled = true;
      startBtn.style.filter = "grayscale(0.15)";
    }

    // Fresh state (in case user came back to the game page)
    clearInterval(timer);
    clearInterval(intermissionInterval);
    isIntermission = false;
    currentPlayer = 1;
    score1 = 0;
    score2 = 0;
    player1Lines = new Set();
    player2Lines = new Set();

    // Ask names when game actually starts
    promptForNames();

    // Build boards, then start first question
    createBoard(board1, 1);
    createBoard(board2, 2);

    turnMessage.innerText = t("turn_message", { name: player1Input.value || t("player1") });
    updateScores();
    generateQuestion();
  };

  function promptForNames() {
    const p1 = prompt(t("enter_p1_name")) || t("player1");
    const p2 = prompt(t("enter_p2_name")) || t("player2");

    player1Input.value = p1;
    player2Input.value = p2;

    localStorage.setItem("player1Name", p1);
    localStorage.setItem("player2Name", p2);
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function createBoard(boardElement, player) {
    boardElement.innerHTML = "";

    // Refresh tables in case user changed menu selection
    selectedTables = getSelectedTables();

    for (let i = 0; i < 25; i++) {
      const table = pickRandom(selectedTables);
      const a = randInt(1, 9);
      const num = a * table;

      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.innerText = String(num);
      cell.dataset.number = String(num);
      cell.dataset.table = String(table);
      cell.dataset.a = String(a);
      cell.onclick = () => selectCell(cell, num, player);
      boardElement.appendChild(cell);
    }
  }

  function showCustomPopup(message) {
    const popup = document.createElement("div");
    popup.classList.add("custom-popup");
    popup.innerHTML = `<p>${message}</p>`;
    document.body.appendChild(popup);

    setTimeout(() => {
      popup.style.opacity = "1";
    }, 50);

    setTimeout(() => {
      popup.style.opacity = "0";
      setTimeout(() => popup.remove(), 350);
    }, 2200);
  }

  function ensureIntermissionOverlay() {
    let overlay = document.getElementById("intermissionOverlay");
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = "intermissionOverlay";
    overlay.className = "intermission-overlay";

    overlay.innerHTML = `
      <div class="intermission-card">
        <div class="intermission-title" id="handoverTitle"></div>
        <div class="intermission-msg" id="handoverMsg"></div>
        <div class="intermission-count" id="handoverCount"></div>
        <div class="intermission-hint" id="handoverHint">⏳</div>
      </div>
    `;

    document.body.appendChild(overlay);
    return overlay;
  }

  function startIntermission(nextPlayerName, onDone) {
    isIntermission = true;
    clearInterval(timer);
    clearInterval(intermissionInterval);

    const overlay = ensureIntermissionOverlay();
    overlay.classList.add("show");

    let remaining = INTERMISSION_SECONDS;
    const titleEl = document.getElementById("handoverTitle");
    const msgEl = document.getElementById("handoverMsg");
    const countEl = document.getElementById("handoverCount");

    function render() {
      titleEl.textContent = t("handover_title", { sec: remaining });
      msgEl.textContent = t("handover_message", { name: nextPlayerName });
      countEl.textContent = String(remaining);
    }

    render();

    intermissionInterval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(intermissionInterval);
        overlay.classList.remove("show");
        isIntermission = false;
        onDone && onDone();
        return;
      }
      render();
    }, 1000);
  }

  function generateQuestion() {
    const currentBoard = currentPlayer === 1 ? board1 : board2;

    // IMPORTANT: boards also contain visual overlays (e.g., red-line divs) that are NOT answer cells.
    const availableCells = Array.from(currentBoard.querySelectorAll(".cell")).filter(
      (cell) => !cell.classList.contains("selected")
    );

    if (availableCells.length === 0) {
      showCustomPopup(t("no_available_answers"));
      endGame();
      return;
    }

    const cell = pickRandom(availableCells);
    const n = Number(cell.dataset.number);
    const a = Number(cell.dataset.a);
    const b = Number(cell.dataset.table);

    correctAnswer = Number.isFinite(n) ? n : 0;
    questionA = Number.isFinite(a) ? a : 1;
    questionB = Number.isFinite(b) ? b : (selectedTables[0] || 2);

    const playerName = currentPlayer === 1 ? player1Input.value : player2Input.value;
    questionDisplay.innerText = t("question_prompt", { name: playerName, a: questionA, b: questionB });

    startTimer();
  }

  function startTimer() {
    clearInterval(timer);
    timeLeft = 15;
    timerDisplay.innerText = String(timeLeft);

    timer = setInterval(() => {
      timeLeft--;
      timerDisplay.innerText = String(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(timer);
        showCustomPopup(t("time_up"));
        nextTurn();
      }
    }, 1000);
  }

  function selectCell(cell, num, player) {
    if (isIntermission) return;
    if (!gameStarted) { showCustomPopup(t("press_start_first")); return; }
    if (player !== currentPlayer) {
      showCustomPopup(t("own_board_only"));
      return;
    }

    if (!cell.classList.contains("selected")) {
      clearInterval(timer);

      if (num === correctAnswer) {
        cell.classList.add("selected");
        const bonusPoints = timeLeft;
        showCustomPopup(t("correct_popup", { bonus: bonusPoints }));

        if (currentPlayer === 1) {
          score1 += 10 + bonusPoints;
        } else {
          score2 += 10 + bonusPoints;
        }

        updateScores();

        if (checkWinningCondition(player)) {
          return;
        }
      } else {
        showCustomPopup(t("incorrect_popup"));
      }

      nextTurn();
    }
  }

  let player1Lines = new Set();
  let player2Lines = new Set();

  function checkWinningCondition(player) {
    const board = player === 1 ? board1 : board2;
    // Only count actual answer cells (ignore overlay divs like red lines).
    const cells = Array.from(board.querySelectorAll('.cell'));
    // Each player should track THEIR OWN lines. Row/col indexes can repeat across boards.
    const linesSet = player === 1 ? player1Lines : player2Lines;

    const grid = Array(5)
      .fill(null)
      .map(() => Array(5).fill(false));

    for (let i = 0; i < 25; i++) {
      if (cells[i].classList.contains("selected")) {
        const row = Math.floor(i / 5);
        const col = i % 5;
        grid[row][col] = true;
      }
    }

    const winningLines = [];
    const newLines = new Set();

    for (let row = 0; row < 5; row++) {
      if (
        grid[row].every((c) => c) &&
        !linesSet.has(`row-${row}`)
      ) {
        winningLines.push({ type: "row", index: row });
        newLines.add(`row-${row}`);
      }
    }

    for (let col = 0; col < 5; col++) {
      if (
        grid.every((r) => r[col]) &&
        !linesSet.has(`col-${col}`)
      ) {
        winningLines.push({ type: "column", index: col });
        newLines.add(`col-${col}`);
      }
    }

    drawRedLines(winningLines, board);

    newLines.forEach((l) => linesSet.add(l));

    // Use >= so a single move that completes 2 lines can still win.
    if (linesSet.size >= 3) {
      const playerName = player === 1 ? player1Input.value : player2Input.value;
      showCustomPopup(t("wins_popup", { name: playerName }));

      if (player === 1) {
        score1 += 100;
      } else {
        score2 += 100;
      }

      updateScores();

      setTimeout(() => {
        endGame();
      }, 3000);

      return true;
    }

    return false;
  }

  function drawRedLines(winningLines, board) {
    winningLines.forEach((line) => {
      const overlay = document.createElement("div");
      overlay.classList.add("red-line");

      // Use only the answer cells for positioning (ignore previously drawn overlays).
      const cells = board.querySelectorAll('.cell');

      if (line.type === "row") {
        const firstCell = cells[line.index * 5];
        overlay.classList.add("horizontal");
        overlay.style.top = `${firstCell.offsetTop + firstCell.offsetHeight / 2}px`;
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "5px";
      } else if (line.type === "column") {
        const firstCell = cells[line.index];
        overlay.classList.add("vertical");
        overlay.style.left = `${firstCell.offsetLeft + firstCell.offsetWidth / 2}px`;
        overlay.style.top = "0";
        overlay.style.width = "5px";
        overlay.style.height = "100%";
      }

      board.appendChild(overlay);
    });
  }

  function nextTurn() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    const currentPlayerName = currentPlayer === 1 ? player1Input.value : player2Input.value;
    turnMessage.innerText = t("turn_message", { name: currentPlayerName });

    startIntermission(currentPlayerName, () => {
      generateQuestion();
    });
  }

  function updateScores() {
    score1Display.innerText = t("score_format", { name: player1Input.value, score: score1 });
    score2Display.innerText = t("score_format", { name: player2Input.value, score: score2 });
  }

  function endGame() {
    localStorage.setItem("finalScore1", String(score1));
    localStorage.setItem("finalScore2", String(score2));
    localStorage.setItem("player1Name", player1Input.value);
    localStorage.setItem("player2Name", player2Input.value);

    showCustomPopup(t("game_over_popup"));
    setTimeout(() => {
      window.location.href = "result.html";
    }, 2500);
  }

  window.addEventListener("load", () => {
    if (!isGamePage()) return;

    board1 = document.getElementById("board1");
    board2 = document.getElementById("board2");
    timerDisplay = document.getElementById("timer");
    score1Display = document.querySelector(".player-info:nth-child(1) .score-label");
    score2Display = document.querySelector(".player-info:nth-child(2) .score-label");
    questionDisplay = document.getElementById("question");
    turnMessage = document.getElementById("turnMessage");
    player1Input = document.getElementById("player1-name");
    player2Input = document.getElementById("player2-name");

    selectedTables = getSelectedTables();

    // Pre-start screen: do NOT start the game automatically.
    gameStarted = false;
    clearInterval(timer);
    clearInterval(intermissionInterval);
    isIntermission = false;
    currentPlayer = 1;
    score1 = 0;
    score2 = 0;
    player1Lines = new Set();
    player2Lines = new Set();

    // Clear old boards (if any) and show "ready" text
    if (board1) board1.innerHTML = "";
    if (board2) board2.innerHTML = "";
    if (timerDisplay) timerDisplay.innerText = "15";
    if (questionDisplay) questionDisplay.innerText = t("question_default");

    // Prefill names (no popups yet)
    const p1 = localStorage.getItem("player1Name") || t("player1");
    const p2 = localStorage.getItem("player2Name") || t("player2");
    if (player1Input) player1Input.value = p1;
    if (player2Input) player2Input.value = p2;

    updateScores();
    if (turnMessage) turnMessage.innerText = t("press_start_first");

    const startBtn = document.getElementById("playStartBtn");
    if (startBtn) startBtn.disabled = false;
  });
})();
