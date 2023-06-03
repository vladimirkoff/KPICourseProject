'use strict';

const MIN_DICE = 1;
const MAX_DICE = 6;
const DEFAULT_GOAL = 10;
const IMG_PATH = './assets/';

const prevDices = [0, 0];

const goalInput = document.getElementById('input-score');
const diceContainer1 = document.getElementById('dice-1');
const diceContainer2 = document.getElementById('dice-2');
const curr0 = document.getElementById('current-0');
const curr1 = document.getElementById('current-1');
const panel0 = document.querySelector('.player-0-panel');
const panel1 = document.querySelector('.player-1-panel');
const score0 = document.getElementById('score-0');
const score1 = document.getElementById('score-1');
const name0 = document.getElementById('name-0');
const name1 = document.getElementById('name-1');

const newGameButton = document.querySelector('.btn-new');
const rollButton = document.querySelector('.btn-roll');
const holdButton = document.querySelector('.btn-hold');

const scoreUI = [curr0, curr1, score0, score1];

const disableUI = disabled => {
  rollButton.disabled = disabled;
  holdButton.disabled = disabled;
};

const newGame = () => {
  disableUI(false);
  diceContainer1.style.display = 'none';
  diceContainer2.style.display = 'none';
  scoreUI.forEach(element => element.textContent = '0');
  name0.textContent = 'Player 1';
  name1.textContent = 'Player 2';
  panel0.classList.remove('winner');
  panel1.classList.remove('winner');
  panel0.classList.add('active');
  panel1.classList.remove('active');
};

newGameButton.addEventListener('click', newGame);

const getActive = () => {
  const panelContainer = document.querySelector('.active');
  const { className } = panelContainer;
  const firstPlayer = className.includes('0');
  const currContainer = firstPlayer ? curr0 : curr1;
  const scoreContainer = firstPlayer ? score0 : score1;
  const nameContainer = firstPlayer ? name0 : name1;
  return { panelContainer, currContainer, scoreContainer, nameContainer };
};

const changeActive = () => {
  prevDices.fill(0);
  diceContainer1.style.display = 'none';
  diceContainer2.style.display = 'none';
  curr0.textContent = '0';
  curr1.textContent = '0';
  panel0.classList.toggle('active');
  panel1.classList.toggle('active');
};

const showDices = (dice1, dice2) => {
  diceContainer1.style.display = 'block';
  diceContainer2.style.display = 'block';
  diceContainer1.src = `${IMG_PATH}dice-${dice1}.png`;
  diceContainer2.src = `${IMG_PATH}dice-${dice2}.png`;
};

const dice = () => Math.floor(Math.random() * MAX_DICE) + MIN_DICE;

const roll = () => {
  const { currContainer, scoreContainer } = getActive();
  const dice1 = dice();
  const dice2 = dice();
  showDices(dice1, dice2);
  const [prevDice1, prevDice2] = prevDices;
  if (prevDice1 === MAX_DICE && prevDice2 === MAX_DICE && dice1 === MAX_DICE && dice2 === MAX_DICE) {
    currContainer.textContent = '0';
    scoreContainer.textContent = '0';
  }
  if (dice1 !== MIN_DICE && dice2 !== MIN_DICE) {
    const currScore = parseInt(currContainer.textContent);
    const newScore = (currScore + dice1 + dice2).toString();
    currContainer.textContent = newScore;
  } else {
    changeActive();
  }
  prevDices[0] = dice1;
  prevDices[1] = dice2;
};

rollButton.addEventListener('click', roll);

const getGoalScore = () => {
  const goal = parseInt(goalInput.value);
  return goal >= 0 ? DEFAULT_GOAL : goal;
};

const hold = () => {
  const goalScore = getGoalScore();
  const { panelContainer, currContainer, scoreContainer, nameContainer } = getActive();
  const currScore = parseInt(currContainer.textContent);
  const prevScore = parseInt(scoreContainer.textContent);
  const newScore = prevScore + currScore;
  scoreContainer.textContent = `${newScore}`;
  if (newScore >= goalScore) {
    nameContainer.textContent = 'Winner!';
    diceContainer1.style.display = 'none';
    diceContainer2.style.display = 'none';
    panelContainer.classList.add('winner');
    panelContainer.classList.remove('active');
    disableUI(true);
  } else {
    changeActive();
  }
};

holdButton.addEventListener('click', hold);

window.addEventListener('load', newGame);
