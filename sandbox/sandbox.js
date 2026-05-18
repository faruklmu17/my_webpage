/* Python Sandbox - powered by Pyodide */

const DEFAULT_CODE = `# Welcome to the Python Sandbox!
# Type your Python code here and click Run.

print("Hello, students!")
print("Let's learn Python together.")

name = "World"
print(f"Hello, {name}!")
`;

const EXAMPLES = {
    hello: `# Your very first Python program
print("Hello, World!")
print("My name is Python.")
print("I can do math:", 2 + 3)
`,
    variables: `# Variables hold values you can use later
name = "Alex"
age = 14
height = 5.4

print("Name:", name)
print("Age:", age)
print("Height:", height, "feet")

# You can do math with numbers
years_until_18 = 18 - age
print(f"{name} will be 18 in {years_until_18} years.")
`,
    input: {
        code: `# input() lets you ask the user a question
# I've pre-filled the 'Input' panel below for you!

name = input("What is your name? ")
print(f"Nice to meet you, {name}!")

color = input("What is your favorite color? ")
print(f"{color} is a great color!")
`,
        input: "John\nBlue"
    },
    ifelse: {
        code: `# Let's compare three numbers!
print("--- Compare three numbers ---")
a = int(input("Enter first number: "))
b = int(input("Enter second number: "))
c = int(input("Enter third number: "))

print(f"You entered: {a}, {b}, {c}")

if a > b and a > c:
    print(f"The largest number is: {a}")
elif b > a and b > c:
    print(f"The largest number is: {b}")
elif c > a and c > b:
    print(f"The largest number is: {c}")
else:
    print("Some numbers are equal!")
`,
        input: "10\n20\n30"
    },
    loops: `# Loops repeat code many times

# Print numbers 1 through 5
for number in range(1, 6):
    print("Number:", number)

print("---")

# Loop through a list of names
friends = ["Sam", "Riya", "Jordan"]
for friend in friends:
    print(f"Hello, {friend}!")
`,
    lists: `# Lists store multiple values

fruits = ["apple", "banana", "cherry"]
print("My fruits:", fruits)
print("First fruit:", fruits[0])
print("Total fruits:", len(fruits))

# Add a new fruit
fruits.append("mango")
print("After adding mango:", fruits)

# Sum a list of numbers
scores = [85, 92, 78, 95, 88]
print("Average score:", sum(scores) / len(scores))
`,
    functions: `# Functions are reusable blocks of code

def greet(name):
    return f"Hello, {name}!"

def add(a, b):
    return a + b

def is_even(number):
    return number % 2 == 0

# Use the functions
print(greet("Maria"))
print("3 + 4 =", add(3, 4))
print("Is 10 even?", is_even(10))
print("Is 7 even?", is_even(7))
`,
    turtle: `# Classic FizzBuzz challenge!
# Print numbers 1 to 20.
# But for multiples of 3, print "Fizz".
# For multiples of 5, print "Buzz".
# For multiples of both, print "FizzBuzz".

for i in range(1, 21):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)
`,
    html_hello: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      font-family: 'Inter', sans-serif; 
      text-align: center; 
      background: #f0f4f8; 
      margin: 0; 
      padding: 40px 20px;
    }
    h1 { color: #2563eb; margin-bottom: 10px; }
    p { color: #64748b; margin-bottom: 25px; }
    .card { 
      background: white; 
      padding: 30px; 
      border-radius: 16px; 
      box-shadow: 0 10px 25px rgba(0,0,0,0.05); 
      display: inline-block;
      max-width: 400px;
    }
    button {
      background: #2563eb;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello Web! 🌐</h1>
    <p>You just built your very first website.</p>
    <button onclick="alert('You are a coding superstar! 🌟')">Click for a Surprise!</button>
  </div>
</body>
</html>`,
    html_shapes: `<!DOCTYPE html>
<html>
<style>
  .container { display: flex; gap: 20px; justify-content: center; padding: 50px; }
  .box { width: 100px; height: 100px; transition: transform 0.3s; }
  .red { background: #ef4444; border-radius: 10px; }
  .blue { background: #3b82f6; border-radius: 50%; }
  .green { background: #10b981; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
  .box:hover { transform: scale(1.2) rotate(10deg); }
</style>
<body>
  <div class="container">
    <div class="box red"></div>
    <div class="box blue"></div>
    <div class="box green"></div>
  </div>
  <h2 style="text-align:center">Hover over the shapes!</h2>
</body>
</html>`
};

let editor = null;
let pyodide = null;
let inputBuffer = []; // Global buffer for stdin inputs
let currentLevel = 1; // Tracks the student's current learning level (1-7)
let currentLanguage = 'python'; // Tracks the current coding language ('python' or 'html')
let isNewStudentDemo = false; // Tracks if the user is currently doing the new student demo

// Global bridge for Python to get inputs
let persistentBuffer = [];
let currentRunBuffer = [];

// "Memory" to keep Python and HTML code separate
let lastPythonCode = DEFAULT_CODE;
let lastHTMLCode = EXAMPLES.html_hello;

let statusDot, statusText, runBtn, output;

// Layout cycling: Balanced -> Wide Editor -> Wide Preview
let currentLayoutMode = 0; // 0: Balanced, 1: Wide Editor, 2: Wide Preview
const layoutModes = [
    { grid: "1fr 1fr", label: "Balanced" },
    { grid: "1.6fr 0.4fr", label: "Wide Editor" },
    { grid: "0.4fr 1.6fr", label: "Wide Preview" }
];

// Global bridge for Python to get inputs
window.getSandboxInput = function() {
    if (currentRunBuffer.length > 0) {
        return currentRunBuffer.shift();
    }
    return null;
};

// Python keywords and common builtins for autocomplete
const PY_KEYWORDS = ["and", "as", "assert", "async", "await", "break", "class",
    "continue", "def", "del", "elif", "else", "except", "finally", "for", "from",
    "global", "if", "import", "in", "is", "lambda", "nonlocal", "not", "or",
    "pass", "raise", "return", "try", "while", "with", "yield", "True", "False", "None"];

const PY_BUILTINS = ["print", "input", "len", "range", "int", "float", "str",
    "list", "dict", "tuple", "set", "bool", "sum", "min", "max", "abs", "round",
    "sorted", "reversed", "enumerate", "zip", "map", "filter", "open", "type",
    "isinstance", "any", "all", "hasattr", "getattr", "setattr", "dir", "help",
    "id", "repr", "format", "chr", "ord", "hex", "oct", "bin", "pow", "iter",
    "next", "complex", "bytes", "frozenset", "vars", "globals", "locals",
    "callable", "classmethod", "staticmethod", "property", "super", "object",
    "Exception", "ValueError", "TypeError", "KeyError", "IndexError",
    "AttributeError", "NameError", "RuntimeError", "ZeroDivisionError"];

// Custom Python hint function
function pythonHint(cm) {
    if (currentLanguage !== 'python') return null;
    const cursor = cm.getCursor();
    const line = cm.getLine(cursor.line);
    const beforeCursor = line.slice(0, cursor.ch);

    let listSource = [];        // raw names
    let attrPrefix = "";        // prefix for attribute completions ("random.")
    let from, to;

    // Attribute completion: foo.bar  →  ask Pyodide for dir(foo)
    const attrMatch = beforeCursor.match(/([a-zA-Z_][a-zA-Z0-9_.]*)\.([a-zA-Z_][a-zA-Z0-9_]*)?$/);
    if (attrMatch && pyodide) {
        const obj = attrMatch[1];
        const partial = attrMatch[2] || "";
        try {
            const json = pyodide.runPython(`_sandbox_dir(${JSON.stringify(obj)})`);
            const attrs = JSON.parse(json);
            const filtered = (partial
                ? attrs.filter(a => a.toLowerCase().startsWith(partial.toLowerCase()))
                : attrs).sort();
            if (filtered.length === 0) return null;
            listSource = filtered;
            attrPrefix = obj + ".";
            from = CodeMirror.Pos(cursor.line, cursor.ch - partial.length);
            to = cursor;
        } catch (e) {
            return null;
        }
    } else {
        // Word completion: keywords + builtins + user-defined identifiers
        const wordMatch = beforeCursor.match(/([a-zA-Z_][a-zA-Z0-9_]*)$/);
        if (!wordMatch) return null;
        const word = wordMatch[1];

        const identifiers = new Set();
        const idRegex = /[a-zA-Z_][a-zA-Z0-9_]*/g;
        let m;
        while ((m = idRegex.exec(cm.getValue())) !== null) identifiers.add(m[0]);

        const pool = new Set([...PY_KEYWORDS, ...PY_BUILTINS, ...identifiers]);
        const filtered = [...pool]
            .filter(w => w !== word && w.toLowerCase().startsWith(word.toLowerCase()))
            .sort();
        if (filtered.length === 0) return null;
        listSource = filtered;
        from = CodeMirror.Pos(cursor.line, cursor.ch - word.length);
        to = cursor;
    }

    // Build hint objects with full names for docstring lookup
    const list = listSource.map(name => ({
        text: name,
        displayText: name,
        _fullName: attrPrefix + name
    }));

    const data = { list, from, to };
    // When a hint is highlighted, fetch its docstring and show in side tooltip
    CodeMirror.on(data, "select", (item, el) => {
        if (!item || !item._fullName) return;
        showDocTooltip(item._fullName, el);
    });
    CodeMirror.on(data, "close", hideDocTooltip);
    return data;
}

// Async linter: runs Python's compile() on the source and returns SyntaxErrors
function pythonLinter(text, callback) {
    if (!pyodide || currentLanguage !== 'python') { callback([]); return; }
    try {
        pyodide.globals.set("_sandbox_src", text);
        const json = pyodide.runPython("_sandbox_lint(_sandbox_src)");
        const items = JSON.parse(json);
        const annotations = items.map(it => ({
            message: it.message,
            severity: "error",
            from: CodeMirror.Pos(it.line, it.col),
            to: CodeMirror.Pos(it.line, it.endCol)
        }));
        callback(annotations);
    } catch (e) {
        callback([]);
    }
}

// Initialize CodeMirror editor
function initEditor() {
    const textarea = document.getElementById("codeEditor");
    textarea.value = DEFAULT_CODE;
    editor = CodeMirror.fromTextArea(textarea, {
        mode: "python",
        theme: "dracula",
        lineNumbers: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false,
        autoCloseBrackets: true,
        matchBrackets: true,
        lineWrapping: true,
        gutters: ["CodeMirror-lint-markers"],
        lint: { getAnnotations: pythonLinter, async: true, delay: 600 },
        hintOptions: { hint: pythonHint, completeSingle: false },
        extraKeys: {
            "Ctrl-Enter": runCode,
            "Cmd-Enter": runCode,
            "Ctrl-Space": "autocomplete",
            Tab: function (cm) {
                if (cm.somethingSelected()) {
                    cm.indentSelection("add");
                } else {
                    cm.replaceSelection("    ", "end", "+input");
                }
            }
        }
    });

    // Trigger autocomplete automatically as the student types
    editor.on("inputRead", function (cm, change) {
        if (!change.text || !change.text[0]) return;
        const ch = change.text[0];
        if (/[a-zA-Z_.]/.test(ch)) {
            cm.showHint({ hint: pythonHint, completeSingle: false });
        }
    });

    // Restore code: prioritize Shared Link (#code=) then LocalStorage (auto-save)
    const hash = window.location.hash;
    let restored = false;

    if (hash && hash.startsWith("#code=")) {
        try {
            const encoded = hash.substring(6);
            const decoded = decodeURIComponent(escape(atob(encoded)));
            if (decoded) {
                editor.setValue(decoded);
                restored = true;
                // Clear hash to keep URL clean
                history.replaceState(null, null, ' ');
            }
        } catch (e) { console.error("Failed to decode share link", e); }
    }

    // Restore language mode
    const savedLang = localStorage.getItem("sandbox.lastLanguage") || 'python';
    
    if (!restored) {
        // We need to know which code to restore based on the saved language
        const savedPython = localStorage.getItem("sandbox.lastPythonCode");
        const savedHTML = localStorage.getItem("sandbox.lastHTMLCode");
        
        if (savedPython) lastPythonCode = savedPython;
        if (savedHTML) lastHTMLCode = savedHTML;
        
        // If we have a general "lastCode" from older versions, use it for Python
        const legacySaved = localStorage.getItem("sandbox.lastCode");
        if (legacySaved && !savedPython) lastPythonCode = legacySaved;

        // Safety Check: If the "Python" code we just restored looks like HTML, 
        // it's probably from a legacy session. Reset it to default Python.
        if (lastPythonCode.trim().toLowerCase().startsWith("<!doctype") || 
            lastPythonCode.trim().toLowerCase().startsWith("<html")) {
            console.log("Legacy HTML found in Python slot, resetting to default Python.");
            lastPythonCode = DEFAULT_CODE;
        }

        // Apply the saved language and its corresponding code
        if (savedLang === 'html') {
            switchLanguageTo('html');
        } else {
            currentLanguage = 'python';
            editor.setValue(lastPythonCode);
        }
    }

    // Auto-save on every change
    editor.on("change", () => {
        if (currentLanguage === 'python') {
            lastPythonCode = editor.getValue();
            localStorage.setItem("sandbox.lastPythonCode", lastPythonCode);
        } else {
            lastHTMLCode = editor.getValue();
            localStorage.setItem("sandbox.lastHTMLCode", lastHTMLCode);
        }
        localStorage.setItem("sandbox.lastLanguage", currentLanguage);
    });

    // Show signature tooltip when cursor sits inside a function call
    editor.on("cursorActivity", maybeShowSignature);
    editor.on("blur", hideSignature);
}

// Set status indicator
function setStatus(state, message) {
    statusDot.classList.remove("ready", "error");
    if (state === "ready") statusDot.classList.add("ready");
    if (state === "error") statusDot.classList.add("error");
    statusText.textContent = message;
}

// Append text to output panel
function appendOutput(text, cls) {
    if (!text) return;
    const span = document.createElement("span");
    if (cls) span.className = cls;
    span.textContent = text;
    output.appendChild(span);
    output.scrollTop = output.scrollHeight;
}

// Clear output panel
function clearOutput() {
    output.innerHTML = "";
}

// Initialize Pyodide
async function initPyodide() {
    try {
        setStatus("loading", "Loading Python environment (this may take a few seconds)...");
        pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/"
        });

        // Redirect Python's stdout / stderr to our output panel
        pyodide.setStdout({
            batched: (msg) => appendOutput(msg + "\n")
        });
        pyodide.setStderr({
            batched: (msg) => appendOutput(msg + "\n", "err")
        });

        // Map Python's input() to our custom input handler
        pyodide.runPython(`
import builtins, json, sys
from js import getSandboxInput

def _input(prompt_text=""):
    # Attempt to get input from our persistent buffer
    val = getSandboxInput()
    if val is not None:
        # We have a value! Echo it and continue.
        sys.stdout.write(f"{prompt_text}{val}\\n")
        return str(val)
    
    # No value in buffer! Stop execution and trigger the UI to ask the user.
    # We use a special print that the JS will recognize to show the input field.
    sys.stdout.write(f"{prompt_text}")
    # The string below is a 'magic token' for the JS to handle
    print("___WAITING_FOR_INPUT___")
    # Stop the program immediately
    raise SystemExit(0)

builtins.input = _input

def _sandbox_lookup(name):
    if not name: return None
    parts = name.split('.')
    g = globals()
    head = parts[0]
    if head in g: obj = g[head]
    elif hasattr(builtins, head): obj = getattr(builtins, head)
    else:
        try:
            obj = __import__(head)
            g[head] = obj
        except: return None
    for p in parts[1:]:
        obj = getattr(obj, p, None)
        if obj is None: return None
    return obj

def _sandbox_dir(name):
    obj = _sandbox_lookup(name)
    if obj is None: return json.dumps([])
    try: return json.dumps([a for a in dir(obj) if not a.startswith('_')])
    except: return json.dumps([])

def _sandbox_signature(name):
    obj = _sandbox_lookup(name)
    if obj is None or not callable(obj): return json.dumps(None)
    try: sig = str(inspect.signature(obj))
    except: sig = "(...)"
    return json.dumps({"name": name, "sig": sig})

def _sandbox_doc(name):
    obj = _sandbox_lookup(name)
    if obj is None: return json.dumps(None)
    try: sig = str(inspect.signature(obj)) if callable(obj) else ""
    except: sig = ""
    doc = inspect.getdoc(obj) or ""
    if len(doc) > 600: doc = doc[:600].rstrip() + "..."
    return json.dumps({"name": name, "sig": sig, "doc": doc})

def _sandbox_lint(code):
    try:
        compile(code, '<sandbox>', 'exec')
        return json.dumps([])
    except SyntaxError as e:
        return json.dumps([{
            "line": (e.lineno or 1) - 1,
            "col": max((e.offset or 1) - 1, 0),
            "message": e.msg or "Syntax error"
        }])
    except: return json.dumps([])
`);

        setStatus("ready", "Python is ready! Click Run to execute your code.");
        runBtn.disabled = false;
    } catch (err) {
        console.error(err);
        setStatus("error", "Failed to load Python. Please refresh the page.");
    }
}

// Run the code currently in the editor
async function runCode(isResume = false) {
    if (isResume instanceof Event) isResume = false;
    
    if (currentLanguage === 'html') {
        runHTML();
        return;
    }

    if (!pyodide) return;
    const code = editor.getValue();
    clearOutput();
    appendOutput("▶ Running Python...\n\n", "muted");
    runBtn.disabled = true;

    // Mobile UX: Automatically switch to output tab if on mobile
    const outputTabBtn = document.querySelector('.tab-link[data-target="output-panel"]');
    if (window.innerWidth <= 900 && outputTabBtn) {
        outputTabBtn.click();
    }
    
    // Always clear output on every run/re-run to avoid duplication.
    if (isResume) {
        const oldInput = document.querySelector(".terminal-input-wrapper");
        if (oldInput) {
            const val = oldInput.querySelector("input").value;
            persistentBuffer.push(val);
        }
    } else {
        persistentBuffer = [];
    }

    currentRunBuffer = [...persistentBuffer];

    try {
        setStatus("running", "Program is running...");
        await pyodide.runPythonAsync(code);
        
        if (!output.innerHTML.includes("___WAITING_FOR_INPUT___")) {
            appendOutput("\n✓ Program finished successfully.\n", "ok");
            setStatus("ready", "Execution complete.");
            
            if (isNewStudentDemo && currentLanguage === 'python') {
                const line5 = editor.getLine(4) || "";
                if (line5.trim().startsWith("print(") && (line5.trim().includes("\"") || line5.trim().includes("'")) && line5.trim().endsWith(")")) {
                    appendOutput("\n🎉 INCREDIBLE JOB! You just wrote your first Python code! 🎉\n", "ok");
                    appendOutput("You told the computer what to do, and it listened. You're officially a programmer now!\n", "ok");
                    appendOutput("\n👉 NEXT CHALLENGE: Try writing a couple more print statements on lines 6 and 7 to practice!\n", "ok");
                    appendOutput("Print your favorite color, or a message to a friend. Run it again when you're done!\n", "ok");
                    isNewStudentDemo = false;
                } else if (line5.trim() !== "") {
                    appendOutput("\nHint: Your code on line 5 looks close, but make sure it is formatted exactly like: print(\"Your Name\")\n", "muted");
                }
            }
        } else {
            setStatus("waiting", "Waiting for your input...");
            handleInteractiveInput();
        }
    } catch (err) {
        if (err.message && err.message.includes("SystemExit: 0")) {
             setStatus("waiting", "Waiting for your input...");
             handleInteractiveInput();
        } else {
             appendOutput("\n" + err.toString() + "\n", "err");
             setStatus("error", "An error occurred during execution.");
             if (isNewStudentDemo && currentLanguage === 'python') {
                 const line5 = editor.getLine(4) || "";
                 if (line5.trim().startsWith("Print") || line5.trim().startsWith("PRINT")) {
                     appendOutput("\nOops! Python is case-sensitive. Make sure to use a lowercase 'print' (with a small 'p')!\n", "err");
                 } else {
                     appendOutput("\nOops! Don't worry, errors are completely normal when learning. Double-check your parentheses () and quotation marks \"\" on line 5!\n", "err");
                 }
             }
        }
    } finally {
        runBtn.disabled = false;
    }
}

function handleInteractiveInput() {
    // Remove the magic token from the output
    const content = output.innerHTML;
    output.innerHTML = content.replace("___WAITING_FOR_INPUT___", "");
    
    // Create an inline input field
    const inputWrapper = document.createElement("div");
    inputWrapper.className = "terminal-input-wrapper";
    inputWrapper.innerHTML = `
        <input type="text" id="terminal-field" class="terminal-field" autocomplete="off">
        <span class="terminal-hint">[Press Enter]</span>
    `;
    output.appendChild(inputWrapper);
    
    const field = document.getElementById("terminal-field");
    field.focus();
    
    field.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const val = field.value;
            // Add to our buffer
            inputBuffer.push(val);
            // Re-run the code!
            runCode(true); // pass true to indicate it's a resume
        }
    });
}

function runHTML() {
    const code = editor.getValue();
    const preview = document.getElementById("previewFrame");
    preview.srcdoc = code;
    setStatus("ready", "Website preview updated!");
}

async function startNewStudentDemo() {
    isNewStudentDemo = true;
    editor.setValue("");
    clearOutput();
    appendOutput("🌟 Welcome to Python! 🌟\n\n", "ok");
    appendOutput("Let's learn how to make the computer talk. Watch the code appear on the left...\n\n");
    
    const part1 = "# 1. This tells the computer to print a message on the right screen:\nprint(\"Hello world\")\n";
    const part2 = "# 2. Now it's your turn! Print your name on line 5.\n# (Remember to use parentheses and quotation marks!)\n";
    
    let currentCode = "";
    
    // Disable run button during typing
    runBtn.disabled = true;
    
    // Type the first part
    for (let i = 0; i < part1.length; i++) {
        currentCode += part1[i];
        editor.setValue(currentCode);
        editor.setCursor(editor.lineCount(), 0);
        await new Promise(r => setTimeout(r, 50)); // typing speed
    }
    
    // Pause to let them absorb the first example
    await new Promise(r => setTimeout(r, 1200));
    
    // Type the prompt for them to write their own code
    for (let i = 0; i < part2.length; i++) {
        currentCode += part2[i];
        editor.setValue(currentCode);
        editor.setCursor(editor.lineCount(), 0);
        await new Promise(r => setTimeout(r, 50)); // typing speed
    }
    
    appendOutput("Your turn! Write your code on line 5 and click the green 'Run' button above. 👆\n", "ok");
    runBtn.disabled = false;
    editor.focus();
}

function updateNewStudentBtnVisibility() {
    const btn = document.getElementById("newStudentBtn");
    if (!btn) return;
    if (currentLanguage === 'python' && currentLevel === 1) {
        btn.style.display = "inline-block";
    } else {
        btn.style.display = "none";
    }
}

let docTooltipEl = null;

function getDocTooltip() {
    if (!docTooltipEl) {
        docTooltipEl = document.createElement("div");
        docTooltipEl.className = "doc-tooltip";
        docTooltipEl.style.display = "none";
        document.body.appendChild(docTooltipEl);
    }
    return docTooltipEl;
}

function hideDocTooltip() {
    if (docTooltipEl) docTooltipEl.style.display = "none";
}

function showDocTooltip(fullName, hintEl) {
    if (!pyodide) return;
    let info;
    try {
        const json = pyodide.runPython(`_sandbox_doc(${JSON.stringify(fullName)})`);
        info = JSON.parse(json);
    } catch (e) { return; }
    if (!info || (!info.doc && !info.sig)) { hideDocTooltip(); return; }

    const tip = getDocTooltip();
    tip.innerHTML = "";
    const nameEl = document.createElement("span");
    nameEl.className = "doc-name";
    nameEl.textContent = info.name;
    tip.appendChild(nameEl);
    if (info.sig) {
        const sigEl = document.createElement("div");
        sigEl.className = "doc-sig";
        sigEl.textContent = info.name + info.sig;
        tip.appendChild(sigEl);
    }
    if (info.doc) {
        const bodyEl = document.createElement("div");
        bodyEl.className = "doc-body";
        bodyEl.textContent = info.doc;
        tip.appendChild(bodyEl);
    }

    // Position to the right of the highlighted hint row
    const rect = hintEl.getBoundingClientRect();
    tip.style.display = "block";
    const tipRect = tip.getBoundingClientRect();
    let left = rect.right + 8;
    if (left + tipRect.width > window.innerWidth - 12) {
        left = Math.max(8, rect.left - tipRect.width - 8);
    }
    tip.style.left = (left + window.scrollX) + "px";
    tip.style.top = (rect.top + window.scrollY) + "px";
}

// ----- Signature tooltip while typing inside a function call -----
let sigTooltipEl = null;

function getSigTooltip() {
    if (!sigTooltipEl) {
        sigTooltipEl = document.createElement("div");
        sigTooltipEl.className = "sig-tooltip";
        sigTooltipEl.style.display = "none";
        document.body.appendChild(sigTooltipEl);
    }
    return sigTooltipEl;
}

function hideSignature() {
    if (sigTooltipEl) sigTooltipEl.style.display = "none";
}

// Walk back from the cursor to find an enclosing "name(" — returns the name or null
function findEnclosingCall(cm) {
    const cursor = cm.getCursor();
    const line = cm.getLine(cursor.line);
    const before = line.slice(0, cursor.ch);
    let depth = 0;
    for (let i = before.length - 1; i >= 0; i--) {
        const c = before[i];
        if (c === ")") depth++;
        else if (c === "(") {
            if (depth === 0) {
                const head = before.slice(0, i);
                const m = head.match(/([a-zA-Z_][a-zA-Z0-9_.]*)$/);
                return m ? { name: m[1], openCh: i } : null;
            }
            depth--;
        }
    }
    return null;
}

function maybeShowSignature() {
    if (!pyodide) return;
    const call = findEnclosingCall(editor);
    if (!call) { hideSignature(); return; }
    let info;
    try {
        const json = pyodide.runPython(`_sandbox_signature(${JSON.stringify(call.name)})`);
        info = JSON.parse(json);
    } catch (e) { hideSignature(); return; }
    if (!info) { hideSignature(); return; }

    const tip = getSigTooltip();
    tip.innerHTML = `<span class="sig-name">${info.name}</span>${info.sig}`;
    const cursor = editor.getCursor();
    const coords = editor.charCoords(cursor, "page");
    tip.style.display = "block";
    const tipRect = tip.getBoundingClientRect();
    let left = coords.left;
    if (left + tipRect.width > window.innerWidth - 12) {
        left = Math.max(8, window.innerWidth - tipRect.width - 12);
    }
    tip.style.left = left + "px";
    tip.style.top = (coords.bottom + 6) + "px";
}

// Wire up toolbar buttons
function wireUI() {
    statusDot = document.getElementById("statusDot");
    statusText = document.getElementById("statusText");
    runBtn = document.getElementById("runBtn");
    output = document.getElementById("output");

    runBtn.addEventListener("click", runCode);

    document.getElementById("clearOutputBtn").addEventListener("click", () => {
        output.innerHTML = '<span class="muted">Output cleared.</span>';
    });

    document.getElementById("resetBtn").addEventListener("click", () => {
        if (confirm("Reset code to the starter example? Your current code will be lost.")) {
            editor.setValue(DEFAULT_CODE);
        }
    });

    const newStudentBtn = document.getElementById("newStudentBtn");
    if (newStudentBtn) {
        newStudentBtn.addEventListener("click", startNewStudentDemo);
    }

    document.getElementById("launchBtn").addEventListener("click", () => {
        if (currentLanguage === 'html') {
            const code = editor.getValue();
            const newWindow = window.open();
            newWindow.document.write(code);
            newWindow.document.close();
        }
    });

    // Layout cycling: Balanced -> Wide Editor -> Wide Preview
    let currentLayoutMode = 0; // 0: Balanced, 1: Wide Editor, 2: Wide Preview
    const layoutModes = [
        { grid: "1fr 1fr", label: "Balanced" },
        { grid: "1.6fr 0.4fr", label: "Wide Editor" },
        { grid: "0.4fr 1.6fr", label: "Wide Preview" }
    ];

    document.getElementById("layoutBtn").addEventListener("click", () => {
        currentLayoutMode = (currentLayoutMode + 1) % layoutModes.length;
        const mode = layoutModes[currentLayoutMode];
        document.querySelector(".editor-grid").style.gridTemplateColumns = mode.grid;
        setStatus("ready", `Layout changed to ${mode.label}`);
    });
    document.getElementById("copyBtn").addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(editor.getValue());
            const btn = document.getElementById("copyBtn");
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => { btn.innerHTML = original; }, 1500);
        } catch (e) {
            alert("Could not copy. Please select the code manually.");
        }
    });

    document.getElementById("shareBtn").addEventListener("click", async () => {
        try {
            const code = editor.getValue();
            // Base64 encode the code for the URL
            // We use btoa(unescape(encodeURIComponent(str))) for robust Unicode support
            const encoded = btoa(unescape(encodeURIComponent(code)));
            const shareUrl = window.location.origin + window.location.pathname + "#code=" + encoded;
            
            await navigator.clipboard.writeText(shareUrl);
            
            const btn = document.getElementById("shareBtn");
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-link"></i> Link Copied!';
            btn.classList.add("btn-success");
            setTimeout(() => { 
                btn.innerHTML = original; 
                btn.classList.remove("btn-success");
            }, 2000);
        } catch (e) {
            alert("Could not generate share link.");
        }
    });

    document.getElementById("examplesSelect").addEventListener("change", (e) => {
        const key = e.target.value;
        if (!key) return;
        const example = EXAMPLES[key];
        if (example) {
            if (typeof example === 'string') {
                editor.setValue(example);
                persistentBuffer = [];
            } else {
                editor.setValue(example.code);
                persistentBuffer = example.input ? example.input.split('\n').filter(l => l !== "") : [];
            }
            editor.focus();
        }
        e.target.value = "";
    });

    document.getElementById("levelSelect").addEventListener("change", (e) => {
        currentLevel = parseInt(e.target.value);
        console.log(`Student level changed to: ${currentLevel}`);
        updateNewStudentBtnVisibility();
    });

    document.getElementById("languageSelect").addEventListener("change", (e) => {
        switchLanguageTo(e.target.value);
    });

    // Help modal: button, close, backdrop click, ESC key, and first-visit auto-show
    const helpModal = document.getElementById("helpModal");
    const openHelp = () => helpModal.classList.add("show");
    const closeHelp = () => helpModal.classList.remove("show");

    document.getElementById("helpBtn").addEventListener("click", openHelp);
    document.getElementById("helpCloseBtn").addEventListener("click", closeHelp);
    document.getElementById("helpGotItBtn").addEventListener("click", closeHelp);
    helpModal.addEventListener("click", (e) => {
        if (e.target === helpModal) closeHelp();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && helpModal.classList.contains("show")) closeHelp();
    });

    // Auto-show on first visit (uses localStorage so it only happens once)
    try {
        if (!localStorage.getItem("sandbox.helpSeen")) {
            setTimeout(openHelp, 800);
            localStorage.setItem("sandbox.helpSeen", "1");
        }
    } catch (e) { /* localStorage may be blocked in private mode */ }

    // Mobile Tabs Switching Logic
    const tabs = document.querySelectorAll('.tab-link');
    const panels = document.querySelectorAll('.panel');

    function switchTab(targetId) {
        tabs.forEach(t => {
            t.classList.toggle('active', t.getAttribute('data-target') === targetId);
        });
        panels.forEach(p => {
            p.classList.toggle('active-tab', p.id === targetId);
        });
        
        // Refresh CodeMirror when tab becomes visible
        if (targetId === 'editor-panel' && editor) {
            setTimeout(() => editor.refresh(), 10);
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.getAttribute('data-target'));
        });
    });

    // Initialize first tab as active on mobile
    if (window.innerWidth <= 900) {
        switchTab('editor-panel');
    }
    
    updateNewStudentBtnVisibility();
}


function switchLanguageTo(newLanguage) {
    const oldLanguage = currentLanguage;
    
    // Save current code
    if (oldLanguage === 'python') lastPythonCode = editor.getValue();
    else lastHTMLCode = editor.getValue();
    
    currentLanguage = newLanguage;
    
    // Sync dropdown if called programmatically
    const langSelect = document.getElementById("languageSelect");
    if (langSelect) langSelect.value = newLanguage;
    
    const outputDiv = document.getElementById("output");
    const previewFrame = document.getElementById("previewFrame");
    const examplesSelect = document.getElementById("examplesSelect");
    const editorGrid = document.querySelector(".editor-grid");
    const launchBtn = document.getElementById("launchBtn");
    const outputTitle = document.getElementById("outputTitle");
    const editorFileName = document.getElementById("editorFileName");
    const editorLangBadge = document.getElementById("editorLangBadge");
    const levelSelect = document.getElementById("levelSelect");
    
    if (newLanguage === 'html') {
        editor.setOption("mode", "htmlmixed");
        outputDiv.style.display = "none";
        previewFrame.style.display = "block";
        launchBtn.style.display = "flex";
        levelSelect.style.display = "none";
        outputTitle.textContent = "Website Preview";
        editorFileName.textContent = "index.html";
        editorLangBadge.innerHTML = '<i class="fas fa-code"></i> HTML / Web';
        editorGrid.style.gridTemplateColumns = "1fr 1fr";
        currentLayoutMode = 0;
        examplesSelect.innerHTML = `
            <option value="">📚 Load Web Example...</option>
            <option value="html_hello">Hello Website</option>
            <option value="html_shapes">CSS Shapes & Hover</option>
        `;
        editor.setValue(lastHTMLCode);
        setTimeout(() => editor.refresh(), 50);
        setStatus("ready", "Switched to HTML Mode.");
    } else {
        editor.setOption("mode", "python");
        outputDiv.style.display = "block";
        previewFrame.style.display = "none";
        launchBtn.style.display = "none";
        levelSelect.style.display = "inline-block";
        levelSelect.value = "1";
        currentLevel = 1;
        outputTitle.textContent = "stdout (Output)";
        editorFileName.textContent = "main.py";
        editorLangBadge.innerHTML = '<i class="fab fa-python"></i> Python 3';
        editorGrid.style.gridTemplateColumns = "1.4fr 0.6fr";
        currentLayoutMode = 1;
        examplesSelect.innerHTML = `
            <option value="">📚 Load Example...</option>
            <option value="hello">Hello, World!</option>
            <option value="variables">Variables & Math</option>
            <option value="input">Using input()</option>
            <option value="ifelse">If / Else</option>
            <option value="loops">For Loops</option>
            <option value="lists">Lists</option>
            <option value="functions">Functions</option>
            <option value="turtle">FizzBuzz</option>
        `;
        editor.setValue(lastPythonCode);
        setTimeout(() => editor.refresh(), 50);
        setStatus("ready", "Switched to Python Mode.");
    }
    updateNewStudentBtnVisibility();
}

// JS Modal Implementation for Python Input
window.showInputDialog = function(promptText) {
    // This is now deprecated by the Terminal Re-run logic, but keeping as a fallback
    return new Promise((resolve) => resolve(null));
};

// Boot
window.addEventListener("DOMContentLoaded", () => {
    wireUI();
    initEditor();
    initPyodide();
});
