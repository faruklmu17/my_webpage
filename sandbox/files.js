/* Sandbox multi-file projects
 *
 * Each language ("python" / "html") has its own project: an ordered list of
 * files plus the active file. Every file is backed by its own CodeMirror.Doc,
 * so undo history and cursor position are kept per file. Projects are saved
 * to localStorage under "sandbox.project.<language>".
 */
const SandboxFiles = (() => {
    const MAX_FILES = 10;
    const MAX_NAME_LENGTH = 40;
    const MAIN_FILE = { python: "main.py", html: "index.html" };
    const ALLOWED_EXT = {
        python: ["py", "txt", "csv", "json"],
        html: ["html", "css", "js"]
    };
    // Naming a file after a standard module hides the real one on import.
    const SHADOWED_MODULES = ["random", "math", "turtle", "time", "string", "os", "sys",
        "json", "csv", "re", "datetime", "statistics", "matplotlib", "numpy", "pandas"];

    const projects = {}; // lang -> { order: [names], active: name }
    const docs = {};     // lang -> { name: CodeMirror.Doc }
    let cm = null;
    let lang = "python";
    let tabsEl = null;
    let fileNameEl = null;
    let persist = true;      // false while visiting someone else's live session
    let listener = null;     // notified of local create/rename/remove (used by Live Share)
    const notify = (type, ...args) => { if (listener) listener(type, ...args); };

    const storageKey = (l) => `sandbox.project.${l}`;
    const extOf = (name) => (name.split(".").pop() || "").toLowerCase();

    function modeFor(name) {
        switch (extOf(name)) {
            case "py": return "python";
            case "html": return "htmlmixed";
            case "css": return "css";
            case "js": return "javascript";
            case "json": return { name: "javascript", json: true };
            default: return "text/plain";
        }
    }

    function starterFor(name) {
        switch (extOf(name)) {
            case "py": return `# ${name}\n# Use this file from main.py with: import ${name.slice(0, -3)}\n\n`;
            case "css": return `/* ${name} - link it in index.html with: <link rel="stylesheet" href="${name}"> */\n`;
            case "js": return `// ${name} - add it to index.html with: <script src="${name}"></script>\n`;
            case "html": return `<!DOCTYPE html>\n<html>\n<body>\n\n</body>\n</html>\n`;
            default: return "";
        }
    }

    function buildProject(l, files, active) {
        docs[l] = {};
        const order = [];
        for (const f of files) {
            if (!f || typeof f.name !== "string" || docs[l][f.name]) continue;
            docs[l][f.name] = new CodeMirror.Doc(String(f.content ?? ""), modeFor(f.name));
            order.push(f.name);
        }
        const main = MAIN_FILE[l];
        if (!docs[l][main]) {
            docs[l][main] = new CodeMirror.Doc("", modeFor(main));
            order.unshift(main);
        }
        // Keep the main file first
        const rest = order.filter(n => n !== main);
        projects[l] = { order: [main, ...rest], active: docs[l][active] ? active : main };
    }

    function loadProject(l, fallbackMainContent) {
        let saved = null;
        try { saved = JSON.parse(localStorage.getItem(storageKey(l)) || "null"); } catch (e) { saved = null; }
        if (saved && Array.isArray(saved.files) && saved.files.length) {
            buildProject(l, saved.files.slice(0, MAX_FILES), saved.active);
        } else {
            // Migrate the old single-file save into the main file
            buildProject(l, [{ name: MAIN_FILE[l], content: fallbackMainContent }], MAIN_FILE[l]);
        }
    }

    function save(l = lang) {
        if (!projects[l] || !persist) return;
        try {
            localStorage.setItem(storageKey(l), JSON.stringify({
                version: 1,
                files: getFiles(l),
                active: projects[l].active
            }));
        } catch (e) { /* storage full or blocked */ }
    }

    function getFiles(l = lang) {
        const p = projects[l];
        if (!p) return [];
        return p.order.map(name => ({ name, content: docs[l][name].getValue() }));
    }

    function getFile(name, l = lang) {
        const d = docs[l] && docs[l][name];
        return d ? d.getValue() : null;
    }

    function showActive() {
        const p = projects[lang];
        cm.swapDoc(docs[lang][p.active]);
        if (fileNameEl) fileNameEl.textContent = p.active;
        render();
        if (typeof cm.performLint === "function") setTimeout(() => cm.performLint(), 0);
        setTimeout(() => cm.refresh(), 0);
    }

    function setLanguage(l) {
        lang = l;
        showActive();
    }

    function open(name) {
        const p = projects[lang];
        if (!docs[lang][name] || p.active === name) return;
        p.active = name;
        showActive();
        save();
        if (window.SandboxLiveShare && typeof window.SandboxLiveShare.attachCodeMirrorBinding === 'function') {
            window.SandboxLiveShare.attachCodeMirrorBinding();
        }
        cm.focus();
    }

    function openMain() { open(MAIN_FILE[lang]); }

    function validateName(name, ignoreName) {
        const allowed = ALLOWED_EXT[lang];
        if (!name) return "Please type a file name.";
        if (name.length > MAX_NAME_LENGTH) return `File names must be ${MAX_NAME_LENGTH} characters or less.`;
        if (!/^[A-Za-z0-9_\-]+\.[A-Za-z0-9]+$/.test(name)) {
            return "Use only letters, numbers, - and _, plus an extension (example: helpers.py).";
        }
        if (!allowed.includes(extOf(name))) return `Allowed file types here: ${allowed.map(e => "." + e).join(", ")}`;
        if (extOf(name) === "py" && !/^[A-Za-z_][A-Za-z0-9_]*\.py$/.test(name)) {
            return "Python file names can only use letters, numbers and _ and can't start with a number, so you can import them.";
        }
        const taken = projects[lang].order.some(n => n !== ignoreName && n.toLowerCase() === name.toLowerCase());
        if (taken) return `There is already a file named "${name}".`;
        return null;
    }

    function confirmShadowing(name) {
        if (extOf(name) !== "py") return true;
        const stem = name.slice(0, -3).toLowerCase();
        if (!SHADOWED_MODULES.includes(stem)) return true;
        return confirm(`Heads up: naming your file "${name}" will hide Python's built-in "${stem}" module, so "import ${stem}" will load your file instead.\n\nCreate it anyway?`);
    }

    function create() {
        const p = projects[lang];
        if (p.order.length >= MAX_FILES) { alert(`You can have up to ${MAX_FILES} files.`); return; }
        const example = lang === "python" ? "helpers.py" : "style.css";
        const raw = prompt(`New file name (example: ${example})`, "");
        if (raw === null) return;
        const name = raw.trim();
        const err = validateName(name);
        if (err) { alert(err); return; }
        if (!confirmShadowing(name)) return;
        docs[lang][name] = new CodeMirror.Doc(starterFor(name), modeFor(name));
        p.order.push(name);
        p.active = name;
        showActive();
        save();
        notify("create", name);
        const doc = docs[lang][name];
        doc.setCursor(doc.lineCount(), 0);
        cm.focus();
    }

    function rename(oldName) {
        if (oldName === MAIN_FILE[lang]) { alert(`${oldName} is the main file and can't be renamed.`); return; }
        const raw = prompt("Rename file", oldName);
        if (raw === null) return;
        const name = raw.trim();
        if (name === oldName) return;
        const err = validateName(name, oldName);
        if (err) { alert(err); return; }
        if (!confirmShadowing(name)) return;
        const p = projects[lang];
        const content = docs[lang][oldName].getValue();
        delete docs[lang][oldName];
        // New Doc so the syntax mode matches the new extension
        docs[lang][name] = new CodeMirror.Doc(content, modeFor(name));
        p.order[p.order.indexOf(oldName)] = name;
        if (p.active === oldName) p.active = name;
        showActive();
        save();
        notify("rename", oldName, name);
    }

    function remove(name) {
        if (name === MAIN_FILE[lang]) return;
        if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
        const p = projects[lang];
        p.order = p.order.filter(n => n !== name);
        delete docs[lang][name];
        if (p.active === name) p.active = MAIN_FILE[lang];
        showActive();
        save();
        notify("remove", name);
    }

    // ----- Programmatic changes (used by Live Share; no prompts, no notifications) -----

    /** Make the file list match `names` exactly, creating missing files with given contents. */
    function syncFiles(names, contentFor) {
        const p = projects[lang];
        const main = MAIN_FILE[lang];
        for (const name of names) {
            if (!docs[lang][name]) docs[lang][name] = new CodeMirror.Doc(contentFor(name), modeFor(name));
        }
        for (const name of p.order) {
            if (!names.includes(name) && name !== main) delete docs[lang][name];
        }
        p.order = [main, ...names.filter(n => n !== main && docs[lang][n])];
        if (!docs[lang][p.active]) p.active = main;
        showActive();
        save();
    }

    function getDoc(name) { return docs[lang] && docs[lang][name]; }
    function setPersist(on) { persist = on; }
    function setListener(fn) { listener = fn; }
    /** Re-read a saved project from localStorage (e.g. after leaving a live session). */
    function reload(l) {
        loadProject(l, "");
        if (l === lang && cm) showActive();
    }

    /** Replace a whole project (used by share links). */
    function importProject(l, files, active) {
        buildProject(l, files.slice(0, MAX_FILES), active);
        save(l);
        if (l === lang && cm) showActive();
    }

    function render() {
        if (!tabsEl) return;
        const p = projects[lang];
        tabsEl.innerHTML = "";
        for (const name of p.order) {
            const tab = document.createElement("div");
            tab.className = "file-tab" + (name === p.active ? " active" : "");
            tab.setAttribute("role", "tab");
            tab.setAttribute("aria-selected", name === p.active ? "true" : "false");
            tab.tabIndex = 0;
            tab.title = name === MAIN_FILE[lang] ? `${name} (runs first)` : `${name} - double-click to rename`;

            const label = document.createElement("span");
            label.className = "file-tab-name";
            label.textContent = name;
            tab.appendChild(label);

            if (name !== MAIN_FILE[lang]) {
                const close = document.createElement("button");
                close.className = "file-tab-close";
                close.type = "button";
                close.setAttribute("aria-label", `Delete ${name}`);
                close.title = `Delete ${name}`;
                close.textContent = "×";
                close.addEventListener("click", (e) => { e.stopPropagation(); remove(name); });
                tab.appendChild(close);
            }

            tab.addEventListener("click", () => open(name));
            tab.addEventListener("dblclick", () => rename(name));
            tab.addEventListener("keydown", (e) => {
                if (e.key === "Enter") open(name);
                if (e.key === "F2") rename(name);
            });
            tabsEl.appendChild(tab);
        }
        const add = document.createElement("button");
        add.className = "file-tab-add";
        add.type = "button";
        add.title = "New file";
        add.setAttribute("aria-label", "New file");
        add.innerHTML = '<i class="fas fa-plus"></i>';
        add.addEventListener("click", create);
        tabsEl.appendChild(add);

        const activeTab = tabsEl.querySelector(".file-tab.active");
        if (activeTab && activeTab.scrollIntoView) activeTab.scrollIntoView({ block: "nearest", inline: "nearest" });
    }

    function init(editor, initialLang, fallbacks) {
        cm = editor;
        lang = initialLang;
        tabsEl = document.getElementById("fileTabs");
        fileNameEl = document.getElementById("editorFileName");
        loadProject("python", fallbacks.python);
        loadProject("html", fallbacks.html);
        // Auto-save whichever file is being edited
        cm.on("change", () => save());
    }

    return {
        init, setLanguage, open, openMain, create, rename, remove, importProject,
        getFiles, getFile, save,
        syncFiles, getDoc, setPersist, setListener, reload,
        language: () => lang,
        names: () => (projects[lang] ? [...projects[lang].order] : []),
        activeName: () => projects[lang] && projects[lang].active,
        mainName: () => MAIN_FILE[lang],
        isMainActive: () => projects[lang] && projects[lang].active === MAIN_FILE[lang],
        activeIsPython: () => extOf((projects[lang] && projects[lang].active) || "") === "py"
    };
})();
