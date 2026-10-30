# Design – Hörschmiede Boo

## Welt

Die Seite ist aus dem echten Beratungsraum in Horgen abgeleitet: weiss gestrichene Backsteinwand,
anthrazitfarbene Möbel, senfgelbe Sessel und das Messing des Logos. Die Signatur ist das **Audiogramm**,
die Notation, die jede Hörakustikerin und jeder Kunde vom Hörtest kennt. Im Hero hebt sich die Kurve
vom Hörverlust zum versorgten Hören; das ist die eine inszenierte Bewegung der Seite.

Szene: ältere Menschen und ihre Angehörigen, oft am Tablet oder Handy, bei Tageslicht zu Hause.
Daraus folgen der helle Grund, grosse Schrift (18 px Basis), grosse Klickflächen (min. 52 px) und
eine Telefonnummer, die immer sichtbar ist.

## Tokens (`css/site.css`)

| Rolle | Token | Wert |
|---|---|---|
| Grund | `--chalk` | `#F1F1EE` |
| Flächen | `--paper` | `#FFFFFF` |
| Text | `--ink` | `#1C1C1A` |
| Sekundärtext | `--ink-2` | `#47474A` |
| Dunkle Sektion | `--graphite` | `#26272A` |
| Akzentfläche | `--mustard` | `#E3A82B` |
| Text auf Senf | `--mustard-ink` | `#3A2A05` |
| Linien | `--rule` | `#D6D5CF` |

Farbstrategie: *Committed*. Senf besetzt ganze Flächen (Hero, Bewertungen, Unterseiten-Hero), nicht einzelne Akzente.

## Schrift

- **Archivo** (variabel, 82–90 % Breite, 750–850) für Überschriften, Wortmarke, Ziffern im Ablauf.
- **Atkinson Hyperlegible Next** für Fliesstext: entworfen für Menschen mit eingeschränktem Sehvermögen,
  passend für ein älteres Publikum.
- Beide lokal unter `fonts/` (keine Verbindung zu Google Fonts).

## Formensprache

- Bedienelemente rund (Pill), Fotos und Flächen fast eckig (4 px).
- Gliederung über Linien: 2 px Anthrazit über Gruppen, 1 px `--rule` zwischen Einträgen. Keine Karten-Raster.
- Icons: eigene SVG-Symbole (Strich 1.9, runde Enden) im Sprite oben in jeder Seite.

## Interaktion

- **Hörprobe**: Web-Audio-Synthese (Brummen, Uhr-Ticken, Vogelgezwitscher) durch zwei Tiefpässe;
  drei Stufen simulieren Hochtonverlust. Startet nur auf Klick, stoppt beim Tab-Wechsel.
- **Öffnungsstatus**: live aus den Öffnungszeiten (Zeitzone Europe/Zurich), heutiger Tag in der Tabelle markiert.
- Bewegungen respektieren `prefers-reduced-motion`.

## Dateien

- `css/site.css` – gesamtes Design-System für alle Seiten
- `js/site.js` – Header, Mobile-Menü, FAQ-Akkordeon (alle Seiten)
- `js/home.js` – Startseite: Status, Audiogramm, Hörprobe, Formular, Karte, Lightbox
