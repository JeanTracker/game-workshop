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

  const visuals = {
    poseStage: 0,
    moveDelayId: null,
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
    handlePoseSequence();
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
    visuals.poseStage = 0;
    setPose('back');
    startButton.disabled = true;
    logEl.textContent = '별이 나타났어요! 빨리 클릭하세요!';
    moveStar();
    startTimer();
  }

  function resetState() {
    state.score = 0;
    state.timeLeft = GAME_TIME;
    state.playing = true;
    clearTimeout(visuals.moveDelayId);
    visuals.moveDelayId = null;
    visuals.poseStage = 0;
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
    clearTimeout(visuals.moveDelayId);
    visuals.moveDelayId = null;
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

  function handlePoseSequence() {
    if (visuals.poseStage === 0) {
      setPose('turn');
      visuals.poseStage = 1;
      scheduleMoveStar(220, false);
    } else if (visuals.poseStage === 1) {
      setPose('growl');
      visuals.poseStage = 2;
      scheduleMoveStar(320, true);
    } else {
      setPose('back');
      visuals.poseStage = 0;
      scheduleMoveStar(220, false);
    }
  }

  function scheduleMoveStar(delay = 220, resetAfter = false) {
    clearTimeout(visuals.moveDelayId);
    visuals.moveDelayId = setTimeout(() => {
      if (!state.playing) {
        return;
      }
      moveStar();
      if (resetAfter) {
        visuals.poseStage = 0;
        setPose('back');
      }
    }, delay);
  }

  function setPose(pose) {
    star.classList.remove('pose-back', 'pose-turn', 'pose-growl');
    const className = pose === 'turn' ? 'pose-turn' : pose === 'growl' ? 'pose-growl' : 'pose-back';
    star.classList.add(className);
  }
})();
