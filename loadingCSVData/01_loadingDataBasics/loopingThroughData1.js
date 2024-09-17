let economiesArray, dimensionsArray, scoresArray;

function preload() {
  economiesArray = loadD3CSV("data/economies_labels.csv");
  dimensionsArray = loadD3CSV("data/dimensions_labels.csv");
  scoresArray = loadD3CSV("data/dimensions_scores.csv");
}

function setup() {
  createCanvas(2000, 2000);
  console.log("Loaded data:", { economiesArray, dimensionsArray, scoresArray });
  noLoop();
}

function draw() {
  background(220);
  textSize(12);
  let y = 20;

  economiesArray.forEach((economy) => {
    text(`Country: ${economy.label}`, 10, y);
    y += 20;

    dimensionsArray.forEach((dimension) => {
      let score = scoresArray.find((s) => s.economy == economy.key && s.key == dimension.key && s.year == "2024");
      console.log(score);
      if (score) {
        text(`  ${dimension.label}: ${score.score}`, 20, y);
        y += 20;
      }
    });

    y += 20; // Add space between countries
  });
}
