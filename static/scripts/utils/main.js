let money = localStorage.getItem('money');
if (!money || isNaN(money)) {
  money = 0;
}

localStorage.setItem('money', money);
document.querySelector('body > div.header > p').innerHTML = money;
