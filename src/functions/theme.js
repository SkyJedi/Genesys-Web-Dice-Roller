// Which colour theme this browser shows. Saved per browser; the colours live in index.css under [data-theme="..."].
const KEY = 'diceTheme';
// [id, label, group]; the toolbar dropdown shows the groups Basic and Colour themes.
const THEMES = [
  ['light', 'Light', 'Basic'], ['dark', 'Dark', 'Basic'],
  ['coruscant', 'Coruscant (navy)', 'Colour themes'], ['tatooine', 'Tatooine (sand)', 'Colour themes'],
  ['endor', 'Endor (forest)', 'Colour themes'], ['mustafar', 'Mustafar (ember)', 'Colour themes'],
  ['hoth', 'Hoth (ice)', 'Colour themes'],
];
const BAR = {light: '#ffffff', dark: '#181b21', coruscant: '#151d33', tatooine: '#fff6e4', endor: '#f7fbf3', mustafar: '#26150f', hoth: '#ffffff'};

function theme() {
  try {
    const t = window.localStorage.getItem(KEY);
    return THEMES.some((x) => x[0] === t) ? t : 'light';
  } catch (e) {
    return 'light';
  }
}

// Switches at once, no reload; the page colours are all CSS variables.
function applyTheme(t) {
  if (!THEMES.some((x) => x[0] === t)) t = 'light';
  document.documentElement.setAttribute('data-theme', t);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', BAR[t]);
  return t;
}

function setTheme(t) {
  t = applyTheme(t);
  try {
    window.localStorage.setItem(KEY, t);
  } catch (e) {
    // storage blocked: the theme still applies until the page closes
  }
}

module.exports = {
  THEMES: THEMES,
  theme: theme,
  setTheme: setTheme,
  applyTheme: applyTheme,
};
