const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, 'finance', 'TQQQ_signals_updated_with_new_data_formatted.xlsx');

// New Data from user, sorted Chronologically
// Ranges:
// Nov 21
// Nov 24 - Nov 28
// Dec 01 - Dec 05
// Dec 08 - Dec 12
// Dec 15 - Dec 19

const newData = [
    { Date: '11/21/2025', Close: 47.48 },
    { Date: '11/24/2025', Close: 51.08 },
    { Date: '11/25/2025', Close: 52.01 },
    { Date: '11/26/2025', Close: 53.37 },
    { Date: '11/28/2025', Close: 54.54 },
    { Date: '12/01/2025', Close: 54.05 },
    { Date: '12/02/2025', Close: 55.30 },
    { Date: '12/03/2025', Close: 55.69 },
    { Date: '12/04/2025', Close: 55.51 },
    { Date: '12/05/2025', Close: 56.15 },
    { Date: '12/08/2025', Close: 55.80 },
    { Date: '12/09/2025', Close: 56.01 },
    { Date: '12/10/2025', Close: 56.65 },
    { Date: '12/11/2025', Close: 56.11 },
    { Date: '12/12/2025', Close: 52.82 },
    { Date: '12/15/2025', Close: 52.02 },
    { Date: '12/16/2025', Close: 52.33 },
    { Date: '12/17/2025', Close: 49.40 },
    { Date: '12/18/2025', Close: 51.51 },
    { Date: '12/19/2025', Close: 53.52 }
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

        console.log(`Current rows: ${data.length}`);

        // --- APPEND NEW DATA ---
        console.log("Appending new data...");

        let lastEquity = parseFloat(getKey(data[data.length - 1], 'Equity', 'Strategy Equity'));
        let lastSignal = parseInt(getKey(data[data.length - 1], 'Signal')); // 1 or 0
        let lastClose = parseFloat(getKey(data[data.length - 1], 'Close'));

        newData.forEach(newEntry => {
            const currentClose = newEntry.Close;

            // 1. Calculate 200-Day MA
            const allCloses = data.map(r => parseFloat(getKey(r, 'Close')));
            const maWindow = allCloses.slice(-199);
            maWindow.push(currentClose);

            const sum = maWindow.reduce((a, b) => a + b, 0);
            const ma200 = sum / 200;

            // 2. Generate Signal
            const signal = currentClose > ma200 ? 1 : 0;

            // 3. Instruction
            let instruction = "Hold";
            if (lastSignal === 0 && signal === 1) instruction = "Buy";
            else if (lastSignal === 1 && signal === 0) instruction = "Switch to Cash";
            else if (lastSignal === 0 && signal === 0) instruction = "Cash";

            // 4. Calculate Equity
            let newEquity = lastEquity;
            if (lastSignal === 1) {
                const pctChange = (currentClose - lastClose) / lastClose;
                newEquity = lastEquity * (1 + pctChange);
            }

            // Create Row Object
            const dateObj = new Date(newEntry.Date);
            const excelDate = (dateObj.getTime() / (1000 * 60 * 60 * 24)) + 25569;

            const newRow = {
                'Date': excelDate,
                'Close': currentClose,
                '200-Day MA': ma200,
                'Signal': signal,
                'Instruction': instruction,
                'Position': signal,
                'Daily Return': (currentClose - lastClose) / lastClose,
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
