import { fixDecimal } from './other.js';

export const createDiv = (id, divClass) => {
  const div = document.createElement('div');
  if (id) div.id = id;
  if (divClass) div.classList.add(divClass);
  return div;
};

let timerId;

export const showAlertMsg = (msg, delay = 1000) => {
  clearTimeout(timerId);
  const alert = document.getElementById('alert-message');
  if (alert) {
    alert.remove();
    timerId = null;
  }
  const alertDiv = createDiv('alert-message');
  alertDiv.textContent = msg;
  document.body.appendChild(alertDiv);
  timerId = setTimeout(() => alertDiv.remove(), delay);
};

export const showOverlayMsg = (
  message,
  timeout = 1000,
  color = '#f2f2f2'
) => {
  const messageBox = document.createElement('div');
  messageBox.classList.add('overlay-message');
  messageBox.style.color = color;
  messageBox.textContent = message;
  document.body.appendChild(messageBox);
  const backdrop = document.createElement('div');
  backdrop.classList.add('backdrop');
  document.body.appendChild(backdrop);
  setTimeout(() => {
    messageBox.remove();
    backdrop.remove();
  }, timeout);
};

export class LiveChangeValue {
  constructor(valueDiv, changeDiv, hideDelay = 2000) {
    this.valueDiv = valueDiv;
    this.changeDiv = changeDiv;
    this.hideDelay = hideDelay;
    this.timeoutId = null;
  }

  updateValue(change) {
    if (!change) return;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    const oldValue = parseFloat(this.valueDiv.textContent);
    const changeText = change >= 0 ? `+${change}` : `${change}`;
    const changeColor = change >= 0 ? 'green' : 'red';
    const newValue = fixDecimal(oldValue + change);
    this.valueDiv.textContent = `${newValue}`;
    this.changeDiv.textContent = changeText;
    this.changeDiv.style.color = changeColor;
    this.timeoutId = setTimeout(() => {
      this.changeDiv.textContent = '';
      this.timeoutId = null;
    }, this.hideDelay);
  }

  resetValue() {
    const oldValue = parseFloat(this.valueDiv.textContent);
    this.updateValue(-oldValue);
  }
}
