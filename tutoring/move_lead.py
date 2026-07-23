import re

with open('tutoring.html', 'r') as f:
    content = f.read()

# Extract the Lead Capture block
lead_capture_pattern = r'(  <!-- Lead Capture Section -->\s*<section id="lead-capture".*?</section>\s*)'
lead_match = re.search(lead_capture_pattern, content, re.DOTALL)

if not lead_match:
    print("Lead capture section not found")
    exit(1)

lead_capture_html = lead_match.group(1)

# Remove it from the original place
content = content.replace(lead_capture_html, '')

# Find the reviews section and insert before it
reviews_pattern = r'  <section id="reviews"'
content = content.replace(reviews_pattern, lead_capture_html + reviews_pattern)

with open('tutoring.html', 'w') as f:
    f.write(content)

print("Moved Lead Capture Section!")
