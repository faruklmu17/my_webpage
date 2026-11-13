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
    chart: `# Plotting and Data Visualization with Matplotlib!
import matplotlib.pyplot as plt

# Sample data
months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
visitors = [150, 240, 390, 510, 620, 850]

# Create line chart
plt.figure(figsize=(7, 4))
plt.plot(months, visitors, marker='o', color='#2563eb', linewidth=2.5, label='Monthly Visitors')
plt.title("Website Growth Over Time", fontsize=14, fontweight='bold', pad=12)
plt.xlabel("Month", fontsize=11)
plt.ylabel("Visitors", fontsize=11)
plt.grid(True, linestyle='--', alpha=0.6)
plt.legend()

# Display the chart in output
plt.show()
print("Chart generated successfully!")
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
window.editor = null;
let pyodide = null;
let inputBuffer = []; // Global buffer for stdin inputs
let currentLevel = 1; // Tracks the student's current learning level (1-7)
let currentLanguage = 'python'; // Tracks the current coding language ('python' or 'html')
window.currentLanguage = currentLanguage;
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
    if (currentLanguage !== 'python' || !SandboxFiles.activeIsPython()) return null;
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
    if (!pyodide || currentLanguage !== 'python' || !SandboxFiles.activeIsPython()) { callback([]); return; }
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
            "Cmd-/": "toggleComment",
            "Ctrl-/": "toggleComment",
            // Explicit add / remove comment (Sublime-style)
            "Cmd-K Cmd-C": function (cm) { cm.lineComment(cm.getCursor("from"), cm.getCursor("to")); },
            "Ctrl-K Ctrl-C": function (cm) { cm.lineComment(cm.getCursor("from"), cm.getCursor("to")); },
            "Cmd-K Cmd-U": function (cm) { cm.uncomment(cm.getCursor("from"), cm.getCursor("to")); },
            "Ctrl-K Ctrl-U": function (cm) { cm.uncomment(cm.getCursor("from"), cm.getCursor("to")); },
            // Block comment (HTML <!-- --> / Python line comments)
            "Shift-Alt-A": "toggleComment",
            // VS Code-style line editing
            "Shift-Cmd-K": "deleteLine",
            "Shift-Ctrl-K": "deleteLine",
            "Alt-Up": "swapLineUp",
            "Alt-Down": "swapLineDown",
            "Shift-Alt-Up": function (cm) { cm.execCommand("duplicateLine"); cm.execCommand("goLineUp"); },
            "Shift-Alt-Down": "duplicateLine",
            "Cmd-]": "indentMore",
            "Cmd-[": "indentLess",
            "Ctrl-]": "indentMore",
            "Ctrl-[": "indentLess",
            "Cmd-D": "selectNextOccurrence",
            "Ctrl-D": "selectNextOccurrence",
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
    window.editor = editor;

    // Trigger autocomplete automatically as the student types
    editor.on("inputRead", function (cm, change) {
        if (!change.text || !change.text[0]) return;
        const ch = change.text[0];
        if (/[a-zA-Z_.]/.test(ch)) {
            cm.showHint({ hint: pythonHint, completeSingle: false });
        }
    });

    // Old single-file saves become the starting main file (migration)
    const savedLang = localStorage.getItem("sandbox.lastLanguage") || 'python';
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

    SandboxFiles.init(editor, 'python', { python: lastPythonCode, html: lastHTMLCode });

    // Shared links: #project= (multi-file) or legacy #code= (single Python file)
    let startLang = savedLang === 'html' ? 'html' : 'python';
    const hash = window.location.hash;
    try {
        if (hash.startsWith("#project=")) {
            const data = JSON.parse(decodeURIComponent(escape(atob(hash.substring(9)))));
            if (data && Array.isArray(data.files) && (data.language === 'python' || data.language === 'html')) {
                SandboxFiles.importProject(data.language, data.files, data.active);
                startLang = data.language;
            }
            history.replaceState(null, null, ' ');
        } else if (hash.startsWith("#code=")) {
            const decoded = decodeURIComponent(escape(atob(hash.substring(6))));
            if (decoded) {
                SandboxFiles.importProject('python', [{ name: 'main.py', content: decoded }], 'main.py');
                startLang = 'python';
            }
            history.replaceState(null, null, ' ');
        }
    } catch (e) { console.error("Failed to decode share link", e); }

    if (startLang === 'html') {
        switchLanguageTo('html');
    } else {
        currentLanguage = 'python';
        SandboxFiles.setLanguage('python');
    }

    // Remember the language (file contents are auto-saved by SandboxFiles)
    editor.on("change", () => {
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

// Append text or plot image to output panel
function appendOutput(text, cls) {
    if (!text) return;

    if (typeof text === "string" && text.includes("__SANDBOX_IMAGE__:")) {
        const lines = text.split("\n");
        for (const line of lines) {
            if (line.startsWith("__SANDBOX_IMAGE__:")) {
                const src = line.replace("__SANDBOX_IMAGE__:", "").trim();
                if (src) {
                    const imgContainer = document.createElement("div");
                    imgContainer.className = "sandbox-plot-container";
                    imgContainer.style.margin = "12px 0";
                    imgContainer.style.background = "#ffffff";
                    imgContainer.style.padding = "10px";
                    imgContainer.style.borderRadius = "8px";
                    imgContainer.style.display = "inline-block";
                    imgContainer.style.maxWidth = "100%";
                    imgContainer.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";

                    const img = document.createElement("img");
                    img.src = src;
                    img.alt = "Plot output";
                    img.style.maxWidth = "100%";
                    img.style.height = "auto";
                    img.style.display = "block";
                    img.style.borderRadius = "4px";

                    imgContainer.appendChild(img);
                    output.appendChild(imgContainer);
                }
            } else if (line.length > 0) {
                const span = document.createElement("span");
                if (cls) span.className = cls;
                span.textContent = line + "\n";
                output.appendChild(span);
            }
        }
        output.scrollTop = output.scrollHeight;
        return;
    }

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
        window.pyodide = pyodide;

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
    // Always run main.py, no matter which file tab is open
    const projectFiles = SandboxFiles.getFiles('python');
    const mainFile = projectFiles.find(f => f.name === 'main.py');
    const code = mainFile ? mainFile.content : editor.getValue();
    // All Python sources, used to detect packages/matplotlib across files
    const allPython = projectFiles.filter(f => f.name.endsWith('.py')).map(f => f.content).join("\n");
    
    // Always grab the previous input before clearing the output panel!
    if (isResume) {
        const oldInput = document.querySelector(".terminal-input-wrapper input");
        if (oldInput) {
            persistentBuffer.push(oldInput.value);
        }
    } else {
        persistentBuffer = [];
    }

    clearOutput();
    runBtn.disabled = true;

    // Mobile UX: Automatically switch to output tab if on mobile
    const outputTabBtn = document.querySelector('.tab-link[data-target="output-panel"]');
    if (window.innerWidth <= 900 && outputTabBtn) {
        outputTabBtn.click();
    }

    currentRunBuffer = [...persistentBuffer];

    try {
        setStatus("running", "Running your code...");

        // Auto-load packages needed by imports (e.g. matplotlib, numpy, pandas)
        if (pyodide.loadPackagesFromImports) {
            setStatus("loading", "Checking & loading packages...");
            await pyodide.loadPackagesFromImports(allPython, {
                messageCallback: (msg) => setStatus("loading", msg)
            });
        }

        // Dedicated setup for matplotlib if used
        if (allPython.includes("matplotlib") || allPython.includes("plt.")) {
            setStatus("loading", "Loading matplotlib...");
            await pyodide.loadPackage("matplotlib");
            await pyodide.runPythonAsync(`
try:
    import io, base64, sys
    import matplotlib
    matplotlib.use('agg')
    import matplotlib.pyplot as plt
    from matplotlib.ticker import MultipleLocator

    def _sandbox_custom_show(*args, **kwargs):
        # Auto-enhance student graphs for clear 1-by-1 math readability
        try:
            fig = plt.gcf()
            for ax in fig.axes:
                # 1. Put dots on discrete series so students see exact points
                for line in ax.get_lines():
                    if line.get_marker() in ('', 'None', None):
                        xdata = line.get_xdata()
                        if len(xdata) <= 30:
                            line.set_marker('o')
                            line.set_markersize(5.5)

                # 2. Draw prominent origin axes (x=0, y=0) if in range
                xlim = ax.get_xlim()
                ylim = ax.get_ylim()
                if xlim[0] < 0 < xlim[1]:
                    ax.axvline(0, color='#334155', linewidth=1.1, zorder=2)
                if ylim[0] < 0 < ylim[1]:
                    ax.axhline(0, color='#334155', linewidth=1.1, zorder=2)

                # 3. Orderly leveling: step by 1 on small ranges instead of decimals like 2.5
                x_span = abs(xlim[1] - xlim[0])
                y_span = abs(ylim[1] - ylim[0])

                if x_span <= 22:
                    ax.xaxis.set_major_locator(MultipleLocator(1))
                elif x_span <= 44:
                    ax.xaxis.set_major_locator(MultipleLocator(2))

                if y_span <= 25:
                    ax.yaxis.set_major_locator(MultipleLocator(1))
                elif y_span <= 50:
                    ax.yaxis.set_major_locator(MultipleLocator(2))

                # 4. Clean math grid and readable tick labels
                ax.grid(True, linestyle='--', alpha=0.55, color='#94a3b8')
                ax.tick_params(labelsize=8.5)
        except Exception:
            pass

        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight', dpi=150)
        buf.seek(0)
        b64 = base64.b64encode(buf.read()).decode('ascii')
        buf.close()
        sys.stdout.write(f"__SANDBOX_IMAGE__:data:image/png;base64,{b64}\\n")
        plt.clf()
        plt.close('all')

    plt.show = _sandbox_custom_show
    plt.clf()
    plt.close('all')
except Exception:
    pass
`);
        }

        setStatus("running", "Running your code...");
        syncPythonFiles(projectFiles);
        await pyodide.runPythonAsync(code, { filename: "main.py" });

        // Auto-show plot if one was created without an explicit plt.show()
        if (allPython.includes("matplotlib") || allPython.includes("plt.")) {
            await pyodide.runPythonAsync(`
try:
    import matplotlib.pyplot as plt
    if plt.get_fignums():
        plt.show()
except Exception:
    pass
`);
        }
        
        if (!output.innerHTML.includes("___WAITING_FOR_INPUT___")) {
            const separator = output.textContent.length > 0 ? "\n" : "";
            appendOutput(separator + "✓ Program finished successfully.\n", "ok");
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

// Write every project file into Pyodide's in-memory file system so that
// `import helpers` and `open("data.txt")` work from main.py.
const PY_PROJECT_DIR = "/home/pyodide/project";
function syncPythonFiles(files) {
    const FS = pyodide.FS;
    try { FS.mkdirTree(PY_PROJECT_DIR); } catch (e) { /* exists */ }
    // Remove files from the previous run (deleted/renamed files must disappear)
    for (const name of FS.readdir(PY_PROJECT_DIR)) {
        if (name === "." || name === "..") continue;
        const path = `${PY_PROJECT_DIR}/${name}`;
        try { if (FS.isFile(FS.stat(path).mode)) FS.unlink(path); } catch (e) { /* ignore */ }
    }
    for (const f of files) FS.writeFile(`${PY_PROJECT_DIR}/${f.name}`, f.content);
    // Forget previously imported student modules so edits take effect
    pyodide.runPython(`
import os, sys, importlib
sys.dont_write_bytecode = True
os.chdir(${JSON.stringify(PY_PROJECT_DIR)})
if ${JSON.stringify(PY_PROJECT_DIR)} not in sys.path:
    sys.path.insert(0, ${JSON.stringify(PY_PROJECT_DIR)})
for _name, _mod in list(sys.modules.items()):
    if (getattr(_mod, "__file__", None) or "").startswith(${JSON.stringify(PY_PROJECT_DIR)}):
        del sys.modules[_name]
importlib.invalidate_caches()
`);
}

let currentPreviewPage = "index.html";
let previewHistory = ["index.html"];
let previewHistoryIndex = 0;

function rewriteNavigationJS(js) {
    if (!js || typeof js !== "string") return js;
    return js
        .replace(/(^|[^.\w$])(?:(?:window|document|self|top|parent)\s*\.\s*)*location\s*\.\s*(href|assign|replace|reload|pathname|search|hash)\b/g, "$1window.__sandboxLoc.$2")
        .replace(/(^|[^.\w$])(?:(?:window|document|self|top|parent)\s*\.\s*)+location\s*=(?!=)/g, "$1window.__sandboxLoc.href =")
        .replace(/(^|[;{}\(\)\[\]\?\:\,\!\|\&\n\r]|(?:\b(?:return|yield|=>)\s+))\s*location\s*=(?!=)/g, "$1 window.__sandboxLoc.href =")
        .replace(/(^|[^.\w$])(?:(?:window|self|top|parent)\s*\.\s*)*history\s*\.\s*(back|forward|go)\b/g, "$1window.__sandboxHistory.$2");
}

function parseHTMLTarget(rawTarget) {
    const raw = String(rawTarget || "").trim();
    let hash = "";
    let search = "";
    let pathPart = raw;
    const hashIdx = pathPart.indexOf("#");
    if (hashIdx !== -1) {
        hash = pathPart.slice(hashIdx);
        pathPart = pathPart.slice(0, hashIdx);
    }
    const qIdx = pathPart.indexOf("?");
    if (qIdx !== -1) {
        search = pathPart.slice(qIdx);
        pathPart = pathPart.slice(0, qIdx);
    }
    pathPart = pathPart.replace(/^(?:\.\/|\/|\.\.\/)+/, "").trim();
    const baseName = pathPart.split("/").pop() || "";

    const projectFiles = SandboxFiles.getFiles('html');
    const htmlFiles = projectFiles.filter(f => /\.html$/i.test(f.name));

    if (!baseName) {
        return { found: true, pageName: "index.html", hash, search };
    }

    const exact = htmlFiles.find(f => f.name.toLowerCase() === baseName.toLowerCase());
    if (exact) {
        return { found: true, pageName: exact.name, hash, search };
    }

    if (!baseName.includes(".")) {
        const withExt = htmlFiles.find(f => f.name.toLowerCase() === (baseName + ".html").toLowerCase());
        if (withExt) {
            return { found: true, pageName: withExt.name, hash, search };
        }
    }

    const fallbackName = /\.html$/i.test(baseName) ? baseName : `${baseName}.html`;
    return { found: false, pageName: fallbackName, hash, search };
}

function buildMissingPageHTML(missingPageName) {
    const safeName = String(missingPageName).replace(/[<>&"']/g, "");
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      margin: 0;
      padding: 48px 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 75vh;
    }
    .missing-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 32px;
      max-width: 440px;
      text-align: center;
      box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
    }
    .missing-icon {
      font-size: 2.4rem;
      margin-bottom: 12px;
    }
    h2 {
      margin: 0 0 8px;
      font-size: 1.25rem;
      color: #0f172a;
    }
    code {
      background: #f1f5f9;
      color: #2563eb;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
    }
    p {
      color: #64748b;
      font-size: 0.92rem;
      line-height: 1.5;
      margin: 0 0 22px;
    }
    .btn-row {
      display: flex;
      gap: 10px;
      justify-content: center;
      flex-wrap: wrap;
    }
    button {
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.88rem;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease;
    }
    .btn-back {
      background: #f1f5f9;
      color: #334155;
      border-color: #cbd5e1;
    }
    .btn-back:hover { background: #e2e8f0; }
    .btn-create {
      background: #2563eb;
      color: #ffffff;
    }
    .btn-create:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="missing-card">
    <div class="missing-icon">📄</div>
    <h2><code>${safeName}</code> Not Found Yet</h2>
    <p>Your button or link navigated to <code>${safeName}</code>, which hasn't been created in your project tabs yet.</p>
    <div class="btn-row">
      <button class="btn-back" onclick="window.__sandboxHistory.back()">⬅ Go Back</button>
      <button class="btn-create" onclick="window.__sandboxCreatePage('${safeName}')">＋ Create ${safeName}</button>
    </div>
  </div>
</body>
</html>`;
}

// Compile a single HTML file (inlining project CSS/JS and rewriting navigation calls)
function compileSingleHTMLPage(pageName, filesMap, options = {}) {
    const lookup = (src) => filesMap[src.replace(/^(?:\.\/|\/)+/, "").toLowerCase()];
    const lowerTarget = (pageName || "index.html").toLowerCase();
    let html = filesMap[lowerTarget];
    if (html === undefined) {
        html = buildMissingPageHTML(pageName || "index.html");
    }

    html = html.replace(/<link\b[^>]*?\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi, (tag, href) => {
        const css = lookup(href);
        if (css === undefined || !/\.css$/i.test(href)) return tag;
        return `<style data-file="${href}">\n${css.replace(/<\/style/gi, "<\\/style")}\n</style>`;
    });
    html = html.replace(/<script\b([^>]*?)\bsrc\s*=\s*["']([^"']+)["']([^>]*)>\s*<\/script>/gi, (tag, before, src, after) => {
        const js = lookup(src);
        if (js === undefined || !/\.js$/i.test(src)) return tag;
        return `<script${before}${after} data-file="${src}">\n${rewriteNavigationJS(js).replace(/<\/script/gi, "<\\/script")}\n</script>`;
    });
    html = html.replace(/<script\b([^>]*?)\bsrc\s*=\s*["']([^"']+)["']([^>]*)\/>/gi, (tag, before, src, after) => {
        const js = lookup(src);
        if (js === undefined || !/\.js$/i.test(src)) return tag;
        return `<script${before}${after} data-file="${src}">\n${rewriteNavigationJS(js).replace(/<\/script/gi, "<\\/script")}\n</script>`;
    });

    // Rewrite inline <script> blocks
    html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (match, attrs, body) => {
        if (/\bdata-sandbox-nav\b|\bdata-file\b/i.test(attrs)) return match;
        return `<script${attrs}>${rewriteNavigationJS(body)}</script>`;
    });

    // Rewrite inline event handlers (e.g., onclick="window.location.href='page2.html'")
    html = html.replace(/(\bon[a-z]+\s*=\s*)(?:"([^"]*)"|'([^']*)')/gi, (match, prefix, dq, sq) => {
        if (dq !== undefined) return `${prefix}"${rewriteNavigationJS(dq)}"`;
        return `${prefix}'${rewriteNavigationJS(sq)}'`;
    });

    // Rewrite href="javascript:..."
    html = html.replace(/(\bhref\s*=\s*)(?:"javascript:([^"]*)"|'javascript:([^']*)')/gi, (match, prefix, dq, sq) => {
        if (dq !== undefined) return `${prefix}"javascript:${rewriteNavigationJS(dq)}"`;
        return `${prefix}'javascript:${rewriteNavigationJS(sq)}'`;
    });

    // Rewrite relative <a href="..."> so the browser never natively navigates to /sandbox/index.html
    html = html.replace(/<a\b([^>]*?)\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')([^>]*)>/gi, (match, before, dq, sq, after) => {
        const rawHref = (dq !== undefined ? dq : sq).trim();
        if (!rawHref || /^(?:https?:|mailto:|tel:|javascript:|#|data:|blob:)/i.test(rawHref)) {
            return match;
        }
        const safeAttr = rawHref.replace(/"/g, "&quot;");
        return `<a${before}href="javascript:void(0)" data-sandbox-href="${safeAttr}"${after}>`;
    });

    // Rewrite relative <form action="..."> so form submit never natively navigates to /sandbox/index.html
    html = html.replace(/<form\b([^>]*?)\baction\s*=\s*(?:"([^"]*)"|'([^']*)')([^>]*)>/gi, (match, before, dq, sq, after) => {
        const rawAction = (dq !== undefined ? dq : sq).trim();
        if (!rawAction || /^(?:https?:|mailto:|tel:|javascript:|#|data:|blob:)/i.test(rawAction)) {
            return match;
        }
        const safeAttr = rawAction.replace(/"/g, "&quot;");
        return `<form${before}action="javascript:void(0)" data-sandbox-action="${safeAttr}"${after}>`;
    });

    const standalonePayload = options.standalonePages
        ? JSON.stringify(options.standalonePages).replace(/<\/script/gi, "<\\/script")
        : "null";

    const navRuntime = `<style data-sandbox-nav="1">
@keyframes __sandboxPageFadeIn {
  from { opacity: 0; transform: translateY(3px); }
  to { opacity: 1; transform: translateY(0); }
}
html { animation: __sandboxPageFadeIn 0.16s ease-out; }
</style>
<script data-sandbox-nav="1">
(function() {
  window.__sandboxCurrentPage = ${JSON.stringify(pageName || "index.html")};
  window.__sandboxCurrentHash = ${JSON.stringify(options.hash || "")};
  window.__sandboxCurrentSearch = ${JSON.stringify(options.search || "")};
  var standalonePages = ${standalonePayload};

  function getStandalonePages() {
    if (standalonePages) return standalonePages;
    try {
      var raw = sessionStorage.getItem('__sandboxStandalonePages');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function loadStandalonePage(targetKey) {
    var pages = getStandalonePages();
    if (!pages) return false;
    var nextHtml = pages[targetKey];
    if (!nextHtml) return false;
    document.open();
    document.write(nextHtml);
    document.close();
    return true;
  }

  if (standalonePages) {
    try {
      sessionStorage.setItem('__sandboxStandalonePages', JSON.stringify(standalonePages));
      sessionStorage.setItem('__sandboxStandaloneHist', JSON.stringify([(window.__sandboxCurrentPage || 'index.html').toLowerCase()]));
      sessionStorage.setItem('__sandboxStandaloneHistIdx', '0');
    } catch (e) {}
  }

  window.__sandboxNavigate = function(target, replace) {
    if (target === undefined || target === null) return;
    var str = String(target).trim();
    if (!str) return;
    if (str.charAt(0) === '#') {
      window.__sandboxCurrentHash = str;
      var el = document.querySelector(str);
      if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (/^(https?:|mailto:|tel:)/i.test(str)) {
      window.open(str, '_blank', 'noopener');
      return;
    }
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'sandbox-navigate',
        target: str,
        replace: !!replace
      }, '*');
      return;
    }
    var pages = getStandalonePages();
    if (pages) {
      var clean = str.split('#')[0].split('?')[0].replace(/^(?:\\.\\/|\\/|\\.\\.\\/)+/, '').trim() || 'index.html';
      var key = clean.toLowerCase();
      if (!key.includes('.')) key += '.html';
      if (pages[key]) {
        try {
          var hist = JSON.parse(sessionStorage.getItem('__sandboxStandaloneHist') || '["index.html"]');
          var idx = parseInt(sessionStorage.getItem('__sandboxStandaloneHistIdx') || String(hist.length - 1), 10);
          if (isNaN(idx) || idx < 0 || idx >= hist.length) idx = hist.length - 1;
          if (replace) {
            hist[idx] = key;
          } else {
            hist = hist.slice(0, idx + 1);
            hist.push(key);
            idx = hist.length - 1;
          }
          sessionStorage.setItem('__sandboxStandaloneHist', JSON.stringify(hist));
          sessionStorage.setItem('__sandboxStandaloneHistIdx', String(idx));
        } catch (e) {}
        loadStandalonePage(key);
      }
    }
  };

  window.__sandboxCreatePage = function(name) {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'sandbox-create-page', pageName: name }, '*');
    }
  };

  function navigateStandaloneHistory(delta) {
    var pages = getStandalonePages();
    if (!pages) return;
    try {
      var hist = JSON.parse(sessionStorage.getItem('__sandboxStandaloneHist') || '["index.html"]');
      var idx = parseInt(sessionStorage.getItem('__sandboxStandaloneHistIdx') || String(hist.length - 1), 10);
      if (isNaN(idx)) idx = hist.length - 1;
      var nextIdx = idx + delta;
      if (nextIdx < 0 || nextIdx >= hist.length) return;
      var targetKey = hist[nextIdx] || 'index.html';
      sessionStorage.setItem('__sandboxStandaloneHistIdx', String(nextIdx));
      loadStandalonePage(targetKey);
    } catch (e) {}
  }

  window.__sandboxHistory = {
    back: function() {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'sandbox-history', delta: -1 }, '*');
        return;
      }
      navigateStandaloneHistory(-1);
    },
    forward: function() {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'sandbox-history', delta: 1 }, '*');
        return;
      }
      navigateStandaloneHistory(1);
    },
    go: function(delta) {
      var d = Number(delta) || 0;
      if (d === 0) {
        window.__sandboxNavigate(window.__sandboxCurrentPage, true);
      } else if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'sandbox-history', delta: d }, '*');
      } else {
        navigateStandaloneHistory(d);
      }
    }
  };

  window.__sandboxLoc = {
    get href() { return window.__sandboxCurrentPage + (window.__sandboxCurrentSearch || '') + (window.__sandboxCurrentHash || ''); },
    set href(val) { window.__sandboxNavigate(val, false); },
    get pathname() { return '/' + window.__sandboxCurrentPage; },
    set pathname(val) { window.__sandboxNavigate(val, false); },
    get search() { return window.__sandboxCurrentSearch || ''; },
    set search(val) {
      var s = val ? (String(val).charAt(0) === '?' ? String(val) : '?' + val) : '';
      window.__sandboxNavigate(window.__sandboxCurrentPage + s + (window.__sandboxCurrentHash || ''), false);
    },
    get hash() { return window.__sandboxCurrentHash || ''; },
    set hash(val) {
      var h = val ? (String(val).charAt(0) === '#' ? String(val) : '#' + val) : '';
      window.__sandboxNavigate(h || '#');
    },
    assign: function(val) { window.__sandboxNavigate(val, false); },
    replace: function(val) { window.__sandboxNavigate(val, true); },
    reload: function() { window.__sandboxNavigate(window.__sandboxCurrentPage, true); },
    toString: function() { return this.href; }
  };

  var origOpen = window.open;
  window.open = function(url, target, features) {
    if (url && typeof url === 'string' && !/^(https?:|mailto:|tel:|javascript:|about:|blob:|data:)/i.test(url)) {
      window.__sandboxNavigate(url, false);
      return window;
    }
    return origOpen ? origOpen.call(window, url, target, features) : null;
  };

  window.addEventListener('click', function(e) {
    var el = e.target && e.target.nodeType === 1 ? e.target : (e.target && e.target.parentElement);
    if (!el || !el.closest) return;
    var link = el.closest('a[data-sandbox-href], a[href]');
    if (!link) {
      var parentBtn = el.closest('button');
      if (parentBtn && parentBtn.querySelector) {
        link = parentBtn.querySelector('a[data-sandbox-href], a[href]');
      }
    }
    if (link) {
      var rawHref = link.getAttribute('data-sandbox-href') || link.getAttribute('href');
      if (!rawHref || /^javascript:/i.test(rawHref)) return;
      if (rawHref.charAt(0) === '#') {
        e.preventDefault();
        window.__sandboxNavigate(rawHref);
        return;
      }
      if (/^(https?:|mailto:|tel:)/i.test(rawHref)) {
        e.preventDefault();
        if (origOpen) origOpen.call(window, rawHref, '_blank', 'noopener');
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      window.__sandboxNavigate(rawHref, false);
      return;
    }
    var actionBtn = el.closest('button[formaction], input[formaction], [data-href]');
    if (actionBtn) {
      var dest = actionBtn.getAttribute('formaction') || actionBtn.getAttribute('data-href');
      if (dest && !/^(https?:|mailto:|tel:|javascript:|#)/i.test(dest)) {
        e.preventDefault();
        e.stopPropagation();
        window.__sandboxNavigate(dest, false);
      }
    }
  }, true);

  window.addEventListener('submit', function(e) {
    var form = e.target;
    if (!form || !form.getAttribute) return;
    var action = form.getAttribute('data-sandbox-action') || form.getAttribute('action');
    if (action && !/^(https?:|mailto:|tel:|javascript:|#)/i.test(action)) {
      e.preventDefault();
      e.stopPropagation();
      window.__sandboxNavigate(action, false);
    }
  }, true);

  window.addEventListener('DOMContentLoaded', function() {
    if (window.__sandboxCurrentHash) {
      var targetEl = document.querySelector(window.__sandboxCurrentHash);
      if (targetEl && targetEl.scrollIntoView) targetEl.scrollIntoView();
    }
  });
})();
</script>`;

    if (/<head\b[^>]*>/i.test(html)) {
        html = html.replace(/<head\b[^>]*>/i, (m) => `${m}\n${navRuntime}`);
    } else if (/<html\b[^>]*>/i.test(html)) {
        html = html.replace(/<html\b[^>]*>/i, (m) => `${m}\n<head>${navRuntime}</head>`);
    } else {
        html = navRuntime + "\n" + html;
    }

    return html;
}

// Build a single HTML page (defaulting to currentPreviewPage / index.html), inlining linked project CSS/JS files.
function buildHTMLDocument(targetPageName, options = {}) {
    const filesMap = {};
    const projectFiles = SandboxFiles.getFiles('html');
    for (const f of projectFiles) filesMap[f.name.toLowerCase()] = f.content;
    if (!filesMap["index.html"] && editor) {
        filesMap["index.html"] = editor.getValue();
    }

    const pageName = targetPageName || currentPreviewPage || "index.html";

    if (options.standalone) {
        const standalonePages = {};
        for (const f of projectFiles) {
            if (/\.html$/i.test(f.name)) {
                standalonePages[f.name.toLowerCase()] = compileSingleHTMLPage(f.name, filesMap);
            }
        }
        return compileSingleHTMLPage(pageName, filesMap, { ...options, standalonePages });
    }

    return compileSingleHTMLPage(pageName, filesMap, options);
}

function updatePreviewNavUI() {
    const backBtn = document.getElementById("previewBackBtn");
    const forwardBtn = document.getElementById("previewForwardBtn");
    const pageSelect = document.getElementById("previewPageSelect");
    const outputTitle = document.getElementById("outputTitle");

    if (backBtn) backBtn.disabled = previewHistoryIndex <= 0;
    if (forwardBtn) forwardBtn.disabled = previewHistoryIndex >= previewHistory.length - 1;

    if (pageSelect) {
        const htmlFiles = SandboxFiles.getFiles('html')
            .filter(f => /\.html$/i.test(f.name))
            .map(f => f.name);
        if (!htmlFiles.includes("index.html")) htmlFiles.unshift("index.html");
        const existsInList = htmlFiles.some(n => n.toLowerCase() === currentPreviewPage.toLowerCase());
        if (!existsInList && currentPreviewPage) {
            htmlFiles.push(currentPreviewPage);
        }

        pageSelect.innerHTML = "";
        for (const name of htmlFiles) {
            const opt = document.createElement("option");
            opt.value = name;
            const fileExists = SandboxFiles.getFiles('html').some(f => f.name.toLowerCase() === name.toLowerCase());
            opt.textContent = fileExists ? name : `${name} (not created)`;
            if (name.toLowerCase() === currentPreviewPage.toLowerCase()) {
                opt.selected = true;
            }
            pageSelect.appendChild(opt);
        }
    }

    if (outputTitle && currentLanguage === 'html') {
        outputTitle.textContent = `Website Preview — ${currentPreviewPage}`;
    }
}

function navigatePreviewTo(rawTarget, options = {}) {
    const { pushHistory = true, replaceHistory = false, animate = false } = options;
    const resolved = parseHTMLTarget(rawTarget);
    const pageName = resolved.pageName;
    const fullEntry = pageName + (resolved.search || "") + (resolved.hash || "");

    if (replaceHistory) {
        previewHistory[previewHistoryIndex] = fullEntry;
    } else if (pushHistory && (previewHistory[previewHistoryIndex] || "").toLowerCase() !== fullEntry.toLowerCase()) {
        previewHistory = previewHistory.slice(0, previewHistoryIndex + 1);
        previewHistory.push(fullEntry);
        previewHistoryIndex = previewHistory.length - 1;
    }

    currentPreviewPage = pageName;
    const preview = document.getElementById("previewFrame");
    if (!preview) return;

    if (animate) {
        preview.classList.add("preview-transitioning");
    }

    preview.srcdoc = buildHTMLDocument(pageName, {
        hash: resolved.hash,
        search: resolved.search
    });

    if (animate) {
        requestAnimationFrame(() => {
            setTimeout(() => preview.classList.remove("preview-transitioning"), 60);
        });
    } else {
        preview.classList.remove("preview-transitioning");
    }

    updatePreviewNavUI();
    setStatus("ready", resolved.found ? `Viewing ${pageName}` : `${pageName} not created yet`);
}

function navigatePreviewHistory(delta) {
    const nextIdx = previewHistoryIndex + delta;
    if (nextIdx < 0 || nextIdx >= previewHistory.length) return;
    previewHistoryIndex = nextIdx;
    const targetPage = previewHistory[previewHistoryIndex];
    navigatePreviewTo(targetPage, { pushHistory: false, replaceHistory: false, animate: true });
}

function runHTML() {
    const activeFile = SandboxFiles.activeName();
    const targetPage = (activeFile && /\.html$/i.test(activeFile))
        ? activeFile
        : (currentPreviewPage || "index.html");
    navigatePreviewTo(targetPage, { pushHistory: true, animate: false });
    setStatus("ready", `Website preview updated (${targetPage})!`);
}

async function startNewStudentDemo() {
    isNewStudentDemo = true;
    SandboxFiles.openMain();
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

    // Reset confirmation modal handlers
    const resetModal = document.getElementById("resetModal");
    const openResetModal = () => resetModal && resetModal.classList.add("show");
    const closeResetModal = () => resetModal && resetModal.classList.remove("show");

    document.getElementById("resetBtn").addEventListener("click", openResetModal);
    const resetCancelBtn = document.getElementById("resetCancelBtn");
    if (resetCancelBtn) resetCancelBtn.addEventListener("click", closeResetModal);
    const resetModalCloseBtn = document.getElementById("resetModalCloseBtn");
    if (resetModalCloseBtn) resetModalCloseBtn.addEventListener("click", closeResetModal);
    if (resetModal) {
        resetModal.addEventListener("click", (e) => {
            if (e.target === resetModal) closeResetModal();
        });
    }

    const resetConfirmBtn = document.getElementById("resetConfirmBtn");
    if (resetConfirmBtn) {
        resetConfirmBtn.addEventListener("click", () => {
            // Resets only the open file: main file -> starter code, other files -> empty
            if (!SandboxFiles.isMainActive()) {
                editor.setValue("");
            } else if (currentLanguage === 'html') {
                editor.setValue(EXAMPLES.html_hello);
            } else {
                editor.setValue(DEFAULT_CODE);
            }
            clearOutput();
            setStatus("ready", "Code reset to starter template.");
            closeResetModal();
        });
    }

    const newStudentBtn = document.getElementById("newStudentBtn");
    if (newStudentBtn) {
        newStudentBtn.addEventListener("click", startNewStudentDemo);
    }

    document.getElementById("launchBtn").addEventListener("click", () => {
        if (currentLanguage === 'html') {
            const code = buildHTMLDocument(currentPreviewPage || "index.html", { standalone: true });
            const newWindow = window.open();
            if (newWindow) {
                newWindow.document.write(code);
                newWindow.document.close();
            }
        }
    });

    // Preview Navigation Bar Controls
    const previewBackBtn = document.getElementById("previewBackBtn");
    if (previewBackBtn) {
        previewBackBtn.addEventListener("click", () => navigatePreviewHistory(-1));
    }
    const previewForwardBtn = document.getElementById("previewForwardBtn");
    if (previewForwardBtn) {
        previewForwardBtn.addEventListener("click", () => navigatePreviewHistory(1));
    }
    const previewHomeBtn = document.getElementById("previewHomeBtn");
    if (previewHomeBtn) {
        previewHomeBtn.addEventListener("click", () => navigatePreviewTo("index.html", { pushHistory: true, animate: true }));
    }
    const previewReloadBtn = document.getElementById("previewReloadBtn");
    if (previewReloadBtn) {
        previewReloadBtn.addEventListener("click", () => navigatePreviewTo(currentPreviewPage || "index.html", { pushHistory: false, animate: true }));
    }
    const previewPageSelect = document.getElementById("previewPageSelect");
    if (previewPageSelect) {
        previewPageSelect.addEventListener("change", (e) => {
            if (e.target.value) {
                navigatePreviewTo(e.target.value, { pushHistory: true, animate: true });
            }
        });
    }
    const previewNewPageBtn = document.getElementById("previewNewPageBtn");
    if (previewNewPageBtn) {
        previewNewPageBtn.addEventListener("click", () => {
            SandboxFiles.create("html");
        });
    }

    // Listen for navigation and page-creation messages from the preview iframe
    window.addEventListener("message", (e) => {
        if (!e.data || typeof e.data !== "object") return;
        if (e.data.type === "sandbox-navigate" && e.data.target) {
            navigatePreviewTo(e.data.target, {
                pushHistory: !e.data.replace,
                replaceHistory: !!e.data.replace,
                animate: true
            });
        } else if (e.data.type === "sandbox-history" && typeof e.data.delta === "number") {
            navigatePreviewHistory(e.data.delta);
        } else if (e.data.type === "sandbox-create-page" && e.data.pageName) {
            const created = SandboxFiles.createFile(e.data.pageName);
            if (created) {
                navigatePreviewTo(created, { replaceHistory: true, animate: true });
            }
        }
    });

    // Fallback: intercept native iframe navigation or browser-back srcdoc restoration
    const previewFrameEl = document.getElementById("previewFrame");
    if (previewFrameEl) {
        previewFrameEl.addEventListener("load", () => {
            try {
                const win = previewFrameEl.contentWindow;
                const loc = win && win.location;
                if (loc && loc.href && !loc.href.startsWith("about:")) {
                    const pathname = decodeURIComponent(loc.pathname || "");
                    const fileName = pathname.split("/").pop() || "index.html";
                    navigatePreviewTo(fileName + (loc.search || "") + (loc.hash || ""), { pushHistory: true, animate: true });
                } else if (win && win.__sandboxCurrentPage) {
                    const loadedPage = win.__sandboxCurrentPage;
                    if (loadedPage.toLowerCase() !== (currentPreviewPage || "").toLowerCase()) {
                        currentPreviewPage = loadedPage;
                        const matchIdx = previewHistory.findIndex(h => h.split(/[?#]/)[0].toLowerCase() === loadedPage.toLowerCase());
                        if (matchIdx !== -1) previewHistoryIndex = matchIdx;
                        updatePreviewNavUI();
                    }
                }
            } catch (err) { /* ignore cross-origin */ }
        });
    }

    window.addEventListener("sandbox:files-changed", (e) => {
        if (currentLanguage === 'html') {
            updatePreviewNavUI();
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
            // Share the whole project (all files) in the URL
            const payload = JSON.stringify({
                language: currentLanguage,
                files: SandboxFiles.getFiles(currentLanguage),
                active: SandboxFiles.activeName()
            });
            // We use btoa(unescape(encodeURIComponent(str))) for robust Unicode support
            const encoded = btoa(unescape(encodeURIComponent(payload)));
            const shareUrl = window.location.origin + window.location.pathname + "#project=" + encoded;
            
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

    // Live Share UI Wiring
    const liveBtn = document.getElementById("liveShareBtn");
    if (liveBtn) {
        liveBtn.addEventListener("click", () => {
            if (SandboxLiveShare.isConnected()) {
                SandboxLiveShare.openLiveModal(SandboxLiveShare.getRoomId());
            } else {
                SandboxLiveShare.startSession(null, true);
            }
        });
    }

    const liveShareCloseBtn = document.getElementById("liveShareCloseBtn");
    if (liveShareCloseBtn) liveShareCloseBtn.addEventListener("click", SandboxLiveShare.closeLiveModal);

    const closeLiveModalBtn = document.getElementById("closeLiveModalBtn");
    if (closeLiveModalBtn) closeLiveModalBtn.addEventListener("click", SandboxLiveShare.closeLiveModal);

    const copyLiveUrlBtn = document.getElementById("copyLiveUrlBtn");
    if (copyLiveUrlBtn) {
        copyLiveUrlBtn.addEventListener("click", async () => {
            const input = document.getElementById("liveShareUrlInput");
            if (input) {
                await navigator.clipboard.writeText(input.value);
                const original = copyLiveUrlBtn.innerHTML;
                copyLiveUrlBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => { copyLiveUrlBtn.innerHTML = original; }, 1500);
            }
        });
    }

    const copyTeacherLiveUrlBtn = document.getElementById("copyTeacherLiveUrlBtn");
    if (copyTeacherLiveUrlBtn) {
        copyTeacherLiveUrlBtn.addEventListener("click", async () => {
            const input = document.getElementById("liveShareTeacherUrlInput");
            if (input) {
                await navigator.clipboard.writeText(input.value);
                const original = copyTeacherLiveUrlBtn.innerHTML;
                copyTeacherLiveUrlBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => { copyTeacherLiveUrlBtn.innerHTML = original; }, 1500);
            }
        });
    }

    const stopLiveSessionBtn = document.getElementById("stopLiveSessionBtn");
    if (stopLiveSessionBtn) {
        stopLiveSessionBtn.addEventListener("click", () => {
            SandboxLiveShare.stopSession();
            SandboxLiveShare.closeLiveModal();
        });
    }

    const liveShareReconnectBtn = document.getElementById("liveShareReconnectBtn");
    if (liveShareReconnectBtn) {
        liveShareReconnectBtn.addEventListener("click", () => {
            const input = document.getElementById("liveShareServerInput");
            if (input) SandboxLiveShare.setCustomServerAndReconnect(input.value);
        });
    }

    document.getElementById("examplesSelect").addEventListener("change", (e) => {
        const key = e.target.value;
        if (!key) return;
        const example = EXAMPLES[key];
        if (example) {
            SandboxFiles.openMain(); // examples always load into main.py / index.html
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
        if (e.key === "Escape") {
            if (helpModal && helpModal.classList.contains("show")) closeHelp();
            if (resetModal && resetModal.classList.contains("show")) closeResetModal();
        }
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
    // Each language keeps its own multi-file project (auto-saved by SandboxFiles)
    currentLanguage = newLanguage;
    window.currentLanguage = newLanguage;
    try { localStorage.setItem("sandbox.lastLanguage", newLanguage); } catch (e) { /* blocked */ }
    
    // Sync dropdown if called programmatically
    const langSelect = document.getElementById("languageSelect");
    if (langSelect) langSelect.value = newLanguage;
    
    const outputDiv = document.getElementById("output");
    const previewFrame = document.getElementById("previewFrame");
    const previewNavBar = document.getElementById("previewNavBar");
    const examplesSelect = document.getElementById("examplesSelect");
    const editorGrid = document.querySelector(".editor-grid");
    const launchBtn = document.getElementById("launchBtn");
    const outputTitle = document.getElementById("outputTitle");
    const editorFileName = document.getElementById("editorFileName");
    const editorLangBadge = document.getElementById("editorLangBadge");
    const levelSelect = document.getElementById("levelSelect");
    const clearOutputBtn = document.getElementById("clearOutputBtn");
    
    if (newLanguage === 'html') {
        outputDiv.style.display = "none";
        previewFrame.style.display = "block";
        if (previewNavBar) previewNavBar.style.display = "flex";
        launchBtn.style.display = "flex";
        levelSelect.style.display = "none";
        if (clearOutputBtn) clearOutputBtn.style.display = "none";
        outputTitle.textContent = `Website Preview — ${currentPreviewPage || "index.html"}`;
        editorFileName.textContent = "index.html";
        editorLangBadge.innerHTML = '<i class="fas fa-code"></i> HTML / Web';
        editorGrid.style.gridTemplateColumns = "1fr 1fr";
        currentLayoutMode = 0;
        examplesSelect.innerHTML = `
            <option value="">📚 Load Web Example...</option>
            <option value="html_hello">Hello Website</option>
            <option value="html_shapes">CSS Shapes & Hover</option>
        `;
        SandboxFiles.setLanguage('html');
        updatePreviewNavUI();
        runHTML();
        if (window.SandboxLiveShare && typeof window.SandboxLiveShare.onLanguageChanged === 'function') {
            window.SandboxLiveShare.onLanguageChanged('html');
        }
        setTimeout(() => editor.refresh(), 50);
        setStatus("ready", "Switched to HTML Mode.");
    } else {
        outputDiv.style.display = "block";
        previewFrame.style.display = "none";
        if (previewNavBar) previewNavBar.style.display = "none";
        launchBtn.style.display = "none";
        levelSelect.style.display = "inline-block";
        if (clearOutputBtn) clearOutputBtn.style.display = "inline-flex";
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
            <option value="chart">Data Plot (Matplotlib)</option>
        `;
        SandboxFiles.setLanguage('python');
        if (window.SandboxLiveShare && typeof window.SandboxLiveShare.onLanguageChanged === 'function') {
            window.SandboxLiveShare.onLanguageChanged('python');
        }
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
    if (window.SandboxLiveShare && typeof window.SandboxLiveShare.checkUrlForSession === 'function') {
        window.SandboxLiveShare.checkUrlForSession();
    }
});

// Social Sharing Functions
window.shareOnFacebook = function() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
};

window.shareOnTwitter = function() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank', 'width=600,height=400');
};

window.shareOnLinkedIn = function() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=400');
};

window.shareByEmail = function() {
    const title = document.title;
    const url = window.location.href;
    const subject = `Check out: ${title}`;
    const body = `I thought you might be interested in this: ${url}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
