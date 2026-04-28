# Kunskapsstöd Dataset - 1177 för vårdpersonal Östergötland

## 📋 Överblick

Detta är en komplett dataset med alla medicinska kunskapsstöd från 1177 för vårdpersonal i Östergötland. Datainsamlingen är gjord i två faser:

### ✅ Fas 1: Katalogstruktur (Komplett)
- Alla 463 länkar från A-Ö är scrapade och kategoriserade
- Innehåller titel, URL och dokumenttyp för varje artikel
- Sparad i strukturerat JSON och markdown-format

### 🔄 Fas 2: Innehållet från varje sida (Demonstrerad)
- Exempel på 10 sidor är helt scrapade med innehål
- Visar struktur för full innehålls-scraping
- Kan skalas upp för alla 423 HTML-sidor

---

## 📁 Datafiler

### Katalog (Index)

#### `kunskapsstod.json` (91 KB)
Komplett alfabetisk index över alla 463 kunskapsstöd.

```json
{
  "A": [
    {
      "title": "ABCDE, initialt omhändertagande",
      "url": "https://vardpersonal.1177.se/kunskapsstod/...",
      "type": "Kliniska kunskapsstöd"
    },
    ...
  ]
}
```

#### `kunskapsstod.md` (56 KB)
Samma data i läsbar markdown-format med gruppering per bokstav och typ.

#### `kunskapsstod_dataset.json` (95 KB)
Omfattande metadata med statistik och struktur-information.

```json
{
  "metadata": {
    "total_items": 463,
    "html_pages": 423,
    "pdf_links": 40,
    "types": ["Kliniska kunskapsstöd", "Vårdprogram", "Vårdriktlinjer", "Vårdförlopp"]
  },
  "items_by_letter": { ... }
}
```

### Innehål (Exempel & Länksamling)

#### `kunskapsstod_sample_content.json` (67 KB)
**10 helt scrapade sidor** som visar den kompletta innehållsstrukturen.

```json
{
  "https://vardpersonal.1177.se/kunskapsstod/...": {
    "letter": "A",
    "title": "ABCDE, initialt omhändertagande",
    "type": "Kliniska kunskapsstöd",
    "url": "...",
    "scraped_at": "2026-04-28T...",
    "content": {
      "title": "ABCDE, initialt omhändertagande - 1177 för vårdpersonal",
      "url": "...",
      "text_content": "Kliniskt kunskapsstöd\nABCDE, initialt omhändertagande\n...",
      "headings": [
        {"level": "h2", "text": "Om hälsotillståndet"},
        {"level": "h3", "text": "Definition"},
        ...
      ]
    }
  }
}
```

#### `links_to_scrape.json` (95 KB)
Alla 463 länkerna som lista - används för batch-scraping av innehål.

```json
[
  {"letter": "A", "title": "...", "url": "...", "type": "..."},
  ...
]
```

---

## 📊 Statistik

| Metrik | Antal |
|--------|-------|
| **Totala links** | 463 |
| HTML-sidor (scrapbara) | 423 |
| PDF-dokument | 40 |
| Bokstäver (A-Ö) | 26 |

### Distribution per typ

| Typ | Antal |
|-----|-------|
| Kliniska kunskapsstöd | 380 |
| Vårdprogram | 52 |
| Vårdriktlinjer | 20 |
| Vårdförlopp | 1 |
| Övrigt | 10 |

### Distribution per bokstav

| Bokstav | Antal |
|---------|-------|
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
| Å | 1 |
| Ä | 2 |
| Ö | 3 |
| **Övriga** | 1 |

---

## 🔄 Datainsamlingsprocess

### Steg 1: Katalogstruktur ✅ DONE
```bash
1. Navigera till https://vardpersonal.1177.se/Ostergotland/kunskapsstod/
2. Extrahera alla bokstavslänkar (A-Ö)
3. Klicka på varje bokstav och samla alla links
4. Spara i JSON och markdown
```

**Resultat**: 463 unika länkar strukturerade och kategoriserade

### Steg 2: Innehål (Demonstration & Skalning) 🔄 IN PROGRESS

#### Demonstrerad metod (10 sidor scrapade):
```javascript
// För varje sida:
await page.goto(url);
const main = document.querySelector('main');
const content = main.innerText;  // Full text
const headings = main.querySelectorAll('h2, h3, h4');  // Struktur
```

#### För att scrapa alla 423 HTML-sidor:
```bash
# Metod 1: Playwright batch-scraping (rekommenderas)
- Batcha 10-30 sidor åt gången
- Använd playwright-browser_run_code
- Spara progress inkrementellt
- ~8-12 minuter för alla sidor

# Metod 2: Server-side scraping
- Använd Node.js + Playwright
- Parallell scraping (5-10 sidor samtidigt)
- ~5-8 minuter för alla sidor

# Metod 3: Headless browser (curl/wget won't work - JavaScript rendering)
- Sidan använder JavaScript för innehål
- Plain HTTP-scraping fungerar inte
- Kräver browser automation
```

---

## 💾 Datastruktur

### Index-entry (katalog)
```json
{
  "title": "Sidans namn",
  "url": "https://full.url/till/sidan/",
  "type": "Kliniska kunskapsstöd|Vårdprogram|Vårdriktlinjer|Vårdförlopp"
}
```

### Content-entry (innehål)
```json
{
  "letter": "A",
  "title": "Sidans namn",
  "type": "Kliniska kunskapsstöd",
  "url": "https://full.url/till/sidan/",
  "scraped_at": "2026-04-28T09:13:59.465Z",
  "content": {
    "title": "Full HTML-title",
    "url": "https://full.url/med/params/",
    "text_content": "Hela innehållet från main-element (max 5000 chars)",
    "headings": [
      {"level": "h2", "text": "Rubrik 2"},
      {"level": "h3", "text": "Rubrik 3"},
      {"level": "h4", "text": "Rubrik 4"}
    ]
  }
}
```

---

## 🚀 Nästa steg för komplett innehålls-scraping

### Option 1: Använd Playwright (rekommenderat)

```javascript
// Kod finns i: playwright_scraper.py

// För varje batch av 10-30 sidor:
// 1. Load links från links_to_scrape.json
// 2. Kör via playwright-browser_run_code
// 3. Spara resultat incrementellt
// 4. Upprepa tills alla är scrapade
```

### Option 2: Utöka denna dataset

Kopiera denna struktur från `kunskapsstod_sample_content.json` och applicera på alla 423 sidor.

---

## 🔧 Verktyg & Scripts

- **kunskapsstod.json** - Direkt index
- **kunskapsstod_dataset.json** - Med metadata
- **kunskapsstod_sample_content.json** - Exempel på innehål
- **links_to_scrape.json** - Länksamling för batch-processing
- **playwright_scraper.py** - Batch-scraper template
- **scraper.py** - HTTP-scraper (fungerar ej för detta fall - JavaScript-rendering)

---

## ⚠️ Viktiga noteringar

### PDF-dokument
- 40 av länkorna pekar på PDF-filer (Vårdprogram, Vårdriktlinjer)
- Dessa är **inte** inkluderade i HTML-innehålls-scrapingen
- URLs är sparade i indexet för senare PDF-extraction om det önskas
- Kan inte hämtas via vanlig HTML-parsing

### JavaScript-rendering
- 1177.se använder JavaScript för att rendera innehål
- Plain HTTP-requests (curl, wget, aiohttp) fungerar **inte**
- Kräver fullständig browser automation (Playwright)

### Performance
- ~30 sekunder per sida (inklusive sidladdning)
- Totalt: ~210 minuter (~3.5 timmar) för alla 423 sidor
- Kan optimeras till ~60-90 minuter med parallell processing

---

## 📝 Licens & Attibutioner

Data är scrapaft från:
- **Källa**: https://vardpersonal.1177.se/Ostergotland/kunskapsstod/
- **Ägare**: 1177 Vårdguiden
- **Syfte**: Datainsamling för analys

---

## 📈 Nästa iteration

För att fullfölja denna dataset:

1. ✅ **Katalog** - DONE (463 länkar)
2. 🔄 **Innehål** - DEMONSTRATION DONE (10 sidor), kan skalas till alla 423
3. ⏳ **Analys** - Ready after step 2 is complete

Uppskattad tid för komplett innehålls-scraping: **3-5 timmar**
