import { betOptions, betClassesInfo, red } from './bettingBoard.js';
import {
    getUserBalance,
    addUserBalance,
    Stack,
    ShowChangeValue,
    showAlertMsg,
} from '../utils.js';

const balanceInfo = document.getElementById('balanceInfo');
const balanceValue = balanceInfo.querySelector('#balance-value');
const balanceChange = balanceInfo.querySelector('#balance-change');

balanceValue.textContent = getUserBalance().toString();

const balanceBar = new ShowChangeValue(balanceValue, balanceChange);

const totalBetInfo = document.getElementById('totalBetInfo');
const totalBetValue = totalBetInfo.querySelector('#total-value');
const totalBetChange = totalBetInfo.querySelector('#total-change');

const totalBetBar = new ShowChangeValue(totalBetValue, totalBetChange);

const bettingBoard = document.getElementById('bettingBoard');
const wheel = document.getElementById('wheel');
const spin = document.getElementById('spin');
const double = document.getElementById('double');
const undo = document.getElementById('undo');
const clear = document.getElementById('clear');
const chipContainer = document.getElementById('chipContainer');
const winNumsContainer = document.getElementById('winNumsContainer');
const winNumsSpans = winNumsContainer.getElementsByTagName('span');

const bets = new Stack();
const chips = [...chipContainer.children];
const chipCosts = [5000, 1000, 500, 100, 50, 10, 5, 1];

const alert = () => showAlertMsg('Do bet first', 2000);

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
        showAlertMsg('You need to select chip first', 2000);
        return false;
    }
    const betClass = betOption.classList.item(0);
    const info = betClassesInfo[betClass];
    if (!info) return false;
    const { min, max } = info;
    if (betCost < min) {
        showAlertMsg(
            'You need to select chip with greater or equal cost to minimum bet cost',
            2000
        );
        return false;
    }
    const { betAmount } = betOptions.get(betOption);
    const currBet = betAmount + betCost;
    if (currBet > max) {
        showAlertMsg('Reached maximum bet amount for this option', 2000);
        return false;
    }
    const balance = getUserBalance();
    if (betCost > balance) {
        showAlertMsg('Insufficient funds to bet', 2000);
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
    let currChip = betOption.querySelector('.chip');
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
    betOptions.addBetAmount(betOption, betCost);
    addUserBalance(-betCost);
    const bet = { betCost, betOption };
    bets.push(bet);
    setChip(betOption);
    totalBetBar.updateValue(betCost);
    balanceBar.updateValue(-betCost);
};

bettingBoard.addEventListener('click', bet);

const doubleBet = () => {
    let { last } = bets;
    if (!last) {
        alert();
        return;
    }
    let totalBet = 0;
    while (last) {
        const { betCost, betOption } = last.item;
        const successfulTransaction = checkTransaction(betOption, betCost);
        if (!successfulTransaction) return;
        betOptions.addBetAmount(betOption, betCost);
        addUserBalance(-betCost);
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
        alert();
        return;
    }
    const { betCost, betOption } = bet;
    betOptions.addBetAmount(betOption, -betCost);
    if (restoreBalance) {
        addUserBalance(betCost);
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
        alert();
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

const FULL_ANGLE = 2 * Math.PI;
const spinsCount = 15;

const rouletteWheel = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
    16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

const spinWheel = (winNum, spinsCount) => {
    return new Promise((resolve) => {
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
};

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
        alert();
        return;
    }
    let totalWin = 0;
    let totalBet = 0;
    const winNum = Math.floor(Math.random() * rouletteWheel.length);
    while (last) {
        const { betCost, betOption } = last.item;
        totalBet += betCost;
        const { winNums } = betOptions.get(betOption);
        const win = winNums.includes(winNum);
        if (win) {
            const betClass = betOption.classList.item(0);
            const { payout } = betClassesInfo[betClass];
            totalWin += betCost * payout;
        }
        removeBet(false, win);
        last = bets.last;
    }
    disableInterface(true);
    await spinWheel(winNum, spinsCount);
    clearBoard();
    disableInterface(false);
    addUserBalance(totalWin);
    balanceBar.updateValue(totalWin);
    totalBetBar.updateValue(-totalBet);
    saveWinNum(winNum);
};

spin.addEventListener('click', getResult);
