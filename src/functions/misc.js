import seedrandom from 'seedrandom';
var rng = seedrandom('added entropy.', { entropy: true });

function cryptoDice(sides) {
  return Math.floor(rng() * sides) + 1;
}

export { cryptoDice as dice };
