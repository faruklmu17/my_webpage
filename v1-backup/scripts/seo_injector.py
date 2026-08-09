import os
import glob
from bs4 import BeautifulSoup

def format_title(filepath, base_dir):
    filename = os.path.basename(filepath)
    name, _ = os.path.splitext(filename)
    if name in ['index', 'index_main']:
        return "Faruk Hasan - QA Engineer & Automation Specialist"
    
    # Format name
    formatted = name.replace('_', ' ').replace('-', ' ').title()
    return f"{formatted} | Faruk Hasan"

def inject_metadata(base_dir):
    html_files = glob.glob(os.path.join(base_dir, '**', '*.html'), recursive=True)
    base_url = 'https://faruk-hasan.com'
    
    modified_count = 0
    
    for filepath in html_files:
        if any(x in filepath for x in ['node_modules', '.git', 'playwright-report', 'test-results', 'temp_hf_space']):
            continue
            
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        try:
            soup = BeautifulSoup(content, 'html.parser')
        except Exception as e:
            print(f"Error parsing {filepath}: {e}")
            continue
            
        head = soup.find('head')
        if not head:
            continue
            
        modified = False
        
        # 1. Title
        title_tag = head.find('title')
        page_title = title_tag.string.strip() if title_tag and title_tag.string else None
        
        if not title_tag:
            new_title = soup.new_tag('title')
            page_title = format_title(filepath, base_dir)
            new_title.string = page_title
            head.insert(1, new_title)
            modified = True
            
        # 2. Description
        desc_meta = head.find('meta', attrs={'name': 'description'})
        if not desc_meta or not desc_meta.get('content') or not desc_meta.get('content').strip():
            if desc_meta:
                desc_meta.decompose() # Remove empty one if exists
                
            new_desc = soup.new_tag('meta', attrs={'name': 'description'})
            
            # Try to find h1
            h1_tag = soup.find('h1')
            if h1_tag and h1_tag.text.strip():
                desc_text = f"Explore {h1_tag.text.strip()} on Faruk Hasan's portfolio. Interactive resources and programming practice."
            elif page_title:
                desc_text = f"{page_title} - Interactive programming resources, tutorials, and automation testing practice by Faruk Hasan."
            else:
                desc_text = "Interactive programming resources, tutorials, and automation testing practice by Faruk Hasan."
                
            new_desc['content'] = desc_text
            # Insert after charset if possible, or just at end of head
            head.append(new_desc)
            modified = True
            
        # 3. Canonical Link
        canonical_link = head.find('link', attrs={'rel': 'canonical'})
        if not canonical_link or not canonical_link.get('href') or not canonical_link.get('href').strip():
            if canonical_link:
                canonical_link.decompose()
                
            new_canonical = soup.new_tag('link', attrs={'rel': 'canonical'})
            rel_path = os.path.relpath(filepath, base_dir)
            # Replace windows slashes just in case
            rel_path = rel_path.replace('\\', '/')
            new_canonical['href'] = f"{base_url}/{rel_path}"
            head.append(new_canonical)
            modified = True
            
        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(str(soup))
            modified_count += 1
            print(f"Updated metadata for: {os.path.relpath(filepath, base_dir)}")
            
    print(f"Total files updated: {modified_count}")

if __name__ == '__main__':
    base_dir = '/Users/farukhasan/Desktop/Projects/my_webpage'
    inject_metadata(base_dir)
