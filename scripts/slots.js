'use strict';

document.querySelector('.money').innerHTML = localStorage.getItem('money');
const rolls = Array.from(document.querySelectorAll('.roll'));
const startButton = document.querySelector('.start__button');
const closetButton = document.querySelector('.back__button');
const added = document.querySelector('.added');

const elements = [1,2,3,4,5,6,7];

const slotFunc = (roll) => {
  const num = Math.floor(Math.random() * 7)
  const current = elements[num];
  const next = !elements[num+1] ? elements[0] : elements[num+1];
  const previous = !elements[num-1] ? elements[elements.length-1] : elements[num-1];
  
  const delay = 200; 
  
  setTimeout(() => {
    roll.children[0].innerHTML = previous;
  }, delay);
  
  setTimeout(() => {
    roll.children[1].innerHTML = current;
  }, delay * 2);
  
  setTimeout(() => {
    roll.children[2].innerHTML = next;
  }, delay * 3);
};

const maxOccurrences = (arr) =>{
  const occurrences = {};
  let maxCount = 0;

  for(const elem of arr){
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
}

const checkWin = (array, money, bettedMoney) => {
  const win = maxOccurrences(array);
  if(win == 1){
    const lostMoney = -2 * bettedMoney;
    added.innerHTML = lostMoney;
    added.style.color = 'red';
    money += lostMoney;
  }else{
    const winMoney = 0.5 * bettedMoney * (win-2);
    added.innerHTML = '+' + winMoney;
    added.style.color = 'green';
    money += winMoney;
  }
  localStorage.setItem('money', money);
  document.querySelector('.money').innerHTML = localStorage.getItem('money');
  startButton.onclick = slots;
};

const slots = () => {
  let money = +(localStorage.getItem('money'));
  let bettedMoney = +(document.querySelector('.input__money').value);
  document.querySelector('.error__message').style.display = 'none';
  added.innerHTML = '';

  if(isNaN(bettedMoney) || bettedMoney <= 0){
    document.querySelector('.error__message').style.display = 'block';
  } else{
    startButton.onclick = null;
    for(const roll of rolls){
      for(const children of roll.children){
        children.innerHTML = '';
      }
    }
  
    let delay = 0;
    for (const roll of rolls) {
      setTimeout(() => slotFunc(roll), delay);
      delay += 2000; 
    }
  
    const current = Array.from(document.querySelectorAll('.current'));
    setTimeout(() => checkWin(current, money, bettedMoney), delay);
  }
};

startButton.onclick = slots;
closetButton.onclick = () => window.close();






