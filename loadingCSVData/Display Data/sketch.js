let countriesData = [];
let data;

function preload() {
  loadD3JSON("data/compiled_data.json", function (data) {
    console.log("raw data", data);
    countriesData = data.map((countryData) => new Country(countryData));
  });
  // just to show you the difference
  data = loadD3JSON("data/compiled_data.json");
}

function setup() {
  createCanvas(windowWidth, 2000);
  console.log("data", data, countriesData);
  let dataArray = Object.values(data);
  console.log("dataArray", dataArray);
}

function draw() {
  background(220);
  let x = 0;
  let y = 50;

  countriesData.forEach((country) => {
    push();
    translate(x, y);
    country.draw();
    pop();
    x = 0;
    y += 100;
  });
}

class Country {
  constructor(data) {
    this.key = data.key;
    this.label = data.label;
    this.dimensions = data.dimensions; //.map((dimData) => new Dimension(dimData, this.key));
    this.dimensionCellWidth = 50;
    this.isMouseInside = false;
  }

  draw() {
    push();
    textSize(12);
    text(this.label, 0, 0);

    let cW = 80;
    this.dimensions.forEach((dimension, index) => {
      push();
      translate(100 + cW * index, 0);
      let topLeft = getAbsoluteCoordinates(0, 0);
      let bottomRight = getAbsoluteCoordinates(cW, cW);

      this.isMouseInside = mouseX > topLeft.x && mouseX < bottomRight.x && mouseY > topLeft.y && mouseY < bottomRight.y;
      fill(255, 20);

      if (this.isMouseInside) {
        fill(255, 0, 0, 20);
        if (mouseIsPressed) {
          fill(0, 0, 255);
        }
      }
      let score2018 = map(dimension.scores[2018], 0, 5, cW, 0);
      let score2021 = map(dimension.scores[2021], 0, 5, cW, 0);
      let score2024 = map(dimension.scores[2024], 0, 5, cW, 0);

      rect(0, 0, cW, cW);

      fill(255);
      let cWpart = cW / 3;
      circle(cWpart / 2, score2018, 5);
      circle(cWpart + cWpart / 2, score2021, 5);
      circle(cWpart + cWpart + cWpart / 2, score2024, 5);

      fill(0);
      textSize(8);
      text(dimension.label, 0, 0, 50);

      pop();
    });

    pop();
  }
}

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
