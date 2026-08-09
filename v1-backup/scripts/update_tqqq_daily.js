const { chromium } = require('playwright');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '..', 'finance', 'TQQQ_signals_updated_with_new_data_formatted.xlsx');

async function scrapeYahooFinance() {
    console.log("Launching browser...");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    console.log("Navigating to Yahoo Finance...");
    // Use a user-agent to look more like a real browser
    await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
    });

    await page.goto('https://finance.yahoo.com/quote/TQQQ/history/', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Handle potential consent forms
    try {
        const consentButton = await page.getByRole('button', { name: /accept|agree/i }).first();
        if (await consentButton.isVisible()) {
            console.log("Accepting cookies...");
            await consentButton.click();
            await page.waitForTimeout(2000);
        }
    } catch (e) {
        // No consent popup found or already accepted
    }

    console.log("Extracting table data...");

    // Scrape data from the table
    const scrapedData = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Midnight today

        return rows.map(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length < 5) return null;

            const dateStr = cells[0].innerText.trim();
            const date = new Date(dateStr);

            // Skip if it's today (partial data)
            if (date >= today) return null;

            return {
                DateStr: dateStr,
                Date: date,
                Close: parseFloat(cells[4].innerText.replace(/,/g, ''))
            };
        }).filter(r => r !== null && !isNaN(r.Close));
    });

    console.log(`Scraped ${scrapedData.length} valid historical rows.`);
    await browser.close();

    // Sort chronological (Oldest -> Newest)
    return scrapedData.sort((a, b) => new Date(a.Date) - new Date(b.Date));
}

// Helper: Excel Date Converter (Midnight)
function dateToExcel(d) {
    const date = new Date(d);
    date.setHours(12, 0, 0, 0); // Center in the day to avoid timezone shifts
    return Math.floor((date.getTime() / (1000 * 60 * 60 * 24)) + 25569);
}

// Helper: Get key case-insensitive
const getKey = (row, ...keys) => {
    const rowKeys = Object.keys(row);
    for (let k of keys) {
        const found = rowKeys.find(rk => rk.toLowerCase().trim() === k.toLowerCase());
        if (found) return row[found];
    }
    return null;
};

async function updateExcel() {
    try {
        // 1. Scrape New Data
        const rawNewData = await scrapeYahooFinance();
        if (rawNewData.length === 0) {
            console.log("No new data retrieved from Yahoo Finance.");
            return;
        }

        // 2. Read Existing Excel
        console.log("Reading existing Excel file...");
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        let fileData = XLSX.utils.sheet_to_json(worksheet);

        // 3. Find latest date in existing file
        const lastRow = fileData[fileData.length - 1];
        const lastSerialDate = Math.floor(parseFloat(getKey(lastRow, 'Date')));

        // 4. Filter for NEW rows only
        const newRowsToAdd = rawNewData.filter(d => {
            const serial = dateToExcel(d.Date);
            return serial > lastSerialDate;
        });

        if (newRowsToAdd.length === 0) {
            console.log("Excel is already up to date with historical data.");
            return;
        }

        console.log(`Adding ${newRowsToAdd.length} new days of data...`);

        // 5. Append Logic
        let lastEquity = parseFloat(getKey(lastRow, 'Equity', 'Strategy Equity'));
        let lastSignal = parseInt(getKey(lastRow, 'Signal'));
        let lastClose = parseFloat(getKey(lastRow, 'Close'));

        newRowsToAdd.forEach(entry => {
            const currentClose = entry.Close;
            const excelDate = dateToExcel(entry.Date);

            // Calc 200-Day MA
            const allCloses = fileData.map(r => parseFloat(getKey(r, 'Close')));
            const maWindow = allCloses.slice(-199);
            maWindow.push(currentClose);
            const sum = maWindow.reduce((a, b) => a + b, 0);
            const ma200 = sum / 200;

            // Signal
            const signal = currentClose > ma200 ? 1 : 0;

            // Instruction
            let instruction = "Hold";
            if (lastSignal === 0 && signal === 1) instruction = "Buy";
            else if (lastSignal === 1 && signal === 0) instruction = "Switch to Cash";
            else if (lastSignal === 0 && signal === 0) instruction = "Cash";

            // Equity
            let newEquity = lastEquity;
            if (lastSignal === 1) {
                const pctChange = (currentClose - lastClose) / lastClose;
                newEquity = lastEquity * (1 + pctChange);
            }

            const newRow = {
                'Date': excelDate,
                'Close': currentClose,
                '200-Day MA': ma200,
                'Signal': signal,
                'Instruction': instruction,
                'Daily Return': (currentClose - lastClose) / lastClose,
                'Strategy Return': lastSignal === 1 ? (currentClose - lastClose) / lastClose : 0,
                'Equity': newEquity
            };

            fileData.push(newRow);

            // Increment pointers
            lastClose = currentClose;
            lastSignal = signal;
            lastEquity = newEquity;
        });

        // 6. Save
        console.log("Saving updated Excel file...");
        const newSheet = XLSX.utils.json_to_sheet(fileData);
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Sheet1");
        XLSX.writeFile(newWorkbook, filePath);

        console.log(`Success: Data updated up to ${newRowsToAdd[newRowsToAdd.length - 1].DateStr}`);

    } catch (e) {
        console.error("Critical Error during update:", e);
    }
}

updateExcel();
