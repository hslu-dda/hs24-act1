// DATA
let countriesData = [];
let sortedCountries;
let sortedByMean;
let dimensionsArray, economiesArray, scoresArray, historicScoresArray, subdimensionsArray, subdimensionsLabels;

// Design constants
let DESIGN = {
  // page border
  windowLeftBorder: 150,
  windowRightBorder: 150,

  topBorder: 80,
  bottomBorder: 50,

  // cell design
  cellHeight: 100,
  cellPadding: 10,
  cellWidth: 50,
  debugView: true,
  showSubdimensions: true,
};

function getAbsoluteCoordinates(x, y) {
  let pos = createVector(x, y);
  return screenPosition(pos);
}

function screenPosition(point) {
  let m = drawingContext.getTransform();
  let tx = m.a * point.x + m.c * point.y + m.e;
  let ty = m.b * point.x + m.d * point.y + m.f;
  return createVector(tx / pixelDensity(), ty / pixelDensity());
}

function preload() {
  dimensionsArray = loadD3CSV("data/dimensions_labels.csv");
  economiesArray = loadD3CSV("data/economies_labels.csv");
  scoresArray = loadD3CSV("data/dimensions_scores.csv");
  historicScoresArray = loadD3CSV("data/dimensions_scores_historic.csv");
  subdimensionsLabels = loadD3CSV("data/subdimensions_labels.csv");
  subdimensionsArray = loadD3CSV("data/subdimensions_scores.csv");
}

function setup() {
  createCanvas(windowWidth, 2000);
  console.log("dimensions", dimensionsArray);
  console.log("scoresArray", scoresArray);

  // Looping through economies
  countriesData = processData(); //

  console.log("countries data", countriesData);

  sortedCountries = sortCountriesByDimension(countriesData, "INVESTMENT", 2024);

  sortedByMean2018 = sortCountriesByMeanDimensions(countriesData, ["TRADE", "INVESTMENT", "FINANCE"], 2018);

  sortedByMean2024 = sortCountriesByMeanDimensions(countriesData, ["TRADE", "INVESTMENT", "FINANCE"], 2024);
  console.log(width - DESIGN.windowLeftBorder - DESIGN.windowRightBorder, countriesData[0].dimensions.length);
  let cw = (width - DESIGN.windowLeftBorder - DESIGN.windowRightBorder) / countriesData[0].dimensions.length;
  console.log("cellwidth", DESIGN.cellWidth, cw);

  DESIGN.cellWidth = cw;

  textSize(14);
  //noLoop();
}

function draw() {
  background(220);
  let x = 0;
  let y = 50;

  sortedCountries.forEach((country) => {
    country.draw(x, y);
    /*let dimx = DESIGN.windowLeftBorder;
    let dimy = y;
    country.dimensions.forEach((dimension) => {
      dimension.draw(dimx, dimy);
      dimx += DESIGN.cellWidth;
    });*/
    x = 0;
    y += DESIGN.cellHeight;
  });

  /*
  x = 200;
  y = 50;
  sortedCountries.forEach((country) => {
    country.draw(x, y);

    x = 200;
    y += 50;
  });

  x = 400;
  y = 50;
  sortedByMean2018.forEach((country) => {
    country.draw(x, y);
    x = 400;
    y += 50;
  });

  x = 600;
  y = 50;
  sortedByMean2024.forEach((country) => {
    country.draw(x, y);
    x = 600;
    y += 50;
  });*/
}

//-----------------------------------------
// HELPER
//-----------------------------------------

function processData() {
  const countries = [];

  economiesArray.forEach((economy) => {
    let country = new Country(economy.key, economy.label);

    dimensionsArray.forEach((dimension) => {
      const dim = new Dimension(dimension.key, dimension.label, economy.key);
      country.addDimension(dim);
    });

    countries.push(country);
  });

  // Combine  scoresArray and historicScoresArray using concat
  const combinedScoresArray = scoresArray.concat(historicScoresArray);
  // loop through each score and add it to the right country
  combinedScoresArray.forEach((score) => {
    const country = countries.find((country) => country.key === score.economy);
    const dim = country.dimensions.find((d) => d.key === score.key);
    dim.addScore(score.year, score.score);
  });

  // loop through subdimensions and add it to the right dimensions in the right country
  subdimensionsArray.forEach((subdim) => {
    const country = countries.find((country) => country.key === subdim.economy);
    const dim = country.dimensions.find((d) => subdim.key.startsWith(d.key));
    dim.addSubdimension(subdim.key, subdim.score);
  });
  return countries;
}

class Country {
  constructor(key, label) {
    this.key = key;
    this.label = label;
    this.dimensions = [];
  }

  addDimension(dimension) {
    this.dimensions.push(dimension);
  }

  draw(x, y) {
    push();
    translate(x, y);
    textSize(12);
    text(this.label, 10, DESIGN.cellHeight / 2);

    let dimx = DESIGN.windowLeftBorder;
    let dimy = 0;
    this.dimensions.forEach((dimension) => {
      dimension.draw(dimx, dimy);
      dimx += DESIGN.cellWidth;
    });

    pop();
  }
}

class Dimension {
  constructor(key, label, economy) {
    this.key = key;
    this.label = label;
    this.scores = {};
    this.subdimensions = {};
    this.economy = economy;
    this.hover = false;
  }
  addScore(year, score) {
    this.scores[year] = parseFloat(score);
  }
  addSubdimension(key, score) {
    this.subdimensions[key] = parseFloat(score);
  }

  draw(x, y) {
    push();
    translate(x, y);

    line(0, 0, DESIGN.cellWidth, 0);
    noStroke();
    fill(245);
    rect(0, 0, DESIGN.cellWidth, DESIGN.cellHeight);

    let topLeft = getAbsoluteCoordinates(0, 0);
    let bottomRight = getAbsoluteCoordinates(DESIGN.cellWidth, DESIGN.cellHeight);

    this.hover = false;
    if (mouseX > topLeft.x && mouseX < bottomRight.x && mouseY > topLeft.y && mouseY < bottomRight.y) {
      //console.log("absolute", mouseX, topLeft.x);
      // fill(255, 100, 100);
      // rect(0, 0, DESIGN.cellWidth, DESIGN.cellHeight);
      this.hover = true;
    }

    noStroke(0);
    fill(255);
    rect(
      DESIGN.cellPadding,
      DESIGN.cellPadding,
      DESIGN.cellWidth - 2 * DESIGN.cellPadding,
      DESIGN.cellHeight - 2 * DESIGN.cellPadding
    );
    translate(DESIGN.cellPadding, DESIGN.cellPadding);

    let innerHeigth = DESIGN.cellHeight - 2 * DESIGN.cellPadding;
    let innerWidth = DESIGN.cellWidth - 2 * DESIGN.cellPadding;

    const scoresLength = Object.keys(this.scores).length;
    let partWidth = innerWidth / scoresLength;

    //if (DESIGN.debugView) line(partWidth, 0, partWidth, innerHeigth);
    //if (DESIGN.debugView) line(partWidth * 2, 0, partWidth * 2, innerHeigth);

    if (DESIGN.debugView) stroke(0, 0, 0, 50);
    if (DESIGN.debugView) line(partWidth / 2, 0, partWidth / 2, innerHeigth);
    if (DESIGN.debugView) line(partWidth + partWidth / 2, 0, partWidth + partWidth / 2, innerHeigth);
    if (DESIGN.debugView) line(2 * partWidth + partWidth / 2, 0, 2 * partWidth + partWidth / 2, innerHeigth);

    let score2018 = map(this.scores[2018], 0, 5, innerHeigth, 0);
    let score2021 = map(this.scores[2021], 0, 5, innerHeigth, 0);
    let score2024 = map(this.scores[2024], 0, 5, innerHeigth, 0);

    stroke(100, 100, 255);
    line(partWidth / 2, score2018, partWidth + partWidth / 2, score2021);
    line(partWidth + partWidth / 2, score2021, 2 * partWidth + partWidth / 2, score2024);

    ellipse(partWidth / 2, score2018, 5);
    ellipse(partWidth + partWidth / 2, score2021, 5);
    ellipse(2 * partWidth + partWidth / 2, score2024, 5);

    if (DESIGN.showSubdimensions && this.hover) {
      const subdimensionsCount = Object.keys(this.subdimensions).length;
      Object.entries(this.subdimensions).forEach(([key, value], index) => {
        let mappedVal = map(value, 0, 5, innerHeigth, 0);
        stroke(255, 0, 0);
        let lineStart = 2 * partWidth + partWidth / 2 - 10;
        let lineEnd = 2 * partWidth + partWidth / 2 + 10;
        line(lineStart, mappedVal, lineEnd, mappedVal);
      });
    }

    textSize(10);
    fill(0);
    noStroke();
    text(this.label, 5, 5, DESIGN.cellWidth - 2 * DESIGN.cellPadding, DESIGN.cellHeight - 2 * DESIGN.cellPadding);
    pop();
  }
}

// This function sorts countries based on their scores for a specific dimension and year
const orderCountriesByDimensionScore = (data, dimensionCode, year) => {
  // Create a new sorted array from the input data
  return [...data].sort((a, b) => {
    // Find the score for country 'a' for the given dimension and year
    const scoreA = a.dimensions.find((dim) => dim.dimensionCode === dimensionCode)?.scores[year] ?? -Infinity;

    // Find the score for country 'b' for the given dimension and year
    const scoreB = b.dimensions.find((dim) => dim.dimensionCode === dimensionCode)?.scores[year] ?? -Infinity;

    // Compare scores for descending order (highest score first)
    return scoreB - scoreA;
  });
};

function sortCountriesByDimension(data, dimensionKey, year) {
  return [...data].sort((a, b) => {
    const dimensionA = a.dimensions.find((d) => d.key === dimensionKey);
    const dimensionB = b.dimensions.find((d) => d.key === dimensionKey);

    if (!dimensionA || !dimensionB) {
      console.warn(`Dimension ${dimensionKey} not found for one or both countries`);
      return 0;
    }

    const scoreA = dimensionA.scores[year] || 0;
    const scoreB = dimensionB.scores[year] || 0;

    return scoreB - scoreA; // Sort in descending order
  });
}

function sortCountriesByMeanDimensions(countries, dimensionKeys, year) {
  return [...countries].sort((a, b) => {
    const meanScoreA = calculateMeanScore(a, dimensionKeys, year);
    const meanScoreB = calculateMeanScore(b, dimensionKeys, year);
    return meanScoreB - meanScoreA; // Sort in descending order
  });
}

function calculateMeanScore(country, dimensionKeys, year) {
  let totalScore = 0;
  let countValidDimensions = 0;

  for (const dimensionKey of dimensionKeys) {
    const dimension = country.dimensions.find((d) => d.key === dimensionKey);
    if (dimension && dimension.scores[year] !== undefined) {
      totalScore += dimension.scores[year];
      countValidDimensions++;
    } else {
      console.warn(`Dimension ${dimensionKey} not found or has no 2024 score for country ${country.label}`);
    }
  }

  if (countValidDimensions === 0) {
    console.warn(`No valid dimensions found for country ${country.label}`);
    return 0;
  }

  return totalScore / countValidDimensions;
}
// Example usage:
// const sortedCountries = sortCountriesByMeanDimensions(countries, ['TRADE', 'INVESTMENT', 'FINANCE']);
// console.log(sortedCountries.map(c => ({
//   country: c.label,
//   meanScore: calculateMeanScore(c, ['TRADE', 'INVESTMENT', 'FINANCE']).toFixed(2),
//   tradeScore: c.dimensions.find(d => d.key === 'TRADE')?.scores[2024] || 'N/A',
//   investmentScore: c.dimensions.find(d => d.key === 'INVESTMENT')?.scores[2024] || 'N/A',
//   financeScore: c.dimensions.find(d => d.key === 'FINANCE')?.scores[2024] || 'N/A'
// })));

function keyPressed() {
  if (key == "d") {
    console.log(stateTracker);
    stateTracker = (stateTracker + 1) % states.length;
    state = states[stateTracker];
    redraw(); // Redraw the canvas once
  }
  if (key == "s") {
    const jsonString = JSON.stringify(countriesData, null, 2);
    saveJSON(countriesData, "compiled_data.json");
  }
}
