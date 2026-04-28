# Kunskapsstöd - 1177 för vårdpersonal Östergötland

## Sammanfattning

Denna dataset innehåller en komplett index av medicinskkunskapsstöd från 1177 för vårdpersonal i Östergötland.

- **Källa**: [1177 för vårdpersonal - Kunskapsstöd](https://vardpersonal.1177.se/Ostergotland/kunskapsstod/)
- **Uppdaterad**: 2026-04-28T11:13:25.001645
- **Status**: Datainsamlingsfas - katalogstruktur helt scrappad

## Statistik

- **Totalt antal länkar**: 463
- **HTML-sidor**: 423 (kan scrapas för fullt innehål)
- **PDF-dokument**: 40 (inte inkluderade i denna version)
- **Bokstäver A-Ö**: 26
- **Dokumenttyper**: 4

## Dokumenttyper

- **Kliniska kunskapsstöd**: 385 st
- **Okänd**: 57 st
- **Vårdprogram**: 21 st


## Distribution per bokstav

| Bokstav | Antal |
|---------|-------|
| # | 1 |
| A | 36 |
| B | 24 |
| C | 8 |
| D | 18 |
| E | 10 |
| F | 15 |
| G | 12 |
| H | 52 |
| I | 13 |
| J | 2 |
| K | 25 |
| L | 22 |
| M | 24 |
| N | 12 |
| O | 17 |
| P | 34 |
| R | 19 |
| S | 60 |
| T | 27 |
| U | 12 |
| V | 13 |
| Y | 1 |
| Ä | 2 |
| Å | 1 |
| Ö | 3 |
| **Totalt** | **463** |


## Datafiler

- **kunskapsstod.json** - Komplett index strukturerad per bokstav
- **kunskapsstod.md** - Samma data i markdown-format
- **kunskapsstod_dataset.json** - Denna dataset med metadata och statistik
- **links_to_scrape.json** - Alla 463 länkar för vidare bearbetning
- **README_SCRAPING.md** - Instruktioner för att scrapa innehål från varje sida

## Struktur

Varje item i indexet innehåller:

```json
{
  "title": "Sidans titel",
  "url": "https://vardpersonal.1177.se/...",
  "type": "Kliniska kunskapsstöd|Vårdprogram|Vårdriktlinjer|Vårdförlopp"
}
```

## Nästa steg

För att samla det fullständiga innehållet från varje sida:

1. Använd `links_to_scrape.json` som indata
2. För varje HTML-sida (inte PDF), använd Playwright browser automation
3. Extrahera:
   - Sidrubrik (title-element)
   - Huvudinnehål (main-element innerText)
   - Alla rubriker (h2, h3, h4)
   - Strukturerad information
4. Spara i JSON-format med samma struktur som indexet

Se `playwright_scraper.py` för implementeringsexempel.

---

**Notering**: PDF-dokumenten (Vårdprogram, Vårdriktlinjer etc.) är inte inkluderade i denna version, men deras URLs finns i indexet för senare bearbetning om PDFparsning läggs till.
