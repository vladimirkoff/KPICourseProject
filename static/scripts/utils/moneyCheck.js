'use strict';

const input = document.querySelector('.input__money');
const errorMessage = document.querySelector('.error__message');

export const checkMoney = (money, bettedMoney, startFn) => {
  const moneyCases = {
    'invalid': () => {
      errorMessage.textContent = 'Input correct value!';
      errorMessage.style.display = 'block';
      input.readOnly = false;
    }, 
    
    'not enough': () => {
      errorMessage.textContent = 'Not enough money!';
      errorMessage.style.display = 'block';
      input.readOnly = false;
    },
  
    'correct': () => startFn(money, bettedMoney)
  };

  if (isNaN(bettedMoney) || bettedMoney <= 0) moneyCases['invalid']();
  else if (bettedMoney > money) moneyCases['not enough']();
  else moneyCases['correct']();
}