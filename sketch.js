// Variables globales
let paddle, ball;
let bricks = [];
let rows = 3;
let cols = 6;
let score = 0;
let lives = 3;
let level = 1;
let totalLevels = 3;
let isWaitingNextLevel = false;
let gameOver = false;
let gameWon = false;

function setup() {
  createCanvas(600, 400);
  iniciarJuego();
}

function iniciarJuego() {
  paddle = new Paddle();
  ball = new Ball();
  createBricks();
  score = 0;
  lives = 3;
  level = 1;  // Empezamos en el nivel 1
  isWaitingNextLevel = false;
  gameOver = false;
  gameWon = false;
  loop();
}

function iniciarNivel() {
  paddle = new Paddle();
  ball = new Ball();
  createBricks();
  isWaitingNextLevel = false;
  lives = 3;  // Recuperamos 3 vidas al pasar de nivel
  loop();
}

function draw() {
  background(30);

  // Mostrar información del juego
  fill(255);
  textSize(16);
  text(`Puntos: ${score}`, 10, 20);
  text(`Vidas: ${lives}`, width - 80, 20);
  text(`Nivel: ${level}`, width / 2 - 30, 20);

  // Mensajes de estado
  if (gameOver) {
    mostrarMensajeFinal('Perdiste - Presiona R para reiniciar');
    return;
  }

  if (gameWon) {
    mostrarMensajeFinal('¡Ganaste el juego! - Presiona R para reiniciar');
    return;
  }

  if (isWaitingNextLevel) {
    mostrarMensajeFinal('¡Nivel completado! - Presiona P para continuar');
    return;
  }

  paddle.update();
  paddle.show();

  ball.update();
  ball.checkPaddle(paddle);
  ball.show();

  // Mostrar y verificar bloques
  for (let i = bricks.length - 1; i >= 0; i--) {
    bricks[i].show();
    if (ball.hits(bricks[i])) {
      if (bricks[i].hit()) {
        bricks.splice(i, 1);
        score++;
      }
    }
  }

  // Si la pelota cae
  if (ball.offScreen()) {
    lives--;
    if (lives > 0) {
      ball = new Ball();
    } else {
      // Si no quedan vidas, reiniciar al nivel 1
      gameOver = true;
      level = 1;  // Regresar al nivel 1
      noLoop();
    }
  }

  // Si destruyó todos los bloques (excepto los inquebrantables)
  if (bricks.filter(brick => brick.type !== "unbreakable").length === 0 && !isWaitingNextLevel) {
    level++;
    if (level <= totalLevels) {
      isWaitingNextLevel = true;
      noLoop(); // Pausa para mostrar mensaje
    } else {
      gameWon = true;
      noLoop();
    }
  }
}

// Mostrar mensajes centrados
function mostrarMensajeFinal(texto) {
  textSize(24);
  textAlign(CENTER, CENTER);
  fill(255);
  text(texto, width / 2, height / 2);
}

// Clase Paddle (barra)
class Paddle {
  constructor() {
    this.w = 100;
    this.h = 10;
    this.x = width / 2 - this.w / 2;
    this.y = height - 30;
    this.speed = 7;
  }

  update() {
    if (keyIsDown(LEFT_ARROW)) this.x -= this.speed;
    if (keyIsDown(RIGHT_ARROW)) this.x += this.speed;
    this.x = constrain(this.x, 0, width - this.w);
  }

  show() {
    fill(255);
    rect(this.x, this.y, this.w, this.h);
  }
}

// Clase Ball (pelota)
class Ball {
  constructor() {
    this.r = 10;
    this.reset();
  }

  reset() {
    this.x = width / 2;
    this.y = height / 2;
    this.xSpeed = random([-3, 3]);
    this.ySpeed = -4 - level;
  }

  update() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;
    if (this.x < 0 || this.x > width) this.xSpeed *= -1;
    if (this.y < 0) this.ySpeed *= -1;
  }

  show() {
    fill(255);
    ellipse(this.x, this.y, this.r * 2);
  }

  offScreen() {
    return this.y > height;
  }

  checkPaddle(p) {
    if (
      this.x > p.x &&
      this.x < p.x + p.w &&
      this.y + this.r > p.y &&
      this.y - this.r < p.y + p.h
    ) {
      this.ySpeed *= -1;
      this.y = p.y - this.r;
    }
  }

  hits(brick) {
    let hit = collideRectCircle(brick.x, brick.y, brick.w, brick.h, this.x, this.y, this.r * 2);
    if (hit) this.ySpeed *= -1;
    return hit;
  }
}

// Clase Brick (bloques)
class Brick {
  constructor(x, y, type = "normal") {
    this.x = x;
    this.y = y;
    this.w = 80;
    this.h = 20;
    this.type = type;
    this.hitsLeft = type === "strong" ? 3 : 1;
  }

  show() {
    if (this.type === "unbreakable") {
      fill(80);  // Color para bloques inquebrantables
    } else if (this.type === "strong") {
      if (this.hitsLeft === 3) fill(255, 140, 0);
      else if (this.hitsLeft === 2) fill(255, 180, 80);
      else fill(255, 220, 150);
    } else {
      fill(200, 0, 0);  // Color para bloques normales
    }
    rect(this.x, this.y, this.w, this.h);
  }

  hit() {
    if (this.type === "unbreakable") return false;  // No se destruye si es inquebrantable
    this.hitsLeft--;
    return this.hitsLeft <= 0;
  }
}

// Genera bloques por nivel
function createBricks() {
  bricks = [];
  let offsetX = 40;
  let offsetY = 50;
  let rowsThisLevel = rows + level;

  for (let r = 0; r < rowsThisLevel; r++) {
    for (let c = 0; c < cols; c++) {
      let x = offsetX + c * 90;
      let y = offsetY + r * 30;

      let type = "normal";
      if (level === 2 && r === 0 && c === 2) type = "strong";
      if (level === 3) {
        if ((r === 1 && c === 1) || (r === 2 && c === 4)) type = "strong";
        if (r === 0 && c === 3) type = "unbreakable";
      }

      bricks.push(new Brick(x, y, type));
    }
  }
}

// Teclas especiales
function keyPressed() {
  // R para reiniciar si perdiste o ganaste
  if ((gameOver || gameWon) && (key === 'r' || key === 'R')) {
    iniciarJuego();
  }

  // P para pasar al siguiente nivel
  if (isWaitingNextLevel && (key === 'p' || key === 'P')) {
    iniciarNivel();
  }
}
