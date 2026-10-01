# Basil.js: Text and Images

[Deutsch](README_DE.md)

An InDesign script that turns all folders in `source/` into one PDF:
every folder starts on a new page with the text from `text.txt`, followed
by every image in the folder on a page of its own. It creates a new
document, fills it folder by folder and exports the PDF; the document
stays open, so you can check and refine the layout – a batch run instead
of layouting by hand. Written with
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
   install script copies it there. Open a terminal in the repository
   folder and run
   - **macOS**: `./install_basil.sh`
   - **Windows**: `powershell -ExecutionPolicy Bypass -File install_basil.ps1`

   If basil.js is already installed (e.g. from another basil example), the
   script leaves it as it is and tells you so.

   Instead of a copy, you can also create a symbolic link, which keeps the
   library in the repository:
   ```sh
   ln -s "/path/to/Indesign_Basil_Batch_TextAndImages/basiljs" ~/Documents
   ```
   Or change the `@includepath` line to where the library actually lives.
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

Don't click into InDesign while the script runs, wait until the message
appears. The new document stays open afterwards; save it if you want to
keep the InDesign file.

## Coding Help

Scripts are written in ExtendScript (an old dialect of JavaScript). A basil
script defines `draw()` and optionally `setup()`, which runs once before it;
basil calls both automatically once the library is included. The script
uses basil functions wherever basil has one; the full list is in the
[basil.js reference](https://basiljs2.netlify.app/reference/).

- **`setup()`**: `selectFolder()` opens the folder dialog and stores the
  chosen folder in `sourceFolder`.
- **`draw()` → document**: `app.documents.add()` creates a new document
  with single pages, `doc()` tells basil to work with it, `units(MM)`
  switches all coordinates to millimetres and `size(210, 297)` sets A4.
  `app.pdfExportPreferences.pageRange` is set to all pages, otherwise
  InDesign reuses the page range of the last export.
- **`draw()` → folders**: `getFiles()` lists the subfolders, they are
  sorted by name and `forEach()` calls `addItem()` for each of them.
- **`startPage()`**: uses page 1 for the first content and appends a new
  page with `addPage()` for everything after it, so every folder and every
  image starts on a page of its own. `margins(pageMargin)` sets the margins
  of the page, `canvasMode(MARGIN)` makes basil draw inside them: `(0, 0)`
  is the top left margin corner, `width` and `height` are the size of the
  area inside the margins.
- **`addItem()` → text**: `readParagraphs()` reads `text.txt` with
  `loadStrings()` (as UTF-8, set on the `File` with `encoding`), `trim()`s
  the lines and `join()`s them into paragraphs. In InDesign, `\r`
  separates paragraphs. `text(…, 0, 0, width, height)` creates the frame;
  font, size and alignment come from `textFont()`, `textSize()` and
  `textAlign()`, the text colour from `fill()`. `fill()` has to be set
  again for every text, because the image frames switch it off with
  `noFill()` – without it, the text would be invisible.
- **`addItem()` → formatting**: basil formats only the text that fits into
  the frame, so `typo()` applies font and size to the whole
  `parentStory`. `paragraphs(frame)[0]` is the title: 24 pt bold. While the
  frame `overflows`, `startPage()` adds a page, `text()` a new frame, and
  `linkTextFrames()` threads it to the previous one, so long texts continue
  on the following pages.
- **`addItem()` → images**: `files(folder, {filter: […]})` lists the images
  (`jpg`, `jpeg`, `png`, `tif`). For each, `rect(0, 0, width, height)`
  draws a frame inside the margins (without fill and stroke, see
  `noFill()` / `noStroke()`), and `image(file, frame)` places the image in
  it. `image()` fills the frame and crops the image, so it is fitted again
  with `FitOptions.PROPORTIONALLY` and `FitOptions.CENTER_CONTENT`. Leave
  these two lines out to fill the area instead.
- **`draw()` → export**: `file()` describes `output/document.pdf`,
  `savePDF()` creates the `output` folder if needed and exports with the
  last used PDF settings (by default *High Quality Print*). The document
  stays open and unsaved. In a batch run over many documents, close each
  one after the export with `close(false)` (without saving) or save it
  with `doc().save(new File(...))`.
