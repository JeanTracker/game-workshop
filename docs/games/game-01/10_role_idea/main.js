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
    streak: 0,
    level: 1,
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
    state.streak += 1;
    if (state.streak >= 3) {
      state.score += 1;
      state.level += 1;
      logEl.textContent = `말티즈가 화났어요! ${state.score}점 → 단계 ${state.level}`;
      celebrateLevelUp();
    } else {
      logEl.textContent = `연타 ${state.streak}회! 화나기까지 ${3 - state.streak}번 남았어요.`;
    }
    scoreEl.textContent = state.score;
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
    logEl.textContent = '말티즈가 숨어 있다 나타나요! 연타로 화나게 해서 점수를 얻어 보세요!';
    moveStar();
    startTimer();
  }

  function resetState() {
    state.score = 0;
    state.timeLeft = GAME_TIME;
    state.playing = true;
    state.level = 1;
    state.streak = 0;
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
        logEl.textContent = `${state.timeLeft}초 남았어요! 단계 ${state.level}에서 계속 연타!`;
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
    if (state.score >= 1) {
      logEl.textContent = `게임 끝! ${state.score}점, 단계 ${state.level}까지 도달했어요!`;
    } else {
      logEl.textContent = '아쉽지만 말티즈를 화나게 하지 못했어요. 다시 도전해 볼까요?';
    }
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
    state.streak = 0;
  }

  function celebrateLevelUp() {
    state.streak = 0;
    star.classList.add('shake');
    setTimeout(() => {
      star.classList.remove('shake');
    }, 350);
  }
})();
