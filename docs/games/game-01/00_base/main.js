(() => {
  const GAME_TIME = 30;
  const STAR_SIZE = 64;

  const startButton = document.getElementById('startButton');
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
    timerId: null,
  };

  startButton.addEventListener('click', () => {
    if (state.playing) {
      return;
    }
    startButton.textContent = '게임 중...';
    startRound();
  });

  star.addEventListener('click', () => {
    if (!state.playing) {
      return;
    }
    state.score += 1;
    scoreEl.textContent = state.score;
    logEl.textContent = `좋아요! 현재 점수 ${state.score}점`;
    moveStar();
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
    logEl.textContent = '별이 나타났어요! 빨리 클릭하세요!';
    moveStar();
    startTimer();
  }

  function resetState() {
    state.score = 0;
    state.timeLeft = GAME_TIME;
    state.playing = true;
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
    startButton.disabled = false;
    startButton.textContent = '다시 하기';
    star.classList.add('hidden');
    helperEl.classList.remove('hidden');
    logEl.textContent = `게임 끝! 당신의 점수는 ${state.score}점이에요.`;
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
