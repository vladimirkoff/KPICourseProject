document.querySelector('#money > p').innerHTML = localStorage.getItem('money');

let money = parseInt(document.querySelector('#money > p').innerHTML);
console.log(money);

document.querySelector('body > div:nth-child(2) > input[type=button]:nth-child(2)')
  .onclick = function() {
    const a = Math.floor(Math.random() * 2);
    const bettedMoney = parseInt(document
      .querySelector('body > div:nth-child(2) > input[type=text]:nth-child(1)').value);
    a === 0 ? money -= bettedMoney : money += bettedMoney;

    document.querySelector('#money > p').innerHTML = money;
    localStorage.setItem('money', money);
  };
