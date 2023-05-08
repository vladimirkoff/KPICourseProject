/*
If you improve this software or find a bug, please let me know: orciu@users.sourceforge.net
Project home page: http://sourceforge.net/projects/jsholdem/
*/
"use strict";

var START_DATE;
var NUM_ROUNDS;
var STOP_AUTOPLAY = 0;
var RUN_EM = 0;
var STARTING_BANKROLL = 500;
var SMALL_BLIND;
var BIG_BLIND;
var BG_HILITE = 'gold';           // "#EFEF30",
var global_speed = 1;
var HUMAN_WINS_AGAIN;
var HUMAN_GOES_ALL_IN;
var cards = new Array(52);
var players;
var board, deck_index, button_index;
var current_bettor_index, current_bet_amount, current_min_raise;

function leave_pseudo_alert () {
  gui_write_modal_box("");
}

function my_pseudo_alert (text) {
  var html = "<html><body topmargin=2 bottommargin=0 bgcolor=" +
             BG_HILITE + " onload='document.f.y.focus();'>" +
             "<font size=+2>" + text +
             "</font><form name=f><input name=y type=button value='  OK  ' " +
             "onclick='parent.leave_pseudo_alert()'></form></body></html>";
  gui_write_modal_box(html);
}

function player (name, bankroll, carda, cardb, status, total_bet,
                 subtotal_bet) {
  this.name = name;
  this.bankroll = bankroll;
  this.carda = carda;
  this.cardb = cardb;
  this.status = status;
  this.total_bet = total_bet;
  this.subtotal_bet = subtotal_bet;
}

// See stackoverflow.com/questions/16427636/check-if-localstorage-is-available
function has_local_storage () {
  try {
    var storage = window['localStorage'];
    var x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  }
  catch (e) {
    return false;
  }
}

function init () {
  if (!has_local_storage()) {
    my_pseudo_alert("Your browser do not support localStorage - " +
                    "try a more modern browser like Firefox");
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

function make_deck () {
  var i;
  var j = 0;
  for (i = 2; i < 15; i++) {
    cards[j++] = "h" + i;
    cards[j++] = "d" + i;
    cards[j++] = "c" + i;
    cards[j++] = "s" + i;
  }
}

function handle_how_many_reply (opponents) {
  gui_write_modal_box("");
  write_settings_frame();
  new_game_continues(opponents);
  gui_initialize_css();         // Load background images
  gui_show_game_response();
}

function ask_how_many_opponents () {
  var quick_values = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  var asking = "<b><font size=+4 color=red>" +
               "So, how many opponents do you want?" +
               "</font></b><br>";
  for (var i = 0; i < 9; i++) {
    if (quick_values[i]) {
      asking += "<font size=+4>" +
                "<a href='javascript:parent.handle_how_many_reply(" +
                quick_values[i] + ")'>" + quick_values[i] +
                " </a></font>" + "&nbsp;&nbsp;&nbsp;";
    }
  }
  var html9 = "<td><table align=center><tr><td align=center>";
  var html10 = asking + "</td></tr></table></td></tr></table></body></html>";
  gui_write_modal_box(html9 + html10);
}

function initialize_game () {
  gui_hide_poker_table();
  gui_hide_dealer_button();
  gui_hide_fold_call_click();
  gui_show_poker_table();
}

function clear_player_cards (count) {
  count = count + 1; // Count that human too
  for (var pl = 0; pl < count; ++pl) {
    gui_set_player_cards("", "", pl);
    gui_set_player_name("", pl);
    gui_set_bet("", pl);
    gui_set_bankroll("", pl);
  }
}

function new_game () {
  START_DATE = new Date();
  NUM_ROUNDS = 0;
  HUMAN_WINS_AGAIN = 0;
  initialize_game();
  ask_how_many_opponents();
}

function new_game_continues (req_no_opponents) {
  var my_players = [
                    new player("惠辰國", 0, "", "", "", 0, 0),
                    new player("Jani Sointula", 0, "", "", "", 0, 0),
                    new player("Annette Obrestad", 0, "", "", "", 0, 0),
                    new player("Ricardo Chauriye", 0, "", "", "", 0, 0),
                    new player("Jennifer Shahade", 0, "", "", "", 0, 0),
                    new player("Theo Jørgensen", 0, "", "", "", 0, 0),
                    new player("Marek Židlický", 0, "", "", "", 0, 0),
                    //  Żółć - Grzegorz Brzęczyszczykiewicz
                    new player("Brzęczyszczykiewicz", 0, "", "", "", 0, 0),
                    new player("Chris Moneymaker", 0, "", "", "", 0, 0)
                   ];

  players = new Array(req_no_opponents + 1);
  var player_name = getLocalStorage("playername");
  if (!player_name) {
    player_name = "You";
  }
  players[0] = new player(player_name, 0, "", "", "", 0, 0);
  my_players.sort(compRan);
  var i;
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
}

function number_of_active_players () {
  var num_playing = 0;
  var i;
  for (i = 0; i < players.length; i++) {
    if (has_money(i)) {
      num_playing += 1;
    }
  }
  return num_playing;
}

function new_round () {
  RUN_EM = 0;
  NUM_ROUNDS++;
  // Clear buttons
  gui_hide_fold_call_click();

  var num_playing = number_of_active_players();
  if (num_playing < 2) {
    gui_setup_fold_call_click("Start a new game",
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
  var i;
  for (i = 0; i < players.length; i++) {
    write_player(i, 0, 0);
  }

  for (i = 0; i < board.length; i++) {
    if (i > 4) {        // board.length != 5
      continue;
    }
    board[i] = "";
    gui_lay_board_card(i, board[i]);     // Clear the board
  }
  for (i = 0; i < 3; i++) {
    board[i] = "";
    gui_burn_board_card(i, board[i]);
  }

  var message = "<tr><td><font size=+2><b>New round</b></font>";
  gui_write_game_response(message);
  gui_hide_guick_raise();
  shuffle();
  blinds_and_deal();
}

function collect_cards () {
  board = new Array(6);
  for (var i = 0; i < players.length; i++) {
    players[i].carda = "";
    players[i].cardb = "";
  }
}

function new_shuffle () {
  function get_random_int (max) {
    return Math.floor(Math.random() * max);
  }
  var len = cards.length;
  for (var i = 0; i < len; ++i) {
    var j = i + get_random_int(len - i);
    var tmp = cards[i];
    cards[i] = cards[j];
    cards[j] = tmp;
  }
}

function shuffle () {
  new_shuffle();
  deck_index = 0;
}

function blinds_and_deal () {
  SMALL_BLIND = 5;
  BIG_BLIND = 10;
  var num_playing = number_of_active_players();
  if (num_playing == 3) {
    SMALL_BLIND = 10;
    BIG_BLIND = 20;
  } else if (num_playing < 3) {
    SMALL_BLIND = 25;
    BIG_BLIND = 50;
  }
  var small_blind = get_next_player_position(button_index, 1);
  the_bet_function(small_blind, SMALL_BLIND);
  write_player(small_blind, 0, 0);
  var big_blind = get_next_player_position(small_blind, 1);
  the_bet_function(big_blind, BIG_BLIND);
  write_player(big_blind, 0, 0);
  players[big_blind].status = "OPTION";
  current_bettor_index = get_next_player_position(big_blind, 1);
  deal_and_write_a();
}

function unroll_player (starting_player, player_pos, final_call) {
  var next_player = get_next_player_position(player_pos, 1);
  write_player(player_pos, 0, 0);
  if (starting_player == next_player) {
    setTimeout(final_call, 550 * global_speed);
  } else {
    setTimeout(unroll_player, 550 * global_speed,
               starting_player, next_player, final_call);
  }
}

function deal_and_write_a () {
  var current_player;
  var start_player;

  start_player = current_player = get_next_player_position(button_index, 1);
  // Deal cards to players still active
  do {
    players[current_player].carda = cards[deck_index++];
    current_player = get_next_player_position(current_player, 1);
  } while (current_player != start_player);

  // and now show the cards
  current_player = get_next_player_position(button_index, 1);
  unroll_player(current_player, current_player, deal_and_write_b);
}

// Make a small delay before starting the bets
function delay_for_main () {
  setTimeout(main, 1000);
}

function deal_and_write_b () {
  var current_player = button_index;
  for (var i = 0; i < players.length; i++) {
    current_player = get_next_player_position(current_player, 1);
    if (players[current_player].cardb) {
      break;
    }
    players[current_player].cardb = cards[deck_index++];
  }

  current_player = get_next_player_position(button_index, 1);
  unroll_player(current_player, current_player, delay_for_main);
}

function go_to_betting () {
  if (get_num_betting() > 1) {
    setTimeout(main, 1000 * global_speed);
  } else {
    setTimeout(ready_for_next_card, 1000 * global_speed);
  }
}

function unroll_table (last_pos, current_pos, final_call) {
  gui_lay_board_card(current_pos, board[current_pos]);

  if (current_pos == last_pos) {
    setTimeout(final_call, 150 * global_speed);
  } else {
    setTimeout(unroll_table, 150 * global_speed,
               last_pos, current_pos + 1, final_call);
  }
}

function deal_flop () {
  var burn = cards[deck_index++];
  burn = 'blinded';
  gui_burn_board_card(0, burn);
  var message = "<tr><td><font size=+2><b>Dealing flop</b></font>";
  gui_write_game_response(message);
  for (var i = 0; i < 3; i++) {
    board[i] = cards[deck_index++];
  }

  // Place 3 first cards
  setTimeout(unroll_table, 1000, /*last_pos*/2, /*start_pos*/0, go_to_betting);
}

function deal_fourth () {
  var burn = cards[deck_index++];
  burn = 'blinded';
  gui_burn_board_card(1, burn);
  var message = "<tr><td><font size=+2><b>Dealing turn</b></font>";
  gui_write_game_response(message);
  board[3] = cards[deck_index++];

  // Place 4th card
  setTimeout(unroll_table, 1000, /*last_pos*/3, /*start_pos*/3, go_to_betting);
}

function deal_fifth () {
  var burn = cards[deck_index++];
  burn = 'blinded';
  gui_burn_board_card(2, burn);
  var message = "<tr><td><font size=+2><b>Dealing river</b></font>";
  gui_write_game_response(message);
  board[4] = cards[deck_index++];

  // Place 5th card
  setTimeout(unroll_table, 1000, /*last_pos*/4, /*start_pos*/4, go_to_betting);
}

function main () {
  gui_hide_guick_raise();
  var increment_bettor_index = 0;
  if (players[current_bettor_index].status == "BUST" ||
      players[current_bettor_index].status == "FOLD") {
    increment_bettor_index = 1;
  } else if (!has_money(current_bettor_index)) {
    players[current_bettor_index].status = "CALL";
    increment_bettor_index = 1;
  } else if (players[current_bettor_index].status == "CALL" &&
             players[current_bettor_index].subtotal_bet == current_bet_amount) {
    increment_bettor_index = 1;
  } else {
    players[current_bettor_index].status = "";
    if (current_bettor_index == 0) {
      var call_button_text = "<u>C</u>all";
      var fold_button_text = "<u>F</u>old";
      var to_call = current_bet_amount - players[0].subtotal_bet;
      if (to_call > players[0].bankroll) {
        to_call = players[0].bankroll;
      }
      call_button_text += " $" + to_call;
      var that_is_not_the_key_you_are_looking_for;
      if (to_call == 0) {
        call_button_text = "<u>C</u>heck";
        fold_button_text = 0;
        that_is_not_the_key_you_are_looking_for = function (key) {
          if (key == 67) {         // Check
            human_call();
          } else {
            return true;           // Not my business
          }
          return false;
        };
      } else {
        that_is_not_the_key_you_are_looking_for = function (key) {
          if (key == 67) {         // Call
            human_call();
          } else if (key == 70) {  // Fold
            human_fold();
          } else {
            return true;           // Not my business
          }
          return false;
        };
      }
      // Fix the shortcut keys - structured and simple
      // Called through a key event
      var ret_function = function (key_event) {
        actual_function(key_event.keyCode, key_event);
      }

      // Called both by a key press and click on button.
      // Why? Because we want to disable the shortcut keys when done
      var actual_function = function (key, key_event) {
        if (that_is_not_the_key_you_are_looking_for(key)) {
          return;
        }
        gui_disable_shortcut_keys(ret_function);
        if (key_event != null) {
          key_event.preventDefault();
        }
      };

      // And now set up so the key click also go to 'actual_function'
      var do_fold = function () {
        actual_function(70, null);
      };
      var do_call = function () {
        actual_function(67, null);
      };
      // Trigger the shortcut keys
      gui_enable_shortcut_keys(ret_function);

      // And enable the buttons
      gui_setup_fold_call_click(fold_button_text,
                                call_button_text,
                                do_fold,
                                do_call);

      var quick_values = new Array(6);
      if (to_call < players[0].bankroll) {
        quick_values[0] = current_min_raise;
      }
      var quick_start = quick_values[0];
      if (quick_start < 20) {
        quick_start = 20;
      } else {
        quick_start = current_min_raise + 20;
      }
      var i;
      for (i = 0; i < 5; i++) {
        if (quick_start + 20 * i < players[0].bankroll) {
          quick_values[i + 1] = quick_start + 20 * i;
        }
      }
      var bet_or_raise = "Bet";
      if (to_call > 0) {
        bet_or_raise = "Raise";
      }
      var quick_bets = "<b>Quick " + bet_or_raise + "s</b><br>";
      for (i = 0; i < 6; i++) {
        if (quick_values[i]) {
          quick_bets += "<a href='javascript:parent.handle_human_bet(" +
                        quick_values[i] + ")'>" + quick_values[i] + "</a>" +
                        "&nbsp;&nbsp;&nbsp;";
        }
      }
      quick_bets += "<a href='javascript:parent.handle_human_bet(" +
                    players[0].bankroll + ")'>All In!</a>";
      var html9 = "<td><table align=center><tr><td align=center>";
      var html10 = quick_bets +
                   "</td></tr></table></td></tr></table></body></html>";
      gui_write_guick_raise(html9 + html10);

      var hi_lite_color = gui_get_theme_mode_highlite_color();
      var message = "<tr><td><font size=+2><b>Current raise: " +
                    current_bet_amount +
                    "</b><br> You need <font color=" + hi_lite_color +
                    " size=+3>" + to_call +
                    "</font> more to call.</font></td></tr>";
      gui_write_game_response(message);
      write_player(0, 1, 0);
      return;
    } else {
      write_player(current_bettor_index, 1, 0);
      setTimeout(bet_from_bot, 777 * global_speed, current_bettor_index);
      return;
    }
  }
  var can_break = true;
  for (var j = 0; j < players.length; j++) {
    var s = players[j].status;
    if (s == "OPTION") {
      can_break = false;
      break;
    }
    if (s != "BUST" && s != "FOLD") {
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
}

var global_pot_remainder = 0;

function handle_end_of_round () {
  var candidates = new Array(players.length);
  var allocations = new Array(players.length);
  var winning_hands = new Array(players.length);
  var my_total_bets_per_player = new Array(players.length);

  // Clear the ones that folded or are busted
  var i;
  var still_active_candidates = 0;
  for (i = 0; i < candidates.length; i++) {
    allocations[i] = 0;
    my_total_bets_per_player[i] = players[i].total_bet;
    if (players[i].status != "FOLD" && players[i].status != "BUST") {
      candidates[i] = players[i];
      still_active_candidates += 1;
    }
  }

  var my_total_pot_size = get_pot_size();
  var my_best_hand_name = "";
  var best_hand_players;
  var current_pot_to_split = 0;
  var pot_remainder = 0;
  if (global_pot_remainder) {
    gui_log_to_history("transferring global pot remainder " + global_pot_remainder);
    pot_remainder = global_pot_remainder;
    my_total_pot_size += global_pot_remainder;
    global_pot_remainder = 0;
  }

  while (my_total_pot_size > (pot_remainder + 0.9) && still_active_candidates) {
//    gui_log_to_history("splitting pot with pot " + my_total_pot_size +
//                       " and remainder " + pot_remainder +
//                       " on " + still_active_candidates + " candidates" );

    // The first round all who not folded or busted are candidates
    // If that/ose winner(s) cannot get all of the pot then we try
    // with the remaining players until the pot is emptied
    var winners = get_winners(candidates);
    if (!best_hand_players) {
      best_hand_players = winners;
    }
    if (!winners) {
//      gui_log_to_history("no winners");
      my_pseudo_alert("No winners for the pot ");
      pot_remainder = my_total_pot_size;
      my_total_pot_size = 0;
      break;
    }

    // Get the lowest winner bet, e.g. an all-in
    var lowest_winner_bet = my_total_pot_size * 2;
    var num_winners = 0;
    for (i = 0; i < winners.length; i++) {
      if (!winners[i]) { // Only the winners bets
        continue;
      }
      if (!my_best_hand_name) {
        my_best_hand_name = winners[i]["hand_name"];
      }
      num_winners++;
      if (my_total_bets_per_player[i] < lowest_winner_bet) {
        lowest_winner_bet = my_total_bets_per_player[i];
      }
    }

    // Compose the pot
    // If your bet was less than (a fold) or equal to the lowest winner bet:
    //    then add it to the current pot
    // If your bet was greater than lowest:
    //    then just take the 'lowest_winner_bet' to the pot

    // Take in any fraction from a previous split
//    if (pot_remainder) {
//      gui_log_to_history("increasing current pot with remainder " + pot_remainder);
//    }
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

    // Divide the pot - in even integrals
//    gui_log_to_history("Divide the pot " + current_pot_to_split +
//                       " on " + num_winners + " winner(s)");
    var share = Math.floor(current_pot_to_split / num_winners);
    // and save any remainders to next round
    pot_remainder = current_pot_to_split - share * num_winners;

//    gui_log_to_history("share " + share + " remainder " + pot_remainder);

    for (i = 0; i < winners.length; i++) {
      if (my_total_bets_per_player[i] < 0.01) {
        candidates[i] = null;           // You have got your share
      }
      if (!winners[i]) {                // You should not have any
        continue;
      }
      my_total_pot_size -= share;       // Take from the pot
      allocations[i] += share;          // and give to the winners
      winning_hands[i] = winners[i].hand_name;
    }

    // Iterate until pot size is zero - or no more candidates
    for (i = 0; i < candidates.length; i++) {
      if (candidates[i] == null) {
        continue;
      }
      still_active_candidates += 1
    }
    if (still_active_candidates == 0) {
      pot_remainder = my_total_pot_size;
//      gui_log_to_history("no more candidates, pot_remainder " + pot_remainder);
    }
    gui_log_to_history("End of iteration");
  } // End of pot distribution

  global_pot_remainder = pot_remainder;
//  gui_log_to_history("distributed; global_pot_remainder: " +
//                     global_pot_remainder +
//                     " pot_remainder: " + pot_remainder);
  pot_remainder = 0;
  var winner_text = "";
  var human_loses = 0;
  // Distribute the pot - and then do too many things
  for (i = 0; i < allocations.length; i++) {
    if (allocations[i] > 0) {
      var a_string = "" + allocations[i];
      var dot_index = a_string.indexOf(".");
      if (dot_index > 0) {
        a_string = "" + a_string + "00";
        allocations[i] = a_string.substring(0, dot_index + 3) - 0;
      }
      winner_text += winning_hands[i] + " gives " + allocations[i] +
                     " to " + players[i].name + ". ";
      players[i].bankroll += allocations[i];
      if (best_hand_players[i]) {
        // function write_player(n, hilite, show_cards)
        write_player(i, 2, 1);
      } else {
        write_player(i, 1, 1);
      }
    } else {
      if (!has_money(i) && players[i].status != "BUST") {
        players[i].status = "BUST";
        if (i == 0) {
          human_loses = 1;
        }
      }
      if (players[i].status != "FOLD") {
        write_player(i, 0, 1);
      }
    }
  }
  // Have a more liberal take on winning
  if (allocations[0] > 5) {
    HUMAN_WINS_AGAIN++;
  } else {
    HUMAN_WINS_AGAIN = 0;
  }

  var detail = "";
  for (i = 0; i < players.length; i++) {
    if (players[i].total_bet == 0 && players[i].status == "BUST") {
      continue;  // Skip busted players
    }
    detail += players[i].name + " bet " + players[i].total_bet + " & got " +
              allocations[i] + ".\\n";
  }
  detail = " (<a href='javascript:alert(\"" + detail + "\")'>details</a>)";

  var quit_text = "Restart";
  var quit_func = new_game;
  var continue_text = "Go on";
  var continue_func = new_round;

  if (players[0].status == "BUST" && !human_loses) {
    continue_text = 0;
    quit_func = function () {
      parent.STOP_AUTOPLAY = 1;
    };
    setTimeout(autoplay_new_round, 1500 + 1100 * global_speed);
  }

  var num_playing = number_of_active_players();
  if (num_playing < 2) {
    // Convoluted way of finding the active player and give him the pot
    for (i = 0; i < players.length; i++) {
      // For whosoever hath, to him shall be given
      if (has_money(i)) {
        players[i].bankroll += pot_remainder;
        pot_remainder = 0;
      }
    }
  }
  if (pot_remainder) {
    var local_text = "There is " + pot_remainder + " put into next pot\n";
    detail += local_text;
  }
  var hi_lite_color = gui_get_theme_mode_highlite_color();
  var html = "<html><body topmargin=2 bottommargin=0 bgcolor=" + BG_HILITE +
             " onload='document.f.c.focus();'><table><tr><td>" +
             get_pot_size_html() +
             "</td></tr></table><br><font size=+2 color=" + hi_lite_color +
             "><b>Winning: " +
             winner_text + "</b></font>" + detail + "<br>";
  gui_write_game_response(html);

  gui_setup_fold_call_click(quit_text,
                            continue_text,
                            quit_func,
                            continue_func);

  var elapsed_milliseconds = ((new Date()) - START_DATE);
  var elapsed_time = makeTimeString(elapsed_milliseconds);

  if (human_loses == 1) {
    var ending = NUM_ROUNDS == 1 ? "1 deal." : NUM_ROUNDS + " deals.";
    my_pseudo_alert("Sorry, you busted " + players[0].name + ".\n\n" +
                    elapsed_time + ", " + ending);
  } else {
    num_playing = number_of_active_players();
    if (num_playing < 2) {
      var end_msg = "GAME OVER!";
      var over_ending = NUM_ROUNDS == 1 ? "1 deal." : NUM_ROUNDS + " deals.";
      if (has_money(0)) {
        end_msg += "\n\nYOU WIN " + players[0].name.toUpperCase() + "!!!";
      } else {
        end_msg += "\n\nSorry, you lost.";
      }
      my_pseudo_alert(end_msg + "\n\nThis game lasted " + elapsed_time + ", " +
                      over_ending);
    }
  }
}

function autoplay_new_round () {
  if (STOP_AUTOPLAY > 0) {
    STOP_AUTOPLAY = 0;
    new_game();
  } else {
    new_round();
  }
}

function ready_for_next_card () {
  var num_betting = get_num_betting();
  var i;
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
  if (players[button_index].status == "FOLD") {
    players[get_next_player_position(button_index, -1)].status = "OPTION";
  } else {
    players[button_index].status = "OPTION";
  }
  current_bettor_index = get_next_player_position(button_index, 1);
  var show_cards = 0;
  if (num_betting < 2) {
    show_cards = 1;
  }

  if (!RUN_EM) {
    for (i = 0; i < players.length; i++) { // <-- UNROLL
      if (players[i].status != "BUST" && players[i].status != "FOLD") {
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
}

function the_bet_function (player_index, bet_amount) {
  if (players[player_index].status == "FOLD") {
    return 0;
    // FOLD ;
  } else if (bet_amount >= players[player_index].bankroll) { // ALL IN
    bet_amount = players[player_index].bankroll;

    var old_current_bet = current_bet_amount;

    if (players[player_index].subtotal_bet + bet_amount > current_bet_amount) {
      current_bet_amount = players[player_index].subtotal_bet + bet_amount;
    }

    // current_min_raise should be calculated earlier ? <--
    var new_current_min_raise = current_bet_amount - old_current_bet;
    if (new_current_min_raise > current_min_raise) {
      current_min_raise = new_current_min_raise;
    }
    players[player_index].status = "CALL";
  } else if (bet_amount + players[player_index].subtotal_bet ==
             current_bet_amount) { // CALL
    players[player_index].status = "CALL";
  } else if (current_bet_amount >
             players[player_index].subtotal_bet + bet_amount) { // 2 SMALL
    // COMMENT OUT TO FIND BUGS
    if (player_index == 0) {
      my_pseudo_alert("The current bet to match is " + current_bet_amount +
                      "\nYou must bet a total of at least " +
                      (current_bet_amount - players[player_index].subtotal_bet) +
                      " or fold.");
    }
    return 0;
  } else if (bet_amount + players[player_index].subtotal_bet >
             current_bet_amount && // RAISE 2 SMALL
             get_pot_size() > 0 &&
             bet_amount + players[player_index].subtotal_bet - current_bet_amount < current_min_raise) {
    // COMMENT OUT TO FIND BUGS
    if (player_index == 0) {
      my_pseudo_alert("Minimum raise is currently " + current_min_raise + ".");
    }
    return 0;
  } else { // RAISE
    players[player_index].status = "CALL";

    var previous_current_bet = current_bet_amount;
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
  var current_pot_size = get_pot_size();
  gui_write_basic_general(current_pot_size);
  return 1;
}

function human_call () {
  // Clear buttons
  gui_hide_fold_call_click();
  players[0].status = "CALL";
  current_bettor_index = get_next_player_position(0, 1);
  the_bet_function(0, current_bet_amount - players[0].subtotal_bet);
  write_player(0, 0, 0);
  main();
}

function handle_human_bet (bet_amount) {
  if (bet_amount < 0 || isNaN(bet_amount)) bet_amount = 0;
  var to_call = current_bet_amount - players[0].subtotal_bet;
  bet_amount += to_call;
  var is_ok_bet = the_bet_function(0, bet_amount);
  if (is_ok_bet) {
    players[0].status = "CALL";
    current_bettor_index = get_next_player_position(0, 1);
    write_player(0, 0, 0);
    main();
    gui_hide_guick_raise();
  } else {
    crash_me();
  }
}

function human_fold () {
  players[0].status = "FOLD";
  // Clear the buttons - not able to call
  gui_hide_fold_call_click();
  current_bettor_index = get_next_player_position(0, 1);
  write_player(0, 0, 0);
  var current_pot_size = get_pot_size();
  gui_write_basic_general(current_pot_size);
  main();
}

function bet_from_bot (x) {
  var b = 0;
  var n = current_bet_amount - players[x].subtotal_bet;
  if (!board[0]) b = bot_get_preflop_bet();
  else b = bot_get_postflop_bet();
  if (b >= players[x].bankroll) { // ALL IN
    players[x].status = "";
  } else if (b < n) { // BET 2 SMALL
    b = 0;
    players[x].status = "FOLD";
  } else if (b == n) { // CALL
    players[x].status = "CALL";
  } else if (b > n) {
    if (b - n < current_min_raise) { // RAISE 2 SMALL
      b = n;
      players[x].status = "CALL";
    } else {
      players[x].status = ""; // RAISE
    }
  }
  if (the_bet_function(x, b) == 0) {
    players[x].status = "FOLD";
    the_bet_function(x, 0);
  }
  write_player(current_bettor_index, 0, 0);
  current_bettor_index = get_next_player_position(current_bettor_index, 1);
  main();
}

function write_player (n, hilite, show_cards) {
  var carda = "";
  var cardb = "";
  var name_background_color = "";
  var name_font_color = "";
  if (hilite == 1) {            // Current
    name_background_color = BG_HILITE;
    name_font_color = 'black';
  } else if (hilite == 2) {       // Winner
    name_background_color = 'red';
  }
  if (players[n].status == "FOLD") {
    name_font_color = 'black';
    name_background_color = 'gray';
  }
  if (players[n].status == "BUST") {
    name_font_color = 'white';
    name_background_color = 'black';
  }
  gui_hilite_player(name_background_color, name_font_color, n);

  var show_folded = false;
  // If the human is out of the game
  if (players[0].status == "BUST" || players[0].status == "FOLD") {
    show_cards = 1;
  }
  if (players[n].carda) {
    if (players[n].status == "FOLD") {
      carda = "";
      show_folded = true;
    } else {
      carda = "blinded";
    }
    if (n == 0 || (show_cards && players[n].status != "FOLD")) {
      carda = players[n].carda;
    }
  }
  if (players[n].cardb) {
    if (players[n].status == "FOLD") {
      cardb = "";
      show_folded = true;
    } else {
      cardb = "blinded";
    }
    if (n == 0 || (show_cards && players[n].status != "FOLD")) {
      cardb = players[n].cardb;
    }
  }
  if (n == button_index) {
    gui_place_dealer_button(n);
  }
  var bet_text = "TO BE OVERWRITTEN";
  var allin = "Bet:";

  if (players[n].status == "FOLD") {
    bet_text = "FOLDED (" +
               (players[n].subtotal_bet + players[n].total_bet) + ")";
    if (n == 0) {
      HUMAN_GOES_ALL_IN = 0;
    }
  } else if (players[n].status == "BUST") {
    bet_text = "BUSTED";
    if (n == 0) {
      HUMAN_GOES_ALL_IN = 0;
    }
  } else if (!has_money(n)) {
    bet_text = "ALL IN (" +
               (players[n].subtotal_bet + players[n].total_bet) + ")";
    if (n == 0) {
      HUMAN_GOES_ALL_IN = 1;
    }
  } else {
    bet_text = allin + "$" + players[n].subtotal_bet +
               " (" + (players[n].subtotal_bet + players[n].total_bet) + ")";
  }

  gui_set_player_name(players[n].name, n);    // offset 1 on seat-index
  gui_set_bet(bet_text, n);
  gui_set_bankroll(players[n].bankroll, n);
  gui_set_player_cards(carda, cardb, n, show_folded);
}

function make_readable_rank (r) {
  if (r < 11) {
    return r;
  } else if (r == 11) {
    return "J";
  } else if (r == 12) {
    return "Q";
  } else if (r == 13) {
    return "K";
  } else if (r == 14) {
    return "A";
  }
}

function get_pot_size () {
  var p = 0;
  for (var i = 0; i < players.length; i++) {
    p += players[i].total_bet + players[i].subtotal_bet;
  }
  return p;
}

function get_pot_size_html () {
  return "<font size=+4><b>TOTAL POT: " + get_pot_size() + "</b></font>";
}

function clear_bets () {
  for (var i = 0; i < players.length; i++) {
    players[i].subtotal_bet = 0;
  }
  current_bet_amount = 0;
}

function clear_pot () {
  for (var i = 0; i < players.length; i++) {
    players[i].total_bet = 0;
  }
}

function reset_player_statuses (type) {
  for (var i = 0; i < players.length; i++) {
    if (type == 0) {
      players[i].status = "";
    } else if (type == 1 && players[i].status != "BUST") {
      players[i].status = "";
    } else if (type == 2 &&
               players[i].status != "FOLD" &&
               players[i].status != "BUST") {
      players[i].status = "";
    }
  }
}

function get_num_betting () {
  var n = 0;
  for (var i = 0; i < players.length; i++) {
    if (players[i].status != "FOLD" &&
        players[i].status != "BUST" &&
        has_money(i)) {
      n++;
    }
  }
  return n;
}

function change_name () {
  var name = prompt("What is your name?", getLocalStorage("playername"));
  if (!name) {
    return;
  }
  if (!players) {
    my_pseudo_alert("Too early to get a name");
    return;
  }
  if (name.length > 14) {
    my_pseudo_alert("Too long, I will call you Sue");
    name = "Sue";
  }
  players[0].name = name;
  write_player(0, 0, 0);
  setLocalStorage("playername", name);
}

function help_func () {
  var win = window.open('help.html', '_blank');
  win.focus();
}

function update_func () {
  var url = 'https://sourceforge.net/projects/js-css-poker/files/';
  var win = window.open(url, '_blank');
  win.focus();
}

function write_settings_frame () {
  var default_speed = 2;
  var speed_i = getLocalStorage("gamespeed");
  if (speed_i == "") {
    speed_i = default_speed;
  }
  if (speed_i == null ||
      (speed_i != 0 &&
       speed_i != 1 &&
       speed_i != 2 &&
       speed_i != 3 &&
       speed_i != 4)) {
    speed_i = default_speed;
  }
  set_speed(speed_i);
  gui_setup_option_buttons(change_name,
                           set_raw_speed,
                           help_func,
                           update_func,
                           gui_toggle_the_theme_mode);
}

function index2speed (index) {
  var speeds = ['2', '1', '.6', '.3', '0.01'];
  return speeds[index];
}

function set_speed (index) {
  global_speed = index2speed(index);
  setLocalStorage("gamespeed", index);
  gui_set_selected_speed_option(index);
}

function set_raw_speed (selector_index) {
  // check that selector_index = [1,5]
  if (selector_index < 1 || selector_index > 5) {
    my_pseudo_alert("Cannot set speed to " + selector_index);
    selector_index = 3;
  }
  var index = selector_index - 1;
  set_speed(index);
}

function get_next_player_position (i, delta) {
  var j = 0;
  var step = 1;
  if (delta < 0) step = -1;

  var loop_on = 0;
  do {
    i += step;
    if (i >= players.length) {
      i = 0;
    } else {
      if (i < 0) {
        i = players.length - 1;
      }
    }

    // Check if we can stop
    loop_on = 0;
    if (players[i].status == "BUST") loop_on = 1;
    if (players[i].status == "FOLD") loop_on = 1;
    if (++j < delta) loop_on = 1;
  } while (loop_on);

  return i;
}

function getLocalStorage (key) {
  return localStorage.getItem(key);
}

function setLocalStorage (key, value) {
  return localStorage.setItem(key, value);
}

function has_money (i) {
  if (players[i].bankroll >= 0.01) {
    return true;
  }
  return false;
}

function compRan () {
  return 0.5 - Math.random();
}

function my_local_subtime (invalue, fractionizer) {
  var quotient = 0;
  var remainder = invalue;
  if (invalue > fractionizer) {
    quotient = Math.floor(invalue / fractionizer);
    remainder = invalue - quotient * fractionizer;
  }
  return [quotient, remainder];
}

function getTimeText (string, number, text) {
  if (number == 0) return string;
  if (string.length > 0) {
    string += " ";
  }
  if (number == 1) {
    string = string + "1 " + text;
  } else {
    string = string + number + " " + text + "s";
  }
  return string;
}

function makeTimeString (milliseconds) {
  var _MS_PER_SECOND = 1000;
  var _MS_PER_MINUTE = 1000 * 60;
  var _MS_PER_HOUR = _MS_PER_MINUTE * 60;
  var _MS_PER_DAY = 1000 * 60 * 60 * 24;
  var _MS_PER_WEEK = _MS_PER_DAY * 7;
  var weeks = 0;
  var days = 0;
  var hours = 0;
  var minutes = 0;
  var seconds = 0;
  [weeks, milliseconds] = my_local_subtime(milliseconds, _MS_PER_WEEK);
  [days, milliseconds] = my_local_subtime(milliseconds, _MS_PER_DAY);
  [hours, milliseconds] = my_local_subtime(milliseconds, _MS_PER_HOUR);
  [minutes, milliseconds] = my_local_subtime(milliseconds, _MS_PER_MINUTE);
  [seconds, milliseconds] = my_local_subtime(milliseconds, _MS_PER_SECOND);

  var string = "";
  string = getTimeText(string, weeks, "week");
  string = getTimeText(string, days, "day");
  string = getTimeText(string, hours, "hour");
  string = getTimeText(string, minutes, "minute");
  string = getTimeText(string, seconds, "second");

  return (string);
}
