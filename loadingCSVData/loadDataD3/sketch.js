// DATA
let countriesData = [];
let orderedCountries;
let dimensionsArray,
  economiesArray,
  scoresArray,
  historicScoresArray,
  subdimensionsArray,
  subdimensionsLabels;

// Design
let leftBorder = 150;
let rightBorder = 50;
let topBorder = 80;
let bottomBorder = 50;

let debugView = false;

let states = ["line", "circle"];
let stateTracker = 0;
let state = states[stateTracker];

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

  // Looping through economies
  countriesData = economiesArray.map((economy) => {
    // console.log(economy.label);
    //object to compile and store data per country
    const countryData = {
      countryCode: economy.key,
      country: economy.label,
      dimensions: [],
    };

    //looping through dimensions
    dimensionsArray.forEach((dimension) => {
      // console.log(dimension);
      const dimensionData = {
        dimensionCode: dimension.key,
        dimensionName: dimension.label,
        subdimensions: {},
        scores: {},
      };

      // Find scores for this country and dimension
      scoresArray.forEach((score) => {
        // go through all scores and check for the actual country code and dimension name
        if (score.economy === economy.key && score.key === dimension.key) {
          dimensionData.scores[score.year] = parseFloat(score.score);
        }
      });

      // Find historic scores for this country and dimension
      historicScoresArray.forEach((histScore) => {
        if (
          histScore.economy === economy.key &&
          histScore.key === dimension.key
        ) {
          dimensionData.scores[histScore.year] = parseFloat(histScore.score);
        }
      });

      subdimensionsArray.forEach((subdim) => {
        const parentDimName = subdim.key.split("_")[0];
        // if (subdim.economy === economy.key && parentDimName === dimension.key)

        if (subdim.economy === economy.key && parentDimName === dimension.key) {
          dimensionData.subdimensions[subdim.key] = parseFloat(subdim.score);
        }
      });

      countryData.dimensions.push(dimensionData);
    });

    return countryData;
  });
  //console.log(JSON.stringify(countriesData, null, 2));
  console.log("countriesDatamm", countriesData);
  orderedCountries = orderCountriesByDimensionScore(
    countriesData,
    "TRANSPORT",
    2024
  );
  console.log("orderd", orderedCountries);

  textSize(14);
  noLoop();
}

function draw() {
  background(220);
  circle(mouseX, mouseY, 20, 20);
  // loop through countriesData
  let y = 20;
  let cellheight = 130;
  //get the "Unterlaenge", the line below the baseline where g/p/q reach to…
  let lineoffset = textDescent();
  //
  let textheight = textAscent() + textDescent();
  let margin = textheight * 2;
  let cellpadding = 10;

  orderedCountries.map((country) => {
    //console.log(country.country);

    push();
    translate(0, y);
    text(country.country, 10, 0);
    translate(0, lineoffset);
    line(0, 0, width - rightBorder, 0);

    let cellwidth =
      (width - leftBorder - rightBorder) / country.dimensions.length;
    translate(leftBorder, 0);

    country.dimensions.map((dimension) => {
      // move left for each dimension
      // background
      rect(0, 0, cellwidth, cellheight);
      //text(dimension.dimensionCode, x + cellpadding, y - 20);
      noStroke();
      text(dimension.dimensionCode, 0, 0);
      stroke(0);

      // get how many scores we have
      const scoresCount = Object.keys(dimension.scores).length;
      let partheight = (cellheight - 2 * cellpadding) / scoresCount;

      switch (state) {
        case "circle":
          // we need to push/pop so that each cell is encapsulated
          push();
          // some padding
          translate(0, cellpadding);
          Object.entries(dimension.scores).forEach(([key, value], index) => {
            // translate to center of the partheight
            push();
            translate(0, partheight / 2 + index * partheight);
            // draw centerline
            line(0, 0, cellwidth, 0);
            // scale diameter
            let d = map(value, 0, 5, 0, partheight);
            // draw an ellipse according to value
            ellipse(cellwidth / 2, 0, d);
            // translate to the end of the partheight to prepare for next partheight
            pop();
          });
          pop();
          break;
        case "line":
          let partwidth = (cellwidth - 2 * cellpadding) / scoresCount;

          // we need to push/pop so that each cell is encapsulated
          push();
          // some padding
          translate(cellpadding, 0);

          // track last y to draw a line
          Object.entries(dimension.scores).forEach(([key, value], index) => {
            // translate to center of the partheight
            push();
            translate(partwidth / 2 + index * partwidth, 0);
            // draw centerline
            stroke(255, 0, 0, 50);
            if (debugView) line(0, 0, 0, cellheight);

            noStroke();
            textSize(10);
            let textW = textWidth(key);
            text(key, -textW / 2, cellheight - cellpadding);
            // scale diameter
            let y = map(value, 0, 5, cellheight, 0);
            // draw an ellipse according to value
            stroke(0);

            ellipse(0, y, 5);
            // translate to the end of the partheight to prepare for next partheight
            pop();
          });
          pop();

          // 3 strategie, less generic, less translate, more position-addings…
          // get Values and mapp them
          let v2018 = dimension.scores["2018"];
          let v2018mapped = map(v2018, 0, 5, cellheight, 0);
          let v2021 = dimension.scores["2021"];
          let v2021mapped = map(v2021, 0, 5, cellheight, 0);
          let v2024 = dimension.scores["2024"];
          let v2024mapped = map(v2024, 0, 5, cellheight, 0);

          line(
            cellpadding + partwidth / 2,
            v2018mapped,
            cellpadding + partwidth / 2 + partwidth,
            v2021mapped
          );

          line(
            cellpadding + partwidth / 2 + partwidth,
            v2021mapped,
            cellpadding + partwidth / 2 + partwidth + partwidth,
            v2024mapped
          );

          break;
      }
      stroke(255, 0, 0);
      if (debugView) line(0, cellpadding, cellwidth, cellpadding);
      if (debugView)
        line(0, cellheight - cellpadding, cellwidth, cellheight - cellpadding);
      stroke(0);
      // move right for the next cell
      translate(cellwidth, 0);
    });

    y += cellheight + margin;
    pop();
  });
}

//------------ HELPERS ----------------
// const orderCountriesByDimensionScore = (data, dimensionCode, year) => {
//   return data
//     .map((country) => {
//       const dimension = country.dimensions.find(
//         (dim) => dim.dimensionCode === dimensionCode
//       );
//       return {
//         ...country, // Spread the entire country object
//         sortScore:
//           dimension && dimension.scores[year] ? dimension.scores[year] : null,
//       };
//     })
//     .filter((item) => item.sortScore !== null) // Remove countries without a score for this dimension/year
//     .sort((a, b) => b.sortScore - a.sortScore) // Sort in descending order
//     .map(({ sortScore, ...rest }) => rest); // Remove the temporary sortScore field
// };

// This function sorts countries based on their scores for a specific dimension and year
const orderCountriesByDimensionScore = (data, dimensionCode, year) => {
  // Create a new sorted array from the input data
  return [...data].sort((a, b) => {
    // Find the score for country 'a' for the given dimension and year
    const scoreA =
      a.dimensions.find((dim) => dim.dimensionCode === dimensionCode)?.scores[
        year
      ] ?? -Infinity;

    // Find the score for country 'b' for the given dimension and year
    const scoreB =
      b.dimensions.find((dim) => dim.dimensionCode === dimensionCode)?.scores[
        year
      ] ?? -Infinity;

    // Compare scores for descending order (highest score first)
    return scoreB - scoreA;
  });
};

function keyPressed() {
  if (key == "d") {
    console.log(stateTracker);
    stateTracker = (stateTracker + 1) % states.length;
    state = states[stateTracker];
    redraw(); // Redraw the canvas once
  }
}
