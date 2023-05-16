import { showAlertMsg } from './helperUI.js';

const validateMoney = (money) => {
  const isValid =
    money !== null &&
    typeof money === 'number' &&
    !isNaN(money) &&
    isFinite(money);
  if (!isValid) throw new Error('Invalid amount of money');
};

export const getUserBalance = () => {
  const balance = parseFloat(localStorage.getItem('money'));
  if (isNaN(balance)) {
    localStorage.setItem('money', '0');
    return 0;
  }
  return balance;
};

const addUserBalance = (money) => {
  try {
    validateMoney(money);
    const balance = getUserBalance();
    const newAmount = balance + money;
    if (newAmount < 0) {
      const errMsg = 'Insufficient funds';
      showAlertMsg(errMsg);
      return [new Error(errMsg)];
    }
    localStorage.setItem('money', newAmount);
    return [null, newAmount];
  } catch (err) {
    return [err];
  }
};

export const putMoney = (money, callback) =>
  callback(...addUserBalance(Math.abs(money)));

export const withdrawMoney = (money, callback) =>
  callback(...addUserBalance(-Math.abs(money)));
