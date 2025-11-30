(() => {
  const GAME_TIME = 3;
  const STAR_SIZE = 118;
  const STAR_RESPAWN_INTERVAL = 700;
  const STAR_VISIBLE_TIME = 350;

  const startButton = document.getElementById('startButton');
  const pauseButton = document.getElementById('pauseButton');
  const scoreEl = document.getElementById('score');
  const timeEl = document.getElementById('time');
  const playArea = document.querySelector('.play-area');
  const star = document.querySelector('.star');
  const helperEl = document.querySelector('.helper');
  const logEl = document.querySelector('.log');

  const state = {
    score: 0,
    timeLeft: GAME_TIME,
    playing: false,
    paused: false,
    timerId: null,
    respawnId: null,
    hideTimeoutId: null,
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

  star.addEventListener('click', () => {
    if (!state.playing || state.paused) {
      return;
    }
    state.score += 1;
    scoreEl.textContent = state.score;
    logEl.textContent = `와! 말티즈 ${state.score}마리째 잡았어요. 목표는 1마리!`;
    spawnStar();
  });

  window.addEventListener('resize', () => {
    if (state.playing && !state.paused) {
      moveStar();
    }
  });

  function startRound() {
    resetState();
    helperEl.classList.add('hidden');
    startButton.disabled = true;
    pauseButton.disabled = false;
    pauseButton.textContent = '일시정지';
    logEl.textContent = '말티즈가 번개처럼 나타나고 사라져요!';
    spawnStar();
    startTimer();
    startRespawnLoop();
  }

  function resetState() {
    state.score = 0;
    state.timeLeft = GAME_TIME;
    state.playing = true;
    state.paused = false;
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
      logEl.textContent = `${state.timeLeft}초 남았어요! 말티즈 1마리만 잡으면 성공!`;
    }, 1000);
  }

  function startRespawnLoop() {
    clearInterval(state.respawnId);
    state.respawnId = setInterval(() => {
      spawnStar();
    }, STAR_RESPAWN_INTERVAL);
  }

  function spawnStar() {
    if (!state.playing || state.paused) {
      return;
    }
    star.classList.remove('hidden');
    moveStar();
    scheduleStarHide();
  }

  function scheduleStarHide() {
    clearTimeout(state.hideTimeoutId);
    state.hideTimeoutId = setTimeout(() => {
      star.classList.add('hidden');
    }, STAR_VISIBLE_TIME);
  }

  function finishRound() {
    clearInterval(state.timerId);
    state.timerId = null;
    clearInterval(state.respawnId);
    state.respawnId = null;
    clearTimeout(state.hideTimeoutId);
    state.hideTimeoutId = null;
    state.playing = false;
    state.paused = false;
    startButton.disabled = false;
    startButton.textContent = '다시 하기';
    pauseButton.disabled = true;
    pauseButton.textContent = '일시정지';
    star.classList.add('hidden');
    helperEl.classList.remove('hidden');
    if (state.score >= 1) {
      logEl.textContent = `게임 끝! ${state.score}마리 잡았어요. 도망가는 말티즈 임무 성공!`;
    } else {
      logEl.textContent = '아쉽지만 한 마리도 잡지 못했어요. 다시 도전해 볼까요?';
    }
  }

  function pauseGame() {
    state.paused = true;
    clearInterval(state.timerId);
    state.timerId = null;
    clearInterval(state.respawnId);
    state.respawnId = null;
    clearTimeout(state.hideTimeoutId);
    state.hideTimeoutId = null;
    pauseButton.textContent = '다시 시작';
    logEl.textContent = '일시정지! 숨 고르고 다시 이어서 해봐요.';
  }

  function resumeGame() {
    state.paused = false;
    pauseButton.textContent = '일시정지';
    logEl.textContent = '게임 재개! 계속해서 말티즈를 쫓아보세요!';
    startTimer();
    startRespawnLoop();
    spawnStar();
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
