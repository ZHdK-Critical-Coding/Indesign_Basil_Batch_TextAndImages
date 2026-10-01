// @includepath "~/Documents/;%USERPROFILE%Documents";
// @include "basiljs/basil.js";

// Creates one PDF with all folders in source/: every folder starts
// on a new page with its text.txt, every image follows on its own page.
// The PDF is saved as output/document.pdf next to the source folder.

var pageMargin = 20; // mm
var sourceFolder;
var pageUsed;      // false until something is placed on page 1

function setup() {
    sourceFolder = Folder.selectDialog("Select the source folder");
}

function draw() {
    if (!sourceFolder) {
        alert("No folder selected.");
        return;
    }

    var outputFolder = new Folder(sourceFolder.parent.fsName + "/output");
    outputFolder.create();

    // export all pages, regardless of what was used last time
    app.pdfExportPreferences.pageRange = PageRange.ALL_PAGES;

    // every subfolder is one item
    var itemFolders = sourceFolder.getFiles(function(file) {
        return file instanceof Folder;
    });
    itemFolders.sort(byName);

    // one InDesign document for all folders: build it, export it, close it
    var d = app.documents.add();
    d.documentPreferences.properties = {
        facingPages: false,
        pageWidth: "210mm",
        pageHeight: "297mm"
    };
    doc(d);      // basil now works with this document
    units(MM);
    pageUsed = false;

    for (var i = 0; i < itemFolders.length; i++) {
        addItem(itemFolders[i]);
    }

    var pdf = new File(outputFolder.fsName + "/document.pdf");
    savePDF(pdf);
    close(false); // close without saving the .indd

    alert(itemFolders.length + " folder(s) saved in\n" + pdf.fsName);
}

// Page 1 for the first content, a new page for everything after it
function nextPage() {
    if (pageUsed) addPage();
    pageUsed = true;
}

// One folder: a new page with the text, then one page per image
function addItem(itemFolder) {
    var pageBounds = bounds(page());
    var w = pageBounds.width - 2 * pageMargin;
    var h = pageBounds.height - 2 * pageMargin;

    // ---- the text ----
    var textFile = new File(itemFolder.fsName + "/text.txt");
    if (textFile.exists) {
        nextPage();
        textFont("Arial", "Regular");
        textSize(11);

        var frame = text(readParagraphs(textFile).join("\r"), pageMargin, pageMargin, w, h);

        // basil formats only the text that fits into the frame,
        // so the whole story (including overset text) is formatted here
        var story = frame.parentStory;
        story.appliedFont = textFont();
        story.pointSize = textSize();
        story.spaceAfter = 2;
        story.justification = Justification.LEFT_JUSTIFIED;

        // the first paragraph is the title
        var title = frame.paragraphs[0];
        title.pointSize = 24;
        title.fontStyle = "Bold";
        title.justification = Justification.LEFT_ALIGN;
        title.spaceAfter = 8;

        // too much text for one page: add pages and thread the frames
        while (frame.overflows) {
            addPage();
            var next = text("", pageMargin, pageMargin, w, h);
            frame.nextTextFrame = next;
            frame = next;
            story.recompose();
        }
    }

    // ---- one page per image ----
    var images = itemFolder.getFiles(function(file) {
        return file instanceof File && /\.(jpg|jpeg|png|tif|tiff)$/i.test(file.name);
    });
    images.sort(byName);

    noFill();
    noStroke();
    for (var i = 0; i < images.length; i++) {
        nextPage();
        var r = rect(pageMargin, pageMargin, w, h);
        r.place(images[i]);
        r.fit(FitOptions.PROPORTIONALLY);
        r.fit(FitOptions.CENTER_CONTENT);
    }
}

// Reads a UTF-8 text file. Lines are joined into paragraphs,
// an empty line starts a new paragraph.
function readParagraphs(file) {
    file.encoding = "UTF-8";
    file.open("r");
    var lines = file.read().split(/\r\n|\r|\n/);
    file.close();

    var paragraphs = [];
    var current = [];
    for (var i = 0; i < lines.length; i++) {
        if (/^\s*$/.test(lines[i])) {
            if (current.length) paragraphs.push(current.join(" "));
            current = [];
        } else {
            current.push(lines[i]);
        }
    }
    if (current.length) paragraphs.push(current.join(" "));
    return paragraphs;
}

function byName(a, b) {
    return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0);
}
