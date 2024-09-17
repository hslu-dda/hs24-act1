let economiesArray, dimensionsArray, scoresArray, historicScoresArray, subdimensionsArray, subdimensionsLabels;
let indicatorsArray, indicatorsLables, structureData;

let countriesData;

function preload() {
  economiesArray = loadD3CSV("data/economies_labels.csv");
  dimensionsArray = loadD3CSV("data/dimensions_labels.csv");
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
  createCanvas(400, 1000);
  console.log("setup", economiesArray, dimensionsArray, scoresArray);
  countriesData = processData();
  console.log("contriesData", countriesData);
  noLoop();
}

function keyPressed() {
  if (key == "s") {
    saveJSON(countriesData, "compiled_data.json");
  }
}

function processData() {
  let countries = [];
  economiesArray.forEach((economy) => {
    let country = {
      key: economy.key,
      label: economy.label,
      dimensions: [],
    };
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

  const allScores = scoresArray.concat(historicScoresArray);

  allScores.forEach((score) => {
    const country = countries.find((c) => c.key == score.economy);
    const dimension = country.dimensions.find((d) => d.key == score.key);
    dimension.scores[score.year] = parseFloat(score.score);
  });

  const subdimensionIndicators = {};
  structureData.forEach((item) => {
    if (!subdimensionIndicators[item.subdimension]) {
      subdimensionIndicators[item.subdimension] = [];
    }
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

  return countries;
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
