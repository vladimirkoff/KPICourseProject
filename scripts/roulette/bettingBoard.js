import { createDiv } from '../utils.js';

export const betOptions = new Map();

betOptions.addBetAmount = (betOption, betAmount) => {
    betOptions.get(betOption).betAmount += betAmount;
};

export const betClassesInfo = {
    straight: { name: 'Straight', payout: 35, max: 5000, min: 1 },
    horizontalSplit: { name: 'Split', payout: 17, max: 10000, min: 1 },
    verticalSplit: { name: 'Split', payout: 17, max: 10000, min: 1 },
    street: { name: 'Street', payout: 11, max: 15000, min: 1 },
    basket: { name: 'Basket', payout: 11, max: 15000, min: 1 },
    corner: { name: 'Corner', payout: 8, max: 20000, min: 1 },
    firstFour: { name: 'First Four', payout: 8, max: 20000, min: 1 },
    doubleStreet: { name: 'Double Street', payout: 5, max: 25000, min: 1 },
    column: { name: 'Column', payout: 2, max: 30000, min: 1 },
    dozen: { name: 'Dozen', payout: 2, max: 30000, min: 1 },
    low: { name: 'Low', payout: 1, max: 40000, min: 1 },
    manque: { name: 'Manque', payout: 1, max: 40000, min: 1 },
    even: { name: 'Even', payout: 1, max: 40000, min: 1 },
    odd: { name: 'Odd', payout: 1, max: 40000, min: 1 },
    red: { name: 'Red', payout: 1, max: 40000, min: 1 },
    black: { name: 'Black', payout: 1, max: 40000, min: 1 },
};

let timerId;
const showDelay = 500;

const showBetOptionInfo = (ev) => {
    if (timerId) clearTimeout(timerId);
    const currBetInfo = document.getElementById('betInfo');
    if (currBetInfo) {
        currBetInfo.remove();
        timerId = null;
    }
    const { target } = ev;
    const betClass = target.classList.item(0);
    const { name, payout, max, min } = betClassesInfo[betClass];
    const betInfo = createDiv('betInfo');
    betInfo.style.visibility = 'hidden';
    betInfo.innerText = `Bet name: ${name}\nPayout: ${payout} to 1\nMax bet: ${max}$\nMin bet: ${min}$`;
    const { x, y, width } = target.getBoundingClientRect();
    document.body.appendChild(betInfo);
    const left = x + width / 2 - betInfo.offsetWidth / 2;
    betInfo.style.left = `${left}px`;
    const top = y - betInfo.offsetHeight - 25;
    betInfo.style.top = `${top}px`;
    timerId = setTimeout(() => (betInfo.style.visibility = 'visible'), showDelay);
};

const hideBetOptionInfo = () => {
    const betInfo = document.getElementById('betInfo');
    betInfo.remove();
};

const highlightWinNums = (ev) => {
    const { target } = ev;
    const { winNums } = betOptions.get(target);
    for (const winNum of winNums) {
        const straight = document.getElementById(winNum);
        if (ev.type === 'mouseenter') straight.classList.add('highlighted');
        else straight.classList.remove('highlighted');
    }
};

const buildBetOption = (betClass, winNums) => {
    const betOption = document.createElement('button');
    if (betClass === 'straight') betOption.id = winNums;
    betOption.classList.add(betClass);
    betOptions.set(betOption, { winNums, betAmount: 0 });
    betOption.addEventListener('mouseenter', highlightWinNums);
    betOption.addEventListener('mouseleave', highlightWinNums);
    betOption.addEventListener('mouseenter', showBetOptionInfo);
    betOption.addEventListener('mouseleave', hideBetOptionInfo);
    return betOption;
};

const innerBoard = [
    [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
    [0, 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
    [0, 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
];

const complexBetOption = (row, col, handler, classesBasedOnLen) => {
    const winNums1 = handler(row, col - 1);
    const winNums2 = handler(row, col);
    const winNums = [...new Set([...winNums1, ...winNums2])];
    const betClass = classesBasedOnLen[winNums.length];
    return [betClass, winNums];
};

const innerMeta = {
    straight: (row, col) => [innerBoard[row][col]],
    horizontalSplit: (row, col) => [
        innerBoard[row][col - 1],
        innerBoard[row][col],
    ],
};

const verticalSplit = (row, col) => [
    innerBoard[row][col],
    innerBoard[row + 1][col],
];

const firstTwoRowsMeta = {
    verticalSplit,
    '*': (row, col) => {
        const betClasses = { 3: 'basket', 4: 'corner' };
        return complexBetOption(row, col, verticalSplit, betClasses);
    },
};

const street = (row, col) => [
    innerBoard[row][col],
    innerBoard[row - 1][col],
    innerBoard[row - 2][col],
];

const lastRowMeta = {
    street,
    '*': (row, col) => {
        const betClasses = { 4: 'firstFour', 6: 'doubleStreet' };
        return complexBetOption(row, col, street, betClasses);
    },
};

const buildInnerBetOptions = (container) => {
    const boardCell = createDiv(null, 'boardCell');
    const zero = buildBetOption('straight', [0]);
    boardCell.appendChild(zero);
    container.appendChild(boardCell);
    for (let i = 0; i < innerBoard.length; i++) {
        const lastRow = i === 2;
        const rowMeta = lastRow ? lastRowMeta : firstTwoRowsMeta;
        const meta = Object.assign({}, innerMeta, rowMeta);
        const betClasses = Object.keys(meta);
        for (let j = 1; j < innerBoard[0].length; j++) {
            const boardCell = createDiv(null, 'boardCell');
            for (const betClass of betClasses) {
                const winNums = meta[betClass](i, j);
                const args = betClass === '*' ? winNums : [betClass, winNums];
                const betOption = buildBetOption(...args);
                boardCell.appendChild(betOption);
            }
            container.appendChild(boardCell);
        }
    }
};

const outerBoard = innerBoard.map((row) => row.slice(1, row.length));

const colsInDozen = 4;
const colsInHalf = 6;

export const red = [
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];
const black = [
    2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
];

const outerMeta = {
    column: outerBoard,
    dozen: outerBoard.map((_, i) =>
        outerBoard
            .map((row) => row.slice(i * colsInDozen, (i + 1) * colsInDozen))
            .flat()
    ),
    low: outerBoard.map((row) => row.slice(0, colsInHalf)).flat(),
    even: outerBoard.flat().filter((elem) => !(elem % 2)),
    red,
    black,
    odd: outerBoard.flat().filter((elem) => !!(elem % 2)),
    manque: outerBoard.map((row) => row.slice(colsInHalf, row.length)).flat(),
};

const buildOuterBetOptions = (container) => {
    const betClasses = Object.keys(outerMeta);
    for (const betClass of betClasses) {
        const winNums = outerMeta[betClass];
        const args = Array.isArray(winNums[0]) ? winNums : [winNums];
        for (const arg of args) {
            const betOption = buildBetOption(betClass, arg);
            container.appendChild(betOption);
        }
    }
};

const buildBettingBoard = (container) => {
    const inner = createDiv('inner');
    buildInnerBetOptions(inner);
    container.appendChild(inner);
    const outer = createDiv('outer');
    buildOuterBetOptions(outer);
    container.appendChild(outer);
};

const bettingBoard = document.getElementById('bettingBoard');

buildBettingBoard(bettingBoard);
