let morcego, game, scoreDisplay, initialScreen, deathScreen, finalScore, recordDisplay, initialScreenRecord;
let backgroundMusic, jumpMusic, endMusic;
let morcegoY, gameInterval, pipeInterval, obstacleInterval, score, backgroundPositionX, gameOver, gameStarted, record;
const gravity = 0.5; // Aumenta a gravidade
const lift = -6; // Diminui a força do pulo
let velocity = 0;

document.addEventListener('DOMContentLoaded', () => {
    morcego = document.getElementById('morcego');
    game = document.getElementById('game');
    scoreDisplay = document.getElementById('score');
    initialScreen = document.getElementById('initial-screen');
    deathScreen = document.getElementById('death-screen');
    finalScore = document.getElementById('final-score');
    recordDisplay = document.getElementById('record');
    initialScreenRecord = document.getElementById('initial-record');

    backgroundMusic = document.getElementById('background-music');
    jumpMusic = document.getElementById('jump-music');
    endMusic = document.getElementById('end-music');

    backgroundMusic.volume = 0.5;

    morcegoY = window.innerHeight / 2;
    gameInterval;
    pipeInterval;
    obstacleInterval;
    score = 0;
    backgroundPositionX = 0;
    gameOver = false;
    gameStarted = false;

    record = localStorage.getItem('record') || 0;
    recordDisplay.textContent = "Recorde: " + record;
    initialScreenRecord.textContent = "Recorde: " + record;

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            if (!gameStarted) {
                initialScreen.style.display = 'none';
                gameStarted = true;
                startGame();
            } else if (deathScreen.style.display === 'flex') {
                window.location.reload();
            } else {
                fly();
            }
        }
    });
});

function startGame() {
    gameInterval = setInterval(gameLoop, 20);
    pipeInterval = setInterval(createPipe, 2000); // Diminui o intervalo entre a criação dos tubos
    obstacleInterval = setInterval(createObstacle, 2000); // Intervalo para criação de pássaros e nuvens
    backgroundMusic.play();
}

function gameLoop() {
    if (gameOver) return;

    velocity += gravity;
    morcegoY += velocity;
    morcego.style.top = morcegoY + 'px';

    if (morcegoY > window.innerHeight || morcegoY < 0) endGame();

    let hitboxBuffer = 10;
    let pipes = document.querySelectorAll('.pipe');
    pipes.forEach(pipe => {
        let pipeRect = pipe.getBoundingClientRect();
        let morcegoRect = morcego.getBoundingClientRect();
        let buffer = 5;
        if (
            morcegoRect.right - buffer - hitboxBuffer > pipeRect.left &&
            morcegoRect.left + buffer + hitboxBuffer < pipeRect.right &&
            ((morcegoRect.bottom - buffer - hitboxBuffer > pipeRect.top && pipe.classList.contains('bottom')) ||
            (morcegoRect.top + buffer + hitboxBuffer < pipeRect.bottom && pipe.classList.contains('top')))
        ) {
            endGame();
        }

        if (!pipe.passed && morcegoRect.right - buffer > pipeRect.right) {
            pipe.passed = true;
            if (pipe.classList.contains('top')) {
                score++;
                scoreDisplay.textContent = score;
                scoreDisplay.classList.remove('deflate');
                scoreDisplay.classList.add('deflate');
            }
        }

        if (pipeRect.right < 0) {
            pipe.remove();
        }
    });

    let obstacles = document.querySelectorAll('.bird, .cloud');
    obstacles.forEach(obstacle => {
        let obstacleRect = obstacle.getBoundingClientRect();
        let morcegoRect = morcego.getBoundingClientRect();
        let buffer = 5;
        if (
            morcegoRect.right - buffer - hitboxBuffer > obstacleRect.left &&
            morcegoRect.left + buffer + hitboxBuffer < obstacleRect.right &&
            morcegoRect.bottom - buffer - hitboxBuffer > obstacleRect.top &&
            morcegoRect.top + buffer + hitboxBuffer < obstacleRect.bottom
        ) {
            endGame();
        }

        if (obstacleRect.right < 0) {
            obstacle.remove();
        }
    });

    scoreDisplay.onanimationend = () => {
        scoreDisplay.classList.remove('deflate');
    };

    backgroundPositionX -= 2;
    game.style.backgroundPositionX = backgroundPositionX + 'px';
}

function createPipe() {
    let pipeHeight = Math.floor(Math.random() * (window.innerHeight / 2)) + 50;
    const gap = 150; // Diminui o tamanho do gap entre os tubos

    let topPipe = document.createElement('div');
    topPipe.classList.add('pipe', 'top');
    topPipe.style.height = pipeHeight + 'px';
    topPipe.style.left = '100%';
    topPipe.passed = false;
    game.appendChild(topPipe);

    let bottomPipe = document.createElement('div');
    bottomPipe.classList.add('pipe', 'bottom');
    bottomPipe.style.height = (window.innerHeight - pipeHeight - gap) + 'px';
    bottomPipe.style.left = '100%';
    bottomPipe.passed = false;
    game.appendChild(bottomPipe);

    setTimeout(() => {
        if (!gameOver) {
            topPipe.remove();
            bottomPipe.remove();
        }
    }, 3000); // Reduz o tempo de remoção dos tubos para corresponder à velocidade aumentada
}

function createObstacle() {
    let obstacleType = Math.random() > 0.5 ? 'bird' : 'cloud';
    let obstacle = document.createElement('div');
    obstacle.classList.add(obstacleType);

    let obstacleHeight = Math.random() * (window.innerHeight - 60); // Evita que as nuvens e pássaros saiam da tela
    obstacle.style.top = obstacleHeight + 'px';
    obstacle.style.left = '100%';

    game.appendChild(obstacle);

    setTimeout(() => {
        if (!gameOver) {
            moveObstacle(obstacle); // Chama a função de movimento do obstáculo
        }
    }, 0); // Tempo de remoção dos obstáculos
}

function moveObstacle(obstacle) {
    let obstacleRect = obstacle.getBoundingClientRect();
    let gameRect = game.getBoundingClientRect();
    let obstacleSpeed = 2 + Math.random() * 4; // Velocidade aleatória para os obstáculos

    function frame() {
        if (gameOver) return;

        obstacle.style.left = obstacleRect.left - obstacleSpeed + 'px';
        obstacleRect = obstacle.getBoundingClientRect();

        if (obstacleRect.right < gameRect.left) {
            obstacle.remove(); // Remove o obstáculo somente após sair completamente da tela
            cancelAnimationFrame(animation);
        } else {
            animation = requestAnimationFrame(frame);
        }
    }

    let animation = requestAnimationFrame(frame);
}

function fly() {
    if (gameOver) return;
    velocity = lift;
    jumpMusic.play();
}

function endGame() {
    gameOver = true;
    clearInterval(gameInterval);
    clearInterval(pipeInterval);
    clearInterval(obstacleInterval);
    if (score > record) {
        record = score;
        localStorage.setItem('record', record);
        recordDisplay.textContent = "Recorde: " + record;
        initialScreenRecord.textContent = "Recorde: " + record;
    }
    finalScore.textContent = score;
    deathScreen.style.display = 'flex';
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    endMusic.play();
    let pipes = document.querySelectorAll('.pipe');
    pipes.forEach(pipe => {
        pipe.classList.add('paused');
    });

    let obstacles = document.querySelectorAll('.bird, .cloud');
    obstacles.forEach(obstacle => {
        obstacle.classList.add('paused');
    });
}
