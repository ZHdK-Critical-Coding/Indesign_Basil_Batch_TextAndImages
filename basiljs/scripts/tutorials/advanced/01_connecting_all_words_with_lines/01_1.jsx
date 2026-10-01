// @includepath "~/Documents/;%USERPROFILE%Documents";
// @include "basiljs/basil.js";

function draw() {

  var selItems = selections(); // get all selected items

  var textFrame1 = selItems[0]; // the first textframe
  var textFrame2 = selItems[1]; // the second textframe

  var words1 = words(textFrame1);
  var words2 = words(textFrame2);

  layer("generatedLines"); // get or create this layer and set it as the active one
  strokeWeight(0.3); // we like hairs

  for(var i = 0; i < words1.length; i++) { // for each word

    var w1 = words1[i]; // current word from the first textframe

      // nested for-loop, connect each word with all other words of other textframe
    for(var j = 0; j < words2.length; j++) {

      var w2 = words2[j]; // the current word from the second textframe

      line(
            // add half of the width and height to make sure the lines are centered
            bounds(w1).left + bounds(w1).width / 2,
            bounds(w1).top + bounds(w1).height / 2,
            bounds(w2).left + bounds(w2).width / 2,
            bounds(w2).top + bounds(w2).height / 2
        );

    }

  }

}