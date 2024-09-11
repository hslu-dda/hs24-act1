let economiesArray;

function preload() {
  economiesArray = loadD3CSV("data/economies_labels.csv");
}

function setup() {
  createCanvas(600, 400);
  console.log("Loaded data:", economiesArray);
  noLoop();
}

function draw() {
  background(220);
  textSize(14);
  let y = 20;

  text("List of Countries:", 10, y);
  y += 30;

  economiesArray.forEach((economy, index) => {
    text(`${index + 1}. ${economy.label} (${economy.key})`, 10, y);
    y += 20;
  });
}
