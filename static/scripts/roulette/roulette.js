import { betOptions, betClassesInfo, red } from './bettingBoard.js';
import { getUserBalance, putMoney, withdrawMoney } from '../utils/transact.js';
import {
  showOverlayMsg,
  showAlertMsg,
  LiveChangeValue,
} from '../utils/helperUI.js';
import { Stack } from '../utils/other.js';

const bettingBoard = document.getElementById('bettingBoard');
const wheel = document.getElementById('wheel');
const spin = document.getElementById('spin');
const double = document.getElementById('double');
const undo = document.getElementById('undo');
const clear = document.getElementById('clear');
const chipContainer = document.getElementById('chipContainer');
const winNumsContainer = document.getElementById('winNumsContainer');
const winNumsSpans = winNumsContainer.getElementsByTagName('span');

const balanceInfo = document.getElementById('balanceInfo');
const balanceValue = balanceInfo.querySelector('#balance-value');
const balanceChange = balanceInfo.querySelector('#balance-change');

balanceValue.textContent = getUserBalance().toString();

const balanceBar = new LiveChangeValue(balanceValue, balanceChange);

const totalBetInfo = document.getElementById('totalBetInfo');
const totalBetValue = totalBetInfo.querySelector('#total-value');
const totalBetChange = totalBetInfo.querySelector('#total-change');

const totalBetBar = new LiveChangeValue(totalBetValue, totalBetChange);

const MSG_TIMEOUT = 2000;
const FULL_ANGLE = 2 * Math.PI;
const spinsCount = 15;
const bets = new Stack();
const chips = [...chipContainer.children];
const chipCosts = [5000, 1000, 500, 100, 50, 10, 5, 1];
const rouletteWheel = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

const betAlert = () => showAlertMsg('Do bet first', MSG_TIMEOUT);

const getChipCost = (chip) => {
  const i = chips.indexOf(chip);
  const cost = chipCosts[i];
  return cost ? cost : 0;
};

const selectChip = (ev) => {
  const { target } = ev;
  if (!target.classList.contains('chip')) return;
  const prevSelected = chipContainer.querySelector('.selected');
  if (prevSelected) prevSelected.classList.remove('selected');
  target.classList.add('selected');
};

chipContainer.addEventListener('click', selectChip);

const checkTransaction = (betOption, betCost) => {
  if (!betCost) {
    showAlertMsg('You need to select chip first', MSG_TIMEOUT);
    return false;
  }
  const betClass = betOption.classList.item(0);
  const info = betClassesInfo[betClass];
  if (!info) return false;
  const { min, max } = info;
  if (betCost < min) {
    showAlertMsg(
      'You need to select chip with greater or equal cost to minimum bet cost',
      MSG_TIMEOUT
    );
    return false;
  }
  const { betAmount } = betOptions.get(betOption);
  const currBet = betAmount + betCost;
  if (currBet > max) {
    showAlertMsg('Reached maximum bet amount for this option', MSG_TIMEOUT);
    return false;
  }
  return true;
};

const setChip = (betOption) => {
  let chip;
  const { betAmount } = betOptions.get(betOption);
  for (let i = chipCosts.length - 1; i >= 0; i--) {
    if (!betAmount) break;
    const minLim = chipCosts[i];
    const maxLim = chipCosts[i - 1] || Infinity;
    if (betAmount >= minLim && betAmount < maxLim) {
      chip = chips[i].cloneNode(true);
      chip.classList.remove('selected');
      chip.classList.add('onBoard');
      break;
    }
  }
  const currChip = betOption.querySelector('.chip');
  if (currChip) currChip.remove();
  if (chip) betOption.append(chip);
};

const bet = (ev) => {
  let betOption = ev.target;
  if (betOption.classList.contains('chip')) betOption = betOption.parentNode;
  const selected = chipContainer.querySelector('.selected');
  const betCost = getChipCost(selected);
  const successfulTransaction = checkTransaction(betOption, betCost);
  if (!successfulTransaction) return;
  withdrawMoney(betCost, (err) => {
    if (!err) {
      betOptions.addBetAmount(betOption, betCost);
      const bet = { betCost, betOption };
      bets.push(bet);
      setChip(betOption);
      totalBetBar.updateValue(betCost);
      balanceBar.updateValue(-betCost);
    }
  });
};

bettingBoard.addEventListener('click', bet);

const doubleBet = () => {
  let { last } = bets;
  if (!last) {
    betAlert();
    return;
  }
  let totalBet = 0;
  while (last) {
    const { betCost, betOption } = last.item;
    let successfulTransaction = checkTransaction(betOption, betCost);
    if (!successfulTransaction) return;
    withdrawMoney(betCost, (err) => {
      if (err) successfulTransaction = false;
    });
    if (!successfulTransaction) return;
    betOptions.addBetAmount(betOption, betCost);
    setChip(betOption);
    last.item.betCost *= 2;
    totalBet += betCost;
    last = last.prev;
  }
  if (totalBet) {
    totalBetBar.updateValue(totalBet);
    balanceBar.updateValue(-totalBet);
  }
};

double.addEventListener('click', doubleBet);

const removeBet = (undo, restoreBalance) => {
  const bet = bets.pop();
  if (!bet) {
    betAlert();
    return;
  }
  const { betCost, betOption } = bet;
  betOptions.addBetAmount(betOption, -betCost);
  if (restoreBalance) {
    putMoney(betCost, (err) => {
      if (err) console.error(err);
    });
  }
  if (undo) {
    setChip(betOption);
    totalBetBar.updateValue(-betCost);
    balanceBar.updateValue(betCost);
  }
};

undo.addEventListener('click', removeBet.bind(null, true, true));

const clearBoard = () => {
  const chips = bettingBoard.querySelectorAll('.onBoard');
  for (const chip of chips) {
    chip.remove();
  }
};

const clearBets = () => {
  let { last } = bets;
  if (!last) {
    betAlert();
    return;
  }
  let totalBet = 0;
  clearBoard();
  while (last) {
    totalBet += last.item.betCost;
    removeBet(false, true);
    last = bets.last;
  }
  totalBetBar.updateValue(-totalBet);
  balanceBar.updateValue(totalBet);
};

clear.addEventListener('click', clearBets);

const spinWheel = (winNum, spinsCount) =>
  new Promise((resolve) => {
    const numAngle = rouletteWheel.indexOf(winNum);
    const angle = FULL_ANGLE * (spinsCount + numAngle / rouletteWheel.length);
    const actualAngle = angle % FULL_ANGLE;
    wheel.style.transition = `all ${spinsCount}s ease`;
    wheel.style.rotate = `-${angle}rad`;
    const transitionEndHandler = () => {
      wheel.removeEventListener('transitionend', transitionEndHandler);
      wheel.style.transition = 'none';
      wheel.style.rotate = `-${actualAngle}rad`;
      resolve();
    };
    wheel.addEventListener('transitionend', transitionEndHandler);
  });

const disableInterface = (disabled) => {
  if (disabled) bettingBoard.removeEventListener('click', bet);
  else bettingBoard.addEventListener('click', bet);
  spin.disabled = disabled;
  double.disabled = disabled;
  undo.disabled = disabled;
  clear.disabled = disabled;
};

let winNumIndex = 0;

const saveWinNum = (winNum) => {
  const winNumSpan = winNumsSpans[winNumIndex];
  let color;
  if (!winNum) color = '#025839';
  else color = red.includes(winNum) ? '#cc0000' : '#000000';
  winNumSpan.textContent = winNum.toString();
  winNumSpan.style.color = color;
  winNumIndex = (winNumIndex + 1) % winNumsSpans.length;
};

const getResult = async () => {
  let { last } = bets;
  if (!last) {
    betAlert();
    return;
  }
  let totalWin = 0;
  const winNum = Math.floor(Math.random() * rouletteWheel.length);
  while (last) {
    const { betCost, betOption } = last.item;
    const { winNums } = betOptions.get(betOption);
    const win = winNums.includes(winNum);
    if (win) {
      const betClass = betOption.classList.item(0);
      const { payout } = betClassesInfo[betClass];
      totalWin += betCost * (payout + 1);
    }
    removeBet(false, false);
    last = bets.last;
  }
  disableInterface(true);
  await spinWheel(winNum, spinsCount);
  clearBoard();
  disableInterface(false);
  putMoney(totalWin, (err) => {
    if (err) console.error(err);
  });
  balanceBar.updateValue(totalWin);
  totalBetBar.resetValue();
  saveWinNum(winNum);
  if (totalWin) showOverlayMsg('You win!', MSG_TIMEOUT);
  else showOverlayMsg('You lose!', MSG_TIMEOUT);
};

spin.addEventListener('click', getResult);
