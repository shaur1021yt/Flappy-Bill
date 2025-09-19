document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('game-container');
  container.innerHTML = `
    <div id="start-screen">
      <h2>Flappy Bill</h2>
      <button id="normal-mode" class="button">Normal Mode</button>
      <button id="hard-mode" class="button">Hard Mode</button>
    </div>
    <div id="game" style="display:none;">
      <span class="score">Score: 0</span>
      <div id="bird"></div>
    </div>
    <button id="start-game" class="button" style="display:none;">Start Game</button>
    <div id="game-status"></div>
  `;

  const startScreen = document.getElementById('start-screen');
  const game = document.getElementById('game');
  const bird = document.getElementById('bird');
  const scoreEl = document.querySelector('.score');
  const startBtn = document.getElementById('start-game');
  const statusEl = document.getElementById('game-status');
  const normalBtn = document.getElementById('normal-mode');
  const hardBtn = document.getElementById('hard-mode');

  bird.style.width = '40px';
  bird.style.height = '40px';
  bird.style.background = '#ffeb3b';
  bird.style.borderRadius = '50%';
  bird.style.position = 'absolute';
  bird.style.left = '100px';
  bird.style.top = '180px';

  let birdY = 180;
  let velocity = 0;
  let gravity = 0.4;
  let isPlaying = false;
  let pipes = [];
  let aliens = [];
  let score = 0;
  let gameInterval, pipeInterval, alienInterval;
  let hardMode = false;
  let lastGapTop = 150; // Default gap position
  const pipeGap = 130; // Consistent gap for pipes and collision

  function resetGame() {
    birdY = 180;
    velocity = 0;
    score = 0;
    scoreEl.textContent = 'Score: 0';
    statusEl.textContent = '';
    pipes.forEach(pipe => pipe.remove());
    pipes = [];
    bird.style.top = birdY + 'px';
    aliens.forEach(alien => alien.remove());
    aliens = [];
  }

  function startGame() {
    resetGame();
    isPlaying = true;
    game.style.display = '';
    startBtn.style.display = 'none';
    startScreen.style.display = 'none';
    gameInterval = setInterval(gameLoop, 20);
    pipeInterval = setInterval(createPipe, 1800);
    if (hardMode) alienInterval = setInterval(createAlien, 2000);
  }

  function endGame() {
    isPlaying = false;
    clearInterval(gameInterval);
    clearInterval(pipeInterval);
    clearInterval(alienInterval);
    statusEl.textContent = 'Game Over! Click Start Game to play again.';
    startBtn.style.display = '';
  }

  function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw &&
           ax + aw > bx &&
           ay < by + bh &&
           ay + ah > by;
  }

  function gameLoop() {
    velocity += gravity;
    birdY += velocity;
    if (birdY < 0) birdY = 0;
    if (birdY > 360) {
      birdY = 360;
      endGame();
    }
    bird.style.top = birdY + 'px';

    const birdX = 100, birdW = 40, birdH = 40;

    pipes.forEach(pipe => {
      let pipeX = parseInt(pipe.style.left);

      // Top pipe collision
      const gapTop = parseInt(pipe.dataset.gapTop);
      if (rectsOverlap(birdX, birdY, birdW, birdH, pipeX, 0, 60, gapTop)) {
        endGame();
      }
      // Bottom pipe collision
      if (rectsOverlap(birdX, birdY, birdW, birdH, pipeX, gapTop + pipeGap, 60, 400 - gapTop - pipeGap)) {
        endGame();
      }

      pipeX -= 2;
      pipe.style.left = pipeX + 'px';

      if (!pipe.passed && pipeX < birdX) {
        score++;
        scoreEl.textContent = 'Score: ' + score;
        pipe.passed = true;
      }
      if (pipeX < -60) {
        pipe.remove();
      }
    });
    pipes = pipes.filter(pipe => parseInt(pipe.style.left) > -60);

    aliens.forEach(alien => {
  let alienX = parseInt(alien.style.left);
  let alienY = parseInt(alien.style.top);

  // More precise hitbox: shrink to 28x28 and center inside the 40x40 alien
  const alienHitboxX = alienX + 6;
  const alienHitboxY = alienY + 6;
  const alienHitboxW = 28;
  const alienHitboxH = 28;

  if (rectsOverlap(birdX, birdY, birdW, birdH, alienHitboxX, alienHitboxY, alienHitboxW, alienHitboxH)) {
    endGame();
  }

  alienX -= 3;
  alien.style.left = alienX + 'px';

  if (alienX < -40) {
    alien.remove();
  }
});
aliens = aliens.filter(alien => parseInt(alien.style.left) > -40);
  }

  function createPipe() {
    const gapTop = Math.floor(Math.random() * 200) + 50;
    lastGapTop = gapTop; // Save for alien spawn
    const pipe = document.createElement('div');
    pipe.className = 'pipe';
    pipe.style.position = 'absolute';
    pipe.style.left = '600px';
    pipe.style.width = '60px';
    pipe.style.height = '400px';
    pipe.style.top = '0';
    pipe.style.background = 'transparent';
    pipe.dataset.gapTop = gapTop;
    pipe.passed = false;

    const topPipe = document.createElement('div');
    topPipe.style.position = 'absolute';
    topPipe.style.left = '0';
    topPipe.style.top = '0';
    topPipe.style.width = '60px';
    topPipe.style.height = gapTop + 'px';
    topPipe.style.background = '#4CAF50';
    pipe.appendChild(topPipe);

    const bottomPipe = document.createElement('div');
    bottomPipe.style.position = 'absolute';
    bottomPipe.style.left = '0';
    bottomPipe.style.top = (gapTop + pipeGap) + 'px';
    bottomPipe.style.width = '60px';
    bottomPipe.style.height = (400 - gapTop - pipeGap) + 'px';
    bottomPipe.style.background = '#4CAF50';
    pipe.appendChild(bottomPipe);

    game.appendChild(pipe);
    pipes.push(pipe);
  }

  function createAlien() {
    // Avoid spawning in the pipe gap
    let alienTop;
    do {
      alienTop = Math.floor(Math.random() * 360);
    } while (alienTop > lastGapTop - 40 && alienTop < lastGapTop + pipeGap);

    const alien = document.createElement('div');
    alien.className = 'alien';
    alien.style.position = 'absolute';
    alien.style.left = '600px';
    alien.style.top = alienTop + 'px';
    alien.style.width = '40px';
    alien.style.height = '40px';
    alien.style.background = 'purple';
    alien.style.borderRadius = '50%';
    alien.style.boxShadow = '0 0 10px #00ffea';
    alien.style.border = '2px solid #fff';
    game.appendChild(alien);
    aliens.push(alien);
  }

  document.addEventListener('keydown', e => {
    if (isPlaying && (e.code === 'Space' || e.code === 'ArrowUp')) {
      velocity = -6;
    }
    if (!isPlaying && e.code === 'Enter') {
      startGame();
    }
    if (isPlaying && (e.code === 'KeyR' || e.key === 'r')) {
      resetGame();
    }
  });

  game.addEventListener('click', () => {
    if (isPlaying) velocity = -6;
  });

  startBtn.addEventListener('click', () => {
    if (!isPlaying) startGame();
  });

  normalBtn.addEventListener('click', () => {
    hardMode = false;
    game.style.display = '';
    startBtn.style.display = '';
    startScreen.style.display = 'none';
    statusEl.textContent = 'Press Start Game or Enter!';
  });

  hardBtn.addEventListener('click', () => {
    hardMode = true;
    game.style.display = '';
    startBtn.style.display = '';
    startScreen.style.display = 'none';
    statusEl.textContent = 'Press Start Game or Enter! (Aliens will spawn)';
  });
});