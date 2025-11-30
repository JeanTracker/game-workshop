(() => {
  const GAME_TIME = 30;
  const STAR_SIZE = 64;

  const startButton = document.getElementById('startButton');
  const pauseButton = document.getElementById('pauseButton');
  const scoreEl = document.getElementById('score');
  const timeEl = document.getElementById('time');
  const playArea = document.querySelector('.play-area');
  const star = document.querySelector('.star');
  const helperEl = document.querySelector('.helper');
  const logEl = document.querySelector('.log');
  const popup = document.querySelector('.popup');
  const nextStageButton = document.getElementById('nextStageButton');

  const state = {
    score: 0,
    timeLeft: GAME_TIME,
    playing: false,
    paused: false,
    timerId: null,
    popupOpen: false,
    stage: 1,
  };

  startButton.addEventListener('click', () => {
    if (state.playing) {
      return;
    }
    startButton.textContent = '게임 중...';
    startRound();
  });

  pauseButton.addEventListener('click', () => {
    if (!state.playing) {
      return;
    }
    if (state.paused) {
      resumeGame();
    } else {
      pauseGame();
    }
  });

  nextStageButton.addEventListener('click', () => {
    if (!state.popupOpen || !state.playing) {
      return;
    }
    advanceStage();
  });

  star.addEventListener('click', () => {
    if (!state.playing || state.paused || state.popupOpen) {
      return;
    }
    state.score += 1;
    scoreEl.textContent = state.score;
    logEl.textContent = `와! ${state.score}점 달성! 팝업을 눌러 다음 단계로 이동하세요.`;
    showPopup();
  });

  window.addEventListener('resize', () => {
    if (state.playing) {
      moveStar();
    }
  });

  function startRound() {
    resetState();
    helperEl.classList.add('hidden');
    star.classList.remove('hidden');
    startButton.disabled = true;
    pauseButton.disabled = false;
    pauseButton.textContent = '일시정지';
    hidePopup();
    state.stage = 1;
    logEl.textContent = '별이 나타났어요! 빨리 클릭하세요!';
    moveStar();
    startTimer();
  }

  function resetState() {
    state.score = 0;
    state.timeLeft = GAME_TIME;
    state.playing = true;
    state.paused = false;
    state.stage = 1;
    state.popupOpen = false;
    scoreEl.textContent = state.score;
    timeEl.textContent = state.timeLeft;
  }

  function startTimer() {
    clearInterval(state.timerId);
    state.timerId = setInterval(() => {
      state.timeLeft -= 1;
      if (state.timeLeft <= 0) {
        timeEl.textContent = '0';
        finishRound();
        return;
      }
      timeEl.textContent = state.timeLeft;
      if (state.timeLeft % 5 === 0) {
        logEl.textContent = `${state.timeLeft}초 남았어요!`;
      }
    }, 1000);
  }

  function finishRound() {
    clearInterval(state.timerId);
    state.timerId = null;
    state.playing = false;
    state.paused = false;
    startButton.disabled = false;
    startButton.textContent = '다시 하기';
    pauseButton.disabled = true;
    pauseButton.textContent = '일시정지';
    star.classList.add('hidden');
    helperEl.classList.remove('hidden');
    hidePopup();
    logEl.textContent = `게임 끝! 당신의 점수는 ${state.score}점이에요.`;
  }

  function pauseGame() {
    state.paused = true;
    clearInterval(state.timerId);
    state.timerId = null;
    pauseButton.textContent = '다시 시작';
    logEl.textContent = '일시정지! 다시 시작 버튼을 눌러 보세요.';
  }

  function showPopup() {
    state.popupOpen = true;
    state.paused = true;
    star.classList.add('hidden');
    pauseButton.disabled = true;
    clearInterval(state.timerId);
    state.timerId = null;
    popup.classList.remove('hidden');
    requestAnimationFrame(() => popup.classList.add('open'));
  }

  function hidePopup() {
    popup.classList.remove('open');
    popup.classList.add('hidden');
    state.popupOpen = false;
  }

  function advanceStage() {
    state.stage += 1;
    hidePopup();
    pauseButton.disabled = false;
    state.paused = false;
    star.classList.remove('hidden');
    logEl.textContent = `스테이지 ${state.stage}! 더 빠르게 별을 잡아보세요!`;
    moveStar();
    startTimer();
  }

  function resumeGame() {
    state.paused = false;
    pauseButton.textContent = '일시정지';
    logEl.textContent = '게임 재개! 계속해서 별을 잡아보세요!';
    startTimer();
  }

  function moveStar() {
    const width = playArea.clientWidth;
    const height = playArea.clientHeight;
    const maxX = Math.max(width - STAR_SIZE, 0);
    const maxY = Math.max(height - STAR_SIZE, 0);
    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;
    star.style.left = `${randomX}px`;
    star.style.top = `${randomY}px`;
  }
})();
