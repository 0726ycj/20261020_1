// ===================================================
// PBL 專題：韓文單詞多媒體測驗 - 學習一（拖曳配對）
// 檔案：sketch.js
// ===================================================

let myGifImage = null;
let isGifLoaded = false;
let fireworks = [];
let isSubmitted = false;
let finalScore = 0;
let submitButton = null;
let draggedCard = null;
let dragOffsetX = 0, dragOffsetY = 0;

// 韓文單詞測驗題庫
const quizData = [
  { id: 1, question: "1. 蘋果 🍎", correct: "사과 (sagwa)", matchedCard: null },
  { id: 2, question: "2. 貓咪 🐱", correct: "고양이 (goyangi)", matchedCard: null },
  { id: 3, question: "3. 水 💧", correct: "물 (mul)", matchedCard: null },
  { id: 4, question: "4. 牛奶 🥛", correct: "우유 (uyu)", matchedCard: null },
  { id: 5, question: "5. 謝謝 🙏", correct: "감사합니다 (gamsahamnida)", matchedCard: null },
  { id: 6, question: "6. 你好 👋", correct: "안녕하세요 (annyeonghaseyo)", matchedCard: null }
];
let cards = [];

function preload() {
  try {
    myGifImage = loadImage('assets/animation.gif', () => { isGifLoaded = true; }, () => { isGifLoaded = false; });
  } catch (e) { isGifLoaded = false; }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  initQuizLayout();
  createSubmitButton();
}

function draw() {
  background(255, 248, 245); // 韓系奶油白背景
  drawHeader();
  drawTopGifSection();
  drawDropZones();
  drawCards();

  if (isSubmitted) {
    drawResultBoard();
    if (finalScore >= 60) updateAndDrawConfetti();
  }
}

function initQuizLayout() {
  cards = [];
  let answers = quizData.map(q => q.correct);
  shuffleArray(answers);

  let cardW = min(width * 0.28, 220);
  let cardH = 45;
  let startY = height - 130;

  for (let i = 0; i < 6; i++) {
    let col = i % 3;
    let row = Math.floor(i / 3);
    let gapX = (width - cardW * 3) / 4;
    let posX = gapX + col * (cardW + gapX);
    let posY = startY + row * (cardH + 15);

    cards.push({
      text: answers[i],
      x: posX, y: posY, homeX: posX, homeY: posY,
      w: cardW, h: cardH, isPlaced: false, targetIdx: -1
    });
  }
}

function drawHeader() {
  fill(60, 40, 40); noStroke(); textSize(22); textStyle(BOLD);
  text("🇰🇷 學習一：韓文單詞拖曳配對測驗", width / 2, 30);
  textSize(13); textStyle(NORMAL); fill(120, 100, 100);
  text("請將下方的韓文單詞卡片拖曳至對應的中文提示框中，完成後點擊交卷", width / 2, 58);
}

function drawTopGifSection() {
  let x = width / 2, y = 115, w = 120, h = 75;
  fill(255); stroke(255, 200, 200); strokeWeight(2);
  rect(x - w/2 - 10, y - h/2 - 5, w + 20, h + 10, 12);

  if (isGifLoaded && myGifImage) {
    imageMode(CENTER);
    image(myGifImage, x, y, w, h);
  } else {
    push();
    translate(x, y); noFill(); stroke(255, 120, 120, 180); strokeWeight(3);
    rotate(frameCount * 0.02); rect(-25, -25, 50, 50, 8);
    pop();
    fill(216, 67, 21); noStroke(); textSize(11); textStyle(BOLD);
    text("KOREAN", x, y);
  }
}

function drawDropZones() {
  let startY = 175;
  let zoneW = min(width * 0.42, 360);
  let zoneH = 50;

  for (let i = 0; i < quizData.length; i++) {
    let col = i % 2;
    let row = Math.floor(i / 2);
    let gapX = (width - zoneW * 2) / 3;
    let posX = gapX + col * (zoneW + gapX);
    let posY = startY + row * (zoneH + 20);

    quizData[i].x = posX; quizData[i].y = posY; quizData[i].w = zoneW; quizData[i].h = zoneH;

    if (isSubmitted) {
      if (quizData[i].matchedCard && quizData[i].matchedCard.text === quizData[i].correct) {
        fill(232, 245, 233); stroke(76, 175, 80);
      } else {
        fill(255, 235, 238); stroke(244, 67, 54);
      }
    } else {
      fill(255); stroke(230, 200, 200);
    }
    strokeWeight(2);
    rect(posX, posY, zoneW, zoneH, 8);

    fill(80, 60, 60); noStroke(); textAlign(LEFT, CENTER); textSize(12); textStyle(BOLD);
    text(quizData[i].question, posX + 12, posY + zoneH / 2);
  }
}

function drawCards() {
  textAlign(CENTER, CENTER); textSize(12);
  for (let card of cards) {
    push();
    fill(card === draggedCard ? 255 : 255, 240, 240);
    stroke(255, 150, 150); strokeWeight(2);
    rect(card.x, card.y, card.w, card.h, 8);
    fill(120, 40, 40); noStroke(); textStyle(BOLD);
    text(card.text, card.x + card.w/2, card.y + card.h/2);
    pop();
  }
}

function mousePressed() {
  if (isSubmitted) return;
  for (let i = cards.length - 1; i >= 0; i--) {
    let c = cards[i];
    if (mouseX >= c.x && mouseX <= c.x + c.w && mouseY >= c.y && mouseY <= c.y + c.h) {
      draggedCard = c;
      dragOffsetX = mouseX - c.x;
      dragOffsetY = mouseY - c.y;
      if (c.isPlaced && c.targetIdx !== -1) {
        quizData[c.targetIdx].matchedCard = null;
        c.isPlaced = false; c.targetIdx = -1;
      }
      break;
    }
  }
}

function mouseDragged() {
  if (draggedCard) {
    draggedCard.x = mouseX - dragOffsetX;
    draggedCard.y = mouseY - dragOffsetY;
  }
}

function mouseReleased() {
  if (!draggedCard) return;
  let snapped = false;
  for (let i = 0; i < quizData.length; i++) {
    let q = quizData[i];
    if (mouseX >= q.x && mouseX <= q.x + q.w && mouseY >= q.y && mouseY <= q.y + q.h) {
      if (q.matchedCard && q.matchedCard !== draggedCard) {
        q.matchedCard.isPlaced = false;
        q.matchedCard.x = q.matchedCard.homeX;
        q.matchedCard.y = q.matchedCard.homeY;
        q.matchedCard.targetIdx = -1;
      }
      draggedCard.x = q.x + q.w - draggedCard.w - 8;
      draggedCard.y = q.y + q.h - draggedCard.h - 4;
      draggedCard.isPlaced = true;
      draggedCard.targetIdx = i;
      q.matchedCard = draggedCard;
      snapped = true;
      break;
    }
  }
  if (!snapped) {
    draggedCard.x = draggedCard.homeX;
    draggedCard.y = draggedCard.homeY;
    draggedCard.isPlaced = false;
    draggedCard.targetIdx = -1;
  }
  draggedCard = null;
}

function createSubmitButton() {
  submitButton = createButton("送出答案，交卷看成績 🚀");
  positionSubmitButton();
  submitButton.style("background-color", "#E57373");
  submitButton.style("color", "#FFF");
  submitButton.style("font-weight", "bold");
  submitButton.style("padding", "12px 28px");
  submitButton.style("border", "none");
  submitButton.style("border-radius", "30px");
  submitButton.style("cursor", "pointer");
  submitButton.mousePressed(calculateScore);
}

function positionSubmitButton() {
  if (submitButton) submitButton.position(width / 2 - 100, height - 60);
}

function calculateScore() {
  let correct = 0;
  for (let q of quizData) {
    if (q.matchedCard && q.matchedCard.text === q.correct) correct++;
  }
  finalScore = Math.round((correct / quizData.length) * 100);
  isSubmitted = true;
  submitButton.hide();
  if (finalScore >= 60) createConfetti();
}

function drawResultBoard() {
  fill(0, 0, 0, 150); rect(0, 0, width, height);
  let w = min(width * 0.8, 420), h = 260, x = width/2 - w/2, y = height/2 - h/2;
  fill(255); stroke(255, 200, 200); strokeWeight(2); rect(x, y, w, h, 16);
  textAlign(CENTER, CENTER); fill(60, 40, 40); textSize(22); textStyle(BOLD);
  text("🎉 韓文測驗結果結算", width/2, y + 45);
  textSize(42); fill(finalScore >= 60 ? color(76, 175, 80) : color(244, 67, 54));
  text(finalScore + " 分", width/2, y + 105);
  textSize(12); fill(150, 130, 130);
  text("（點擊任意處重新挑戰）", width/2, y + 215);
}

function mouseClicked() {
  if (isSubmitted) {
    isSubmitted = false; finalScore = 0;
    quizData.forEach(q => q.matchedCard = null);
    initQuizLayout();
    submitButton.show();
  }
}

function createConfetti() {
  fireworks = [];
  let colors = ['#f43f5e', '#fb7185', '#fda4af', '#34d399', '#fbbf24'];
  for (let i = 0; i < 120; i++) {
    fireworks.push({ x: width/2, y: height/2, vx: random(-8, 8), vy: random(-14, -4), size: random(6, 12), color: random(colors), gravity: 0.25, rotation: random(TWO_PI), vRot: random(-0.1, 0.1) });
  }
}

function updateAndDrawConfetti() {
  for (let p of fireworks) {
    p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.rotation += p.vRot;
    push(); translate(p.x, p.y); rotate(p.rotation); fill(p.color); noStroke();
    rect(-p.size/2, -p.size/2, p.size, p.size * 0.6);
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initQuizLayout();
  positionSubmitButton();
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}