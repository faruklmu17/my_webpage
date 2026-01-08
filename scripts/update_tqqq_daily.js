const { chromium } = require('playwright'); // Need to install playwright
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '..', 'finance', 'TQQQ_signals_updated_with_new_data_formatted.xlsx');

async function scrapeYahooFinance() {
    console.log("Launching browser...");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    console.log("Navigating to Yahoo Finance...");
    await page.goto('https://finance.yahoo.com/quote/TQQQ/history/', { waitUntil: 'domcontentloaded' });

    // Wait for table
    try {
        await page.waitForSelector('table tbody tr', { timeout: 10000 });
    } catch (e) {
        console.log("Cookie consent popup might be blocking. Trying to proceed anyway...");
    }

    console.log("Extracting table data...");

    // Scrape data from the table
    const scrapedData = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        return rows.map(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length < 5) return null; // Skip dividend/split rows if format is different

            return {
                Date: cells[0].innerText.trim(),
                Close: parseFloat(cells[4].innerText.replace(/,/g, ''))
            };
        }).filter(r => r !== null && !isNaN(r.Close)); // Filter out bad rows
    });

    console.log(`Scraped ${scrapedData.length} rows.`);
    await browser.close();

    // Sort chronological (Oldest -> Newest) because Yahoo gives Newest first
    return scrapedData.reverse();
}

// Helper: Excel Date Converter from String (MM/DD/YYYY)
function dateStringToExcel(dateStr) {
    const d = new Date(dateStr);
    return (d.getTime() / (1000 * 60 * 60 * 24)) + 25569;
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
            console.log("No data found.");
            return;
        }

        // 2. Read Existing Excel
        console.log("Reading existing Excel file...");
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        let fileData = XLSX.utils.sheet_to_json(worksheet);

        // 3. Find latest date in existing file
        // Excel dates are serial numbers. Need to check the last row.
        const lastRow = fileData[fileData.length - 1];
        const lastSerialDate = parseFloat(getKey(lastRow, 'Date'));

        // 4. Filter for NEW rows only
        const newRowsToAdd = rawNewData.filter(d => {
            const serial = dateStringToExcel(d.Date);
            // 25569 is 1970 epoch. Yahoo gives readable dates.
            // Check if this date > lastSerialDate (+ small buffer for float precision)
            return serial > (lastSerialDate + 0.001);
        });

        if (newRowsToAdd.length === 0) {
            console.log("Excel is already up to date.");
            return;
        }

        console.log(`Found ${newRowsToAdd.length} new days to add.`);

        // 5. Append Logic
        let lastEquity = parseFloat(getKey(lastRow, 'Equity', 'Strategy Equity'));
        let lastSignal = parseInt(getKey(lastRow, 'Signal'));
        let lastClose = parseFloat(getKey(lastRow, 'Close'));

        newRowsToAdd.forEach(entry => {
            const currentClose = entry.Close;
            const excelDate = dateStringToExcel(entry.Date);

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
                // 'Position': signal, // Optional, file uses Signal
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

        console.log(`Updated. Added data up to: ${newRowsToAdd[newRowsToAdd.length - 1].Date}`);

    } catch (e) {
        console.error("Error:", e);
    }
}

updateExcel();
