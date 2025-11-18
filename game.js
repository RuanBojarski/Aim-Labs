// Acessando o Canvas e o Contexto 2D
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Parâmetros do Jogo
const gridSize = 20; // Tamanho de cada célula (20x20 pixels)
const tileCount = canvas.width / gridSize;
let velocity = { x: 0, y: 0 };
let speed = 8; // Velocidade inicial (quadros por segundo)
let isPaused = false;

// Estado do Jogo
let snake = [{ x: 10, y: 10 }]; // Posição inicial da cobra
let food = { x: 15, y: 15, color: 'hsl(120, 70%, 50%)' }; // Posição inicial da comida (HSL para melhor controle)
let score = 0;

// Variáveis do Game Loop (Lógica de atualização de quadros)
let lastTime = 0;
const scoreDisplay = document.getElementById('score');
const speedDisplay = document.getElementById('speed-display'); // Novo elemento para a velocidade

// --- Função Principal do Jogo (Game Loop) ---
function gameLoop(currentTime) {
    if (isPaused) {
        requestAnimationFrame(gameLoop);
        return;
    }

    const secondsSinceLastRender = (currentTime - lastTime) / 1000;
    
    if (secondsSinceLastRender < 1 / speed) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    lastTime = currentTime;

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

// --- Função de Atualização (Lógica do Jogo) ---
function update() {
    const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

    // Colisão com Paredes
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    // Colisão com o Próprio Corpo
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    // Verificação de Comida
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreDisplay.textContent = `SCORE: ${score}`;
        
        if (score % 3 === 0) {
            speed += 1;
            speedDisplay.textContent = `SPEED: ${speed} FPS`; // Atualiza no display
        }
        generateFood();
    } else {
        snake.pop();
    }
}

// --- Função de Desenho (Renderização) ---
function draw() {
    // Limpa a tela com o fundo escuro do canvas
    ctx.fillStyle = '#0d1a2b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenha a Comida com um visual mais moderno (como um diamante/cristal)
    drawFoodModern(food.x * gridSize, food.y * gridSize, gridSize, food.color);

    // Desenha a Cobra com um visual segmentado e brilhante
    snake.forEach((segment, index) => {
        const x = segment.x * gridSize;
        const y = segment.y * gridSize;
        
        // Cor base da cobra (um vermelho mais vibrante ou laranja)
        const baseColor = 'hsl(10, 80%, 60%)'; // Laranja avermelhado

        // Adiciona um gradiente para dar volume
        const gradient = ctx.createLinearGradient(x, y, x + gridSize, y + gridSize);
        if (index === 0) { // Cabeça da cobra
            gradient.addColorStop(0, 'hsl(0, 100%, 70%)'); // Vermelho mais vivo
            gradient.addColorStop(1, 'hsl(0, 100%, 50%)'); // Vermelho escuro
        } else {
            gradient.addColorStop(0, 'hsl(10, 80%, 70%)');
            gradient.addColorStop(1, 'hsl(10, 80%, 50%)');
        }
        ctx.fillStyle = gradient;
        
        // Desenha o segmento com um pequeno espaçamento para dar efeito de "gomos"
        ctx.fillRect(x + 1, y + 1, gridSize - 2, gridSize - 2);

        // Opcional: Adicionar um pequeno brilho/contorno para os segmentos
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1, y + 1, gridSize - 2, gridSize - 2);
    });
}

// Nova função para desenhar a comida com um visual de cristal
function drawFoodModern(x, y, size, color) {
    const hue = Math.random() * 360; // Cores aleatórias para um efeito de cristal
    ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
    
    // Desenha um polígono (formato de diamante/cristal)
    ctx.beginPath();
    ctx.moveTo(x + size / 2, y); // Topo
    ctx.lineTo(x + size, y + size / 2); // Direita
    ctx.lineTo(x + size / 2, y + size); // Baixo
    ctx.lineTo(x, y + size / 2); // Esquerda
    ctx.closePath();
    ctx.fill();

    // Adiciona um brilho ou contorno
    ctx.strokeStyle = `hsl(${hue}, 100%, 85%)`;
    ctx.lineWidth = 2;
    ctx.stroke();
}

// --- Funções Auxiliares ---

function generateFood() {
    let newFoodPosition;
    do {
        newFoodPosition = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (snake.some(segment => segment.x === newFoodPosition.x && segment.y === newFoodPosition.y));
    
    food.x = newFoodPosition.x;
    food.y = newFoodPosition.y;
    // A cor da comida agora é definida na função drawFoodModern com HSL dinâmico
    food.color = `hsl(${Math.random() * 360}, 70%, 50%)`; // Gera uma cor aleatória em HSL
}

function gameOver() {
    isPaused = true;
    alert(`Fim de Jogo! Sua Pontuação Final: ${score}. Pressione OK para reiniciar.`);
    resetGame();
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    velocity = { x: 0, y: 0 };
    score = 0;
    speed = 8;
    scoreDisplay.textContent = `SCORE: 0`;
    speedDisplay.textContent = `SPEED: 8 FPS`; // Resetar também o display de velocidade
    generateFood();
    isPaused = false;
}

// --- Manipulação de Eventos de Teclado ---
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            if (velocity.y !== 1) velocity = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (velocity.y !== -1) velocity = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (velocity.x !== 1) velocity = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (velocity.x !== -1) velocity = { x: 1, y: 0 };
            break;
        case ' ': // Tecla de espaço para pausar/reiniciar
            isPaused = !isPaused;
            break;
    }
});

// Inicia o Game Loop
requestAnimationFrame(gameLoop);