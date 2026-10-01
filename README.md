# Basil.js: Text and Images

[Deutsch](README_DE.md)

An InDesign script that turns every folder in `source/` into its own PDF:
the text from `text.txt` on the first page, followed by every image in the
folder on a page of its own. For each folder it creates a new document,
fills it, exports the PDF and closes the document again – a batch run
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

The source material lies in `source/`, one folder per document:

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
folder. The script creates `output/glacier.pdf`, `output/harbour.pdf` …
(A4, 20 mm margins) in a folder `output` next to `source`, and reports how
many PDFs it saved. Existing PDFs are overwritten. Replace the folders in
`source/` with your own material and run it again.

The documents open and close while the script runs; don't click into
InDesign until the message appears.

## Coding Help

Scripts are written in ExtendScript (an old dialect of JavaScript). A basil
script defines `draw()` and optionally `setup()`, which runs once before it;
basil calls both automatically once the library is included.

- **`setup()`**: opens `Folder.selectDialog()` and stores the chosen folder
  in `sourceFolder`.
- **`draw()`**: creates the `output` folder next to it, sets
  `app.pdfExportPreferences.pageRange` to all pages (otherwise InDesign
  reuses the page range of the last export), lists the subfolders with
  `getFiles()` and calls `createPDF()` for each of them.
- **`createPDF()` → document**: `app.documents.add()` creates a new
  document; A4 and single pages are set in `documentPreferences`. `doc(d)`
  tells basil to work with this document, `units(MM)` switches all
  coordinates to millimetres. `pageMargin` at the top of the script sets
  the margin.
- **`createPDF()` → text**: `readParagraphs()` reads `text.txt` as UTF-8
  and joins its lines into paragraphs. In InDesign, `\r` separates
  paragraphs. `text()` creates the frame; font and size come from
  `textFont()` and `textSize()`. They are also applied to `parentStory`,
  because basil formats only the text that fits into the frame. The first
  paragraph is the title: 24 pt bold. While the frame `overflows`, the
  script adds a page with `addPage()`, creates a new frame and links it
  with `nextTextFrame`, so long texts continue on the following pages.
- **`createPDF()` → images**: for every image (`jpg`, `jpeg`, `png`,
  `tif`), `addPage()` appends a page and `rect()` draws a frame inside the
  margins (without fill and stroke, see `noFill()` / `noStroke()`). The
  image is placed with `place()` and fitted with
  `FitOptions.PROPORTIONALLY` and `FitOptions.CENTER_CONTENT`. Use
  `FitOptions.FILL_PROPORTIONALLY` to fill the area instead.
- **`createPDF()` → export**: `savePDF()` exports with the last used PDF
  settings (by default *High Quality Print*), `close(false)` closes the
  document without saving an `.indd` file. To keep the InDesign files as
  well, save them with `d.save(new File(...))` before closing.
