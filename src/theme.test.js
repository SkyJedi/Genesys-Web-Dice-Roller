import { THEMES, theme, setTheme, applyTheme } from './functions/theme';

it('defaults to the white theme and remembers a pick', () => {
  window.localStorage.clear();
  expect(theme()).toBe('light');
  setTheme('dark');
  expect(theme()).toBe('dark');
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
});

it('falls back to white for an unknown theme', () => {
  expect(applyTheme('nope')).toBe('light');
  window.localStorage.setItem('diceTheme', 'nope');
  expect(theme()).toBe('light');
});

it('offers two basic themes and five colour themes', () => {
  expect(THEMES.filter((t) => t[2] === 'Basic').length).toBe(2);
  expect(THEMES.filter((t) => t[2] === 'Colour themes').map((t) => t[0])).toEqual(['coruscant', 'tatooine', 'endor', 'mustafar', 'hoth']);
});
