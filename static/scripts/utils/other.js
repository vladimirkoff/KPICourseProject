const range = (start, end, step) => {
  const res = [];
  for (let i = start; i < end; i += step) {
    res.push(i);
  }
  return res;
};

const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const randRange = (end, start = 0, step = 1) =>
  shuffle(range(start, end, step));

export const fixDecimal = (number) =>
  Number.isInteger(number) ? number : number.toFixed(2);

export class Stack {
  constructor() {
    this.last = null;
  }

  push(item) {
    const prev = this.last;
    const element = { prev, item };
    this.last = element;
  }

  pop() {
    const element = this.last;
    if (!element) return null;
    this.last = element.prev;
    return element.item;
  }
}
