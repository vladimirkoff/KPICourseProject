let money = localStorage.getItem('money');
if (!money || isNaN(money)) {
  money = 0;
}

localStorage.setItem('money', money);
document.querySelector('#money > p').innerHTML = money;
