#!/usr/bin/env python3
"""
Process all batches using Playwright browser automation.
This script reads batch files and processes them using the browser.
"""

import json
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

def extract_json_from_output(output_text):
    """Extract JSON from browser output."""
    # Find the JSON part using regex
    match = re.search(r'\{"pages_scraped":\d+', output_text)
    if not match:
        return None
    
    start_idx = match.start()
    
    # Try to find valid JSON by working backwards from end
    for end_idx in range(len(output_text), start_idx, -1):
        test_str = output_text[start_idx:end_idx]
        try:
            data = json.loads(test_str)
            if 'pages_scraped' in data and 'results' in data:
                return data
        except json.JSONDecodeError:
            pass
    
    return None

def generate_extraction_code(batch_links):
    """Generate JavaScript extraction code for a batch."""
    links_json = json.dumps(batch_links)
    
    code = f"""
async (page) => {{
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
  
  return {{ pages_scraped: Object.keys(results).length, errors_count: errors.length, results: results, errors: errors }};
}}
"""
    return code.strip()

def process_batch(batch_num, batch_links):
    """Process a single batch using Playwright."""
    print(f"\n{'='*60}")
    print(f"Processing Batch {batch_num} ({len(batch_links)} pages)")
    print(f"{'='*60}")
    
    # Generate extraction code
    code = generate_extraction_code(batch_links)
    
    # Save code to temp file
    code_file = f"batch_{batch_num}_code.js"
    with open(code_file, 'w') as f:
        f.write(code)
    
    # Execute with Playwright (using a wrapper command)
    try:
        # This would be called from the main tool
        # For now, just return the code for processing
        return code
    except Exception as e:
        print(f"Error processing batch {batch_num}: {e}")
        return None

def merge_batch_results(batch_num, batch_result):
    """Merge batch results into the main content file."""
    # Load content file
    with open('kunskapsstod_content.json', 'r') as f:
        content_data = json.load(f)
    
    # Update with batch results
    content_data['data'].update(batch_result['results'])
    content_data['metadata']['pages_processed'] += batch_result['pages_scraped']
    content_data['metadata']['pages_errors'] += batch_result['errors_count']
    content_data['metadata']['last_updated'] = datetime.now().isoformat()
    if 'errors' in batch_result:
        content_data['errors'].extend(batch_result['errors'])
    
    # Save updated content
    with open('kunskapsstod_content.json', 'w') as f:
        json.dump(content_data, f, ensure_ascii=False, indent=2)
    
    # Print progress
    total_target = content_data['metadata']['total_to_scrape']
    processed = content_data['metadata']['pages_processed']
    errors = content_data['metadata']['pages_errors']
    remaining = total_target - processed - errors
    
    print(f"✓ Batch {batch_num} merged: {batch_result['pages_scraped']} pages extracted, {batch_result['errors_count']} errors")
    print(f"  Progress: {processed}/{total_target} pages ({100*processed//total_target}%)")
    print(f"  Remaining: {remaining} pages")
    
    return content_data

if __name__ == "__main__":
    # List batch files
    batch_files = sorted(Path('.').glob('batch_*.json'))
    print(f"Found {len(batch_files)} batch files")
    
    for batch_file in batch_files[:3]:
        with open(batch_file, 'r') as f:
            batch = json.load(f)
        batch_num = int(batch_file.stem.split('_')[1])
        print(f"Batch {batch_num}: {len(batch)} links")
