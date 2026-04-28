import json
import re
from datetime import datetime
import sys

def save_batch_result(batch_num, json_output):
    """Parse JSON from playwright output and merge into content file"""
    # Extract JSON
    match = re.search(r'\{"pages_scraped"', json_output)
    if not match:
        print(f"ERROR: Could not find JSON in batch {batch_num}")
        return False
    
    json_str = json_output[match.start():]
    
    # Parse JSON with fallback for incomplete
    try:
        result = json.loads(json_str)
    except json.JSONDecodeError:
        depth = 0
        in_str = False
        escape = False
        end_pos = 0
        for i, char in enumerate(json_str):
            if escape:
                escape = False
                continue
            if char == '\\':
                escape = True
                continue
            if char == '"' and not escape:
                in_str = not in_str
                continue
            if not in_str:
                if char == '{':
                    depth += 1
                elif char == '}':
                    depth -= 1
                    if depth == 0:
                        end_pos = i + 1
                        break
        
        if end_pos == 0:
            print(f"ERROR: Could not parse JSON from batch {batch_num}")
            return False
        result = json.loads(json_str[:end_pos])
    
    # Load content file
    with open('kunskapsstod_content.json', 'r') as f:
        data = json.load(f)
    
    # Merge
    for url, page in result['results'].items():
        data['data'][url] = page
    for err in result['errors']:
        data['errors'].append(err)
    
    # Update metadata
    data['metadata']['pages_processed'] += result['pages_scraped']
    data['metadata']['pages_errors'] += result['errors_count']
    data['metadata']['last_updated'] = datetime.now().isoformat()
    
    # Save
    with open('kunskapsstod_content.json', 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    return True

if __name__ == '__main__':
    batch_num = int(sys.argv[1])
    json_data = sys.argv[2]
    if save_batch_result(batch_num, json_data):
        # Print summary
        with open('kunskapsstod_content.json', 'r') as f:
            data = json.load(f)
        meta = data['metadata']
        print(f"✓ Batch {batch_num}: Total {meta['pages_processed']} pages, {meta['pages_errors']} errors")
