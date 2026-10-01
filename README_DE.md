# Basil.js: Text and Images

[English](README.md)

Ein InDesign-Script, das aus allen Ordnern in `source/` ein PDF macht:
jeder Ordner beginnt auf einer neuen Seite mit dem Text aus `text.txt`,
danach folgt jedes Bild aus dem Ordner auf einer eigenen Seite. Es legt
ein neues Dokument an, füllt es Ordner für Ordner, exportiert das PDF und
schliesst das Dokument wieder
– ein Stapellauf statt Layouten von Hand. Geschrieben mit
[basil.js](https://basiljs2.netlify.app), einer Bibliothek, die die Idee von
Processing nach InDesign bringt.

## Installation

Voraussetzungen: Adobe InDesign. Die Bibliothek liegt in `basiljs/`
(basil.js 2.0.0-beta, Build 2025-01-19; basil.js steht unter der
MIT-Lizenz); das Script liegt in `Basil Scripts/batch_pdf/batch_pdf.jsx`.

1. Basil-Scripts laden die Bibliothek mit diesen zwei Zeilen:
   ```js
   // @includepath "~/Documents/;%USERPROFILE%Documents";
   // @include "basiljs/basil.js";
   ```
   InDesign erwartet die Bibliothek deshalb in `~/Documents/basiljs`. Am
   einfachsten geht das mit einem symbolischen Link:
   ```sh
   ln -s "/pfad/zu/Indesign_Basil_Batch_TextAndImages/basiljs" ~/Documents
   ```
   Gibt es `~/Documents/basiljs` schon (z. B. von einem anderen
   Basil-Beispiel), kann es bleiben. Alternativ die Zeile `@includepath`
   auf den Ort ändern, an dem die Bibliothek tatsächlich liegt.
2. In InDesign das Scripts-Panel öffnen (*Fenster → Hilfsprogramme →
   Skripte*), mit Rechtsklick auf den Ordner *Benutzer* *Im Finder
   anzeigen* wählen und den Ordner `Basil Scripts` dort hinein verlinken:
   ```sh
   ln -s "/pfad/zu/Indesign_Basil_Batch_TextAndImages/Basil Scripts" "/pfad/zum/angezeigten/Scripts Panel"
   ```

Mehr zur Einrichtung: die offizielle
[Getting-Started-Anleitung](https://basiljs2.netlify.app/tutorials/01-getting-started/).
Alle Funktionen: [basil.js-Referenz](https://basiljs2.netlify.app/reference/).

## Ausführen

Das Ausgangsmaterial liegt in `source/`, ein Ordner pro Abschnitt:

```
source/
  glacier/
    text.txt     erste Zeile: Titel; eine Leerzeile beginnt einen neuen Absatz
    01.jpg       Bilder (jpg, png, tif), in alphabetischer Reihenfolge gesetzt
    02.jpg
  harbour/
    ...
```

Im Scripts-Panel auf `batch_pdf.jsx` doppelklicken und den Ordner
`source` wählen. Das Script erzeugt `output/document.pdf` (A4, 20 mm
Rand, Ordner in alphabetischer Reihenfolge) in einem Ordner `output` neben
`source` und meldet, wie viele Ordner es gespeichert hat. Ein bestehendes
PDF wird überschrieben. Die Ordner in `source/` durch eigenes Material
ersetzen und das Script nochmals ausführen.

Während das Script läuft, öffnet und schliesst sich das Dokument; erst
nach der Meldung wieder in InDesign klicken.

## Coding-Hilfe

Die Scripts sind in ExtendScript geschrieben (ein alter
JavaScript-Dialekt). Ein Basil-Script definiert `draw()` und optional
`setup()`, das einmal davor läuft; basil ruft beide automatisch auf, sobald
die Bibliothek eingebunden ist.

- **`setup()`**: öffnet `Folder.selectDialog()` und speichert den
  gewählten Ordner in `sourceFolder`.
- **`draw()`**: legt daneben den Ordner `output` an, setzt
  `app.pdfExportPreferences.pageRange` auf alle Seiten (sonst verwendet
  InDesign den Seitenbereich des letzten Exports), listet die Unterordner mit `getFiles()` auf, legt das Dokument an und
  ruft für jeden Ordner `addItem()` auf. Am Schluss exportiert und
  schliesst es das Dokument.
- **`draw()` → Dokument**: `app.documents.add()` legt ein neues
  Dokument an; A4 und Einzelseiten werden in `documentPreferences`
  gesetzt. `doc(d)` sagt basil, mit diesem Dokument zu arbeiten,
  `units(MM)` stellt alle Koordinaten auf Millimeter um. `pageMargin` oben
  im Script bestimmt den Rand.
- **`nextPage()`**: verwendet Seite 1 für den ersten Inhalt und hängt für
  alles Weitere mit `addPage()` eine neue Seite an; so beginnt jeder
  Ordner und jedes Bild auf einer eigenen Seite.
- **`addItem()` → Text**: `readParagraphs()` liest `text.txt` als UTF-8
  und fügt die Zeilen zu Absätzen zusammen. In InDesign trennt `\r` die
  Absätze. `text()` erzeugt den Rahmen; Schrift und Grösse kommen von
  `textFont()` und `textSize()`. Sie werden zusätzlich auf `parentStory`
  angewendet, weil basil nur den Text formatiert, der in den Rahmen passt.
  Der erste Absatz ist der Titel: 24 pt fett. Solange der Rahmen
  `overflows` (Übersatz hat), fügt das Script mit `addPage()` eine Seite
  an, erzeugt einen neuen Rahmen und verkettet ihn mit `nextTextFrame`;
  lange Texte laufen so auf den folgenden Seiten weiter.
- **`addItem()` → Bilder**: Für jedes Bild (`jpg`, `jpeg`, `png`,
  `tif`) beginnt `nextPage()` eine Seite, und `rect()` zeichnet einen
  Rahmen innerhalb der Ränder (ohne Fläche und Kontur, siehe `noFill()` /
  `noStroke()`). Das Bild wird mit `place()` gesetzt und mit
  `FitOptions.PROPORTIONALLY` und `FitOptions.CENTER_CONTENT` eingepasst.
  Mit `FitOptions.FILL_PROPORTIONALLY` füllt es stattdessen die Fläche.
- **`draw()` → Export**: `savePDF()` exportiert mit den zuletzt
  verwendeten PDF-Einstellungen (standardmässig *Qualitativ hochwertiger
  Druck*), `close(false)` schliesst das Dokument, ohne eine `.indd`-Datei
  zu speichern. Um die InDesign-Datei ebenfalls zu behalten, sie vor dem Schliessen mit `d.save(new File(...))` speichern.
