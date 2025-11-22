#!/usr/bin/env python3
"""
Script to remove conflicting body styles from quiz files that interfere with header layout.
This will remove body padding and other styles that prevent the header from matching resources.html.
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
    'quizzes/GED',
    'quizzes/Arduino'
]

def fix_body_styles(file_path):
    """Remove conflicting body styles from a quiz file"""
    print(f"Processing: {file_path}")
    
    # Read file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Remove body padding that conflicts with header layout
    # Pattern to match body { ... padding: 20px; ... }
    body_pattern = r'(body\s*\{[^}]*?)padding:\s*[^;]+;([^}]*\})'
    content = re.sub(body_pattern, r'\1\2', content, flags=re.DOTALL)
    
    # Remove body margin if it exists
    body_pattern = r'(body\s*\{[^}]*?)margin:\s*[^;]+;([^}]*\})'
    content = re.sub(body_pattern, r'\1\2', content, flags=re.DOTALL)
    
    # Add a comment to indicate the change
    if content != original_content:
        # Find the body style and add a comment
        body_match = re.search(r'(body\s*\{)', content)
        if body_match:
            replacement = body_match.group(1) + '\n      /* Body padding/margin removed to match resources.html header layout */'
            content = content.replace(body_match.group(1), replacement, 1)
    
    # Only write if changes were made
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ Fixed body styles: {file_path}")
        return True
    else:
        print(f"  - No body styles to fix: {file_path}")
        return False

def main():
    """Main function to fix body styles in all quizzes"""
    print("=" * 60)
    print("Quiz Body Styles Fix Script")
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
            
            # Fix the body styles
            if fix_body_styles(file_path):
                updated_count += 1
            else:
                skipped_count += 1
    
    print()
    print("=" * 60)
    print(f"Body styles fix complete!")
    print(f"  Updated: {updated_count} files")
    print(f"  Skipped: {skipped_count} files")
    print("=" * 60)

if __name__ == '__main__':
    main()
