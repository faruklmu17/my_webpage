import os
import glob
from datetime import datetime

def generate_sitemap(base_dir):
    html_files = glob.glob(os.path.join(base_dir, '**', '*.html'), recursive=True)
    base_url = 'https://faruk-hasan.com'
    
    # Exclude patterns
    excludes = ['node_modules', '.git', 'playwright-report', 'test-results', 'temp_hf_space', 'sandbox', 'games', 'legal', 'automation/login.html', 'blog_post/git_fork_clone_feature_branch_pr_merge.html']
    
    urls = []
    
    for filepath in html_files:
        rel_path = os.path.relpath(filepath, base_dir).replace('\\', '/')
        
        if any(ex in rel_path for ex in excludes):
            continue
            
        # Get file modification time
        mtime = os.path.getmtime(filepath)
        lastmod = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')
        
        url = f"{base_url}/{rel_path}"
        
        # Priority and changefreq logic
        priority = "0.8"
        changefreq = "monthly"
        
        if rel_path == 'index.html':
            priority = "1.0"
            changefreq = "weekly"
            url = base_url + "/" # Root
        elif rel_path == 'blog.html':
            priority = "0.9"
            changefreq = "weekly"
            
        urls.append({
            'loc': url,
            'lastmod': lastmod,
            'changefreq': changefreq,
            'priority': priority
        })
        
    # Generate XML
    xml_content = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml_content.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    for u in urls:
        xml_content.append('  <url>')
        xml_content.append(f"    <loc>{u['loc']}</loc>")
        xml_content.append(f"    <lastmod>{u['lastmod']}</lastmod>")
        xml_content.append(f"    <changefreq>{u['changefreq']}</changefreq>")
        xml_content.append(f"    <priority>{u['priority']}</priority>")
        xml_content.append('  </url>')
        
    xml_content.append('</urlset>')
    
    sitemap_path = os.path.join(base_dir, 'sitemap.xml')
    with open(sitemap_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(xml_content))
        
    print(f"Generated sitemap.xml with {len(urls)} URLs")

if __name__ == '__main__':
    base_dir = '/Users/farukhasan/Desktop/Projects/my_webpage'
    generate_sitemap(base_dir)
