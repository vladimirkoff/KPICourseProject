import { cardsMap, cards } from './utils/cardsMapHelper.js';

const BLACKJACK = 21;
const SHOW_RESULT_DELAY = 800;
const DEALER_SAFE_SCORE = 16;

const moneyField = document.querySelector('body > div.header > p');
const money = {
  value: parseInt(localStorage.getItem('money')),
  bettedValue: 0,
};

if (!money.value || isNaN(money.value)) {
  money.value = 0;
}

const game = {
  'you': { 'scoreSpan': '#yourscore', 'div': '#your-box', 'score': '' },
  'dealer': { 'scoreSpan': '#dealerscore', 'div': '#dealer-box', 'score': '' },

  cards,
  'cardsmap': cardsMap,
};
const You = game['you'];
const Dealer = game['dealer'];


const betField = document
  .querySelector('body > div.main > div.row3 > input[type=text]');
const hitButton = document.querySelector('#hit');
const doubleButton = document.querySelector('#double');
const dealButton = document.querySelector('#deal');
const standButton = document.querySelector('#stand');
const commandTitle =  document.querySelector('#command');
const dealerScoreSpan = document.querySelector(Dealer['scoreSpan']);
const youScoreSpan = document.querySelector(You['scoreSpan']);

const betUI = [betField, dealButton, doubleButton];
const playUI = [hitButton, standButton];

const gameState = (disabled) => {
  betUI.forEach((element) => element.disabled = disabled);
  playUI.forEach((element) => element.disabled = !disabled);
};

gameState(false);

const showScore = (activePlayer) => {
  const activeScoreSpan = document.querySelector(activePlayer['scoreSpan']);
  if (activePlayer['score'] > BLACKJACK) {
    activeScoreSpan.textContent = 'BUST!';
    activeScoreSpan.style.color = 'yellow';
    gameState(false);
    showResults(findWinner());
  } else if (activePlayer['score'] === BLACKJACK) {
    activeScoreSpan.textContent = 'BLACKJACK!!!!!';
    activeScoreSpan.style.color = 'blue';
    standButtonClick();
  } else {
    activeScoreSpan.textContent = activePlayer['score'];
  }
};

const updateScore = (currentCard, activePlayer) => {
  const score = game['cardsmap'][currentCard];
  if (currentCard.startsWith('A')) { // For aces
    const [lowValue, highValue] = score;
    const newScore = activePlayer['score'] + highValue;
    activePlayer['score'] += newScore <= BLACKJACK ? highValue : lowValue;
  } else { // For others cards
    activePlayer['score'] += score;
  }
};

const drawCard = (activePlayer) => {
  const randomNumber = Math.floor(Math.random() * (game['cards'].length));
  const currentCard = game['cards'].splice(randomNumber, 1);
  const card = document.createElement('img');
  card.src = `../static/assets/${currentCard}.png`;
  document.querySelector(activePlayer['div']).appendChild(card);
  updateScore(...currentCard, activePlayer);
  showScore(activePlayer);
};

const findWinner = () => {
  let winner;

  if (You['score'] <= BLACKJACK) {
    if (Dealer['score'] < You['score'] || Dealer['score'] > BLACKJACK) {
      game['wins']++;
      winner = You;
    } else if (Dealer['score'] == You['score']) {
      game['draws']++;
    } else {
      game['losses']++;
      winner = Dealer;
    }
  } else if (You['score'] > BLACKJACK && Dealer['score'] <= BLACKJACK) {
    game['losses']++;
    winner = Dealer;
  } else if (You['score'] > BLACKJACK && Dealer['score'] > BLACKJACK) {
    game['draws']++;
  }
  return winner;
};

const showResults = (winner) => {
  if (winner == You) {
    commandTitle.textContent = 'You Won!';
    commandTitle.style.color = 'green';
    money.value += money.bettedValue;
  } else if (winner == Dealer) {
    commandTitle.textContent = 'You Lost!';
    commandTitle.style.color = 'red';
    money.value -= money.bettedValue;
  } else {
    commandTitle.textContent = 'You Drew!';
    commandTitle.style.color = 'orange';
  }
  moneyField.innerHTML = money.value;
  localStorage.setItem('money', money.value);
};

const hitButtonClick = () => {
  if (!Dealer['score']) {
    if (You['score'] <= BLACKJACK) {
      drawCard(You);
    }
  }
};

const dealButtonClick = () => {
  if (!betField.value || isNaN(betField.value)) {
    alert('Bet error');
    return;
  }
  const youImg = document.
    querySelector('#your-box').querySelectorAll('img');

  const dealerImg = document.
    querySelector('#dealer-box').querySelectorAll('img');

  for (let i = 0; i < youImg.length; i++) {
    youImg[i].remove();
  }
  for (let i = 0; i < dealerImg.length; i++) {
    dealerImg[i].remove();
  }

  game['cards'] = cards;
  You['score'] = 0;
  youScoreSpan.textContent = You['score'];
  youScoreSpan.style.color = 'black';
  Dealer['score'] = 0;
  dealerScoreSpan.textContent = Dealer['score'];
  dealerScoreSpan.style.color = 'black';

  commandTitle.textContent = 'Your turn!';
  commandTitle.style.color = 'black';

  gameState(true);
  money.bettedValue = parseInt(betField.value);
};


const standButtonClick = () => {
  if (!You['score']) {
    alert('Please Hit Some Cards First!');
  } else {
    while (Dealer['score'] < DEALER_SAFE_SCORE) {
      drawCard(Dealer);
      if (Dealer['score'] >= BLACKJACK) {
        return;
      }
    }
    setTimeout(() => {
      gameState(false);
      showResults(findWinner());
    }, SHOW_RESULT_DELAY);
  }
};

const doubleButtonClick = () => {
  betField.value *= 2;
  if (betField.value == NaN) betField.value = 0;
};

doubleButton.addEventListener('click', doubleButtonClick);
dealButton.addEventListener('click', dealButtonClick);
standButton.addEventListener('click', standButtonClick);
hitButton.addEventListener('click', hitButtonClick);
