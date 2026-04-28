#!/usr/bin/env python3

import json
import subprocess
from pathlib import Path
from datetime import datetime

def generate_playwright_code(batch_links):
    """Generate Playwright code for a batch of links."""
    links_json = json.dumps(batch_links, ensure_ascii=False)
    
    code = f'''async (page) => {{
  const links = {links_json};
  const results = {{}};
  const errors = [];
  
  for (let i = 0; i < links.length; i++) {{
    const link = links[i];
    try {{
      await page.goto(link.url, {{ waitUntil: 'networkidle', timeout: 30000 }});
      
      const data = await page.evaluate(() => {{
        const main = document.querySelector('main');
        if (!main) return null;
        
        return {{
          title: document.title,
          url: window.location.href,
          text_content: main.innerText.substring(0, 5000),
          headings: Array.from(main.querySelectorAll('h2, h3, h4')).map(h => ({{
            level: h.tagName.toLowerCase(),
            text: h.textContent.trim()
          }}))
        }};
      }});
      
      if (data) {{
        results[link.url] = {{
          letter: link.letter,
          title: link.title,
          type: link.type,
          url: link.url,
          scraped_at: new Date().toISOString(),
          content: data
        }};
      }} else {{
        errors.push({{ url: link.url, error: 'No main element' }});
      }}
    }} catch (e) {{
      errors.push({{ url: link.url, error: e.message }});
    }}
  }}
  
  return {{ 
    pages_scraped: Object.keys(results).length,
    errors: errors.length,
    results: results
  }};
}}'''
    
    return code

def main():
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
                'status': 'scraping'
            },
            'data': {},
            'errors': []
        }
        processed = 0
    
    # Filter out PDFs and already processed
    remaining = [link for link in all_links 
                 if link['url'] not in all_results['data'] 
                 and not link['url'].lower().endswith('.pdf')]
    
    print(f"Total: {len(all_links)}")
    print(f"Already scraped: {processed}")
    print(f"To scrape: {len(remaining)}\n")
    
    # Process in batches
    batch_size = 10  # Smaller batches for Playwright
    for batch_idx in range(0, len(remaining), batch_size):
        batch = remaining[batch_idx:batch_idx + batch_size]
        batch_num = batch_idx // batch_size + 1
        total_batches = (len(remaining) + batch_size - 1) // batch_size
        
        print(f"[{batch_num}/{total_batches}] Scraping {len(batch)} pages...")
        
        # Generate and save code
        code = generate_playwright_code(batch)
        
        # Call via curl to the Playwright API (if available) or save as CLI command
        code_file = Path('/Users/isak/Documents/GitHub/analysis_tool/.playwright-mcp/batch_code.js')
        with open(code_file, 'w', encoding='utf-8') as f:
            f.write(code)
        
        print(f"  Code generated: {code_file}")
        print(f"  First URL: {batch[0]['title'][:40]}")
        
        # Note: Actual execution would need to be done via the Playwright tool
        # This script generates the batches
        break  # For now, just show first batch

    print(f"\nNote: Use playwright-browser_run_code tool to execute the generated batch code")

if __name__ == '__main__':
    main()

