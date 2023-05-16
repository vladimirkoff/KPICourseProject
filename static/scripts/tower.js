import { getUserBalance, putMoney, withdrawMoney } from './utils/transact.js';
import {
  createDiv,
  showOverlayMsg,
  LiveChangeValue,
} from './utils/helperUI.js';
import { fixDecimal, randRange } from './utils/other.js';

const betInput = document.getElementById('bet-amount-input');
const min = document.getElementById('min-bet');
const max = document.getElementById('max-bet');
const decrease = document.getElementById('decrease-bet');
const increase = document.getElementById('increase-bet');
const start = document.getElementById('start');
const control = createDiv('cash-out');

const towerMenu = document.getElementById('tower-menu');
const multipliersContainer = document.getElementById('multipliers-container');
const difficulties = document.getElementById('difficulties-container').children;
const blocksContainer = document.getElementById('blocks-container');

const menu = [...difficulties, betInput, min, max, increase, decrease];

const containerHeight = blocksContainer.offsetHeight;
const containerWidth = blocksContainer.offsetWidth;

const balanceInfo = document.getElementById('balance-info');
const balanceValue = balanceInfo.querySelector('#balance-value');
const balanceChange = balanceInfo.querySelector('#balance-change');

balanceValue.textContent = getUserBalance().toString();

const balanceBar = new LiveChangeValue(balanceValue, balanceChange);

const totalBetInfo = document.getElementById('total-info');
const totalBetValue = totalBetInfo.querySelector('#total-value');
const totalBetChange = totalBetInfo.querySelector('#total-change');

const totalBetBar = new LiveChangeValue(totalBetValue, totalBetChange);

const IMG_PATH = './assets/tower.png';
const GAME_OVER_TIMEOUT = 4000;
const RESULT_MSG_TIMEOUT = 2000;
const MAX_BET = 100;
const MIN_BET = 1;

const towerBlocks = new WeakMap();

const towerSettings = {
  easy: {
    levels: [1.15, 1.75, 2.25, 3, 4, 5.35, 6.65, 7.75, 8.85, 10],
    blocks: 4,
    safe: 3,
  },
  medium: {
    levels: [1.25, 2, 3.5, 5, 7, 9, 11, 13, 14.5, 16],
    blocks: 3,
    safe: 2,
  },
  hard: {
    levels: [2, 3, 6, 14, 27.5, 43, 60, 74, 87.5, 100],
    blocks: 2,
    safe: 1,
  },
  extreme: { levels: [2.85, 8, 15, 31, 54, 180, 324, 600], blocks: 3, safe: 1 },
  nightmare: {
    levels: [29, 161.75, 377.25, 665.75, 1053, 1560, 2343, 3333],
    blocks: 4,
    safe: 1,
  },
};

const createBlock = (isSafe, blockWidth) => {
  const block = createDiv(null, 'tower-block');
  const img = document.createElement('img');
  img.src = IMG_PATH;
  block.style.width = blockWidth;
  img.style.pointerEvents = 'none';
  block.appendChild(img);
  towerBlocks.set(block, isSafe);
  return block;
};

const showMultipliers = (multipliers, multipliersNumber) => {
  multipliersContainer.innerHTML = '';
  const multiplierLength = `${
    (containerWidth - multipliersNumber * 2) / multipliersNumber
  }px`;
  for (const multiplier of multipliers) {
    const multiplierBloc = createDiv(null, 'multiplier-block');
    multiplierBloc.textContent = `${multiplier}`;
    multiplierBloc.style.width = multiplierLength;
    multipliersContainer.appendChild(multiplierBloc);
  }
};

const createTower = (difficulty) => {
  const towerSetting = towerSettings[difficulty];
  if (!towerSetting) throw new Error('Invalid difficulty');
  blocksContainer.innerHTML = '';
  const { levels, blocks, safe } = towerSetting;
  const levelsNumber = levels.length;
  const levelHeight = `${
    (containerHeight - levelsNumber * 2) / levelsNumber
  }px`;
  const blockWidth = `${(containerWidth - blocks * 2) / blocks}px`;
  for (let i = 0; i < levelsNumber; i++) {
    const level = createDiv(null, 'tower-level');
    level.style.height = levelHeight;
    const unsafeRange = randRange(blocks).slice(safe);
    for (let j = 0; j < blocks; j++) {
      const isSafe = !unsafeRange.includes(j);
      const block = createBlock(isSafe, blockWidth);
      level.appendChild(block);
    }
    blocksContainer.appendChild(level);
  }
  showMultipliers(levels, levelsNumber);
};

const getDifficulty = () =>
  document.querySelector('input[name="difficulty"]:checked').value;

const recreateTower = () => {
  const difficulty = getDifficulty();
  createTower(difficulty);
};

const setDifficulties = () => {
  for (const difficulty of difficulties) {
    difficulty.addEventListener('change', (ev) => {
      const { value } = ev.target;
      createTower(value);
    });
  }
};

const getBet = () => parseFloat(betInput.value);

const fixBetInput = () => {
  let prevBet = getBet();
  betInput.addEventListener('change', () => {
    const bet = getBet();
    const newBet = isNaN(bet) ?
      prevBet :
      fixDecimal(Math.max(MIN_BET, Math.min(MAX_BET, bet)));
    betInput.value = newBet;
    prevBet = newBet;
  });
};

max.addEventListener('click', () => (betInput.value = MAX_BET));

min.addEventListener('click', () => (betInput.value = MIN_BET));

decrease.addEventListener('click', () => {
  const prevBet = getBet();
  const newBet = prevBet - (prevBet > 10 ? 10 : 1);
  betInput.value = newBet;
  betInput.dispatchEvent(new Event('change'));
});

increase.addEventListener('click', () => {
  const prevBet = getBet();
  const newBet = prevBet + (prevBet >= 10 ? 10 : 1);
  betInput.value = newBet;
  betInput.dispatchEvent(new Event('change'));
});

const getPayout = (bet, levelNumber) => {
  const difficulty = getDifficulty();
  const multipliers = towerSettings[difficulty].levels;
  const multiplier = multipliers[levelNumber - 1] || 0;
  return bet * levelNumber * multiplier;
};

const disableMenuUI = (disabled) => {
  for (const element of menu) {
    element.disabled = disabled;
  }
  if (disabled) {
    start.remove();
    towerMenu.appendChild(control);
  } else {
    control.remove();
    towerMenu.appendChild(start);
  }
};

const highlightUI = (enable, ...elements) => {
  for (const element of elements) {
    if (enable) element.classList.add('highlighted');
    else element.classList.remove('highlighted');
  }
};

const revealBlock = (block) => {
  const isSafe = towerBlocks.get(block);
  if (isSafe) block.classList.add('safe-block');
  else block.classList.add('unsafe-block');
  return isSafe;
};

const revealBlocks = () => {
  const blocks = document.querySelectorAll('.tower-block');
  for (const block of blocks) {
    revealBlock(block);
  }
};

const handleGameOver = (timeout = 0) =>
  setTimeout(() => {
    recreateTower();
    disableMenuUI(false);
  }, timeout);

const handleWin = (payout, callback) => {
  if (!payout) return;
  showOverlayMsg('You win!', RESULT_MSG_TIMEOUT);
  balanceBar.updateValue(payout);
  putMoney(payout, callback);
};

const playLevel = (level, levelNumber, bet) => {
  const final = level.parentNode.firstChild === level;
  const payout = getPayout(bet, levelNumber - 1);
  control.innerText = payout ? `Cash-Out: ${fixDecimal(payout)}` : 'Cancel';
  return new Promise((resolve, reject) => {
    const handleErr = (err) => {
      if (err) reject(err);
    };
    const controlClickHandler = () => {
      handleWin(payout, handleErr);
      resolve(false);
    };
    const levelClickHandler = (ev) => {
      const block = ev.target;
      if (!towerBlocks.has(block)) {
        reject(new Error('Invalid block'));
        return;
      }
      withdrawMoney(bet, (err) => {
        if (err) {
          reject(err);
        } else {
          totalBetBar.updateValue(bet);
          balanceBar.updateValue(-bet);
          const isSafe = revealBlock(block);
          if (!isSafe)
            showOverlayMsg('You Lose!', RESULT_MSG_TIMEOUT, '#b20000');
          if (final && isSafe) {
            const jackpot = getPayout(bet, levelNumber);
            handleWin(jackpot, handleErr);
          }
          resolve(isSafe);
        }
      });
    };
    control.onclick = controlClickHandler;
    level.onclick = levelClickHandler;
  }).finally(() => {
    level.onclick = null;
    control.onclick = null;
    control.textContent = 'Cancel';
  });
};

const playTower = async () => {
  const levels = blocksContainer.children;
  const multipliers = multipliersContainer.children;
  const levelsCount = levels.length;
  const bet = getBet();
  disableMenuUI(true);
  for (let i = levelsCount - 1; i >= 0; i--) {
    const level = levels[i];
    const levelNumber = levelsCount - i;
    const multiplier = multipliers[levelNumber - 1];
    highlightUI(true, level, multiplier);
    let gameContinue = true;
    try {
      gameContinue = await playLevel(level, levelNumber, bet);
    } catch (err) {
      const returnedBet = bet * levelNumber - 1;
      putMoney(returnedBet, (err) => {
        if (err) console.error(err);
      });
      balanceBar.updateValue(returnedBet);
      gameContinue = false;
    } finally {
      highlightUI(false, level, multiplier);
    }
    if (!gameContinue) break;
  }
  totalBetBar.resetValue();
  revealBlocks();
  handleGameOver(GAME_OVER_TIMEOUT);
};

start.addEventListener('click', playTower);

window.addEventListener('load', () => {
  recreateTower();
  setDifficulties();
  fixBetInput();
});
