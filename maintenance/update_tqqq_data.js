const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, 'finance', 'TQQQ_signals_updated_with_new_data_formatted.xlsx');

// New Data provided by user (Most recent first in user prompt, but we need chronological order)
// 11/10/2025 to 11/20/2025
const newData = [
    { Date: '11/10/2025', Close: 56.355 },
    { Date: '11/11/2025', Close: 55.89 },
    { Date: '11/12/2025', Close: 55.775 },
    { Date: '11/13/2025', Close: 52.33 },
    { Date: '11/14/2025', Close: 52.37 },
    { Date: '11/17/2025', Close: 51.025 },
    { Date: '11/18/2025', Close: 49.18 },
    { Date: '11/19/2025', Close: 50.025 },
    { Date: '11/20/2025', Close: 46.45 }
];

// Helper to parse columns intelligently
const getKey = (row, ...keys) => {
    const rowKeys = Object.keys(row);
    for (let k of keys) {
        const found = rowKeys.find(rk => rk.toLowerCase().trim() === k.toLowerCase());
        if (found) return row[found];
    }
    return null;
};

// Main Update Function
function updateData() {
    try {
        console.log("Reading file...");
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        let data = XLSX.utils.sheet_to_json(worksheet);

        console.log(`Original rows: ${data.length}`);

        // --- STEP 1: APPLY 2:1 SPLIT TO HISTORY ---
        // Verify split condition: Last Old Price (~110) vs First New Price (~56)
        // User confirmed "half split". We divide OLD prices by 2.

        console.log("Applying 2:1 Split to historical prices...");
        data.forEach(row => {
            // Adjust Close
            let close = parseFloat(getKey(row, 'Close', 'Price'));
            if (!isNaN(close)) {
                row['Close'] = close / 2;
            }

            // Adjust MA
            let ma = parseFloat(getKey(row, '200-Day MA', 'MA200'));
            if (!isNaN(ma)) {
                row['200-Day MA'] = ma / 2;
            }

            // Do NOT adjust Equity (it's total value)
        });

        // --- STEP 2: APPEND NEW DATA ---
        console.log("Appending new data...");

        let lastEquity = parseFloat(getKey(data[data.length - 1], 'Equity', 'Strategy Equity'));
        let lastSignal = parseInt(getKey(data[data.length - 1], 'Signal')); // 1 or 0
        let lastClose = parseFloat(getKey(data[data.length - 1], 'Close')); // This is now SPLIT ADJUSTED

        newData.forEach(newEntry => {
            const currentClose = newEntry.Close;

            // 1. Calculate 200-Day MA
            // We need the last 199 closes + current one
            // We can take the last 200 from the data array (since we are appending to it?? No, pushing after calc)
            // Actually, simplest is to extract all 'Close' values into a simple array first
            const allCloses = data.map(r => parseFloat(getKey(r, 'Close')));
            // Add current close for calculation
            const maWindow = allCloses.slice(-199);
            maWindow.push(currentClose);

            const sum = maWindow.reduce((a, b) => a + b, 0);
            const ma200 = sum / 200;

            // 2. Generate Signal
            // Price > MA = 1 (BUY), Price < MA = 0 (CASH)
            const signal = currentClose > ma200 ? 1 : 0;

            // 3. Instruction
            let instruction = "Hold";
            if (lastSignal === 0 && signal === 1) instruction = "Buy";
            else if (lastSignal === 1 && signal === 0) instruction = "Switch to Cash";
            else if (lastSignal === 0 && signal === 0) instruction = "Cash";

            // 4. Calculate Equity
            // If we WERE invested (lastSignal=1), we effectively held through the night to today's close? 
            // Simplified: If LastSignal was 1, we get the return (Current / Last).
            // If LastSignal was 0, Equity stays flat.
            let newEquity = lastEquity;
            if (lastSignal === 1) {
                const pctChange = (currentClose - lastClose) / lastClose;
                newEquity = lastEquity * (1 + pctChange);
            }

            // Create Row Object
            // Need to match existing structure exactly
            // Excel dates are numbers (days since 1900). 
            // We need to convert string '11/10/2025' to Excel Serial
            const dateObj = new Date(newEntry.Date);
            // Excel base date (Dec 30 1899 for JS math usually)
            // 25569 is offset. 
            const excelDate = (dateObj.getTime() / (1000 * 60 * 60 * 24)) + 25569;

            const newRow = {
                'Date': excelDate,
                'Close': currentClose,
                '200-Day MA': ma200,
                'Signal': signal,
                'Instruction': instruction,
                'Position': signal, // Assuming Position matches Signal
                'Daily Return': (currentClose - lastClose) / lastClose, // informational
                'Strategy Return': lastSignal === 1 ? (currentClose - lastClose) / lastClose : 0,
                'Equity': newEquity
            };

            // Push to data
            data.push(newRow);

            // Update "Last" pointers for next iteration
            lastClose = currentClose;
            lastSignal = signal;
            lastEquity = newEquity;
        });

        console.log(`New total rows: ${data.length}`);
        console.log("Saving file...");

        const newSheet = XLSX.utils.json_to_sheet(data);
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Sheet1");
        XLSX.writeFile(newWorkbook, filePath);

        console.log("Success! File updated.");

    } catch (e) {
        console.error("Error:", e);
    }
}

updateData();
