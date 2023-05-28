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
