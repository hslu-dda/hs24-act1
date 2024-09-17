// Global variables to store our data
let dimensionsArray, economiesArray, scoresArray, historicScoresArray, subdimensionsArray, subdimensionsLabels;
let indicatorsArray, indicatorsLabels, structureData;

let countiresData;

function preload() {
  // Load all CSV files
  dimensionsArray = loadD3CSV("data/dimensions_labels.csv");
  economiesArray = loadD3CSV("data/economies_labels.csv");
  scoresArray = loadD3CSV("data/dimensions_scores.csv");
  historicScoresArray = loadD3CSV("data/dimensions_scores_historic.csv");
  subdimensionsLabels = loadD3CSV("data/subdimensions_labels.csv");
  subdimensionsArray = loadD3CSV("data/subdimensions_scores.csv");

  // Load indicator relared files
  indicatorsArray = loadD3CSV("data/indicators_scores.csv");
  indicatorsLabels = loadD3CSV("data/indicators_labels.csv");
  structureData = loadD3CSV("data/structure.csv");
}

function setup() {
  createCanvas(200, 200);
  // Process data and create JSON
  countriesData = processData();
  console.log("countries data", countriesData);

  // Save JSON file
  noLoop();
}

function draw() {
  background(200);
}

function keyPressed() {
  if (key === "s") {
    console.log("save");

    saveJSON(countriesData, "compiled_data.json");
  }
}

function processData() {
  const countries = [];

  // Create country objects
  economiesArray.forEach((economy) => {
    let country = {
      key: economy.key,
      label: economy.label,
      dimensions: [],
    };

    // Add dimensions to each country
    dimensionsArray.forEach((dimension) => {
      let dim = {
        key: dimension.key,
        label: dimension.label,
        scores: {},
        subdimensions: [],
      };
      country.dimensions.push(dim);
    });

    countries.push(country);
  });

  // Combine scoresArray and historicScoresArray
  const allScores = scoresArray.concat(historicScoresArray);

  // Add scores to countries
  allScores.forEach((score) => {
    const country = countries.find((c) => c.key === score.economy);
    const dimension = country.dimensions.find((d) => d.key === score.key);
    dimension.scores[score.year] = parseFloat(score.score);
  });

  // Create a map of subdimensions to their indicators
  const subdimensionIndicators = {};
  structureData.forEach((item) => {
    // If this subdimension doesn't exist in our map yet, create an empty array for it
    if (!subdimensionIndicators[item.subdimension]) {
      subdimensionIndicators[item.subdimension] = [];
    }
    // Add the indicator to this subdimension's array
    subdimensionIndicators[item.subdimension].push(item.indicator);
  });

  // Add subdimensions to countries
  subdimensionsArray.forEach((subdim) => {
    const country = countries.find((c) => c.key === subdim.economy);
    const dimension = country.dimensions.find((d) => subdim.key.startsWith(d.key));

    const subdimKey = subdim.key;
    let subdimension = {
      key: subdimKey,
      label: subdimensionsLabels.find((sl) => sl.key === subdimKey)?.label || "",
      score: parseFloat(subdim.score),
      indicators: [],
    };
    dimension.subdimensions.push(subdimension);

    const indicators = subdimensionIndicators[subdimKey] || [];
    indicators.forEach((indicatorKey) => {
      const indicator = indicatorsArray.find((i) => i.key === indicatorKey && i.economy === subdim.economy);
      if (indicator) {
        subdimension.indicators.push({
          key: indicatorKey,
          score: parseFloat(indicator.score),
          economy: indicator.economy,
          label: indicatorsLabels.find((il) => il.key === indicator.key)?.label || "",
        });
      }
    });
  });

  /*
  // Add subdimensions to countries
  subdimensionsArray.forEach((subdim) => {
    const country = countries.find((c) => c.key === subdim.economy);
    const dimension = country.dimensions.find((d) => subdim.key.startsWith(d.key));
  let subdimension = {
      key: subdimKey,
      label: subdimensionsLabels.find((sl) => sl.key === subdimKey)?.label || "",
      score: parseFloat(subdim.score),
      indicators: [],
    };
    dimension.subdimensions.push(subdimension);
  });*/

  return countries;
}
