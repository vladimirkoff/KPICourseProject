'use strict'

const score0El = document.getElementById("score_0");
const score1El = document.getElementById("score_1");
const diceEl = document.querySelector(".dice");

const btnRoll = document.querySelector(".btn_roll")

score0El.textContent = 0;
score1El.textContent = 0;
diceEl.classList.add("hidden");

btnRoll.addEventListener("click", function() {
    diceEl.classList.remove("hidden");
    const dice = Math.floor(Math.random() * 6) + 1;
    console.log(dice);
});







function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}

function updateDiceImage(diceNumber, index) {
    const diceImage = document.querySelectorAll('img')[index];
    const diceImagePath = `/Assets/dice${diceNumber}.png`;
    diceImage.setAttribute('src', diceImagePath);
}

function getTextFieldValue() {
    const textField = document.getElementById("textField");
    return textField.value
}

function startGame() {
    let textFieldValue = getTextFieldValue()
    const balanceTag = document.querySelector('.balance h3');

    const firstRandomNumber = rollDice();
    const secondRandomNumber = rollDice();

    updateDiceImage(firstRandomNumber, 0);
    updateDiceImage(secondRandomNumber, 1);

    textFieldValue = firstRandomNumber == secondRandomNumber ? textFieldValue * 2 : textFieldValue - textFieldValue;

    balanceTag.textContent = 'Your balance: ' + textFieldValue;
}
