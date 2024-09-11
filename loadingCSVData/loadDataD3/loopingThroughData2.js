let economiesArray, dimensionsArray, scoresArray, subdimensionsArray;

function preload() {
  economiesArray = loadD3CSV("data/economies_labels.csv");
  dimensionsArray = loadD3CSV("data/dimensions_labels.csv");
  scoresArray = loadD3CSV("data/dimensions_scores.csv");
  subdimensionsArray = loadD3CSV("data/subdimensions_scores.csv");
}

function setup() {
  createCanvas(1000, 600);
  console.log("Loaded data:", {
    economiesArray,
    dimensionsArray,
    scoresArray,
    subdimensionsArray,
  });
  noLoop();
}

function draw() {
  background(220);
  textSize(12);
  let y = 20;
  let cellWidth = 150;
  let cellHeight = 100;

  // Display header
  dimensionsArray.forEach((dimension, index) => {
    text(dimension.label, 150 + index * cellWidth, y);
  });
  y += 30;

  economiesArray.slice(0, 5).forEach((economy) => {
    text(economy.label, 10, y + cellHeight / 2);

    dimensionsArray.forEach((dimension, dimIndex) => {
      let x = 150 + dimIndex * cellWidth;

      // Draw main dimension score
      let mainScore = scoresArray.find(
        (s) =>
          s.economy === economy.key &&
          s.key === dimension.key &&
          s.year === "2024"
      );
      if (mainScore) {
        let scoreHeight = map(parseFloat(mainScore.score), 0, 5, 0, cellHeight);
        fill(0, 0, 255, 100);
        rect(x, y + cellHeight - scoreHeight, 50, scoreHeight);
      }

      // Draw subdimension scores
      let subdimensions = subdimensionsArray.filter(
        (s) =>
          s.economy === economy.key && s.key.startsWith(dimension.key + "_")
      );
      subdimensions.forEach((subdim, subIndex) => {
        let subScoreHeight = map(parseFloat(subdim.score), 0, 5, 0, cellHeight);
        fill(255, 0, 0, 100);
        rect(
          x + 60 + subIndex * 20,
          y + cellHeight - subScoreHeight,
          15,
          subScoreHeight
        );
      });
    });

    y += cellHeight + 20; // Add space between countries
  });
}
