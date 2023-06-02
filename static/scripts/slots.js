'use strict';

import { checkMoney } from "./utils/moneyCheck.js";

const DELAY = 200;

document.querySelector('.money').innerHTML = localStorage.getItem('money');

const rolls = Array.from(document.querySelectorAll('.roll'));
const startButton = document.querySelector('.start__button');
const closeButton = document.querySelector('.back__button');
const added = document.querySelector('.added');
const input = document.querySelector('.input__money');
const errorMessage = document.querySelector('.error__message');

const elements = [1, 2, 3, 4, 5, 6, 7];

const spin = (roll) => {
  const num = Math.floor(Math.random() * elements.length);
  const current = elements[num];
  const next = !elements[num + 1] ? elements[0] : elements[num + 1];
  const previous = !elements[num - 1] ?
    elements[elements.length - 1] :
    elements[num - 1];
  const cell = [previous, current, next];
  for (let i = 0; i < cell.length; i++) {
    setTimeout(() => {
      roll.children[i].innerHTML = cell[i];
    }, DELAY * (i + 1));
  }
};

const maxOccurrences = (arr) => {
  const occurrences = {};
  let maxCount = 0;
  for (const elem of arr) {
    if (typeof occurrences[elem.innerHTML] === 'undefined') {
      occurrences[elem.innerHTML] = 1;
    } else {
      occurrences[elem.innerHTML] += 1;
    }
    if (occurrences[elem.innerHTML] > maxCount) {
      maxCount = occurrences[elem.innerHTML];
    }
  }
  return maxCount;
};

const checkWin = (array, money, bettedMoney) => {
  const win = maxOccurrences(array);
  if (win === 1) {
    added.innerHTML = `-${bettedMoney}`;
    added.style.color = 'red';
    money -= bettedMoney;
  } else {
    const winMoney = bettedMoney * (win - 2);
    added.innerHTML = `+${winMoney}`;
    added.style.color = 'green';
    money += winMoney;
  }
  localStorage.setItem('money', money);
  document.querySelector('.money').innerHTML = localStorage.getItem('money');
  startButton.onclick = startGame;
  input.readOnly = false;
};

const slotsGame = (money, bettedMoney) => {
  startButton.onclick = null;
    for (const roll of rolls) {
      for (const children of roll.children) {
        children.innerHTML = '';
      }
    }
    let delay = 0;
    for (const roll of rolls) {
      setTimeout(() => spin(roll), delay);
      delay += 1000;
    }
    const current = Array.from(document.querySelectorAll('.current'));
    setTimeout(() => checkWin(current, money, bettedMoney), delay);
}

const startGame = () => {
  input.readOnly = true;
  const money = parseInt(localStorage.getItem('money'));
  const bettedMoney = parseInt(document.querySelector('.input__money').value);
  errorMessage.style.display = 'none';
  added.innerHTML = '';
  checkMoney(money, bettedMoney, slotsGame);
}

startButton.onclick = startGame;
closeButton.onclick = () => window.close();
window.addEventListener('storage', () => {
  document.querySelector('.money').innerHTML = localStorage.getItem('money');
});