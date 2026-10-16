// Which dice pictures this browser shows: Genesys (the default) or Star Wars (SWRPG).
// Saved per browser, not per channel: stored messages keep /images/... paths and each viewer picks the art.
const KEY = 'diceArt';
// Files that have a Star Wars copy under /images/swrpg/ (same name); anything else keeps its one picture.
const hasSwrpg = /^\/images\/(dice\/[a-z]+-[a-z!]*|yellow|green|blue|red|purple|black|white|success|advantage|triumph|fail|threat|despair|lightside|darkside)\.png$/i;

function diceArt() {
  try {
    return window.localStorage.getItem(KEY) === 'swrpg' ? 'swrpg' : 'genesys';
  } catch (e) {
    return 'genesys';
  }
}

// Reloads so every message, chat line and character card redraws with the new art.
function setDiceArt(art) {
  try {
    window.localStorage.setItem(KEY, art);
  } catch (e) {
    return; // storage blocked: nothing to reload into
  }
  window.location.reload();
}

function artSrc(src) {
  return diceArt() === 'swrpg' && hasSwrpg.test(src) ? src.replace('/images/', '/images/swrpg/') : src;
}

module.exports = {
  diceArt: diceArt,
  setDiceArt: setDiceArt,
  artSrc: artSrc,
};
