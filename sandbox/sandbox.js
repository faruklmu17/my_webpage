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
`
};

let editor = null;
let pyodide = null;
let inputBuffer = []; // Global buffer for stdin inputs

const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const runBtn = document.getElementById("runBtn");
const output = document.getElementById("output");

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
    if (!pyodide) { callback([]); return; }
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
async function runCode() {
    if (!pyodide) return;
    const code = editor.getValue();
    clearOutput();
    appendOutput("▶ Running...\n\n", "muted");
    runBtn.disabled = true;

    // Mobile UX: Automatically switch to output tab if on mobile
    const outputTabBtn = document.querySelector('.tab-link[data-target="output-panel"]');
    if (window.innerWidth <= 900 && outputTabBtn) {
        outputTabBtn.click();
    }

    // Get inputs from the stdin panel
    const stdinText = document.getElementById("stdinInput").value;
    let inputs = [];
    
    // Only populate if there's actual non-whitespace content, 
    // or if the user explicitly provided multiple lines.
    if (stdinText.trim() !== "") {
        inputs = stdinText.split('\n');
        // Remove trailing empty line if it exists (common when pressing Enter at the end)
        if (inputs.length > 0 && inputs[inputs.length - 1] === "") {
            inputs.pop();
        }
    }
    
    // Populate the global input buffer
    inputBuffer = [...inputs];
    
    // Proactive warning: check if number of inputs matches expected input calls
    const inputCalls = (code.match(/\binput\s*\(/g) || []).length;
    if (inputs.length < inputCalls && inputs.length > 0) {
        appendOutput(`[Note: Code has ${inputCalls} input() calls, but Input panel only has ${inputs.length} lines. Interactive prompts will appear for the rest.]\n\n`, "muted");
    } else if (inputs.length === 0 && inputCalls > 0) {
        appendOutput(`[Note: Use the 'Input' panel to pre-fill answers and avoid browser prompts.]\n\n`, "muted");
    }
    
    try {
        // We run the code as-is (synchronously)
        await pyodide.runPythonAsync(code);
        
        // If we finished without being stopped by our 'magic token', clear the interactive state
        if (!output.innerHTML.includes("___WAITING_FOR_INPUT___")) {
            appendOutput("\n✓ Finished.\n", "ok");
            // Clear buffer for next fresh run
            if (inputBuffer.length === 0) {
                // Keep pre-filled inputs but clear temporary ones? 
                // For now, just leave it.
            }
        } else {
            // Handle the interactive input field
            handleInteractiveInput();
        }
    } catch (err) {
        // SystemExit(0) is used to stop the code for input
        if (err.message && err.message.includes("SystemExit: 0")) {
             handleInteractiveInput();
        } else {
             appendOutput("\n" + err.toString() + "\n", "err");
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

// Update runCode to handle "resume" (not clearing output)
async function runCode(isResume = false) {
    // Crucial: If called from an event listener, the first arg is an Event object.
    // We must ensure isResume is explicitly true only when we mean it.
    if (isResume instanceof Event) isResume = false;
    
    if (!pyodide) return;
    const code = editor.getValue();
    
    // Always clear output on every run/re-run to avoid duplication.
    // We capture the value from the UI field before clearing.
    if (isResume) {
        const oldInput = document.querySelector(".terminal-input-wrapper");
        if (oldInput) {
            const val = oldInput.querySelector("input").value;
            persistentBuffer.push(val);
        }
    } else {
        persistentBuffer = [];
    }

    clearOutput();
    appendOutput("▶ Running...\n\n", "muted");

    currentRunBuffer = [...persistentBuffer];
    runBtn.disabled = true;

    try {
        setStatus("running", "Program is running...");
        // We run the code as-is (synchronously)
        await pyodide.runPythonAsync(code);
        
        // If we finished without being stopped by our 'magic token', clear the interactive state
        if (!output.innerHTML.includes("___WAITING_FOR_INPUT___")) {
            appendOutput("\n✓ Program finished successfully.\n", "ok");
            setStatus("ready", "Execution complete.");
        } else {
            // Handle the interactive input field
            setStatus("waiting", "Waiting for your input...");
            handleInteractiveInput();
        }
    } catch (err) {
        // SystemExit(0) is used to stop the code for input
        if (err.message && err.message.includes("SystemExit: 0")) {
             setStatus("waiting", "Waiting for your input...");
             handleInteractiveInput();
        } else {
             appendOutput("\n" + err.toString() + "\n", "err");
             setStatus("error", "An error occurred during execution.");
        }
    } finally {
        runBtn.disabled = false;
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
    runBtn.addEventListener("click", runCode);

    document.getElementById("clearOutputBtn").addEventListener("click", () => {
        output.innerHTML = '<span class="muted">Output cleared.</span>';
    });

    document.getElementById("resetBtn").addEventListener("click", () => {
        if (confirm("Reset code to the starter example? Your current code will be lost.")) {
            editor.setValue(DEFAULT_CODE);
        }
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
}

// Global bridge for Python to get inputs
let persistentBuffer = [];
let currentRunBuffer = [];

window.getSandboxInput = function() {
    if (currentRunBuffer.length > 0) {
        return currentRunBuffer.shift();
    }
    return null;
};

// JS Modal Implementation for Python Input
window.showInputDialog = function(promptText) {
    // This is now deprecated by the Terminal Re-run logic, but keeping as a fallback
    return new Promise((resolve) => resolve(null));
};

// Boot
window.addEventListener("DOMContentLoaded", () => {
    initEditor();
    wireUI();
    initPyodide();
});
