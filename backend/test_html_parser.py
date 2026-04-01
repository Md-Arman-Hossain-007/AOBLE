import re
import json

def test_parse():
    try:
        html = open('opensanctions_raw.html').read()
    except FileNotFoundError:
        print("Raw HTML file not found.")
        return

    entity_id = 'Q19878'
    properties = {}
    
    # Split by table rows to avoid catastrophic backtracking
    rows = html.split('<tr>')
    print(f"Total rows to check: {len(rows)}")
    
    for row in rows:
        if f'/statements/{entity_id}/?prop=' in row:
            # Find the prop name
            prop_match = re.search(r'prop=([^"& ]+)', row)
            if prop_match:
                prop_name = prop_match.group(1)
                # Find values: look for text inside spans or tags that isn't a known spacer/badge
                # We prioritize text that isn't inside a badge or text-muted span if possible, 
                # but for simplicity we'll just take all non-blank strings
                values = re.findall(r'>([^<]{2,})<', row)
                clean_values = [v.strip() for v in values if v.strip() and v.strip() != '·' and not v.strip().startswith('[') and 'badge' not in v]
                
                if clean_values:
                    # The first value is usually the label (e.g. "Aliases"), subsequent ones are values
                    # But the label is also in the <th>, and values in <td>.
                    # Let's be smart: if there's a <th>, that's the label.
                    if prop_name not in properties:
                        properties[prop_name] = []
                    
                    # Add all values that aren't the label itself if we can identify it
                    # For now, just add all and we can clean up if needed
                    properties[prop_name].extend(clean_values)

    print(f"Properties found: {len(properties)}")
    print(json.dumps(properties, indent=2))

if __name__ == "__main__":
    test_parse()
