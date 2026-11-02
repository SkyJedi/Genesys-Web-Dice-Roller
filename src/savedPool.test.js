import { poolOf, cleanPool, poolText, applyPool, SET_POOL_EVENT, setCurrentCharacter, getCurrentCharacter } from './functions/savedPool';

it('reads the pool out of a stored roll, skipping text, caption, symbols and faces', () => {
  const message = {text: '<span>x</span>', caption: 'Shoot', rolledSymbols: {s: 1}, faces: {yellow: [1, 2]}, yellow: ['s', 'a'], green: ['s'], red: ['f', 'f', 'f']};
  expect(poolOf(message)).toEqual({yellow: 2, green: 1, red: 3});
});

it('cleans a pool from the database: known colours, whole numbers 1 to 99', () => {
  expect(cleanPool({yellow: '2', green: -1, nope: 4, red: 500, blue: 1.9})).toEqual({yellow: 2, red: 99, blue: 1});
  expect(cleanPool(undefined)).toEqual({});
});

it('describes a pool in words', () => {
  expect(poolText({green: 1, yellow: 2})).toBe('2 yellow, 1 green');
});

it('tells the dice panel to fill its pool, and does not roll', () => {
  const seen = [];
  const listener = (e) => seen.push(e.detail);
  window.addEventListener(SET_POOL_EVENT, listener);
  applyPool({yellow: 2, bad: 3});
  window.removeEventListener(SET_POOL_EVENT, listener);
  expect(seen).toEqual([{yellow: 2}]);
});

it('remembers the shown character, and none when there is no key', () => {
  setCurrentCharacter({key: 'abc', name: 'Han'});
  expect(getCurrentCharacter()).toEqual({key: 'abc', name: 'Han'});
  setCurrentCharacter({name: 'No Characters'});
  expect(getCurrentCharacter()).toBe(null);
});
