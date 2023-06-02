'use strict';

import { checkMoney } from "./utils/moneyCheck.js";

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
const errorMessage = document.querySelector('.error__message');
let stepsCount = parseInt(steps.innerHTML);

const revealCells = (cells, bombs) => {
  cells.forEach((elem) => (bombs.includes(cells.indexOf(elem)) ?
    elem.classList.add('bomb') :
    elem.classList.add('empty__cell')));
};

const continueGame = (money, bettedMoney) => {
  const filteredCells = cells.filter(elem => !elem.classList.contains('empty__cell'));
  filteredCells.forEach(elem => elem.onclick = () => handleCellClick(money, bettedMoney));
  continueButton.classList.add('disabled');
  giveButton.classList.add('disabled');
  continueButton.onclick = null;
};

const giveReward = (money, bettedMoney, bombs) => {
  revealCells(cells, bombs);
  money += bettedMoney;
  added.innerHTML = `+${bettedMoney}`;
  added.style.color = 'green';
  localStorage.setItem('money', `${money}`);
  document.querySelector('.money').innerHTML = localStorage.getItem('money');
  playMore.style.display = 'block';
  continueButton.classList.add('disabled');
  giveButton.classList.add('disabled');
  cells.forEach((elem) => elem.onclick = null);
  giveButton.onclick = null;
};

const handleCellClick = (money, bettedMoney) => {
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
    giveButton.onclick = null;
    continueButton.onclick = null;
  } else {
    let earnings = Math.floor(bettedMoney * stepsCount / CELLS_COUNT);
    earnedMoney.innerHTML = `${earnings}`;
    cell.classList.add('empty__cell');
    continueButton.onclick = () => continueGame(money, bettedMoney);
    giveButton.onclick = () => giveReward(money, earnings, bombs);
    continueButton.classList.remove('disabled');
    giveButton.classList.remove('disabled');
  }
  cells.forEach((elem) => elem.onclick = null);
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

const minesGame = (money, bettedMoney) => {
  startButton.style.display = 'none';
  gameInfo.style.display = 'block';
  const bombNumbers = generateRandomArray(cells.length - 1);
  sessionStorage.setItem('bombs', JSON.stringify(bombNumbers));
  cells.forEach((elem) => elem.onclick = () => handleCellClick(money, bettedMoney));
}

const startGame = () => {
  input.readOnly = true;
  errorMessage.style.display = 'none';
  const bettedMoney = parseInt(document.querySelector('.input__money').value);
  const money = parseInt(localStorage.getItem('money'));
  checkMoney(money, bettedMoney, minesGame); 
};

startButton.onclick = startGame;
playMore.onclick = () => window.location.reload();
window.addEventListener('storage', () => {
  document.querySelector('.money').innerHTML = localStorage.getItem('money');
});
