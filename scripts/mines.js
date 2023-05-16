'use strict';

const CELLS_COUNT = 5;

document.querySelector('.money').innerHTML = localStorage.getItem('money');

const gameInfo = document.querySelector('.game__info');
const startButton = document.querySelector('.start__button');
const continueButton = document.querySelector('.continue__button');
const cells = Array.from(document.querySelectorAll('.cell'));
const input = document.querySelector('.input__money');
const playMore = document.querySelector('.play__more');
const steps = document.querySelector('.count__steps');
const earnedMoney = document.querySelector('.earned__money');
const added = document.querySelector('.added');
const giveButton = document.querySelector('.give__money');
let stepsCount = parseInt(steps.innerHTML);

const revealCells = (cells, bombs) => {
  cells.forEach((elem) => (bombs.includes(cells.indexOf(elem)) ?
    elem.style.backgroundColor = 'red' :
    elem.style.backgroundColor = 'green'));
};

const continueGame = () => {
  cells.forEach((elem) => elem.addEventListener('click', playMines));
  continueButton.classList.add('disabled');
  giveButton.classList.add('disabled');
  continueButton.onclick = null;
};

const giveReward = (money, winMoney, bombs) => {
  revealCells(cells, bombs);
  money += winMoney;
  added.innerHTML = '+' + winMoney;
  added.style.color = 'green';
  localStorage.setItem('money', `${money}`);
  document.querySelector('.money').innerHTML = localStorage.getItem('money');
  playMore.style.display = 'block';
  continueButton.classList.add('disabled');
  giveButton.classList.add('disabled');
  cells.forEach((elem) => elem.removeEventListener('click', playMines));
  giveButton.onclick = null;
};

function playMines(event) {
  let money = parseInt(localStorage.getItem('money'));
  let bettedMoney = parseInt(document.querySelector('.input__money').value);
  stepsCount++;
  steps.innerHTML = `${stepsCount}`;
  const cell = event.target;
  const bombs = JSON.parse(sessionStorage.getItem('bombs'));
  const bombClicked = bombs.includes(cells.indexOf(cell));
  if (bombClicked) {
    revealCells(cells, bombs);
    money -= bettedMoney;
    added.innerHTML = '-' + bettedMoney;
    added.style.color = 'red';
    localStorage.setItem('money', `${money}`);
    document.querySelector('.money').innerHTML = localStorage.getItem('money');
    playMore.style.display = 'block';
  } else {
    bettedMoney *= stepsCount / CELLS_COUNT;
    const winMoney = Math.floor(bettedMoney);
    earnedMoney.innerHTML = `${winMoney}`;
    cell.style.backgroundColor = 'green';
    continueButton.onclick = continueGame;
    giveButton.onclick = () => giveReward(money, winMoney, bombs);
    continueButton.classList.remove('disabled');
    giveButton.classList.remove('disabled');
  }
  cells.forEach((elem) => elem.removeEventListener('click', playMines));
}

const generateRandomArray = (max) => {
  const arr = [];
  while (arr.length < CELLS_COUNT) {
    const num = Math.floor(Math.random() * max);
    if (!arr.includes(num)) {
      arr.push(num);
    }
  }
  return arr;
};

const start = () => {
  input.readOnly = true;
  document.querySelector('.error__message').style.display = 'none';
  const bettedMoney = parseInt(document.querySelector('.input__money').value);
  if (isNaN(bettedMoney) || bettedMoney <= 0) {
    document.querySelector('.error__message').style.display = 'block';
    input.readOnly = false;
  } else {
    startButton.style.display = 'none';
    gameInfo.style.display = 'block';
    const bombNumbers = generateRandomArray(cells.length - 1);
    sessionStorage.setItem('bombs', JSON.stringify(bombNumbers));
    cells.forEach((elem) => elem.addEventListener('click', playMines));
  }

};

startButton.onclick = start;
playMore.onclick = () => window.location.reload();
window.addEventListener('storage', () => {
  document.querySelector('.money').innerHTML = localStorage.getItem('money');
});
