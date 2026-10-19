import { neighbours, rolledFace, fortuneOptions } from './functions/fortuneFaces';
import { diceFaces, rollDicePool } from './functions/Roll';

// Luke's neighbour values per face (2026-10-19), his 'r' written as the site's '!s'.
const lukeValues = {
  yellow: [['s', 'ss', 'sa', 'sa', 'aa'], ['', 'a', 'ss', 'sa', 'aa'], ['ss', 'sa', 'sa', 'aa', '!s'], ['s', 'a', 'sa', 'aa', '!s'],
           ['', 's', 'sa', 'sa', 'aa'], ['s', 'ss', 'sa', 'aa', '!s'], ['', 's', 'ss', 'sa', 'aa'], ['', 's', 'ss', 'sa', 'aa'],
           ['s', 'a', 'ss', 'aa', '!s'], ['s', 'ss', 'sa', 'sa', '!s'], ['', 's', 'a', 'ss', 'sa'], ['s', 'a', 'ss', 'sa', 'aa']],
  green: [['s', 'a', 'aa'], ['a', 'sa', 'aa'], ['', 'a', 'ss'], ['s', 'a', 'sa'], ['', 's', 'ss'], ['s', 'sa', 'aa'], ['s', 'a', 'ss'], ['', 's', 'a']],
  blue: [['s', 'sa', 'aa', 'a'], ['s', 'sa', 'aa', 'a'], ['', '', 'sa', 'aa'], ['', '', 's', 'a'], ['', '', 's', 'a'], ['', '', 'sa', 'aa']],
};

it('every face lists the neighbours on Luke\'s map, never itself', () => {
  Object.keys(lukeValues).forEach((color) => {
    expect(neighbours[color].length).toBe(diceFaces[color].length);
    neighbours[color].forEach((list, f) => {
      expect(list).not.toContain(f + 1);
      expect(list.map((n) => diceFaces[color][n-1]).sort()).toEqual(lukeValues[color][f].slice().sort());
    });
  });
});

it('offers each different neighbouring result once', () => {
  expect(fortuneOptions('blue', 2).map((f) => diceFaces.blue[f])).toEqual(['', 'sa', 'aa']);
  expect(fortuneOptions('yellow', 2).map((f) => diceFaces.yellow[f]).sort()).toEqual(['!s', 'aa', 'sa', 'ss']);
});

it('a roll keeps which face came up, and twin faces keep their own neighbours', () => {
  const roll = rollDicePool({yellow: 20, success: 1});
  expect(roll.faces.yellow.length).toBe(20);
  roll.yellow.forEach((value, i) => expect(diceFaces.yellow[roll.faces.yellow[i]]).toBe(value));
  expect(roll.faces.success).toBeUndefined();

  const twin2 = {yellow: ['s'], faces: {yellow: [1]}}, twin3 = {yellow: ['s'], faces: {yellow: [2]}};
  expect(rolledFace(twin2, 'yellow', 0)).toBe(1);
  expect(rolledFace(twin3, 'yellow', 0)).toBe(2);
  const old = rolledFace({yellow: ['s']}, 'yellow', 0);
  expect([1, 2]).toContain(old);
});
