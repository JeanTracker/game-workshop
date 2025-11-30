(() => {
  const GAME_TIME = 10;
  const STAR_SIZE = 64;
  const HITS_REQUIRED = 3;
  const BASE_SPEED = 140; // px/sec
  const SPEED_STEP = 30;
  const RESPAWN_DELAY_MS = 600;

  const startButton = document.getElementById('startButton');
  const stageEl = document.getElementById('stage');
  const timeEl = document.getElementById('time');
  const playArea = document.querySelector('.play-area');
  const star = document.querySelector('.star');
  const helperEl = document.querySelector('.helper');
  const logEl = document.querySelector('.log');
  const popup = document.querySelector('.popup');
  const nextStageButton = document.getElementById('nextStageButton');
  const trees = Array.from(document.querySelectorAll('.tree'));

  const state = {
    stage: 1,
    hits: 0,
    timeLeft: GAME_TIME,
    playing: false,
    timerId: null,
    respawnTimeoutId: null,
    moveFrameId: null,
    lastFrameTime: null,
    direction: 1,
    speed: BASE_SPEED,
    popupOpen: false,
  };

  const visuals = {
    poseTimeoutId: null,
  };

  startButton.addEventListener('click', () => {
    if (state.playing) {
      return;
    }
    startButton.textContent = '게임 중...';
    startRound();
  });

  star.addEventListener('click', () => {
    if (!state.playing || state.popupOpen || star.classList.contains('hidden')) {
      return;
    }
    state.hits += 1;
    updatePoseByHits();
    const remain = HITS_REQUIRED - state.hits;
    if (state.hits >= HITS_REQUIRED) {
      handleStageClear();
    } else {
      logEl.textContent = `연타 ${state.hits}회! ${remain}번 더 클릭하면 단계 클리어!`;
    }
  });

  nextStageButton.addEventListener('click', () => {
    if (!state.popupOpen) {
      return;
    }
    advanceStage();
  });

  window.addEventListener('resize', () => {
    if (state.playing && !state.popupOpen) {
      positionStarNearTree();
    }
  });

  function startRound() {
    resetState();
    helperEl.classList.add('hidden');
    startButton.disabled = true;
    logEl.textContent = '말티즈가 나무 뒤에서 달려 나와요. 화면 밖으로 나가기 전에 3번 클릭!';
    updateObstacles();
    spawnStar();
    startTimer();
  }

  function resetState() {
    state.stage = 1;
    state.hits = 0;
    state.timeLeft = GAME_TIME;
    state.playing = true;
    state.popupOpen = false;
    updateStageDisplay();
    timeEl.textContent = state.timeLeft;
    hidePopup();
    setPose('back');
  }

  function updateStageDisplay() {
    stageEl.textContent = state.stage;
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
      logEl.textContent = `${state.timeLeft}초 남았어요! 단계 ${state.stage} 진행 중.`;
    }, 1000);
  }

  function pauseTimer() {
    clearInterval(state.timerId);
    state.timerId = null;
  }

  function finishRound() {
    pauseTimer();
    clearTimeout(state.respawnTimeoutId);
    cancelAnimationFrame(state.moveFrameId);
    state.moveFrameId = null;
    state.playing = false;
    startButton.disabled = false;
    startButton.textContent = '다시 하기';
    star.classList.add('hidden');
    helperEl.classList.remove('hidden');
    hidePopup();
    logEl.textContent = `게임 끝! ${state.stage}단계까지 도전했어요.`;
  }

  function spawnStar() {
    if (!state.playing || state.popupOpen) {
      return;
    }
    clearTimeout(state.respawnTimeoutId);
    cancelAnimationFrame(state.moveFrameId);
    state.moveFrameId = null;
    state.lastFrameTime = null;
    state.hits = 0;
    setPose('back');
    state.speed = BASE_SPEED + (state.stage - 1) * SPEED_STEP;
    positionStarNearTree();
    setInitialDirection();
    star.classList.remove('hidden');
    state.moveFrameId = requestAnimationFrame(moveStar);
  }

  function moveStar(timestamp) {
    if (!state.playing || state.popupOpen) {
      return;
    }
    if (!state.lastFrameTime) {
      state.lastFrameTime = timestamp;
    }
    const delta = (timestamp - state.lastFrameTime) / 1000;
    state.lastFrameTime = timestamp;
    const currentX = parseFloat(star.style.left) || 0;
    const nextX = currentX + state.direction * state.speed * delta;
    star.style.left = `${nextX}px`;

    if (nextX < -STAR_SIZE || nextX > playArea.clientWidth) {
      star.classList.add('hidden');
      logEl.textContent = '말티즈가 화면 밖으로 도망쳤어요! 다시 노려봐요!';
      scheduleRespawn();
      state.moveFrameId = null;
      return;
    }

    state.moveFrameId = requestAnimationFrame(moveStar);
  }

  function handleStageClear() {
    cancelAnimationFrame(state.moveFrameId);
    state.moveFrameId = null;
    star.classList.add('hidden');
    logEl.textContent = `성공! 단계 ${state.stage}을(를) 클리어했어요!`;
    showPopup();
  }

  function scheduleRespawn() {
    clearTimeout(state.respawnTimeoutId);
    state.respawnTimeoutId = setTimeout(() => {
      if (state.playing && !state.popupOpen) {
        spawnStar();
      }
    }, RESPAWN_DELAY_MS);
  }

  function showPopup() {
    state.popupOpen = true;
    pauseTimer();
    popup.classList.remove('hidden');
    requestAnimationFrame(() => popup.classList.add('open'));
  }

  function hidePopup() {
    popup.classList.remove('open');
    popup.classList.add('hidden');
    state.popupOpen = false;
  }

  function advanceStage() {
    hidePopup();
    state.stage += 1;
    updateStageDisplay();
    updateObstacles();
    if (!state.playing) {
      return;
    }
    logEl.textContent = `단계 ${state.stage} 시작! 더욱 빨라진 말티즈를 잡아보세요!`;
    spawnStar();
    startTimer();
  }

  function positionStarNearTree() {
    const activeTrees = trees.filter((tree) => !tree.classList.contains('hidden-tree'));
    const targetTree = activeTrees.length
      ? activeTrees[Math.floor(Math.random() * activeTrees.length)]
      : null;
    if (!targetTree) {
      moveStarRandomly();
      return;
    }
    const playRect = playArea.getBoundingClientRect();
    const treeRect = targetTree.getBoundingClientRect();
    const rawX = treeRect.left - playRect.left + treeRect.width / 2 - STAR_SIZE / 2;
    const rawY = treeRect.top - playRect.top + treeRect.height / 2 - STAR_SIZE / 2;
    const maxX = Math.max(playArea.clientWidth - STAR_SIZE, 0);
    const maxY = Math.max(playArea.clientHeight - STAR_SIZE, 0);
    star.style.left = `${clamp(rawX, 0, maxX)}px`;
    star.style.top = `${clamp(rawY, 0, maxY)}px`;
  }

  function moveStarRandomly() {
    const maxX = Math.max(playArea.clientWidth - STAR_SIZE, 0);
    const maxY = Math.max(playArea.clientHeight - STAR_SIZE, 0);
    star.style.left = `${Math.random() * maxX}px`;
    star.style.top = `${Math.random() * maxY}px`;
  }

  function setInitialDirection() {
    state.direction = Math.random() > 0.5 ? 1 : -1;
    const maxX = Math.max(playArea.clientWidth - STAR_SIZE, 0);
    let currentX = parseFloat(star.style.left) || 0;
    if (state.direction > 0 && currentX > maxX - 40) {
      currentX = maxX - 40;
    }
    if (state.direction < 0 && currentX < 40) {
      currentX = 40;
    }
    star.style.left = `${clamp(currentX, 0, maxX)}px`;
  }

  function updateObstacles() {
    trees.forEach((tree) => {
      const required = Number(tree.dataset.requiredStage || 1);
      if (state.stage >= required) {
        tree.classList.remove('hidden-tree');
      } else {
        tree.classList.add('hidden-tree');
      }
    });
  }

  function updatePoseByHits() {
    if (state.hits === 1) {
      setPose('turn');
    } else if (state.hits === 2) {
      setPose('growl');
    } else {
      setPose('back');
    }
  }

  function setPose(pose) {
    clearTimeout(visuals.poseTimeoutId);
    star.classList.remove('pose-back', 'pose-turn', 'pose-growl');
    const cls = pose === 'turn' ? 'pose-turn' : pose === 'growl' ? 'pose-growl' : 'pose-back';
    star.classList.add(cls);
    if (pose !== 'back') {
      visuals.poseTimeoutId = setTimeout(() => {
        star.classList.remove('pose-turn', 'pose-growl');
        star.classList.add('pose-back');
      }, 400);
    }
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
})();
