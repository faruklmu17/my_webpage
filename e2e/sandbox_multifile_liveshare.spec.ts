import { test, expect } from '@playwright/test';

test.describe('Sandbox Multi-File and Realtime Live Share', () => {

  test('Multi-file tabs: add file, rename, switch tabs, and run with Python imports', async ({ page }) => {
    test.setTimeout(120000);
    // Dismiss help modal automatically
    await page.addInitScript(() => {
      localStorage.setItem('sandbox.helpSeen', '1');
    });

    const answers: string[] = [];
    page.on('dialog', async dialog => {
      if (dialog.type() === 'prompt') {
        await dialog.accept(answers.shift() ?? '');
      } else {
        await dialog.accept();
      }
    });

    await page.goto('/sandbox/index.html');
    await page.waitForSelector('.file-tab');

    // 1. Initial state should have main.py tab
    const initialTabs = await page.$$eval('.file-tab-name', els => els.map(e => e.textContent));
    expect(initialTabs).toContain('main.py');

    // 2. Create helper.py
    answers.push('helper.py');
    await page.click('.file-tab-add');

    const tabsAfterAdd = await page.$$eval('.file-tab-name', els => els.map(e => e.textContent));
    expect(tabsAfterAdd).toEqual(['main.py', 'helper.py']);

    // 3. Write code into helper.py
    await page.evaluate(() => {
      (window as any).editor.setValue('def get_greeting(name):\n    return f"Hello {name} from helper module!"\n');
    });

    // 4. Switch back to main.py
    await page.click('.file-tab:has-text("main.py")');
    await page.evaluate(() => {
      (window as any).editor.setValue('import helper\nprint(helper.get_greeting("Alice"))\n');
    });

    // 5. Run the code and verify Pyodide execution
    await page.waitForFunction(() => typeof (window as any).pyodide !== 'undefined' && (window as any).pyodide, null, { timeout: 120000 });
    await page.click('#runBtn');

    await page.waitForFunction(() => {
      const text = document.getElementById('output')?.textContent || '';
      return text.includes('Hello Alice from helper module!');
    }, null, { timeout: 60000 });

    const outputText = await page.textContent('#output');
    expect(outputText).toContain('Hello Alice from helper module!');
    expect(outputText).toContain('Program finished successfully');

    // 6. Test rename helper.py -> utils.py
    answers.push('utils.py');
    await page.dblclick('.file-tab:has-text("helper.py")');

    const tabsAfterRename = await page.$$eval('.file-tab-name', els => els.map(e => e.textContent));
    expect(tabsAfterRename).toEqual(['main.py', 'utils.py']);

    // 7. Test delete utils.py
    await page.click('.file-tab:has-text("utils.py") .file-tab-close');
    const tabsAfterDelete = await page.$$eval('.file-tab-name', els => els.map(e => e.textContent));
    expect(tabsAfterDelete).toEqual(['main.py']);
  });

  test('Multi-file HTML: CSS and JS inlining into preview iframe', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('sandbox.helpSeen', '1');
    });

    const answers: string[] = [];
    page.on('dialog', async dialog => {
      if (dialog.type() === 'prompt') {
        await dialog.accept(answers.shift() ?? '');
      } else {
        await dialog.accept();
      }
    });

    await page.goto('/sandbox/index.html');
    await page.selectOption('#languageSelect', 'html');
    await page.waitForTimeout(300);

    // Create custom style.css
    answers.push('style.css');
    await page.click('.file-tab-add');
    await page.evaluate(() => {
      (window as any).editor.setValue('h1 { color: rgb(255, 0, 0); font-size: 32px; }');
    });

    // Create custom script.js
    answers.push('script.js');
    await page.click('.file-tab-add');
    await page.evaluate(() => {
      (window as any).editor.setValue('window.addEventListener("DOMContentLoaded", () => { document.body.setAttribute("data-test", "loaded-from-js"); });');
    });

    // Reference both in index.html
    await page.click('.file-tab:has-text("index.html")');
    await page.evaluate(() => {
      (window as any).editor.setValue('<!DOCTYPE html><html><head><link rel="stylesheet" href="style.css"><script src="script.js"></script></head><body><h1>Live Preview Test</h1></body></html>');
    });

    await page.click('#runBtn');
    await page.waitForTimeout(600);

    const frame = page.frame({ url: /about:srcdoc/ }) || page.frames()[1];
    expect(frame).not.toBeNull();

    const h1Color = await frame!.$eval('h1', el => getComputedStyle(el).color);
    expect(h1Color).toBe('rgb(255, 0, 0)');

    const bodyData = await frame!.$eval('body', el => el.getAttribute('data-test'));
    expect(bodyData).toBe('loaded-from-js');
  });

  test('Multi-page HTML navigation: button redirect, link navigation, and back/forward controls', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('sandbox.helpSeen', '1');
    });

    const answers: string[] = [];
    page.on('dialog', async dialog => {
      if (dialog.type() === 'prompt') {
        await dialog.accept(answers.shift() ?? '');
      } else {
        await dialog.accept();
      }
    });

    await page.goto('/sandbox/index.html');
    await page.selectOption('#languageSelect', 'html');
    await page.waitForTimeout(300);

    // 1. Create page2.html using the + Page button
    answers.push('page2.html');
    await page.click('#previewNewPageBtn');
    await page.evaluate(() => {
      (window as any).editor.setValue(
        '<!DOCTYPE html><html><body><h1 id="title">Welcome to Page 2</h1><button id="inPageBackBtn" onclick="history.back()">Go Back</button></body></html>'
      );
    });

    // 2. Switch to index.html and add a button that redirects to page2.html
    await page.click('.file-tab:has-text("index.html")');
    await page.evaluate(() => {
      (window as any).editor.setValue(
        '<!DOCTYPE html><html><body><h1 id="title">Home Page</h1><button id="goPage2Btn" onclick="window.location.href=\'page2.html\'">Go to Page 2</button></body></html>'
      );
    });

    await page.click('#runBtn');
    await page.waitForTimeout(300);

    const getPreviewFrame = () => page.frame({ url: /about:srcdoc/ }) || page.frames()[1];
    let frame = getPreviewFrame();
    expect(await frame!.$eval('#title', el => el.textContent)).toBe('Home Page');
    expect(await page.isDisabled('#previewBackBtn')).toBe(true);

    // 3. Click button inside preview to redirect to page2.html
    await frame!.click('#goPage2Btn');
    await page.waitForTimeout(300);

    frame = getPreviewFrame();
    expect(await frame!.$eval('#title', el => el.textContent)).toBe('Welcome to Page 2');
    expect(await page.isDisabled('#previewBackBtn')).toBe(false);
    expect(await page.$eval('#previewPageSelect', el => (el as HTMLSelectElement).value)).toBe('page2.html');

    // 4. Click Sandbox Back button (#previewBackBtn) to return to index.html
    await page.click('#previewBackBtn');
    await page.waitForTimeout(300);

    frame = getPreviewFrame();
    expect(await frame!.$eval('#title', el => el.textContent)).toBe('Home Page');
    expect(await page.isDisabled('#previewBackBtn')).toBe(true);
    expect(await page.isDisabled('#previewForwardBtn')).toBe(false);

    // 5. Click Sandbox Forward button (#previewForwardBtn) to go forward to page2.html
    await page.click('#previewForwardBtn');
    await page.waitForTimeout(300);

    frame = getPreviewFrame();
    expect(await frame!.$eval('#title', el => el.textContent)).toBe('Welcome to Page 2');

    // 6. Click in-page Back button (onclick="history.back()") to return to index.html
    await frame!.click('#inPageBackBtn');
    await page.waitForTimeout(300);

    frame = getPreviewFrame();
    expect(await frame!.$eval('#title', el => el.textContent)).toBe('Home Page');
  });

  test('Realtime Live Share: bidirectional pair programming between Student and Teacher', async ({ browser }) => {
    // 1. Student context (Host)
    const studentContext = await browser.newContext();
    const studentPage = await studentContext.newPage();
    await studentPage.addInitScript(() => {
      localStorage.setItem('sandbox.helpSeen', '1');
    });

    await studentPage.goto('/sandbox/index.html');
    await studentPage.waitForSelector('#liveShareBtn');

    // Click Live Share to generate room
    await studentPage.click('#liveShareBtn');
    await studentPage.waitForSelector('#liveShareModal.show');

    const teacherLiveUrl = await studentPage.evaluate(() => {
      return (document.getElementById('liveShareTeacherUrlInput') as HTMLInputElement).value;
    });
    expect(teacherLiveUrl).toContain('&role=teacher');
    await studentPage.click('#closeLiveModalBtn');

    // 2. Teacher context (Guest)
    const teacherContext = await browser.newContext();
    const teacherPage = await teacherContext.newPage();
    await teacherPage.addInitScript(() => {
      localStorage.setItem('sandbox.helpSeen', '1');
    });

    await teacherPage.goto(teacherLiveUrl);
    await teacherPage.waitForSelector('.file-tab');
    await teacherPage.waitForTimeout(1200);

    // 3. Student types into editor
    await studentPage.evaluate(() => {
      (window as any).editor.setValue('# Code written by student\nnum = 42\n');
    });

    // Teacher receives edit
    await teacherPage.waitForTimeout(1000);
    const teacherValue1 = await teacherPage.evaluate(() => (window as any).editor.getValue());
    expect(teacherValue1).toContain('Code written by student');
    expect(teacherValue1).toContain('num = 42');

    // 4. Teacher types into editor
    await teacherPage.evaluate(() => {
      (window as any).editor.setValue('# Code added by teacher Faruk\nprint("Excellent job!")\n');
    });

    // Student receives edit
    await studentPage.waitForTimeout(1000);
    const studentValue2 = await studentPage.evaluate(() => (window as any).editor.getValue());
    expect(studentValue2).toContain('Code added by teacher Faruk');
    expect(studentValue2).toContain('Excellent job!');

    await studentContext.close();
    await teacherContext.close();
  });

  test('Realtime Live Share in HTML mode with automatic language switch', async ({ browser }) => {
    const studentContext = await browser.newContext();
    const studentPage = await studentContext.newPage();
    await studentPage.addInitScript(() => {
      localStorage.setItem('sandbox.helpSeen', '1');
    });

    await studentPage.goto('/sandbox/index.html');
    await studentPage.selectOption('#languageSelect', 'html');
    await studentPage.waitForTimeout(300);

    await studentPage.click('#liveShareBtn');
    await studentPage.waitForSelector('#liveShareModal.show');
    const teacherUrl = await studentPage.evaluate(() => {
      return (document.getElementById('liveShareTeacherUrlInput') as HTMLInputElement).value;
    });
    await studentPage.click('#closeLiveModalBtn');

    const teacherContext = await browser.newContext();
    const teacherPage = await teacherContext.newPage();
    await teacherPage.addInitScript(() => {
      localStorage.setItem('sandbox.helpSeen', '1');
    });

    await teacherPage.goto(teacherUrl);
    await teacherPage.waitForSelector('.file-tab');
    await teacherPage.waitForTimeout(1200);

    // Teacher should automatically have switched to HTML mode
    await teacherPage.waitForFunction(() => (window as any).currentLanguage === 'html', null, { timeout: 10000 });
    const teacherLang = await teacherPage.evaluate(() => (window as any).currentLanguage);
    expect(teacherLang).toBe('html');

    // Student updates HTML
    await studentPage.evaluate(() => {
      (window as any).editor.setValue('<div class="box">Live Sync Active</div>');
    });

    await teacherPage.waitForTimeout(1000);
    const teacherHTML = await teacherPage.evaluate(() => (window as any).editor.getValue());
    expect(teacherHTML).toContain('Live Sync Active');

    await studentContext.close();
    await teacherContext.close();
  });

});

