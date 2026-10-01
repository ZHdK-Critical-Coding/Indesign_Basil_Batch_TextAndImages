// @includepath "~/Documents/;%USERPROFILE%Documents";
// @include "basiljs/basil.js";

function draw() {

  var xCells = 5;
  var yCells = 5;
  var center = false;

  if(items(layer("shapes")).length === 0) {
    alert("Nothing found on layer 'shapes'. Put something there first.");
  }

  var layerNameToDelete = "generated";

  if (app.documents.length > 0) {
      var doc = app.activeDocument;
      var layers = doc.layers;

      if (layers.itemByName(layerNameToDelete).isValid) {
          layers.itemByName(layerNameToDelete).remove();
      } else {
      }
  } else {
      alert("No document open.");
  }

  var cellWidth = width / xCells;
  var cellHeight = height / yCells;
  noFill();
  for(var y = 0; y < yCells; y++) {

    for(var x = 0; x < xCells; x++) {

      var shape = getRandomShape();

      layer(layerNameToDelete);

      // rotate(radians(random(-10, 10)));
      // scale( random(0.9, 1.1) );

      var newShape = duplicate(shape);

      // newShape.fillColor = color(255,0,0);

      if(center === true) {
        transform(newShape, "x", cellWidth * x + cellWidth / 2 - bounds(newShape).width / 2);
        transform(newShape, "y", cellHeight * y + cellHeight / 2 - bounds(newShape).height / 2);
      } else {
        transform(newShape, "x", cellWidth * x);
        transform(newShape, "y", cellHeight * y);
      }
      transform(newShape, "size", [cellWidth, cellHeight]);
      rect(cellWidth * x, cellHeight * y, cellWidth, cellHeight)
    }

  }

}


function getRandomShape() {

  var shapesLayer = layer("shapes");
  var shapesItems = items(shapesLayer);

  var randomIndex = floor(random(shapesItems.length));

  return shapesItems[ randomIndex ];

}
