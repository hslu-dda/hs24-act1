// Design constants
const DESIGN = {
  leftBorder: 150,
  rightBorder: 50,
  topBorder: 80,
  bottomBorder: 50,
  cellHeight: 100,
  cellPadding: 10,
  debugView: true,
};

let states = ["line", "circle"];
let stateTracker = 0;

class Country {
  constructor(key, label) {
    this.code = key;
    this.name = label;
    this.dimensions = [];
  }

  addDimension(dimension) {
    this.dimensions.push(dimension);
  }

  draw(x, y) {
    push();
    translate(x, y);
    text(this.name, 10, 0);
    translate(0, textDescent());
    line(0, 0, width - DESIGN.rightBorder, 0);

    const cellWidth =
      (width - DESIGN.leftBorder - DESIGN.rightBorder) / this.dimensions.length;
    translate(DESIGN.leftBorder, 0);

    this.dimensions.forEach((dimension) => {
      dimension.draw(cellWidth, states[stateTracker]);
      translate(cellWidth, 0);
    });

    pop();
    return yStart + DESIGN.cellHeight + textAscent() + textDescent() * 2;
  }
}

class Dimension {
  constructor(key, label) {
    this.code = key;
    this.name = label;
    this.scores = {};
    this.subdimensions = {};
  }

  addScore(year, score) {
    this.scores[year] = parseFloat(score);
  }

  addSubdimension(key, score) {
    this.subdimensions[key] = parseFloat(score);
  }

  draw(cellWidth, state) {
    rect(0, 0, cellWidth, DESIGN.cellHeight);
    noStroke();
    text(this.code, 0, 0);
    stroke(0);

    const scoresCount = Object.keys(this.scores).length;

    if (state === "circle") {
      this.drawCircleState(cellWidth, scoresCount);
    } else if (state === "line") {
      this.drawLineState(cellWidth, scoresCount);
    }

    this.drawSubdimensions(cellWidth, scoresCount);
  }

  drawCircleState(cellWidth, scoresCount) {
    const partHeight =
      (DESIGN.cellHeight - 2 * DESIGN.cellPadding) / scoresCount;
    push();
    translate(0, DESIGN.cellPadding);
    Object.entries(this.scores).forEach(([year, value], index) => {
      push();
      translate(0, partHeight / 2 + index * partHeight);
      line(0, 0, cellWidth, 0);
      const diameter = map(value, 0, 5, 0, partHeight);
      ellipse(cellWidth / 2, 0, diameter);
      pop();
    });
    pop();
  }

  drawLineState(cellWidth, scoresCount) {
    const partWidth = (cellWidth - 2 * DESIGN.cellPadding) / scoresCount;
    push();
    translate(DESIGN.cellPadding, 0);

    const points = Object.entries(this.scores).map(([year, value], index) => {
      const x = partWidth / 2 + index * partWidth;
      const y = map(value, 0, 5, DESIGN.cellHeight, 0);
      return { x, y, year };
    });

    points.forEach((point) => {
      stroke(255, 0, 0, 50);
      if (DESIGN.debugView) line(point.x, 0, point.x, DESIGN.cellHeight);
      noStroke();
      textSize(10);
      text(
        point.year,
        point.x - textWidth(point.year) / 2,
        DESIGN.cellHeight - DESIGN.cellPadding
      );
      stroke(0);
      ellipse(point.x, point.y, 5);
    });

    for (let i = 1; i < points.length; i++) {
      line(points[i - 1].x, points[i - 1].y, points[i].x, points[i].y);
    }

    pop();
  }

  drawSubdimensions(cellWidth, scoresCount) {
    const partWidth = (cellWidth - 2 * DESIGN.cellPadding) / scoresCount;
    push();
    Object.entries(this.subdimensions).forEach(([key, value], index) => {
      noStroke();
      textSize(6);
      text(index + " -> " + value, 0, -index * 10);
      const mappedVal = map(value, 0, 5, DESIGN.cellHeight, 0);
      fill(255, 0, 0, 50);
      stroke(255, 0, 0);
      line(
        DESIGN.cellPadding + partWidth / 2 + partWidth * 2 - 10,
        mappedVal,
        DESIGN.cellPadding + partWidth / 2 + partWidth * 2 + 10,
        mappedVal
      );
      fill(0);
    });
    pop();
  }
}

// Global variables
let countriesData = [];
let orderedCountries;
let dimensionsArray,
  economiesArray,
  scoresArray,
  historicScoresArray,
  subdimensionsArray,
  subdimensionsLabels;

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
  textSize(14);
  noLoop();

  countriesData = processData();
  orderedCountries = orderCountriesByDimensionScore(
    countriesData,
    "INVESTMENT",
    2024
  );
  console.log("Ordered countries:", orderedCountries);
}

function draw() {
  background(220);
  let yOffset = 20;

  orderedCountries.forEach((country) => {
    yOffset = country.draw(100, yOffset);
  });
  yOffset = 20;

  orderedCountries.forEach((country) => {
    yOffset = country.draw(200, yOffset);
  });
}

function processData() {
  const countries = {};

  economiesArray.forEach((economy) => {
    countries[economy.key] = new Country(economy.key, economy.label);
  });

  dimensionsArray.forEach((dimension) => {
    const dim = new Dimension(dimension.key, dimension.label);

    scoresArray.concat(historicScoresArray).forEach((score) => {
      if (score.key === dimension.key) {
        dim.addScore(score.year, score.score);
      }
    });

    subdimensionsArray.forEach((subdim) => {
      if (subdim.key.startsWith(dimension.key + "_")) {
        dim.addSubdimension(subdim.key, subdim.score);
      }
    });

    console.log("dim", dimension, dim);

    Object.values(countries).forEach((country) => {
      console.log("country", country);

      country.addDimension(dim);
    });
  });
  console.log("countries", countries);

  return Object.values(countries);
}

function orderCountriesByDimensionScore(data, dimensionKey, year) {
  return [...data].sort((a, b) => {
    const dimensionA = a.dimensions.find((dim) => dim.key === dimensionKey);
    const dimensionB = b.dimensions.find((dim) => dim.key === dimensionKey);

    const scoreA = dimensionA?.scores[year] ?? -Infinity;
    const scoreB = dimensionB?.scores[year] ?? -Infinity;

    return scoreB - scoreA;
  });
}

function keyPressed() {
  if (key == "d") {
    stateTracker = (stateTracker + 1) % states.length;
    redraw();
  }
}
