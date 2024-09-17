let economiesArray, dimensionsArray, scoresArray;

function preload() {
  economiesArray = loadD3CSV("data/economies_labels.csv");
  dimensionsArray = loadD3CSV("data/dimensions_labels.csv");
  scoresArray = loadD3CSV("data/dimensions_scores.csv");
}
function setup() {
  createCanvas(400, 1000);
  console.log("setup", economiesArray, dimensionsArray, scoresArray);
}
function draw() {
  background(220);
  let y = 50;
  economiesArray.forEach((economy) => {
    text(economy.label, 20, y);
    y += 20;
    dimensionsArray.forEach((dimension) => {
      let scoreItem = scoresArray.find((s) => s.economy == economy.key && s.key == dimension.key);
      text(dimension.label + " " + scoreItem.score, 100, y);
      y += 20;
    });
  });
}
