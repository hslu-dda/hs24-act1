// DATA
let countriesData = [];
let sortedCountries;
let sortedByMean;

// Design constants
let DESIGN = {
  windowLeftBorder: 150,
  windowRightBorder: 150,
  topBorder: 80,
  bottomBorder: 50,
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
  loadD3JSON("compiled_data_2.json", function (data) {
    console.log("data", data);
    countriesData = data;
  });
}

function setup() {
  createCanvas(windowWidth, 2000);
  console.log("countriesData", countriesData);

  sortedCountries = sortCountriesByDimension(countriesData, "INVESTMENT", 2024);

  sortedByMean2018 = sortCountriesByMeanDimensions(countriesData, ["TRADE", "INVESTMENT", "FINANCE"], 2018);
  sortedByMean2024 = sortCountriesByMeanDimensions(countriesData, ["TRADE", "INVESTMENT", "FINANCE"], 2024);

  let cw = (width - DESIGN.windowLeftBorder - DESIGN.windowRightBorder) / countriesData[0].dimensions.length;
  console.log("cellwidth", DESIGN.cellWidth, cw);

  DESIGN.cellWidth = cw;

  textSize(14);
}

function draw() {
  background(220);
  let x = 0;
  let y = 50;

  sortedCountries.forEach((country) => {
    drawCountry(country, x, y);
    x = 0;
    y += DESIGN.cellHeight;
  });
}

function drawCountry(country, x, y) {
  push();
  translate(x, y);
  textSize(12);
  text(country.label, 10, DESIGN.cellHeight / 2);

  let dimx = DESIGN.windowLeftBorder;
  let dimy = 0;
  country.dimensions.forEach((dimension) => {
    drawDimension(dimension, dimx, dimy);
    dimx += DESIGN.cellWidth;
  });

  pop();
}

function drawDimension(dimension, x, y) {
  push();
  translate(x, y);

  line(0, 0, DESIGN.cellWidth, 0);
  noStroke();
  fill(245);
  rect(0, 0, DESIGN.cellWidth, DESIGN.cellHeight);

  let topLeft = getAbsoluteCoordinates(0, 0);
  let bottomRight = getAbsoluteCoordinates(DESIGN.cellWidth, DESIGN.cellHeight);

  let hover = mouseX > topLeft.x && mouseX < bottomRight.x && mouseY > topLeft.y && mouseY < bottomRight.y;

  noStroke(0);
  fill(255);
  rect(
    DESIGN.cellPadding,
    DESIGN.cellPadding,
    DESIGN.cellWidth - 2 * DESIGN.cellPadding,
    DESIGN.cellHeight - 2 * DESIGN.cellPadding
  );
  translate(DESIGN.cellPadding, DESIGN.cellPadding);

  let innerHeight = DESIGN.cellHeight - 2 * DESIGN.cellPadding;
  let innerWidth = DESIGN.cellWidth - 2 * DESIGN.cellPadding;

  const scoresLength = Object.keys(dimension.scores).length;
  let partWidth = innerWidth / scoresLength;

  if (DESIGN.debugView) {
    stroke(0, 0, 0, 50);
    line(partWidth / 2, 0, partWidth / 2, innerHeight);
    line(partWidth + partWidth / 2, 0, partWidth + partWidth / 2, innerHeight);
    line(2 * partWidth + partWidth / 2, 0, 2 * partWidth + partWidth / 2, innerHeight);
  }

  let score2018 = map(dimension.scores[2018], 0, 5, innerHeight, 0);
  let score2021 = map(dimension.scores[2021], 0, 5, innerHeight, 0);
  let score2024 = map(dimension.scores[2024], 0, 5, innerHeight, 0);

  stroke(100, 100, 255);
  line(partWidth / 2, score2018, partWidth + partWidth / 2, score2021);
  line(partWidth + partWidth / 2, score2021, 2 * partWidth + partWidth / 2, score2024);

  ellipse(partWidth / 2, score2018, 5);
  ellipse(partWidth + partWidth / 2, score2021, 5);
  ellipse(2 * partWidth + partWidth / 2, score2024, 5);

  if (DESIGN.showSubdimensions && hover) {
    dimension.subdimensions.forEach((subdimension, index) => {
      let mappedVal = map(subdimension.score, 0, 5, innerHeight, 0);
      stroke(255, 0, 0);
      let lineStart = 2 * partWidth + partWidth / 2 - 10;
      let lineEnd = 2 * partWidth + partWidth / 2 + 10;
      line(lineStart, mappedVal, lineEnd, mappedVal);
    });
  }

  textSize(10);
  fill(0);
  noStroke();
  text(dimension.label, 5, 5, DESIGN.cellWidth - 2 * DESIGN.cellPadding, DESIGN.cellHeight - 2 * DESIGN.cellPadding);
  pop();
}

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
      console.warn(`Dimension ${dimensionKey} not found or has no ${year} score for country ${country.label}`);
    }
  }

  if (countValidDimensions === 0) {
    console.warn(`No valid dimensions found for country ${country.label}`);
    return 0;
  }

  return totalScore / countValidDimensions;
}

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
