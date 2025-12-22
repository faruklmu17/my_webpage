const XLSX = require('xlsx');

try {
    const workbook = XLSX.readFile('portfolio_data.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Get headers
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    if (rawData.length === 0) {
        console.log("Sheet is empty");
    } else {
        console.log("Headers (Row 1):", rawData[0]);
        console.log("Row 2:", rawData[1]);
        console.log("Row 3:", rawData[2]);
    }

    // Also try normal json conversion
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    if (jsonData.length > 0) {
        console.log("First JSON Object:", jsonData[0]);
    } else {
        console.log("No JSON data parsed");
    }

} catch (e) {
    console.error("Error:", e.message);
}
