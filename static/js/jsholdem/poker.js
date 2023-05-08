'use strict';

let START_DATE;
let NUM_ROUNDS;
let STOP_AUTOPLAY = 0;
let RUN_EM = 0;
const STARTING_BANKROLL = 500;
let SMALL_BLIND;
let BIG_BLIND;
const BG_HILITE = 'gold';
let global_speed = 1;
let HUMAN_WINS_AGAIN;
let HUMAN_GOES_ALL_IN;
const cards = new Array(52);
let players;
let board;
let deck_index;
let button_index;
let current_bettor_index;
let current_bet_amount;
let current_min_raise;

function leave_pseudo_alert() {
  gui_write_modal_box('');
}

const my_pseudo_alert = (text) => {
  const html = '<html><body topmargin=2 bottommargin=0 bgcolor=' +
             BG_HILITE + ' onload=\'document.f.y.focus();\'>' +
             '<font size=+2>' + text +
             '</font><form name=f><input name=y type=button value=\'  OK  \' ' +
             'onclick=\'parent.leave_pseudo_alert()\'></form></body></html>';
  gui_write_modal_box(html);
};

function player(name, bankroll, carda, cardb, status, total_bet, subtotal_bet) {
  this.name = name;
  this.bankroll = bankroll;
  this.carda = carda;
  this.cardb = cardb;
  this.status = status;
  this.total_bet = total_bet;
  this.subtotal_bet = subtotal_bet;
}

const has_local_storage = () => {
  try {
    const storage = window['localStorage'];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
};

function init() {
  if (!has_local_storage()) {
    my_pseudo_alert('Your browser do not support localStorage - ' +
                    'try a more modern browser like Firefox');
    return;
  }
  gui_hide_poker_table();
  gui_hide_log_window();
  gui_hide_setup_option_buttons();
  gui_hide_fold_call_click();
  gui_hide_guick_raise();
  gui_hide_dealer_button();
  gui_hide_game_response();
  gui_initialize_theme_mode();
  make_deck();
  new_game();
}

const make_deck = () => {
  let i;
  let j = 0;
  for (i = 2; i < 15; i++) {
    cards[j++] = 'h' + i;
    cards[j++] = 'd' + i;
    cards[j++] = 'c' + i;
    cards[j++] = 's' + i;
  }
};

function handle_how_many_reply (opponents) {
  gui_write_modal_box('');
  write_settings_frame();
  new_game_continues(opponents);
  gui_initialize_css();
  gui_show_game_response();
}

const ask_how_many_opponents = () => {
  const quick_values = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  let asking = '<b><font size=+4 color=red>' +
               'So, how many opponents do you want?' +
               '</font></b><br>';
  for (let i = 0; i < 9; i++) {
    if (quick_values[i]) {
      asking += '<font size=+4>' +
                '<a href=\'javascript:parent.handle_how_many_reply(' +
                quick_values[i] + ')\'>' + quick_values[i] +
                ' </a></font>' + '&nbsp;&nbsp;&nbsp;';
    }
  }
  const html9 = '<td><table align=center><tr><td align=center>';
  const html10 = asking + '</td></tr></table></td></tr></table></body></html>';
  gui_write_modal_box(html9 + html10);
};

const initialize_game = () => {
  gui_hide_poker_table();
  gui_hide_dealer_button();
  gui_hide_fold_call_click();
  gui_show_poker_table();
};

const clear_player_cards = (count) => {
  count = count + 1;
  for (let pl = 0; pl < count; ++pl) {
    gui_set_player_cards('', '', pl);
    gui_set_player_name('', pl);
    gui_set_bet('', pl);
    gui_set_bankroll('', pl);
  }
};

const new_game = () => {
  START_DATE = new Date();
  NUM_ROUNDS = 0;
  HUMAN_WINS_AGAIN = 0;
  initialize_game();
  ask_how_many_opponents();
};

const new_game_continues = (req_no_opponents) => {
  const my_players = [
    new player('惠辰國', 0, '', '', '', 0, 0),
    new player('Jani Sointula', 0, '', '', '', 0, 0),
    new player('Annette Obrestad', 0, '', '', '', 0, 0),
    new player('Ricardo Chauriye', 0, '', '', '', 0, 0),
    new player('Jennifer Shahade', 0, '', '', '', 0, 0),
    new player('Leonardo da Vinci', 0, '', '', '', 0, 0),
    new player('Rene Descartes', 0, '', '', '', 0, 0),
    new player('Marcus Aurelius', 0, '', '', '', 0, 0),
    new player('Chris Moneymaker', 0, '', '', '', 0, 0),
  ];
  players = new Array(req_no_opponents + 1);
  let player_name = getLocalStorage('playername');
  if (!player_name) {
    player_name = 'You';
  }
  players[0] = new player(player_name, 0, '', '', '', 0, 0);
  my_players.sort(compRan);
  let i;
  for (i = 1; i < players.length; i++) {
    players[i] = my_players[i - 1];
  }
  clear_player_cards(my_players.length);
  reset_player_statuses(0);
  clear_bets();
  for (i = 0; i < players.length; i++) {
    players[i].bankroll = STARTING_BANKROLL;
  }
  button_index = Math.floor(Math.random() * players.length);
  new_round();
};

const number_of_active_players = () => {
  let num_playing = 0;
  let i;
  for (i = 0; i < players.length; i++) {
    if (has_money(i)) {
      num_playing += 1;
    }
  }
  return num_playing;
};

const new_round = () => {
  RUN_EM = 0;
  NUM_ROUNDS++;
  gui_hide_fold_call_click();

  const num_playing = number_of_active_players();
  if (num_playing < 2) {
    gui_setup_fold_call_click('Start a new game',
        0,
        new_game,
        new_game);
    return;
  }
  HUMAN_GOES_ALL_IN = 0;
  reset_player_statuses(1);
  clear_bets();
  clear_pot();
  current_min_raise = 0;
  collect_cards();
  button_index = get_next_player_position(button_index, 1);
  let i;
  for (i = 0; i < players.length; i++) {
    write_player(i, 0, 0);
  }

  for (i = 0; i < board.length; i++) {
    if (i > 4) {
      continue;
    }
    board[i] = '';
    gui_lay_board_card(i, board[i]);
  }
  for (i = 0; i < 3; i++) {
    board[i] = '';
    gui_burn_board_card(i, board[i]);
  }

  const message = '<tr><td><font size=+2><b>New round</b></font>';
  gui_write_game_response(message);
  gui_hide_guick_raise();
  shuffle();
  blinds_and_deal();
};

const collect_cards = () => {
  board = new Array(6);
  for (let i = 0; i < players.length; i++) {
    players[i].carda = '';
    players[i].cardb = '';
  }
};

const new_shuffle = () => {
  function get_random_int(max) {
    return Math.floor(Math.random() * max);
  }
  const len = cards.length;
  for (let i = 0; i < len; ++i) {
    const j = i + get_random_int(len - i);
    const tmp = cards[i];
    cards[i] = cards[j];
    cards[j] = tmp;
  }
};

const shuffle = () => {
  new_shuffle();
  deck_index = 0;
};

const blinds_and_deal = () => {
  SMALL_BLIND = 5;
  BIG_BLIND = 10;
  const num_playing = number_of_active_players();
  if (num_playing === 3) {
    SMALL_BLIND = 10;
    BIG_BLIND = 20;
  } else if (num_playing < 3) {
    SMALL_BLIND = 25;
    BIG_BLIND = 50;
  }
  const small_blind = get_next_player_position(button_index, 1);
  the_bet_function(small_blind, SMALL_BLIND);
  write_player(small_blind, 0, 0);
  const big_blind = get_next_player_position(small_blind, 1);
  the_bet_function(big_blind, BIG_BLIND);
  write_player(big_blind, 0, 0);
  players[big_blind].status = 'OPTION';
  current_bettor_index = get_next_player_position(big_blind, 1);
  deal_and_write_a();
};

const unroll_player = (starting_player, player_pos, final_call) => {
  const next_player = get_next_player_position(player_pos, 1);
  write_player(player_pos, 0, 0);
  if (starting_player === next_player) {
    setTimeout(final_call, 550 * global_speed);
  } else {
    setTimeout(unroll_player, 550 * global_speed,
        starting_player, next_player, final_call);
  }
};

const deal_and_write_a = () => {
  let current_player;
  let start_player;
  start_player = current_player = get_next_player_position(button_index, 1);
  do {
    players[current_player].carda = cards[deck_index++];
    current_player = get_next_player_position(current_player, 1);
  } while (current_player !== start_player);
  current_player = get_next_player_position(button_index, 1);
  unroll_player(current_player, current_player, deal_and_write_b);
};

const delay_for_main = () => {
  setTimeout(main, 1000);
};

const deal_and_write_b = () => {
  let current_player = button_index;
  for (let i = 0; i < players.length; i++) {
    current_player = get_next_player_position(current_player, 1);
    if (players[current_player].cardb) {
      break;
    }
    players[current_player].cardb = cards[deck_index++];
  }
  current_player = get_next_player_position(button_index, 1);
  unroll_player(current_player, current_player, delay_for_main);
};

const go_to_betting = () => {
  if (get_num_betting() > 1) {
    setTimeout(main, 1000 * global_speed);
  } else {
    setTimeout(ready_for_next_card, 1000 * global_speed);
  }
};

const unroll_table = (last_pos, current_pos, final_call) => {
  gui_lay_board_card(current_pos, board[current_pos]);

  if (current_pos === last_pos) {
    setTimeout(final_call, 150 * global_speed);
  } else {
    setTimeout(unroll_table, 150 * global_speed,
        last_pos, current_pos + 1, final_call);
  }
};

const deal_flop = () => {
  let burn = cards[deck_index++];
  burn = 'blinded';
  gui_burn_board_card(0, burn);
  const message = '<tr><td><font size=+2><b>Dealing flop</b></font>';
  gui_write_game_response(message);
  for (let i = 0; i < 3; i++) {
    board[i] = cards[deck_index++];
  }

  setTimeout(unroll_table, 1000, 2, 0, go_to_betting);
};

const deal_fourth = () => {
  let burn = cards[deck_index++];
  burn = 'blinded';
  gui_burn_board_card(1, burn);
  const message = '<tr><td><font size=+2><b>Dealing turn</b></font>';
  gui_write_game_response(message);
  board[3] = cards[deck_index++];
  setTimeout(unroll_table, 1000, 3, 3, go_to_betting);
};

const deal_fifth = () => {
  let burn = cards[deck_index++];
  burn = 'blinded';
  gui_burn_board_card(2, burn);
  const message = '<tr><td><font size=+2><b>Dealing river</b></font>';
  gui_write_game_response(message);
  board[4] = cards[deck_index++];
  setTimeout(unroll_table, 1000, 4, 4, go_to_betting);
};

const main = () => {
  gui_hide_guick_raise();
  let increment_bettor_index = 0;
  if (players[current_bettor_index].status === 'BUST' ||
      players[current_bettor_index].status === 'FOLD') {
    increment_bettor_index = 1;
  } else if (!has_money(current_bettor_index)) {
    players[current_bettor_index].status = 'CALL';
    increment_bettor_index = 1;
  } else if (players[current_bettor_index].status === 'CALL' &&
             players[current_bettor_index].subtotal_bet === current_bet_amount) {
    increment_bettor_index = 1;
  } else {
    players[current_bettor_index].status = '';
    if (current_bettor_index === 0) {
      let call_button_text = '<u>C</u>all';
      let fold_button_text = '<u>F</u>old';
      let to_call = current_bet_amount - players[0].subtotal_bet;
      if (to_call > players[0].bankroll) {
        to_call = players[0].bankroll;
      }
      call_button_text += ' $' + to_call;
      let that_is_not_the_key_you_are_looking_for;
      if (to_call === 0) {
        call_button_text = '<u>C</u>heck';
        fold_button_text = 0;
        that_is_not_the_key_you_are_looking_for = function(key) {
          if (key === 67) {
            human_call();
          } else {
            return true;
          }
          return false;
        };
      } else {
        that_is_not_the_key_you_are_looking_for = function(key) {
          if (key === 67) {
            human_call();
          } else if (key === 70) {
            human_fold();
          } else {
            return true;
          }
          return false;
        };
      }
      const ret_function = (key_event) => {
        actual_function(key_event.keyCode, key_event);
      };
      const actual_function = (key, key_event) => {
        if (that_is_not_the_key_you_are_looking_for(key)) {
          return;
        }
        gui_disable_shortcut_keys(ret_function);
        if (key_event != null) {
          key_event.preventDefault();
        }
      };

      const do_fold = () => {
        actual_function(70, null);
      };
      const do_call = () => {
        actual_function(67, null);
      };
      gui_enable_shortcut_keys(ret_function);

      gui_setup_fold_call_click(fold_button_text,
          call_button_text,
          do_fold,
          do_call);

      const quick_values = new Array(6);
      if (to_call < players[0].bankroll) {
        quick_values[0] = current_min_raise;
      }
      let quick_start = quick_values[0];
      if (quick_start < 20) {
        quick_start = 20;
      } else {
        quick_start = current_min_raise + 20;
      }
      let i;
      for (i = 0; i < 5; i++) {
        if (quick_start + 20 * i < players[0].bankroll) {
          quick_values[i + 1] = quick_start + 20 * i;
        }
      }
      let bet_or_raise = 'Bet';
      if (to_call > 0) {
        bet_or_raise = 'Raise';
      }
      let quick_bets = '<b>Quick ' + bet_or_raise + 's</b><br>';
      for (i = 0; i < 6; i++) {
        if (quick_values[i]) {
          quick_bets += '<a href=\'javascript:parent.handle_human_bet(' +
                        quick_values[i] + ')\'>' + quick_values[i] + '</a>' +
                        '&nbsp;&nbsp;&nbsp;';
        }
      }
      quick_bets += '<a href=\'javascript:parent.handle_human_bet(' +
                    players[0].bankroll + ')\'>All In!</a>';
      const html9 = '<td><table align=center><tr><td align=center>';
      const html10 = quick_bets +
                   '</td></tr></table></td></tr></table></body></html>';
      gui_write_guick_raise(html9 + html10);

      const hi_lite_color = gui_get_theme_mode_highlite_color();
      const message = '<tr><td><font size=+2><b>Current raise: ' +
                    current_bet_amount +
                    '</b><br> You need <font color=' + hi_lite_color +
                    ' size=+3>' + to_call +
                    '</font> more to call.</font></td></tr>';
      gui_write_game_response(message);
      write_player(0, 1, 0);
      return;
    } else {
      write_player(current_bettor_index, 1, 0);
      setTimeout(bet_from_bot, 777 * global_speed, current_bettor_index);
      return;
    }
  }
  let can_break = true;
  for (let j = 0; j < players.length; j++) {
    const s = players[j].status;
    if (s === 'OPTION') {
      can_break = false;
      break;
    }
    if (s !== 'BUST' && s !== 'FOLD') {
      if (has_money(j) && players[j].subtotal_bet < current_bet_amount) {
        can_break = false;
        break;
      }
    }
  }
  if (increment_bettor_index) {
    current_bettor_index = get_next_player_position(current_bettor_index, 1);
  }
  if (can_break) {
    setTimeout(ready_for_next_card, 999 * global_speed);
  } else {
    setTimeout(main, 999 * global_speed);
  }
};

let global_pot_remainder = 0;

const handle_end_of_round = () => {
  const candidates = new Array(players.length);
  const allocations = new Array(players.length);
  const winning_hands = new Array(players.length);
  const my_total_bets_per_player = new Array(players.length);
  let i;
  let still_active_candidates = 0;
  for (i = 0; i < candidates.length; i++) {
    allocations[i] = 0;
    my_total_bets_per_player[i] = players[i].total_bet;
    if (players[i].status !== 'FOLD' && players[i].status !== 'BUST') {
      candidates[i] = players[i];
      still_active_candidates += 1;
    }
  }
  let my_total_pot_size = get_pot_size();
  let my_best_hand_name = '';
  let best_hand_players;
  let current_pot_to_split = 0;
  let pot_remainder = 0;
  if (global_pot_remainder) {
    gui_log_to_history('transferring global pot remainder ' + global_pot_remainder);
    pot_remainder = global_pot_remainder;
    my_total_pot_size += global_pot_remainder;
    global_pot_remainder = 0;
  }

  while (my_total_pot_size > (pot_remainder + 0.9) && still_active_candidates) {
    const winners = get_winners(candidates);
    if (!best_hand_players) {
      best_hand_players = winners;
    }
    if (!winners) {
      my_pseudo_alert('No winners for the pot ');
      pot_remainder = my_total_pot_size;
      my_total_pot_size = 0;
      break;
    }
    let lowest_winner_bet = my_total_pot_size * 2;
    let num_winners = 0;
    for (i = 0; i < winners.length; i++) {
      if (!winners[i]) {
        continue;
      }
      if (!my_best_hand_name) {
        my_best_hand_name = winners[i]['hand_name'];
      }
      num_winners++;
      if (my_total_bets_per_player[i] < lowest_winner_bet) {
        lowest_winner_bet = my_total_bets_per_player[i];
      }
    }
    current_pot_to_split = pot_remainder;
    pot_remainder = 0;
    for (i = 0; i < players.length; i++) {
      if (lowest_winner_bet >= my_total_bets_per_player[i]) {
        current_pot_to_split += my_total_bets_per_player[i];
        my_total_bets_per_player[i] = 0;
      } else {
        current_pot_to_split += lowest_winner_bet;
        my_total_bets_per_player[i] -= lowest_winner_bet;
      }
    }
    const share = Math.floor(current_pot_to_split / num_winners);
    pot_remainder = current_pot_to_split - share * num_winners;
    for (i = 0; i < winners.length; i++) {
      if (my_total_bets_per_player[i] < 0.01) {
        candidates[i] = null;
      }
      if (!winners[i]) {
        continue;
      }
      my_total_pot_size -= share;
      allocations[i] += share;
      winning_hands[i] = winners[i].hand_name;
    }
    for (i = 0; i < candidates.length; i++) {
      if (candidates[i] == null) {
        continue;
      }
      still_active_candidates += 1;
    }
    if (still_active_candidates === 0) {
      pot_remainder = my_total_pot_size;
    }
    gui_log_to_history('End of iteration');
  }
  global_pot_remainder = pot_remainder;
  pot_remainder = 0;
  let winner_text = '';
  let human_loses = 0;
  for (i = 0; i < allocations.length; i++) {
    if (allocations[i] > 0) {
      let a_string = '' + allocations[i];
      const dot_index = a_string.indexOf('.');
      if (dot_index > 0) {
        a_string = '' + a_string + '00';
        allocations[i] = a_string.substring(0, dot_index + 3) - 0;
      }
      winner_text += winning_hands[i] + ' gives ' + allocations[i] +
                     ' to ' + players[i].name + '. ';
      players[i].bankroll += allocations[i];
      if (best_hand_players[i]) {
        write_player(i, 2, 1);
      } else {
        write_player(i, 1, 1);
      }
    } else {
      if (!has_money(i) && players[i].status !== 'BUST') {
        players[i].status = 'BUST';
        if (i === 0) {
          human_loses = 1;
        }
      }
      if (players[i].status !== 'FOLD') {
        write_player(i, 0, 1);
      }
    }
  }
  if (allocations[0] > 5) {
    HUMAN_WINS_AGAIN++;
  } else {
    HUMAN_WINS_AGAIN = 0;
  }
  let detail = '';
  for (i = 0; i < players.length; i++) {
    if (players[i].total_bet === 0 && players[i].status === 'BUST') {
      continue;
    }
    detail += players[i].name + ' bet ' + players[i].total_bet + ' & got ' +
              allocations[i] + '.\\n';
  }
  detail = ' (<a href=\'javascript:alert("' + detail + '")\'>details</a>)';

  const quit_text = 'Restart';
  let quit_func = new_game;
  let continue_text = 'Go on';
  const continue_func = new_round;

  if (players[0].status === 'BUST' && !human_loses) {
    continue_text = 0;
    quit_func = function() {
      parent.STOP_AUTOPLAY = 1;
    };
    setTimeout(autoplay_new_round, 1500 + 1100 * global_speed);
  }

  let num_playing = number_of_active_players();
  if (num_playing < 2) {
    for (i = 0; i < players.length; i++) {
      if (has_money(i)) {
        players[i].bankroll += pot_remainder;
        pot_remainder = 0;
      }
    }
  }
  if (pot_remainder) {
    const local_text = 'There is ' + pot_remainder + ' put into next pot\n';
    detail += local_text;
  }
  const hi_lite_color = gui_get_theme_mode_highlite_color();
  const html = '<html><body topmargin=2 bottommargin=0 bgcolor=' + BG_HILITE +
             ' onload=\'document.f.c.focus();\'><table><tr><td>' +
             get_pot_size_html() +
             '</td></tr></table><br><font size=+2 color=' + hi_lite_color +
             '><b>Winning: ' +
             winner_text + '</b></font>' + detail + '<br>';
  gui_write_game_response(html);

  gui_setup_fold_call_click(quit_text,
      continue_text,
      quit_func,
      continue_func);

  const elapsed_milliseconds = ((new Date()) - START_DATE);
  const elapsed_time = makeTimeString(elapsed_milliseconds);

  if (human_loses === 1) {
    const ending = NUM_ROUNDS === 1 ? '1 deal.' : NUM_ROUNDS + ' deals.';
    my_pseudo_alert('Sorry, you busted ' + players[0].name + '.\n\n' +
                    elapsed_time + ', ' + ending);
  } else {
    num_playing = number_of_active_players();
    if (num_playing < 2) {
      let end_msg = 'GAME OVER!';
      const over_ending = NUM_ROUNDS === 1 ? '1 deal.' : NUM_ROUNDS + ' deals.';
      if (has_money(0)) {
        end_msg += '\n\nYOU WIN ' + players[0].name.toUpperCase() + '!!!';
      } else {
        end_msg += '\n\nSorry, you lost.';
      }
      my_pseudo_alert(end_msg + '\n\nThis game lasted ' + elapsed_time + ', ' +
                      over_ending);
    }
  }
};

const autoplay_new_round = () => {
  if (STOP_AUTOPLAY > 0) {
    STOP_AUTOPLAY = 0;
    new_game();
  } else {
    new_round();
  }
};

const ready_for_next_card = () => {
  const num_betting = get_num_betting();
  let i;
  for (i = 0; i < players.length; i++) {
    players[i].total_bet += players[i].subtotal_bet;
  }
  clear_bets();
  if (board[4]) {
    handle_end_of_round();
    return;
  }
  current_min_raise = BIG_BLIND;
  reset_player_statuses(2);
  if (players[button_index].status === 'FOLD') {
    players[get_next_player_position(button_index, -1)].status = 'OPTION';
  } else {
    players[button_index].status = 'OPTION';
  }
  current_bettor_index = get_next_player_position(button_index, 1);
  let show_cards = 0;
  if (num_betting < 2) {
    show_cards = 1;
  }

  if (!RUN_EM) {
    for (i = 0; i < players.length; i++) {
      if (players[i].status !== 'BUST' && players[i].status !== 'FOLD') {
        write_player(i, 0, show_cards);
      }
    }
  }

  if (num_betting < 2) {
    RUN_EM = 1;
  }
  if (!board[0]) {
    deal_flop();
  } else if (!board[3]) {
    deal_fourth();
  } else if (!board[4]) {
    deal_fifth();
  }
};

const the_bet_function = (player_index, bet_amount) => {
  if (players[player_index].status === 'FOLD') {
    return 0;
  } else if (bet_amount >= players[player_index].bankroll) {
    bet_amount = players[player_index].bankroll;

    const old_current_bet = current_bet_amount;

    if (players[player_index].subtotal_bet + bet_amount > current_bet_amount) {
      current_bet_amount = players[player_index].subtotal_bet + bet_amount;
    }
    const new_current_min_raise = current_bet_amount - old_current_bet;
    if (new_current_min_raise > current_min_raise) {
      current_min_raise = new_current_min_raise;
    }
    players[player_index].status = 'CALL';
  } else if (bet_amount + players[player_index].subtotal_bet === current_bet_amount) {
    players[player_index].status = 'CALL';
  } else if (current_bet_amount >
             players[player_index].subtotal_bet + bet_amount) {
    if (player_index === 0) {
      my_pseudo_alert('The current bet to match is ' + current_bet_amount +
                      '\nYou must bet a total of at least ' +
                      (current_bet_amount - players[player_index].subtotal_bet) +
                      ' or fold.');
    }
    return 0;
  } else if (bet_amount + players[player_index].subtotal_bet >
             current_bet_amount &&
             get_pot_size() > 0 &&
             bet_amount + players[player_index].subtotal_bet - current_bet_amount < current_min_raise) {
    if (player_index === 0) {
      my_pseudo_alert('Minimum raise is currently ' + current_min_raise + '.');
    }
    return 0;
  } else {
    players[player_index].status = 'CALL';

    const previous_current_bet = current_bet_amount;
    current_bet_amount = players[player_index].subtotal_bet + bet_amount;

    if (get_pot_size() > 0) {
      current_min_raise = current_bet_amount - previous_current_bet;
      if (current_min_raise < BIG_BLIND) {
        current_min_raise = BIG_BLIND;
      }
    }
  }
  players[player_index].subtotal_bet += bet_amount;
  players[player_index].bankroll -= bet_amount;
  const current_pot_size = get_pot_size();
  gui_write_basic_general(current_pot_size);
  return 1;
};

const human_call = () => {
  gui_hide_fold_call_click();
  players[0].status = 'CALL';
  current_bettor_index = get_next_player_position(0, 1);
  the_bet_function(0, current_bet_amount - players[0].subtotal_bet);
  write_player(0, 0, 0);
  main();
};

function handle_human_bet(bet_amount) {
  if (bet_amount < 0 || isNaN(bet_amount)) bet_amount = 0;
  const to_call = current_bet_amount - players[0].subtotal_bet;
  bet_amount += to_call;
  const is_ok_bet = the_bet_function(0, bet_amount);
  if (is_ok_bet) {
    players[0].status = 'CALL';
    current_bettor_index = get_next_player_position(0, 1);
    write_player(0, 0, 0);
    main();
    gui_hide_guick_raise();
  } else {
    crash_me();
  }
}

const human_fold = () => {
  players[0].status = 'FOLD';
  gui_hide_fold_call_click();
  current_bettor_index = get_next_player_position(0, 1);
  write_player(0, 0, 0);
  const current_pot_size = get_pot_size();
  gui_write_basic_general(current_pot_size);
  main();
};

const bet_from_bot = (x) => {
  let b = 0;
  const n = current_bet_amount - players[x].subtotal_bet;
  if (!board[0]) b = bot_get_preflop_bet();
  else b = bot_get_postflop_bet();
  if (b >= players[x].bankroll) {
    players[x].status = '';
  } else if (b < n) {
    b = 0;
    players[x].status = 'FOLD';
  } else if (b === n) {
    players[x].status = 'CALL';
  } else if (b > n) {
    if (b - n < current_min_raise) {
      b = n;
      players[x].status = 'CALL';
    } else {
      players[x].status = '';
    }
  }
  if (the_bet_function(x, b) === 0) {
    players[x].status = 'FOLD';
    the_bet_function(x, 0);
  }
  write_player(current_bettor_index, 0, 0);
  current_bettor_index = get_next_player_position(current_bettor_index, 1);
  main();
};

const write_player = (n, hilite, show_cards) => {
  let carda = '';
  let cardb = '';
  let name_background_color = '';
  let name_font_color = '';
  if (hilite === 1) {
    name_background_color = BG_HILITE;
    name_font_color = 'black';
  } else if (hilite === 2) {
    name_background_color = 'red';
  }
  if (players[n].status === 'FOLD') {
    name_font_color = 'black';
    name_background_color = 'gray';
  }
  if (players[n].status === 'BUST') {
    name_font_color = 'white';
    name_background_color = 'black';
  }
  gui_hilite_player(name_background_color, name_font_color, n);

  let show_folded = false;
  if (players[0].status === 'BUST' || players[0].status === 'FOLD') {
    show_cards = 1;
  }
  if (players[n].carda) {
    if (players[n].status === 'FOLD') {
      carda = '';
      show_folded = true;
    } else {
      carda = 'blinded';
    }
    if (n === 0 || (show_cards && players[n].status !== 'FOLD')) {
      carda = players[n].carda;
    }
  }
  if (players[n].cardb) {
    if (players[n].status === 'FOLD') {
      cardb = '';
      show_folded = true;
    } else {
      cardb = 'blinded';
    }
    if (n === 0 || (show_cards && players[n].status !== 'FOLD')) {
      cardb = players[n].cardb;
    }
  }
  if (n === button_index) {
    gui_place_dealer_button(n);
  }
  let bet_text;
  const allin = 'Bet:';

  if (players[n].status === 'FOLD') {
    bet_text = 'FOLDED (' +
               (players[n].subtotal_bet + players[n].total_bet) + ')';
    if (n === 0) {
      HUMAN_GOES_ALL_IN = 0;
    }
  } else if (players[n].status === 'BUST') {
    bet_text = 'BUSTED';
    if (n === 0) {
      HUMAN_GOES_ALL_IN = 0;
    }
  } else if (!has_money(n)) {
    bet_text = 'ALL IN (' +
               (players[n].subtotal_bet + players[n].total_bet) + ')';
    if (n === 0) {
      HUMAN_GOES_ALL_IN = 1;
    }
  } else {
    bet_text = allin + '$' + players[n].subtotal_bet +
               ' (' + (players[n].subtotal_bet + players[n].total_bet) + ')';
  }

  gui_set_player_name(players[n].name, n);
  gui_set_bet(bet_text, n);
  gui_set_bankroll(players[n].bankroll, n);
  gui_set_player_cards(carda, cardb, n, show_folded);
};

const make_readable_rank = (r) => {
  if (r < 11) {
    return r;
  } else if (r === 11) {
    return 'J';
  } else if (r === 12) {
    return 'Q';
  } else if (r === 13) {
    return 'K';
  } else if (r === 14) {
    return 'A';
  }
};

const get_pot_size = () => {
  let p = 0;
  for (let i = 0; i < players.length; i++) {
    p += players[i].total_bet + players[i].subtotal_bet;
  }
  return p;
};

const get_pot_size_html = () => '<font size=+4><b>TOTAL POT: ' + get_pot_size() + '</b></font>';

const clear_bets = () => {
  for (let i = 0; i < players.length; i++) {
    players[i].subtotal_bet = 0;
  }
  current_bet_amount = 0;
};

const clear_pot = () => {
  for (let i = 0; i < players.length; i++) {
    players[i].total_bet = 0;
  }
};

const reset_player_statuses = (type) => {
  for (let i = 0; i < players.length; i++) {
    if (type === 0) {
      players[i].status = '';
    } else if (type === 1 && players[i].status !== 'BUST') {
      players[i].status = '';
    } else if (type === 2 &&
               players[i].status !== 'FOLD' &&
               players[i].status !== 'BUST') {
      players[i].status = '';
    }
  }
};

const get_num_betting = () => {
  let n = 0;
  for (let i = 0; i < players.length; i++) {
    if (players[i].status !== 'FOLD' &&
        players[i].status !== 'BUST' &&
        has_money(i)) {
      n++;
    }
  }
  return n;
};

const change_name = () => {
  let name = prompt('What is your name?', getLocalStorage('playername'));
  if (!name) {
    return;
  }
  if (!players) {
    my_pseudo_alert('Too early to get a name');
    return;
  }
  if (name.length > 14) {
    my_pseudo_alert('Too long, I will call you Sue');
    name = 'Sue';
  }
  players[0].name = name;
  write_player(0, 0, 0);
  setLocalStorage('playername', name);
};

const help_func = () => {
  const win = window.open('help.html', '_blank');
  win.focus();
};

const update_func = () => {
  const url = 'https://sourceforge.net/projects/js-css-poker/files/';
  const win = window.open(url, '_blank');
  win.focus();
};

const write_settings_frame = () => {
  const default_speed = 2;
  let speed_i = getLocalStorage('gamespeed');
  if (speed_i === '') {
    speed_i = default_speed;
  }
  if (speed_i == null ||
      (speed_i !== 0 &&
       speed_i !== 1 &&
       speed_i !== 2 &&
       speed_i !== 3 &&
       speed_i !== 4)) {
    speed_i = default_speed;
  }
  set_speed(speed_i);
  gui_setup_option_buttons(change_name,
      set_raw_speed,
      help_func,
      update_func,
      gui_toggle_the_theme_mode);
};

const speeds = ['2', '1', '.6', '.3', '0.01'];

const index2speed = (index) => speeds[index];

const set_speed = (index) => {
  global_speed = index2speed(index);
  setLocalStorage('gamespeed', index);
  gui_set_selected_speed_option(index);
};

const set_raw_speed = (selector_index) => {
  if (selector_index < 1 || selector_index > 5) {
    my_pseudo_alert('Cannot set speed to ' + selector_index);
    selector_index = 3;
  }
  const index = selector_index - 1;
  set_speed(index);
};

const get_next_player_position = (i, delta) => {
  let j = 0;
  let step = 1;
  if (delta < 0) step = -1;
  let loop_on = 0;
  do {
    i += step;
    if (i >= players.length) {
      i = 0;
    } else {
      if (i < 0) {
        i = players.length - 1;
      }
    }
    loop_on = 0;
    if (players[i].status === 'BUST') loop_on = 1;
    if (players[i].status === 'FOLD') loop_on = 1;
    if (++j < delta) loop_on = 1;
  } while (loop_on);
  return i;
};

const getLocalStorage = (key) => localStorage.getItem(key);

const setLocalStorage = (key, value) => localStorage.setItem(key, value);

const has_money = (i) => players[i].bankroll >= 0.01;

const compRan = () => 0.5 - Math.random();

const my_local_subtime = (invalue, fractionizer) => {
  let quotient = 0;
  let remainder = invalue;
  if (invalue > fractionizer) {
    quotient = Math.floor(invalue / fractionizer);
    remainder = invalue - quotient * fractionizer;
  }
  return [quotient, remainder];
};

const getTimeText = (string, number, text) => {
  if (number === 0) return string;
  if (string.length > 0) {
    string += ' ';
  }
  if (number === 1) {
    string = string + '1 ' + text;
  } else {
    string = string + number + ' ' + text + 's';
  }
  return string;
};

const makeTimeString = (milliseconds) => {
  const _MS_PER_SECOND = 1000;
  const _MS_PER_MINUTE = 1000 * 60;
  const _MS_PER_HOUR = _MS_PER_MINUTE * 60;
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  const _MS_PER_WEEK = _MS_PER_DAY * 7;
  let weeks;
  let days;
  let hours;
  let minutes;
  let seconds;
  [weeks, milliseconds] = my_local_subtime(milliseconds, _MS_PER_WEEK);
  [days, milliseconds] = my_local_subtime(milliseconds, _MS_PER_DAY);
  [hours, milliseconds] = my_local_subtime(milliseconds, _MS_PER_HOUR);
  [minutes, milliseconds] = my_local_subtime(milliseconds, _MS_PER_MINUTE);
  [seconds, milliseconds] = my_local_subtime(milliseconds, _MS_PER_SECOND);

  let string = '';
  string = getTimeText(string, weeks, 'week');
  string = getTimeText(string, days, 'day');
  string = getTimeText(string, hours, 'hour');
  string = getTimeText(string, minutes, 'minute');
  string = getTimeText(string, seconds, 'second');

  return (string);
};
