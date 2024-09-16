let economiesArray;

function preload() {
  d3.csv("data/economies_labels.csv", d3.autoType).then(function (csv) {
    economiesArray = csv;
  });
}

function setup() {
  createCanvas(600, 400);
  console.log("Loaded data:", economiesArray);
}

function draw() {
  background(220);
  textSize(14);
  let y = 40;

  text("List of Countries:", 10, y);
  y += 30;

  economiesArray.forEach((economy, index) => {
    text(`${index + 1}. ${economy.label} (${economy.key})`, 10, y);
    y += 20;
  });
}
