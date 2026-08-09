#!/usr/bin/env python3
"""
Script to migrate the newly moved HTML-CSS-JS quizzes to use the shared header/footer system.
"""

import os
import re
from pathlib import Path

# Quiz files to migrate
QUIZ_FILES = [
    'quizzes/HTML-CSS-JS/wd_project_4_quiz1.html',
    'quizzes/HTML-CSS-JS/wd_project_4_quiz2.html',
    'quizzes/HTML-CSS-JS/wd_quiz1.html'
]

def migrate_quiz(file_path):
    """Migrate a single quiz file to use shared header/footer"""
    print(f"Migrating: {file_path}")
    
    # Read file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # 1. Add shared CSS and JS links after Font Awesome
    font_awesome_pattern = r'(<link rel="stylesheet" href="https://cdnjs\.cloudflare\.com/ajax/libs/font-awesome/[^"]+">)'
    if re.search(font_awesome_pattern, content):
        replacement = r'\1\n  <!-- Shared Header/Footer CSS -->\n  <link rel="stylesheet" href="../../shared/header-footer.css">'
        content = re.sub(font_awesome_pattern, replacement, content)
    
    # 2. Remove body padding that conflicts with header
    body_pattern = r'(body\s*\{[^}]*?)padding:\s*[^;]+;([^}]*\})'
    content = re.sub(body_pattern, r'\1\2', content, flags=re.DOTALL)
    
    # 3. Add shared JS before closing body tag
    body_close_pattern = r'(</body>)'
    js_script = '''
  <!-- Shared Header/Footer JavaScript -->
  <script src="../../shared/header-footer.js"></script>
</body>'''
    content = re.sub(body_close_pattern, js_script, content)
    
    # 4. Add comment about body padding removal
    if 'padding:' not in content or 'body {' in content:
        body_match = re.search(r'(body\s*\{)', content)
        if body_match:
            replacement = body_match.group(1) + '\n            /* Body padding removed to match resources.html header layout */'
            content = content.replace(body_match.group(1), replacement, 1)
    
    # Write the updated content
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ Successfully migrated: {file_path}")
        return True
    else:
        print(f"  ⚠️  No changes needed: {file_path}")
        return False

def main():
    """Main function to migrate all new HTML quizzes"""
    print("=" * 60)
    print("HTML Quiz Migration Script")
    print("=" * 60)
    print()
    
    migrated_count = 0
    
    for quiz_file in QUIZ_FILES:
        if os.path.exists(quiz_file):
            if migrate_quiz(quiz_file):
                migrated_count += 1
        else:
            print(f"❌ File not found: {quiz_file}")
    
    print()
    print("=" * 60)
    print(f"Migration complete!")
    print(f"  Migrated: {migrated_count} files")
    print(f"  Total HTML-CSS-JS quizzes now: 4 files")
    print("=" * 60)
    print()
    print("All HTML-CSS-JS quizzes now use the shared header/footer system!")

if __name__ == '__main__':
    main()
