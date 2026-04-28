#!/usr/bin/env python3

import json
from pathlib import Path
from datetime import datetime

# Read the directory index we scraped earlier
with open('/Users/isak/Documents/GitHub/analysis_tool/kunskapsstod.json', 'r', encoding='utf-8') as f:
    index = json.load(f)

# Create comprehensive dataset
dataset = {
    'metadata': {
        'source': 'https://vardpersonal.1177.se/Ostergotland/kunskapsstod/',
        'title': 'Kunskapsstöd - 1177 för vårdpersonal Östergötland',
        'description': 'Complete index of medical knowledge support materials for healthcare professionals',
        'last_updated': datetime.now().isoformat(),
        'total_items': sum(len(items) for items in index.values()),
        'data_collection_phase': True,
        'content_status': 'Directory scraped successfully. Full page content can be collected via Playwright browser automation.',
        'pdf_links': 40,
        'html_pages': 423,
        'total_links': 463
    },
    'structure': {
        'letters': sorted(index.keys()),
        'types': ['Kliniska kunskapsstöd', 'Vårdprogram', 'Vårdriktlinjer', 'Vårdförlopp']
    },
    'items_by_letter': {}
}

# Add organized items
for letter in sorted(index.keys()):
    items = index[letter]
    dataset['items_by_letter'][letter] = {
        'count': len(items),
        'items': items
    }

# Save comprehensive dataset
output_file = '/Users/isak/Documents/GitHub/analysis_tool/kunskapsstod_dataset.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(dataset, f, ensure_ascii=False, indent=2)

print(f"✓ Created comprehensive dataset: {output_file}")
print(f"  Total items: {dataset['metadata']['total_items']}")
print(f"  Letters: {len(dataset['structure']['letters'])}")
print(f"  HTML pages: {dataset['metadata']['html_pages']}")
print(f"  PDF documents: {dataset['metadata']['pdf_links']}")

# Create markdown summary
markdown = f"""# Kunskapsstöd - 1177 för vårdpersonal Östergötland

## Sammanfattning

Denna dataset innehåller en komplett index av medicinskkunskapsstöd från 1177 för vårdpersonal i Östergötland.

- **Källa**: [1177 för vårdpersonal - Kunskapsstöd](https://vardpersonal.1177.se/Ostergotland/kunskapsstod/)
- **Uppdaterad**: {datetime.now().isoformat()}
- **Status**: Datainsamlingsfas - katalogstruktur helt scrappad

## Statistik

- **Totalt antal länkar**: {dataset['metadata']['total_items']}
- **HTML-sidor**: {dataset['metadata']['html_pages']} (kan scrapas för fullt innehål)
- **PDF-dokument**: {dataset['metadata']['pdf_links']} (inte inkluderade i denna version)
- **Bokstäver A-Ö**: {len(dataset['structure']['letters'])}
- **Dokumenttyper**: {len(dataset['structure']['types'])}

## Dokumenttyper

"""

# Count by type
type_counts = {}
for letter in index.values():
    for item in letter:
        item_type = item['type']
        type_counts[item_type] = type_counts.get(item_type, 0) + 1

for item_type, count in sorted(type_counts.items()):
    markdown += f"- **{item_type}**: {count} st\n"

markdown += f"""

## Distribution per bokstav

| Bokstav | Antal |
|---------|-------|
"""

for letter in sorted(index.keys()):
    count = len(index[letter])
    markdown += f"| {letter} | {count} |\n"

total = sum(len(items) for items in index.values())
markdown += f"| **Totalt** | **{total}** |\n"

markdown += f"""

## Datafiler

- **kunskapsstod.json** - Komplett index strukturerad per bokstav
- **kunskapsstod.md** - Samma data i markdown-format
- **kunskapsstod_dataset.json** - Denna dataset med metadata och statistik
- **links_to_scrape.json** - Alla 463 länkar för vidare bearbetning
- **README_SCRAPING.md** - Instruktioner för att scrapa innehål från varje sida

## Struktur

Varje item i indexet innehåller:

```json
{{
  "title": "Sidans titel",
  "url": "https://vardpersonal.1177.se/...",
  "type": "Kliniska kunskapsstöd|Vårdprogram|Vårdriktlinjer|Vårdförlopp"
}}
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
"""

markdown_file = '/Users/isak/Documents/GitHub/analysis_tool/README_SCRAPING.md'
with open(markdown_file, 'w', encoding='utf-8') as f:
    f.write(markdown)

print(f"✓ Created README: {markdown_file}")

