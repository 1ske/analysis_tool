#!/usr/bin/env python3

import json
import asyncio
import aiohttp
from pathlib import Path
from datetime import datetime
from bs4 import BeautifulSoup
import time

async def scrape_page(session, link, semaphore):
    """Scrape a single HTML page (skip PDFs)."""
    async with semaphore:
        # Skip PDFs and non-HTML documents
        if link['url'].lower().endswith('.pdf'):
            return None
        
        try:
            async with session.get(link['url'], timeout=aiohttp.ClientTimeout(total=30)) as resp:
                if resp.status == 200:
                    content_type = resp.headers.get('Content-Type', '')
                    if 'text/html' not in content_type:
                        return None
                    
                    html = await resp.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    main = soup.find('main')
                    
                    if main:
                        text_content = main.get_text()[:5000]
                        headings = []
                        for h in main.find_all(['h2', 'h3', 'h4']):
                            headings.append({
                                'level': h.name,
                                'text': h.get_text(strip=True)
                            })
                        
                        return {
                            'letter': link['letter'],
                            'title': link['title'],
                            'type': link['type'],
                            'url': link['url'],
                            'scraped_at': datetime.now().isoformat() + 'Z',
                            'content': {
                                'title': soup.title.string if soup.title else '',
                                'url': str(resp.url),
                                'text_content': text_content,
                                'headings': headings
                            }
                        }
        except Exception as e:
            return {'url': link['url'], 'error': str(e), 'type': 'html'}
    
    return None

async def scrape_batch(links):
    """Scrape a batch of links concurrently."""
    results = {}
    errors = []
    skipped = []
    semaphore = asyncio.Semaphore(5)  # Limit to 5 concurrent requests
    
    async with aiohttp.ClientSession() as session:
        tasks = []
        for link in links:
            if link['url'].lower().endswith('.pdf'):
                skipped.append(link['url'])
            else:
                task = scrape_page(session, link, semaphore)
                tasks.append(task)
        
        for task in asyncio.as_completed(tasks):
            result = await task
            if result:
                if 'error' in result:
                    errors.append(result)
                    print(f"✗ {result['url'][:60]}")
                elif result:
                    results[result['url']] = result
                    title = result['title'][:40]
                    print(f"✓ {title}")
    
    return results, errors, len(skipped)

async def main():
    # Load links
    with open('/Users/isak/Documents/GitHub/analysis_tool/links_to_scrape.json', 'r', encoding='utf-8') as f:
        all_links = json.load(f)
    
    output_file = Path('/Users/isak/Documents/GitHub/analysis_tool/kunskapsstod_content.json')
    
    # Load existing or create new
    if output_file.exists():
        with open(output_file, 'r', encoding='utf-8') as f:
            all_results = json.load(f)
        processed = len(all_results.get('data', {}))
    else:
        all_results = {
            'metadata': {
                'source': 'https://vardpersonal.1177.se/Ostergotland/kunskapsstod/',
                'started_at': datetime.now().isoformat(),
                'total_to_scrape': len(all_links),
                'html_pages': sum(1 for link in all_links if not link['url'].lower().endswith('.pdf')),
                'pdf_pages': sum(1 for link in all_links if link['url'].lower().endswith('.pdf')),
                'status': 'scraping'
            },
            'data': {},
            'errors': []
        }
        processed = 0
    
    html_count = sum(1 for link in all_links if not link['url'].lower().endswith('.pdf'))
    print(f"Total links: {len(all_links)} ({html_count} HTML, {len(all_links) - html_count} PDFs)")
    print(f"Already scraped HTML: {processed}")
    print()
    
    # Filter out already processed and PDFs
    remaining = [link for link in all_links 
                 if link['url'] not in all_results['data'] 
                 and not link['url'].lower().endswith('.pdf')]
    
    print(f"HTML pages to scrape: {len(remaining)}\n")
    
    # Scrape in batches
    batch_size = 30
    for i in range(0, len(remaining), batch_size):
        batch = remaining[i:i+batch_size]
        batch_num = i // batch_size + 1
        total_batches = (len(remaining) + batch_size - 1) // batch_size
        
        print(f"=== Batch {batch_num}/{total_batches} ({len(batch)} pages) ===")
        print(f"Progress: {len(all_results['data'])}/{html_count}")
        
        results, errors, skipped = await scrape_batch(batch)
        
        all_results['data'].update(results)
        all_results['errors'].extend(errors)
        all_results['metadata']['status'] = 'scraping' if len(remaining) - (i + batch_size) > 0 else 'completed'
        all_results['metadata']['pages_processed'] = len(all_results['data'])
        all_results['metadata']['pages_errors'] = len(all_results['errors'])
        
        # Save progress
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_results, f, ensure_ascii=False, indent=2)
        
        print(f"✓ Batch saved: {len(results)} new pages, {len(errors)} errors")
        print()
        
        if i + batch_size < len(remaining):
            time.sleep(0.5)  # Breath between batches
    
    print(f"\n{'='*50}")
    print(f"✓ COMPLETE!")
    print(f"  HTML pages scraped: {len(all_results['data'])}/{html_count}")
    print(f"  PDF pages (skipped): {len(all_links) - html_count}")
    print(f"  Errors: {len(all_results['errors'])}")
    print(f"  Total content size: {sum(len(json.dumps(v)) for v in all_results['data'].values()) / (1024*1024):.1f} MB")
    print(f"  Saved to: {output_file}")

if __name__ == '__main__':
    asyncio.run(main())

