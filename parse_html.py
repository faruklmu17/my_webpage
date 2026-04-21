from html.parser import HTMLParser

class MyHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.errors = []
    
    def handle_starttag(self, tag, attrs):
        if tag not in ['img', 'br', 'hr', 'input', 'meta', 'link', 'source', 'area', 'base', 'col', 'embed', 'param', 'track', 'wbr', '!doctype']:
            self.tags.append((tag, self.getpos()))
            
    def handle_endtag(self, tag):
        if not self.tags:
            self.errors.append(f"Extra end tag </{tag}> at {self.getpos()}")
            return
        
        if self.tags[-1][0] == tag:
            self.tags.pop()
        else:
            self.errors.append(f"Mismatch end tag </{tag}>. Expected </{self.tags[-1][0]}> (opened at {self.tags[-1][1]}). Closed at {self.getpos()}")
            # Simple heuristic to recover
            if len(self.tags) > 1 and self.tags[-2][0] == tag:
                self.tags.pop()
                self.tags.pop()

p = MyHTMLParser()
with open('/Users/farukhasan/Desktop/my_webpage/tutoring/tutoring.html', 'r', encoding='utf-8') as f:
    p.feed(f.read())

if p.errors:
    print("Errors found:")
    for e in p.errors:
        print(e)
else:
    print("No mismatching tags found.")
