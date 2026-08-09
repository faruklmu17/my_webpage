#!/usr/bin/env python3
"""
Script to migrate all quizzes to use shared header/footer system.
This script will:
1. Add shared CSS link if not present
2. Add shared JS script if not present
3. Remove manual header/footer HTML if present
"""

import os
import re
from pathlib import Path

# Quiz directories to process
QUIZ_DIRS = [
    'quizzes/PYTHON',
    'quizzes/AI',
    'quizzes/GIT',
    'quizzes/HTML-CSS-JS',
    'quizzes/GED'
]

# Files to skip (already migrated or special cases)
SKIP_FILES = [
    'quizzes/Arduino/arduino_board_basic_electronics_quiz.html',  # Already migrated
    'quizzes/PYTHON/python_basic_escape_room_level_1.html',  # Special game format
    'quizzes/GED/ged-math-quizzes.html',  # Main landing page, different structure
]

def has_shared_css(content):
    """Check if file already has shared CSS link"""
    return 'shared/header-footer.css' in content

def has_shared_js(content):
    """Check if file already has shared JS script"""
    return 'shared/header-footer.js' in content

def has_font_awesome(content):
    """Check if file already has Font Awesome"""
    return 'font-awesome' in content.lower() or 'fontawesome' in content.lower()

def add_shared_css(content):
    """Add shared CSS link after Font Awesome or in head"""
    if has_shared_css(content):
        return content
    
    # Try to add after Font Awesome
    if has_font_awesome(content):
        pattern = r'(<link[^>]*font-awesome[^>]*>)'
        replacement = r'\1\n  <!-- Shared Header/Footer CSS -->\n  <link rel="stylesheet" href="../../shared/header-footer.css">'
        content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
    else:
        # Add Font Awesome and shared CSS before </head>
        pattern = r'(</head>)'
        replacement = r'  <!-- Font Awesome -->\n  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\n  <!-- Shared Header/Footer CSS -->\n  <link rel="stylesheet" href="../../shared/header-footer.css">\n\n\1'
        content = re.sub(pattern, replacement, content)
    
    return content

def add_shared_js(content):
    """Add shared JS script before </body>"""
    if has_shared_js(content):
        return content
    
    # Add before </body>
    pattern = r'(</body>)'
    replacement = r'  <!-- Shared Header and Footer JavaScript -->\n  <script src="../../shared/header-footer.js"></script>\n\1'
    content = re.sub(pattern, replacement, content)
    
    return content

def remove_manual_header(content):
    """Remove manual header HTML"""
    # Pattern to match header section
    pattern = r'<!-- Header -->.*?</header>\s*'
    content = re.sub(pattern, '<!-- Header will be automatically injected by shared/header-footer.js -->\n\n  ', content, flags=re.DOTALL)
    
    # Also try without comment
    pattern = r'<header>.*?</header>\s*'
    if '<header>' in content and 'automatically injected' not in content:
        content = re.sub(pattern, '<!-- Header will be automatically injected by shared/header-footer.js -->\n\n  ', content, flags=re.DOTALL, count=1)
    
    return content

def remove_manual_footer(content):
    """Remove manual footer HTML"""
    # Pattern to match footer section
    pattern = r'<!-- Footer -->.*?</footer>\s*'
    content = re.sub(pattern, '<!-- Footer will be automatically injected by shared/header-footer.js -->\n\n  ', content, flags=re.DOTALL)
    
    # Also try without comment
    pattern = r'<footer>.*?</footer>\s*'
    if '<footer>' in content and 'automatically injected' not in content:
        content = re.sub(pattern, '<!-- Footer will be automatically injected by shared/header-footer.js -->\n\n  ', content, flags=re.DOTALL, count=1)
    
    return content

def migrate_quiz(file_path):
    """Migrate a single quiz file"""
    print(f"Processing: {file_path}")
    
    # Read file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Add shared CSS
    content = add_shared_css(content)
    
    # Add shared JS
    content = add_shared_js(content)
    
    # Remove manual header
    content = remove_manual_header(content)
    
    # Remove manual footer
    content = remove_manual_footer(content)
    
    # Only write if changes were made
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ Updated: {file_path}")
        return True
    else:
        print(f"  - No changes needed: {file_path}")
        return False

def main():
    """Main function to migrate all quizzes"""
    print("=" * 60)
    print("Quiz Migration Script")
    print("=" * 60)
    print()
    
    updated_count = 0
    skipped_count = 0
    
    for quiz_dir in QUIZ_DIRS:
        if not os.path.exists(quiz_dir):
            print(f"Directory not found: {quiz_dir}")
            continue
        
        print(f"\nProcessing directory: {quiz_dir}")
        print("-" * 60)
        
        # Get all HTML files in directory
        html_files = list(Path(quiz_dir).glob('*.html'))
        
        for html_file in html_files:
            file_path = str(html_file)
            
            # Skip files in skip list
            if file_path in SKIP_FILES:
                print(f"Skipping: {file_path} (in skip list)")
                skipped_count += 1
                continue
            
            # Migrate the quiz
            if migrate_quiz(file_path):
                updated_count += 1
            else:
                skipped_count += 1
    
    print()
    print("=" * 60)
    print(f"Migration complete!")
    print(f"  Updated: {updated_count} files")
    print(f"  Skipped: {skipped_count} files")
    print("=" * 60)

if __name__ == '__main__':
    main()

