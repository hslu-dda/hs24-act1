let countriesData = [];
let dimensionsTable, economiesTable, scoresTable, historicScoresTable;

function preload() {
  // Load CSV files
  dimensionsTable = loadTable("data/dimensions_labels.csv", "csv", "header");
  economiesTable = loadTable("data/economies_labels.csv", "csv", "header");
  scoresTable = loadTable("data/dimensions_scores.csv", "csv", "header");
  historicScoresTable = loadTable(
    "data/dimensions_scores_historic.csv",
    "csv",
    "header"
  );
}

function setup() {
  createCanvas(1000, 1000);
  compileData();
  console.log(countriesData);
}

function compileData() {
  // Create an object for each country
  for (let row of economiesTable.rows) {
    let countryCode = row.get("key");
    let countryName = row.get("label");

    let countryData = {
      countryCode: countryCode,
      country: countryName,
      dimensions: [],
    };

    // Add dimensions and scores for this country
    for (let dimRow of dimensionsTable.rows) {
      let dimensionCode = dimRow.get("key");
      let dimensionName = dimRow.get("label");

      let dimensionData = {
        dimensionCode: dimensionCode,
        dimensonName: dimensionName,
        scores: {},
      };

      // Find scores for this country and dimension
      for (let scoreRow of scoresTable.rows) {
        if (
          scoreRow.get("economy") === countryCode &&
          scoreRow.get("key") === dimensionCode
        ) {
          dimensionData.scores[scoreRow.get("year")] = parseFloat(
            scoreRow.get("score")
          );
        }
      }

      // Find historic scores for this country and dimension
      for (let histScoreRow of historicScoresTable.rows) {
        if (
          histScoreRow.get("economy") === countryCode &&
          histScoreRow.get("key") === dimensionCode
        ) {
          dimensionData.scores[histScoreRow.get("year")] = parseFloat(
            histScoreRow.get("score")
          );
        }
      }

      countryData.dimensions.push(dimensionData);
    }

    countriesData.push(countryData);
  }
}

function draw() {
  background(220);
  textAlign(LEFT, CENTER);
  textSize(12);

  let y = 20;
  for (let country of countriesData) {
    if (country.countryCode !== "WB6_AVG") {
      // Exclude the average
      text(country.country, 10, y);
      let x = 150;
      for (let dimension of country.dimensions) {
        let score2024 = dimension.scores["2024"] || 0;
        fill(0);
        text(score2024.toFixed(2), x, y);
        x += 60;
      }
      y += 20;
    }
  }
}
