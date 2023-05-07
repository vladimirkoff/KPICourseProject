export const createDiv = (id, divClass) => {
  const div = document.createElement('div');
  if (id) div.id = id;
  if (divClass) div.classList.add(divClass);
  return div;
};

const validateBalance = (balance) =>
  balance &&
    !isNaN(balance) &&
    isFinite(balance) &&
    typeof balance === 'number';

export const getUserBalance = () => {
  const balance = parseInt(localStorage.getItem('money'));
  return validateBalance(balance) ? balance : 0;
};

export const addUserBalance = (money) => {
  if (!validateBalance(money)) return;
  const balance = getUserBalance();
  localStorage.setItem('money', balance + money);
};

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

export class ShowChangeValue {
  constructor(valueDiv, changeDiv, hideDelay = 2000) {
    this.valueDiv = valueDiv;
    this.changeDiv = changeDiv;
    this.hideDelay = hideDelay;
    this.timeoutId = null;
  }
  updateValue(change) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    const oldValue = parseInt(this.valueDiv.textContent);
    const changeText = change >= 0 ? `+${change}` : `${change}`;
    const changeColor = change >= 0 ? 'green' : 'red';
    this.valueDiv.textContent = oldValue + change;
    this.changeDiv.textContent = changeText;
    this.changeDiv.style.color = changeColor;
    this.timeoutId = setTimeout(() => {
      this.changeDiv.textContent = '';
      this.timeoutId = null;
    }, this.hideDelay);
  }
}

let timerId;

export const showAlertMsg = (msg, delay) => {
  clearTimeout(timerId);
  const alert = document.getElementById('alert');
  if (alert) {
    alert.remove();
    timerId = null;
  }
  const alertDiv = createDiv('alert');
  alertDiv.textContent = msg;
  document.body.appendChild(alertDiv);
  timerId = setTimeout(() => alertDiv.remove(), delay);
};
