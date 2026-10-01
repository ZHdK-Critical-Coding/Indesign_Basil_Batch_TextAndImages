// @includepath "~/Documents/;%USERPROFILE%Documents";
// @include "basiljs/basil.js";

// Creates one PDF with all folders in source/: every folder starts
// on a new page with its text.txt, every image follows on its own page.
// The PDF is saved as output/document.pdf next to the source folder.

var pageMargin = 20; // mm
var sourceFolder;
var pageUsed;        // false until something is placed on page 1

function setup() {
    sourceFolder = selectFolder({prompt: "Select the source folder"});
}

function draw() {
    if (!sourceFolder) {
        alert("No folder selected.");
        return;
    }

    // export all pages, regardless of what was used last time
    app.pdfExportPreferences.pageRange = PageRange.ALL_PAGES;

    // a new single-page A4 document; basil works with it from now on
    doc(app.documents.add({documentPreferences: {facingPages: false}}));
    units(MM);
    size(210, 297);
    pageUsed = false;

    // every subfolder is one item, sorted by name
    var itemFolders = sourceFolder.getFiles(function(f) {
        return f instanceof Folder;
    });
    itemFolders.sort(byName);
    forEach(itemFolders, addItem);

    // savePDF() creates the output folder if needed
    var pdf = file(sourceFolder.parent.absoluteURI + "/output/document.pdf");
    savePDF(pdf);

    println(itemFolders.length + " folder(s) saved in " + pdf.fsName);
    alert(itemFolders.length + " folder(s) saved in\n" + pdf.fsName);
}

// Page 1 for the first content, a new page for everything after it.
// The canvas is the area inside the margins: (0, 0) is the top left
// margin corner, width and height are the size of that area.
function startPage() {
    if (pageUsed) addPage();
    pageUsed = true;
    margins(pageMargin);
    canvasMode(MARGIN);
}

// One folder: a new page with the text, then one page per image
function addItem(itemFolder) {

    // ---- the text ----
    var textFile = file(itemFolder.absoluteURI + "/text.txt");
    if (textFile.exists) {
        startPage();

        // text() colours the text with the current fill –
        // set it every time, the image frames below switch it off
        fill(0);
        noStroke();
        textFont("Arial", "Regular");
        textSize(11);
        textAlign(Justification.LEFT_JUSTIFIED);

        var frame = text(join(readParagraphs(textFile), "\r"), 0, 0, width, height);

        // basil formats only the text that fits into the frame,
        // so the whole story (including overset text) is formatted here
        typo(frame.parentStory, {
            appliedFont: textFont(),
            pointSize: textSize(),
            justification: Justification.LEFT_JUSTIFIED,
            spaceAfter: 2
        });

        // the first paragraph is the title
        typo(paragraphs(frame)[0], {
            pointSize: 24,
            fontStyle: "Bold",
            justification: Justification.CENTER_ALIGN,
            spaceAfter: 8
        });

        // too much text for one page: add pages and thread the frames
        while (frame.overflows) {
            startPage();
            var next = text("", 0, 0, width, height);
            linkTextFrames(frame, next);
            frame = next;
        }
    }

    // ---- one page per image ----
    var images = files(itemFolder, {filter: ["jpg", "jpeg", "png", "tif", "tiff"]});
    images.sort(byName);

    forEach(images, function(img) {
        startPage();
        noFill();
        noStroke();
        // image() fills the frame and crops the image;
        // fit it again so the whole image is visible
        var imageFrame = image(img, rect(0, 0, width, height));
        imageFrame.fit(FitOptions.PROPORTIONALLY);
        imageFrame.fit(FitOptions.CENTER_CONTENT);
    });
}

// Reads a UTF-8 text file with loadStrings(). Lines are joined
// into paragraphs, an empty line starts a new paragraph.
function readParagraphs(f) {
    f.encoding = "UTF-8"; // loadStrings() keeps the encoding of the File
    var result = [];
    var current = [];
    forEach(loadStrings(f), function(line) {
        if (trim(line) === "") {
            if (current.length) result.push(join(current, " "));
            current = [];
        } else {
            current.push(trim(line));
        }
    });
    if (current.length) result.push(join(current, " "));
    return result;
}

function byName(a, b) {
    return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0);
}
