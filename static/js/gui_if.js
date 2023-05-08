'use strict';
function internal_get_a_class_named(curr, searched_name) {
  if (!curr) {
    gui_log_to_history('internal_get_a_class_named, no curr for ' +
                       searched_name);
  }
  let notes = null;
  for (let i = 0; i < curr.childNodes.length; i++) {
    if (curr.childNodes[i].className === searched_name) {
      notes = curr.childNodes[i];
      break;
    }
  }
  return notes;
}

function internal_FixTheRanking(rank) {
  let ret_rank = 'NoRank';
  if (rank === 14) {
    ret_rank = 'ace';
  } else if (rank === 13) {
    ret_rank = 'king';
  } else if (rank === 12) {
    ret_rank = 'queen';
  } else if (rank === 11) {
    ret_rank = 'jack';
  } else if (rank > 0 && rank < 11) {
    ret_rank = rank;
  } else {
    console.log(typeof rank);
    alert('Unknown rank ' + rank);
  }
  return ret_rank;
}

function internal_FixTheSuiting(suit) {
  if (suit === 'c') {
    suit = 'clubs';
  } else if (suit === 'd') {
    suit = 'diamonds';
  } else if (suit === 'h') {
    suit = 'hearts';
  } else if (suit === 's') {
    suit = 'spades';
  } else {
    alert('Unknown suit ' + suit);
    suit = 'yourself';
  }
  return suit;
}

function internal_GetCardImageUrl(card) {
  let suit = card.substring(0, 1);
  let rank = parseInt(card.substring(1));
  rank = internal_FixTheRanking(rank);
  suit = internal_FixTheSuiting(suit);
  return 'url(\'static/images/' + rank + '_of_' + suit + '.png\')';
}

function internal_setBackground(diva, image, opacity) {
  const komage = diva.style;
  komage.opacity = opacity;
  komage['background-image'] = image;
}

function internal_setCard(diva, card, folded) {
  let image = 'url(\'static/images/cardback.png\')';
  let opacity = 1.0;
  if (typeof card === 'undefined') {
    alert('Undefined card ' + card);
    opacity = 0.0;
  } else if (card === '') {
    opacity = 0.0;
  } else if (card === 'blinded') {
  } else {
    if (folded) {
      opacity = 0.5;
    }
    image = internal_GetCardImageUrl(card);
  }
  internal_setBackground(diva, image, opacity);
}

function internal_clickin_helper(button, button_text, func_on_click) {
  if (button_text === 0) {
    button.style.visibility = 'hidden';
  } else {
    button.style.visibility = 'visible';
    button.innerHTML = button_text;
    button.onclick = func_on_click;
  }
}

function gui_hide_poker_table() {
  const table = document.getElementById('poker_table');
  table.style.visibility = 'hidden';
}

function gui_show_poker_table() {
  const table = document.getElementById('poker_table');
  table.style.visibility = 'visible';
}

function gui_set_player_name(name, seat) {
  const table = document.getElementById('poker_table');
  const current = 'seat' + seat;
  const seatloc = table.children[current];
  const chipsdiv = internal_get_a_class_named(seatloc, 'name-chips');
  const namediv = internal_get_a_class_named(chipsdiv, 'player-name');
  if (name === '') {
    seatloc.style.visibility = 'hidden';
  } else {
    seatloc.style.visibility = 'visible';
  }
  namediv.textContent = name;
}

function gui_hilite_player(hilite_color, name_color, seat) {
  const table = document.getElementById('poker_table');
  const current = 'seat' + seat;
  const seatloc = table.children[current];
  const chipsdiv = internal_get_a_class_named(seatloc, 'name-chips');
  const namediv = internal_get_a_class_named(chipsdiv, 'player-name');
  if (name_color === '') {
    namediv.style.color = chipsdiv.style.color;
  } else {
    namediv.style.color = name_color;
  }
  if (hilite_color === '') {
    namediv.style.backgroundColor = chipsdiv.style.backgroundColor;
  } else {
    namediv.style.backgroundColor = hilite_color;
  }
}

function gui_set_bankroll(amount, seat) {
  const table = document.getElementById('poker_table');
  const current = 'seat' + seat;
  const seatloc = table.children[current];
  const chipsdiv = internal_get_a_class_named(seatloc, 'name-chips');
  const namediv = internal_get_a_class_named(chipsdiv, 'chips');
  if (!isNaN(amount) && amount != '') {
    amount = '$' + amount;
  }
  namediv.textContent = amount;
}

function gui_set_bet(bet, seat) {
  const table = document.getElementById('poker_table');
  const current = 'seat' + seat;
  const seatloc = table.children[current];
  const betdiv = internal_get_a_class_named(seatloc, 'bet');

  betdiv.textContent = bet;
}

function gui_set_player_cards(card_a, card_b, seat, folded) {
  const table = document.getElementById('poker_table');
  const current = 'seat' + seat;
  const seatloc = table.children[current];
  const cardsdiv = internal_get_a_class_named(seatloc, 'holecards');
  const card1 = internal_get_a_class_named(cardsdiv, 'card holecard1');
  const card2 = internal_get_a_class_named(cardsdiv, 'card holecard2');

  internal_setCard(card1, card_a, folded);
  internal_setCard(card2, card_b, folded);
}

function gui_lay_board_card(n, the_card) {
  let current = '';

  if (n === 0) {
    current = 'flop1';
  } else if (n === 1) {
    current = 'flop2';
  } else if (n === 2) {
    current = 'flop3';
  } else if (n === 3) {
    current = 'turn';
  } else if (n === 4) {
    current = 'river';
  }

  const table = document.getElementById('poker_table');
  const seatloc = table.children.board;

  const cardsdiv = seatloc.children[current];
  internal_setCard(cardsdiv, the_card);
}

function gui_burn_board_card(n, the_card) {
  let current = '';

  if (n === 0) {
    current = 'burn1';
  } else if (n === 1) {
    current = 'burn2';
  } else if (n === 2) {
    current = 'burn3';
  }

  const table = document.getElementById('poker_table');
  const seatloc = table.children.board;

  const cardsdiv = seatloc.children[current];
  internal_setCard(cardsdiv, the_card);
}

function gui_write_basic_general(pot_size) {
  const table = document.getElementById('poker_table');
  const pot_div = table.children.pot;
  const total_div = pot_div.children['total-pot'];

  const the_pot = 'Total pot: ' + pot_size;
  total_div.innerHTML = the_pot;
}

function gui_write_basic_general_text(text) {
  const table = document.getElementById('poker_table');
  const pot_div = table.children.pot;
  const total_div = pot_div.children['total-pot'];
  total_div.style.visibility = 'visible';
  total_div.innerHTML = text;
}

const log_text = [];
let log_index = 0;

function gui_log_to_history(text_to_write) {
  for (var idx = log_index; idx > 0; --idx) {
    log_text[idx] = log_text[idx - 1];
  }

  log_text[0] = text_to_write;
  if (log_index < 40) {
    log_index = log_index + 1;
  }
  let text_to_output = '<br><b>' + log_text[0] + '</b>';
  for (idx = 1; idx < log_index; ++idx) {
    text_to_output += '<br>' + log_text[idx];
  }
  const history = document.getElementById('history');
  history.innerHTML = text_to_output;
}

function gui_hide_log_window() {
  const history = document.getElementById('history');
  history.style.display = 'none';
}

function gui_place_dealer_button(seat) {
  const table_seat = seat;
  const button = document.getElementById('button');
  if (seat < 0) {
    button.style.visibility = 'hidden';
  } else {
    button.style.visibility = 'visible';
  }
  button.className = 'seat' + table_seat + '-button';
}

function gui_hide_dealer_button() {
  gui_place_dealer_button(-3);
}

function gui_hide_fold_call_click() {
  const buttons = document.getElementById('action-options');
  const fold = buttons.children['fold-button'];
  internal_clickin_helper(fold, 0, 0);

  const call = buttons.children['call-button'];
  internal_clickin_helper(call, 0, 0);
  gui_disable_shortcut_keys();
}

function gui_setup_fold_call_click(show_fold, call_text,
    fold_func, call_func, key_ev) {
  const buttons = document.getElementById('action-options');
  const fold = buttons.children['fold-button'];
  internal_clickin_helper(fold, show_fold, fold_func);

  const call = buttons.children['call-button'];
  internal_clickin_helper(call, call_text, call_func);
}

function curry_in_speedfunction(speed_func) {
  const call_back = speed_func;

  const ret_func = function() {
    const buttons = document.getElementById('setup-options');
    const speed = buttons.children['speed-button'];
    const selector = speed.children['speed-selector'];
    const qqq = selector.children['speed-options'];
    const index = qqq.value;
    const value = qqq[index].text;

    call_back(value);
  };
  return ret_func;
}

function gui_set_selected_speed_option(index) {
  const buttons = document.getElementById('setup-options');
  const speed = buttons.children['speed-button'];
  const selector = speed.children['speed-selector'];
  const qqq = selector.children['speed-options'];
  qqq.value = index;
}

function internal_le_button(buttons, button_name, button_func) {
  const le_button = buttons.children[button_name];
  le_button.style.visibility = 'visible';
  le_button.onclick = button_func;
}

function gui_setup_option_buttons(name_func,
    speed_func,
    help_func,
    check_func,
    mode_func) {
  const buttons = document.getElementById('setup-options');

  internal_le_button(buttons, 'name-button', name_func);

  const speed = buttons.children['speed-button'];
  speed.style.visibility = 'visible';
  speed.onchange = curry_in_speedfunction(speed_func);

  internal_le_button(buttons, 'mode-button', mode_func);
  internal_le_button(buttons, 'help-button', help_func);
  internal_le_button(buttons, 'check-button', check_func);
}

function internal_hide_le_button(buttons, button_name, button_func) {
  const le_button = buttons.children[button_name];
  le_button.style.visibility = 'hidden';
}

function gui_hide_setup_option_buttons(name_func,
    speed_func,
    help_func,
    check_func) {
  const buttons = document.getElementById('setup-options');

  internal_hide_le_button(buttons, 'name-button');
  internal_hide_le_button(buttons, 'speed-button');
  internal_hide_le_button(buttons, 'mode-button');
  internal_hide_le_button(buttons, 'help-button');
  internal_hide_le_button(buttons, 'check-button');
}

function gui_hide_game_response() {
  const response = document.getElementById('game-response');
  response.style.visibility = 'hidden';
}

function gui_show_game_response() {
  const response = document.getElementById('game-response');
  response.style.visibility = 'visible';
}

function gui_write_game_response(text) {
  const response = document.getElementById('game-response');
  response.innerHTML = text;
}

function gui_set_game_response_font_color(color) {
  const response = document.getElementById('game-response');
  response.style.color = color;
}

function gui_write_guick_raise(text) {
  const response = document.getElementById('quick-raises');
  if (text === '') {
    response.style.visibility = 'hidden';
  } else {
    response.style.visibility = 'visible';
    response.innerHTML = text;
  }
}

function gui_hide_guick_raise() {
  gui_write_guick_raise('');
}

function gui_write_modal_box(text) {
  const modal = document.getElementById('modal-box');
  if (text === '') {
    modal.style.display = 'none';
  } else {
    modal.innerHTML = text;
    modal.style.display = 'block';
    modal.style.opacity = '0.90';
  }
}

function gui_initialize_css() {
  let image;
  let item;
  item = document.getElementById('poker_table');
  image = 'url(\'static/images/poker_table.png\')';
  internal_setBackground(item, image, 1.0);
}

function gui_enable_shortcut_keys(func) {
  document.addEventListener('keydown', func);
}

function gui_disable_shortcut_keys(func) {
  document.removeEventListener('keydown', func);
}

function internal_get_theme_mode() {
  let mode = getLocalStorage('currentmode');
  if (mode === null) { // first time
    mode = 'light';
  }
  return mode;
}

function internal_set_theme_mode(mode) {
  setLocalStorage('currentmode', mode);
}

function gui_set_production_code_font_color(color) {
  const response = document.getElementById('production-code');
  response.style.color = color;
}

function internal_get_into_the_mode(mode) {
  const buttons = document.getElementById('setup-options');
  const mode_button = buttons.children['mode-button'];

  let color;
  let button_text;
  if (mode == 'dark') {
    color = 'DimGray';
    button_text = 'Darker';
  } else if (mode == 'darker') {
    color = '#393939';
    button_text = 'High contrast';
  } else if (mode == 'night') {
    color = '#090909';
    button_text = 'Light mode';
    gui_set_game_response_font_color('white');
    gui_set_production_code_font_color('white');
  } else {
    color = 'White';
    button_text = 'Dark mode';
    gui_set_game_response_font_color('black');
    gui_set_production_code_font_color('black');
  }
  document.body.style.backgroundColor = color;
  mode_button.innerHTML = button_text;
}

function gui_initialize_theme_mode() {
  const mode = internal_get_theme_mode();
  internal_get_into_the_mode(mode);
  internal_set_theme_mode(mode);
}

function gui_toggle_the_theme_mode() {
  let mode = internal_get_theme_mode();
  if (mode == 'dark') {
    mode = 'darker';
  } else if (mode == 'darker') {
    mode = 'night';
  } else if (mode == 'night') {
    mode = 'light';
  } else {
    mode = 'dark';
  }
  internal_get_into_the_mode(mode);
  internal_set_theme_mode(mode);
}

function gui_get_theme_mode_highlite_color() {
  const mode = internal_get_theme_mode();
  let color = 'yellow';
  if (mode == 'light') {
    color = 'red';
  }
  return color;
}
