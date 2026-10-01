# Basil.js: Text and Images

[English](README.md)

Ein InDesign-Script, das aus allen Ordnern in `source/` ein PDF macht:
jeder Ordner beginnt auf einer neuen Seite mit dem Text aus `text.txt`,
danach folgt jedes Bild aus dem Ordner auf einer eigenen Seite. Es legt
ein neues Dokument an, füllt es Ordner für Ordner und exportiert das PDF;
das Dokument bleibt offen, damit man das Layout prüfen und verfeinern kann
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
   InDesign erwartet die Bibliothek deshalb in `~/Documents/basiljs`. Das
   Installations-Script kopiert sie dorthin. Ein Terminal im Ordner des
   Repositorys öffnen und ausführen:
   - **macOS**: `./install_basil.sh`
   - **Windows**: `powershell -ExecutionPolicy Bypass -File install_basil.ps1`

   Ist basil.js schon installiert (z. B. von einem anderen
   Basil-Beispiel), lässt das Script es unverändert und meldet das.

   Statt einer Kopie geht auch ein symbolischer Link; die Bibliothek bleibt
   dann im Repository:
   ```sh
   ln -s "/pfad/zu/Indesign_Basil_Batch_TextAndImages/basiljs" ~/Documents
   ```
   Oder die Zeile `@includepath` auf den Ort ändern, an dem die Bibliothek
   tatsächlich liegt.
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

Während das Script läuft, nicht in InDesign klicken, sondern auf die
Meldung warten. Das neue Dokument bleibt danach offen; wer die
InDesign-Datei behalten will, speichert es.

## Coding-Hilfe

Die Scripts sind in ExtendScript geschrieben (ein alter
JavaScript-Dialekt). Ein Basil-Script definiert `draw()` und optional
`setup()`, das einmal davor läuft; basil ruft beide automatisch auf, sobald
die Bibliothek eingebunden ist. Das Script verwendet basil-Funktionen, wo
immer basil eine hat; alle stehen in der
[basil.js-Referenz](https://basiljs2.netlify.app/reference/).

- **`setup()`**: `selectFolder()` öffnet den Ordner-Dialog und speichert
  den gewählten Ordner in `sourceFolder`.
- **`draw()` → Dokument**: `app.documents.add()` legt ein neues Dokument
  mit Einzelseiten an, `doc()` sagt basil, damit zu arbeiten, `units(MM)`
  stellt alle Koordinaten auf Millimeter um und `size(210, 297)` setzt A4.
  `app.pdfExportPreferences.pageRange` wird auf alle Seiten gesetzt, sonst
  verwendet InDesign den Seitenbereich des letzten Exports.
- **`draw()` → Ordner**: `getFiles()` listet die Unterordner auf, sie
  werden nach Namen sortiert, und `forEach()` ruft für jeden `addItem()`
  auf.
- **`startPage()`**: verwendet Seite 1 für den ersten Inhalt und hängt für
  alles Weitere mit `addPage()` eine neue Seite an; so beginnt jeder
  Ordner und jedes Bild auf einer eigenen Seite. `margins(pageMargin)`
  setzt die Ränder der Seite, `canvasMode(MARGIN)` lässt basil innerhalb
  davon zeichnen: `(0, 0)` ist die obere linke Ecke des Satzspiegels,
  `width` und `height` sind die Grösse der Fläche innerhalb der Ränder.
- **`addItem()` → Text**: `readParagraphs()` liest `text.txt` mit
  `loadStrings()` (als UTF-8, gesetzt mit `encoding` auf dem `File`),
  bereinigt die Zeilen mit `trim()` und fügt sie mit `join()` zu Absätzen
  zusammen. In InDesign trennt `\r` die Absätze.
  `text(…, 0, 0, width, height)` erzeugt den Rahmen; Schrift, Grösse und
  Ausrichtung kommen von `textFont()`, `textSize()` und `textAlign()`, die
  Textfarbe von `fill()`. `fill()` muss für jeden Text neu gesetzt werden,
  weil die Bildrahmen es mit `noFill()` ausschalten – sonst wäre der Text
  unsichtbar.
- **`addItem()` → Formatierung**: basil formatiert nur den Text, der in
  den Rahmen passt; deshalb wendet `typo()` Schrift und Grösse auf die
  ganze `parentStory` an. `paragraphs(frame)[0]` ist der Titel: 24 pt
  fett. Solange der Rahmen `overflows` (Übersatz hat), fügt `startPage()`
  eine Seite an, `text()` einen neuen Rahmen, und `linkTextFrames()`
  verkettet ihn mit dem vorherigen; lange Texte laufen so auf den
  folgenden Seiten weiter.
- **`addItem()` → Bilder**: `files(ordner, {filter: […]})` listet die
  Bilder auf (`jpg`, `jpeg`, `png`, `tif`). Für jedes zeichnet
  `rect(0, 0, width, height)` einen Rahmen innerhalb der Ränder (ohne
  Fläche und Kontur, siehe `noFill()` / `noStroke()`), und
  `image(datei, rahmen)` setzt das Bild hinein. `image()` füllt den Rahmen
  und beschneidet das Bild; deshalb wird es mit
  `FitOptions.PROPORTIONALLY` und `FitOptions.CENTER_CONTENT` neu
  eingepasst. Ohne diese zwei Zeilen füllt es die Fläche.
- **`draw()` → Export**: `file()` beschreibt `output/document.pdf`,
  `savePDF()` legt den Ordner `output` bei Bedarf an und exportiert mit den
  zuletzt verwendeten PDF-Einstellungen (standardmässig *Qualitativ
  hochwertiger Druck*). Das Dokument bleibt offen und ungespeichert. Bei
  einem Stapellauf über viele Dokumente schliesst man jedes nach dem
  Export mit `close(false)` (ohne zu speichern) oder speichert es mit
  `doc().save(new File(...))`.
