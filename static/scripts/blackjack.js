import { cardsMap, cards } from './utils/cardsMapHelper.js';

const BLACKJACK = 21;
const SHOW_RESULT_DELAY = 800;
const DEALER_SAFE_SCORE = 16;
const IMG_PATH = '../static/assets/';

const moneyField = document.querySelector('body > div.header > p');
const money = {
  value: parseInt(localStorage.getItem('money')),
  bettedValue: 0,
};

if (!money.value || isNaN(money.value)) {
  money.value = 0;
}

const deck = { cards, cardsMap };

const player = { scoreSpan: '#yourscore', div: '#your-box', score: '' };
const dealer = { scoreSpan: '#dealerscore', div: '#dealer-box', score: '' };

const betField = document
  .querySelector('body > div.main > div.row3 > input[type=text]');
const hitButton = document.querySelector('#hit');
const doubleButton = document.querySelector('#double');
const dealButton = document.querySelector('#deal');
const standButton = document.querySelector('#stand');
const commandTitle =  document.querySelector('#command');
const dealerScoreSpan = document.querySelector(dealer.scoreSpan);
const playerScoreSpan = document.querySelector(player.scoreSpan);

const betUI = [betField, dealButton, doubleButton];
const playUI = [hitButton, standButton];

const gameState = (disabled) => {
  betUI.forEach((element) => element.disabled = disabled);
  playUI.forEach((element) => element.disabled = !disabled);
};

gameState(false);

const resultHandlers = {
  'win': () => {
    commandTitle.textContent = 'You Won!';
    commandTitle.style.color = 'green';
    money.value += money.bettedValue;
  },
  'loss': () => {
    commandTitle.textContent = 'You Lost!';
    commandTitle.style.color = 'red';
    money.value -= money.bettedValue;
  },
  'draw': () => {
    commandTitle.textContent = 'You Drew!';
    commandTitle.style.color = 'orange';
  }
};

const showResults = (result) => {
  resultHandlers[result]();
  const newAmount = money.value.toString();
  moneyField.innerHTML = newAmount;
  localStorage.setItem('money', newAmount);
};

const checkBust = (score) => score > BLACKJACK;

const finishGame = () => {
  const dealerScore = dealer.score;
  const playerScore = player.score;
  const playerBust = checkBust(playerScore);
  const dealerBust = checkBust(dealerScore);
  const draw =  playerScore === dealerScore || (playerBust && dealerBust);
  if (draw) showResults('draw');
  const loss = playerBust || (playerScore < dealerScore && !dealerBust);
  if (loss) showResults('loss');
  else showResults('win');
};

const showScore = (activePlayer) => {
  const activeScoreSpan = document.querySelector(activePlayer.scoreSpan);
  const { score } = activePlayer;
  if (score > BLACKJACK) {
    activeScoreSpan.textContent = 'BUST!';
    activeScoreSpan.style.color = 'yellow';
    gameState(false);
    finishGame();
  } else if (score === BLACKJACK) {
    activeScoreSpan.textContent = 'BLACKJACK!!!!!';
    activeScoreSpan.style.color = 'blue';
    standButtonClick();
  } else {
    activeScoreSpan.textContent = score;
  }
};

const updateScore = (currentCard, activePlayer) => {
  const score = deck.cardsMap[currentCard];
  if (currentCard.startsWith('A')) { // For aces
    const [lowValue, highValue] = score;
    const newScore = activePlayer.score + highValue;
    activePlayer.score += newScore <= BLACKJACK ? highValue : lowValue;
  } else { // For others cards
    activePlayer.score += score;
  }
};

const drawCard = (activePlayer) => {
  const { cards } = deck;
  const randomNumber = Math.floor(Math.random() * (cards.length));
  const currentCard = cards.splice(randomNumber, 1);
  const card = document.createElement('img');
  card.src = IMG_PATH + currentCard + '.png';
  document.querySelector(activePlayer.div).appendChild(card);
  updateScore(...currentCard, activePlayer);
  showScore(activePlayer);
};

const hitButtonClick = () => {
  if (!dealer.score && (player.score <= BLACKJACK)) {
    drawCard(player);
  }
};

const dealButtonClick = () => {
  if (!betField.value || isNaN(betField.value)) {
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
  deck.cards = cards;
  player.score = 0;
  playerScoreSpan.textContent = '0';
  playerScoreSpan.style.color = 'black';
  dealer.score = 0;
  dealerScoreSpan.textContent = '0';
  dealerScoreSpan.style.color = 'black';
  commandTitle.textContent = 'Your turn!';
  commandTitle.style.color = 'black';
  gameState(true);
  money.bettedValue = parseInt(betField.value);
};

function standButtonClick() {
  if (!player.score) return;
  while (dealer.score < DEALER_SAFE_SCORE) {
    drawCard(dealer);
    if (dealer.score >= BLACKJACK) {
      return;
    }
  }
  setTimeout(() => {
    gameState(false);
    finishGame();
  }, SHOW_RESULT_DELAY);
}

const doubleButtonClick = () => {
  betField.value = isNaN(betField.value) ? 0 : betField.value * 2;
};

doubleButton.addEventListener('click', doubleButtonClick);
dealButton.addEventListener('click', dealButtonClick);
standButton.addEventListener('click', standButtonClick);
hitButton.addEventListener('click', hitButtonClick);
