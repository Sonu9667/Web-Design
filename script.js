const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const startBtn = document.getElementById('start-btn');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayText = document.getElementById('overlay-text');

const game = {
  width: canvas.width,
  height: canvas.height,
  gravity: 0.35,
  flapStrength: -6.2,
  pipeGap: 140,
  pipeWidth: 54,
  pipeSpeed: 2.6,
  pipeSpacing: 180,
  groundHeight: 70,
};

let bird;
let pipes;
let score;
let bestScore = 0;
let frameId;
let lastPipeX;
let state = 'idle';

const colors = {
  skyTop: '#8fd3ff',
  skyBottom: '#dff5ff',
  ground: '#f6c65b',
  groundShadow: '#d99e3c',
  pipe: '#2ecc71',
  pipeShadow: '#1e9f57',
  bird: '#ffb703',
  birdWing: '#fb8500',
  beak: '#ff6700',
};

const initBird = () => ({
  x: 90,
  y: canvas.height / 2,
  radius: 14,
  velocity: 0,
});

const initGame = () => {
  bird = initBird();
  pipes = [];
  score = 0;
  lastPipeX = canvas.width;
  updateScore();
};

const updateScore = () => {
  scoreEl.textContent = score.toString();
  bestEl.textContent = bestScore.toString();
};

const addPipe = () => {
  const minGapY = 120;
  const maxGapY = canvas.height - game.groundHeight - 120;
  const gapY = Math.random() * (maxGapY - minGapY) + minGapY;

  pipes.push({
    x: canvas.width,
    gapY,
    passed: false,
  });
};

const drawBackground = () => {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, colors.skyTop);
  gradient.addColorStop(1, colors.skyBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = colors.ground;
  ctx.fillRect(0, canvas.height - game.groundHeight, canvas.width, game.groundHeight);
  ctx.fillStyle = colors.groundShadow;
  ctx.fillRect(0, canvas.height - game.groundHeight, canvas.width, 6);
};

const drawBird = () => {
  ctx.save();
  ctx.translate(bird.x, bird.y);
  const tilt = Math.max(-0.4, Math.min(0.6, bird.velocity / 10));
  ctx.rotate(tilt);

  ctx.fillStyle = colors.bird;
  ctx.beginPath();
  ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = colors.birdWing;
  ctx.beginPath();
  ctx.ellipse(-4, 2, 6, 4, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = colors.beak;
  ctx.beginPath();
  ctx.moveTo(bird.radius - 2, -3);
  ctx.lineTo(bird.radius + 8, 0);
  ctx.lineTo(bird.radius - 2, 3);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#1d3557';
  ctx.beginPath();
  ctx.arc(-4, -4, 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

const drawPipe = (pipe) => {
  const topPipeHeight = pipe.gapY - game.pipeGap / 2;
  const bottomPipeY = pipe.gapY + game.pipeGap / 2;
  const bottomPipeHeight = canvas.height - game.groundHeight - bottomPipeY;

  ctx.fillStyle = colors.pipe;
  ctx.fillRect(pipe.x, 0, game.pipeWidth, topPipeHeight);
  ctx.fillRect(pipe.x, bottomPipeY, game.pipeWidth, bottomPipeHeight);

  ctx.fillStyle = colors.pipeShadow;
  ctx.fillRect(pipe.x + game.pipeWidth - 6, 0, 6, topPipeHeight);
  ctx.fillRect(pipe.x + game.pipeWidth - 6, bottomPipeY, 6, bottomPipeHeight);
};

const updateBird = () => {
  bird.velocity += game.gravity;
  bird.y += bird.velocity;
};

const updatePipes = () => {
  pipes.forEach((pipe) => {
    pipe.x -= game.pipeSpeed;
    if (!pipe.passed && pipe.x + game.pipeWidth < bird.x) {
      pipe.passed = true;
      score += 1;
      updateScore();
    }
  });

  pipes = pipes.filter((pipe) => pipe.x + game.pipeWidth > 0);

  if (canvas.width - lastPipeX >= game.pipeSpacing) {
    addPipe();
    lastPipeX = canvas.width;
  } else {
    lastPipeX -= game.pipeSpeed;
  }
};

const checkCollision = () => {
  if (bird.y + bird.radius >= canvas.height - game.groundHeight) {
    return true;
  }
  if (bird.y - bird.radius <= 0) {
    return true;
  }

  return pipes.some((pipe) => {
    const inPipeXRange = bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + game.pipeWidth;
    if (!inPipeXRange) {
      return false;
    }
    const topPipeHeight = pipe.gapY - game.pipeGap / 2;
    const bottomPipeY = pipe.gapY + game.pipeGap / 2;
    const hitTop = bird.y - bird.radius < topPipeHeight;
    const hitBottom = bird.y + bird.radius > bottomPipeY;
    return hitTop || hitBottom;
  });
};

const render = () => {
  drawBackground();
  pipes.forEach(drawPipe);
  drawBird();
};

const gameLoop = () => {
  updateBird();
  updatePipes();
  render();

  if (checkCollision()) {
    endGame();
    return;
  }

  frameId = requestAnimationFrame(gameLoop);
};

const startGame = () => {
  cancelAnimationFrame(frameId);
  initGame();
  state = 'playing';
  overlay.classList.add('hidden');
  startBtn.textContent = 'Restart';
  gameLoop();
};

const endGame = () => {
  state = 'over';
  cancelAnimationFrame(frameId);
  bestScore = Math.max(bestScore, score);
  updateScore();
  overlayTitle.textContent = 'Game Over';
  overlayText.textContent = 'Click or press space to try again.';
  overlay.classList.remove('hidden');
};

const flap = () => {
  if (state === 'idle') {
    startGame();
    return;
  }
  if (state === 'over') {
    startGame();
    return;
  }
  bird.velocity = game.flapStrength;
};

const handleKey = (event) => {
  if (event.code === 'Space' || event.code === 'ArrowUp') {
    event.preventDefault();
    flap();
  }
};

startBtn.addEventListener('click', startGame);
window.addEventListener('keydown', handleKey);
canvas.addEventListener('mousedown', flap);
canvas.addEventListener('touchstart', (event) => {
  event.preventDefault();
  flap();
});

initGame();
render();
