# Basil.js: Text and Images

[Deutsch](README_DE.md)

An InDesign script that turns all folders in `source/` into one PDF:
every folder starts on a new page with the text from `text.txt`, followed
by every image in the folder on a page of its own. It creates a new
document, fills it folder by folder, exports the PDF and closes the
document again – a batch run
instead of layouting by hand. Written with
[basil.js](https://basiljs2.netlify.app), a library that brings the spirit
of Processing to InDesign.

## Installation

Requirements: Adobe InDesign. The library is included in `basiljs/`
(basil.js 2.0.0-beta, build 2025-01-19; basil.js is released under the
MIT license); the script is in `Basil Scripts/batch_pdf/batch_pdf.jsx`.

1. Basil scripts load the library with these two lines:
   ```js
   // @includepath "~/Documents/;%USERPROFILE%Documents";
   // @include "basiljs/basil.js";
   ```
   InDesign therefore expects the library in `~/Documents/basiljs`. The
   easiest way is a symbolic link:
   ```sh
   ln -s "/path/to/Indesign_Basil_Batch_TextAndImages/basiljs" ~/Documents
   ```
   If `~/Documents/basiljs` already exists (e.g. from another basil
   example), you can keep it. Alternatively, change the `@includepath`
   line to where the library actually lives.
2. In InDesign, open the Scripts panel (*Window → Utilities → Scripts*),
   right-click the folder *User* and choose *Reveal in Finder*. Link the
   `Basil Scripts` folder into that directory:
   ```sh
   ln -s "/path/to/Indesign_Basil_Batch_TextAndImages/Basil Scripts" "/path/to/revealed/Scripts Panel"
   ```

More on the setup: the official
[getting started guide](https://basiljs2.netlify.app/tutorials/01-getting-started/).
All functions: [basil.js reference](https://basiljs2.netlify.app/reference/).

## How to Run

The source material lies in `source/`, one folder per section:

```
source/
  glacier/
    text.txt     first line: title; an empty line starts a new paragraph
    01.jpg       images (jpg, png, tif), placed in alphabetical order
    02.jpg
  harbour/
    ...
```

Double-click `batch_pdf.jsx` in the Scripts panel and choose the `source`
folder. The script creates `output/document.pdf` (A4, 20 mm
margins, folders in alphabetical order) in a folder `output` next to
`source`, and reports how many folders it saved. An existing PDF is
overwritten. Replace the folders in
`source/` with your own material and run it again.

The document opens and closes while the script runs; don't click into
InDesign until the message appears.

## Coding Help

Scripts are written in ExtendScript (an old dialect of JavaScript). A basil
script defines `draw()` and optionally `setup()`, which runs once before it;
basil calls both automatically once the library is included.

- **`setup()`**: opens `Folder.selectDialog()` and stores the chosen folder
  in `sourceFolder`.
- **`draw()`**: creates the `output` folder next to it, sets
  `app.pdfExportPreferences.pageRange` to all pages (otherwise InDesign
  reuses the page range of the last export), lists the subfolders with `getFiles()`, creates the document and calls
  `addItem()` for each folder. At the end it exports and closes the
  document.
- **`draw()` → document**: `app.documents.add()` creates a new
  document; A4 and single pages are set in `documentPreferences`. `doc(d)`
  tells basil to work with this document, `units(MM)` switches all
  coordinates to millimetres. `pageMargin` at the top of the script sets
  the margin.
- **`nextPage()`**: uses page 1 for the first content and appends a new
  page with `addPage()` for everything after it, so every folder and every
  image starts on a page of its own.
- **`addItem()` → text**: `readParagraphs()` reads `text.txt` as UTF-8
  and joins its lines into paragraphs. In InDesign, `\r` separates
  paragraphs. `text()` creates the frame; font and size come from
  `textFont()` and `textSize()`. They are also applied to `parentStory`,
  because basil formats only the text that fits into the frame. The first
  paragraph is the title: 24 pt bold. While the frame `overflows`, the
  script adds a page with `addPage()`, creates a new frame and links it
  with `nextTextFrame`, so long texts continue on the following pages.
- **`addItem()` → images**: for every image (`jpg`, `jpeg`, `png`,
  `tif`), `nextPage()` starts a page and `rect()` draws a frame inside the
  margins (without fill and stroke, see `noFill()` / `noStroke()`). The
  image is placed with `place()` and fitted with
  `FitOptions.PROPORTIONALLY` and `FitOptions.CENTER_CONTENT`. Use
  `FitOptions.FILL_PROPORTIONALLY` to fill the area instead.
- **`draw()` → export**: `savePDF()` exports with the last used PDF
  settings (by default *High Quality Print*), `close(false)` closes the
  document without saving an `.indd` file. To keep the InDesign file as well, save it with `d.save(new File(...))` before closing.
