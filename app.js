// declaring variables in global scope so all functions will have access to these
var scores, roundScore, activePlayer, gamePlaying, prevDice1, prevDice2, inputScore;

init();

// addEventListener registers a single event listener on a single target. 2 args: 1. the event type e.g. click. 2. the function to be called when the event happens. note: you can use anonymous function as argument instead of external function like btn() on line 7 e.g. function() {}
function btn() {
  if (gamePlaying) {
    // 1. random number
    var dice1 = Math.floor(Math.random() * 6) + 1;
    var dice2 = Math.floor(Math.random() * 6) + 1;

    document.getElementById('dice-1').style.display = 'block';
    document.getElementById('dice-2').style.display = 'block';
    document.getElementById('dice-1').src = 'dice-' + dice1 + '.png';
    document.getElementById('dice-2').src = 'dice-' + dice2 + '.png';

    if (prevDice1 === 6 && prevDice2 === 6 && dice1 === 6 && dice2 === 6) {
      scores[activePlayer] = 0;
      // update UI
      document.querySelector('#score-' + activePlayer).textContent = scores[activePlayer];
      nextPlayer();
    } else if (dice1 !== 1 && dice2 !== 1) {
        roundScore += dice1 + dice2;
        document.querySelector('#current-' + activePlayer).textContent = roundScore;
    } else {
      // next player
      nextPlayer();
    }

    prevDice1 = dice1;
    prevDice2 = dice2;

  }

}
document.querySelector('.btn-roll').addEventListener('click', btn);
// button hold - hold the score and change active player
document.querySelector('.btn-hold').addEventListener('click', function() { // anonymous function
  if (gamePlaying) {
    // Add current score to global score
    scores[activePlayer] += roundScore;

    // Update the UI
    document.querySelector('#score-' + activePlayer).textContent = scores[activePlayer];

    // checking for user input for new score goal
    inputScore = document.getElementById('input-score').value;
    // debugging

    // check if user had input a score to win
    if (!inputScore) inputScore = 100;

    // Check if player won the game
    if (scores[activePlayer] >= inputScore) {
      document.querySelector('#name-' + activePlayer).textContent = 'Winner!';
      document.getElementById('dice-1').style.display = 'none';
      document.getElementById('dice-2').style.display = 'none';
      document.querySelector('.player-' + activePlayer + '-panel').classList.add('winner');
      document.querySelector('.player-' + activePlayer + '-panel').classList.remove('active');
      gamePlaying = false;
    } else {
      // Next player if there's no winner
      nextPlayer();
    }
  }

});


function nextPlayer() {
  // this switches the activePlayer from 0
  activePlayer === 0 ? activePlayer = 1 : activePlayer = 0;
  roundScore = 0; // that round's score needs to be set back to 0
  prevDice1 = prevDice2 = 0;

  // hiding the dice image on next player's turn
  document.getElementById('dice-1').style.display = 'none';
  document.getElementById('dice-2').style.display = 'none';

  // when a player rolls a 1, they should lose that current score
  document.getElementById('current-0').textContent = 0;
  document.getElementById('current-1').textContent = 0;

  // changing the active player 'display dot' in the class name
  document.querySelector('.player-0-panel').classList.toggle('active');
  document.querySelector('.player-1-panel').classList.toggle('active');
  // another way of doing it:
};


// new game button
document.querySelector('.btn-new').addEventListener('click', init);

function init() {
  // reset scores to 0
  scores = [0,0];
  roundScore = 0;
  activePlayer = 0;
  gamePlaying = true;

  document.getElementById('dice-1').style.display = 'none';
  document.getElementById('dice-2').style.display = 'none';

  document.getElementById('score-0').textContent = '0';
  document.getElementById('score-1').textContent = '0';
  document.getElementById('current-0').textContent = '0';
  document.getElementById('current-1').textContent = '0';

  // resetting player names from 'winner'
  document.getElementById('name-0').textContent = 'Player 1';
  document.getElementById('name-1').textContent = 'Player 2';

  // resetting class list to default
  document.querySelector('.player-0-panel').classList.remove('winner');
  document.querySelector('.player-1-panel').classList.remove('winner');

  // resetting activePlayer to player0
  document.querySelector('.player-0-panel').classList.remove('active');
  document.querySelector('.player-0-panel').classList.add('active');
  document.querySelector('.player-1-panel').classList.remove('active');

};


