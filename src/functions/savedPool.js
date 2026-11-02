// A dice pool saved on a character: {colour: how many}. Built from a stored roll message, applied to the Dice panel.
export const POOL_COLORS = ['yellow', 'green', 'blue', 'red', 'purple', 'black', 'white', 'polyhedral', 'success', 'advantage', 'triumph', 'fail', 'threat', 'despair', 'lightside', 'darkside'];
export const SYMBOL_COLORS = ['success', 'advantage', 'triumph', 'fail', 'threat', 'despair', 'lightside', 'darkside'];

// What a stored roll was made of. Anything that isn't a die list (text, caption, rolledSymbols, faces) is skipped.
export function poolOf(message) {
  const pool = {};
  POOL_COLORS.forEach((color) => {
    const dice = message && message[color];
    if (Array.isArray(dice) && dice.length > 0) pool[color] = Math.min(dice.length, 99);
  });
  return pool;
}

// A pool read back from the database: known colours only, whole numbers from 1 to 99.
export function cleanPool(pool) {
  const clean = {};
  POOL_COLORS.forEach((color) => {
    const n = pool && Math.floor(+pool[color]);
    if (n > 0) clean[color] = Math.min(n, 99);
  });
  return clean;
}

export function poolText(pool) {
  return POOL_COLORS.filter((color) => pool[color] > 0).map((color) => pool[color] + ' ' + color).join(', ');
}

export const SET_POOL_EVENT = 'dice-set-pool';
export function applyPool(pool) {
  window.dispatchEvent(new CustomEvent(SET_POOL_EVENT, {detail: cleanPool(pool)}));
}

// The character the party panel is showing, so the roll log knows where "save pool" goes.
let current = null;
export function setCurrentCharacter(character) { current = character && character.key ? {key: character.key, name: character.name} : null; }
export function getCurrentCharacter() { return current; }
