const dice = require("./misc.js").dice;
const diceFaces = require("./Roll.js").diceFaces;

// Unmatched Fortune turns one positive die to a face that shares an edge with the rolled face.
// Luke's face map (2026-10-19): for each face (1-based, in diceFaces order) the faces next to it.
const neighbours = {
  yellow: [[2, 5, 7, 8, 11], [1, 6, 4, 9, 11], [4, 7, 8, 10, 12], [3, 6, 7, 11, 12], [1, 2, 9, 8, 10], [2, 4, 9, 10, 12],
           [1, 3, 5, 8, 10], [1, 3, 4, 7, 11], [2, 6, 5, 10, 12], [3, 5, 9, 7, 12], [1, 2, 6, 4, 8], [3, 6, 4, 9, 10]],
  green: [[3, 5, 8], [6, 7, 8], [1, 4, 5], [3, 5, 7], [1, 2, 4], [3, 8, 7], [2, 4, 6], [1, 2, 6]],
  blue: [[3, 4, 5, 6], [3, 4, 5, 6], [1, 2, 4, 5], [1, 2, 3, 6], [1, 2, 3, 6], [1, 2, 4, 5]],
};
const fortuneDice = Object.keys(neighbours);

// The face (0-based) die i of this color shows. Rolls made before faces were kept, or a face that no longer
// matches, get one of the faces with that value at random: each was equally likely to have come up.
function rolledFace(rollResults, color, i) {
  let value = rollResults[color][i], faces = rollResults.faces && rollResults.faces[color];
  if (faces && diceFaces[color][faces[i]] === value) return faces[i];
  let twins = [];
  diceFaces[color].forEach((v, f) => { if (v === value) twins.push(f); });
  return twins[dice(twins.length)-1];
}

// The faces (0-based) the die can turn to: one per different result, so twin faces show once.
function fortuneOptions(color, face) {
  let seen = {};
  return neighbours[color][face].map((n) => n-1).filter((f) => {
    if (seen[diceFaces[color][f]]) return false;
    seen[diceFaces[color][f]] = true;
    return true;
  });
}

module.exports = {
  neighbours: neighbours,
  fortuneDice: fortuneDice,
  rolledFace: rolledFace,
  fortuneOptions: fortuneOptions,
};
