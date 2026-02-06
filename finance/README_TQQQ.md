# TQQQ Strategy Dashboard - Update Instructions

## Overview
This directory contains the TQQQ 200-Day SMA Strategy dashboard and data updater.

## Files
- **tqqq.html** - The dashboard webpage that displays TQQQ strategy data
- **TQQQ_signals_updated_with_new_data_formatted.xlsx** - Excel file containing historical TQQQ data, signals, and equity
- **update_tqqq_data.py** - Python script to automatically fetch and update TQQQ data

## How to Update TQQQ Data

### Prerequisites
Make sure you have the required Python packages installed:
```bash
pip3 install yfinance pandas openpyxl
```

### Update Process

1. **Run the update script:**
   ```bash
   cd /Users/farukhasan/Desktop/python/python_projects/my_website/my_webpage/finance
   python3 update_tqqq_data.py
   ```

2. **The script will:**
   - Fetch the latest TQQQ data from Yahoo Finance (from 2020-01-01 to today)
   - Calculate the 200-day moving average
   - Generate BUY/CASH signals based on price vs. MA
   - Calculate strategy equity (starting with $10,000)
   - Update the Excel file with all the latest data

3. **Verify the update:**
   - The script will display a summary showing:
     - Total rows of data
     - Date range (should show today's or yesterday's date as the latest)
     - Current TQQQ price
     - Current 200-Day MA
     - Current signal (BUY or CASH)
     - Strategy equity value

### Viewing the Dashboard

The dashboard needs to be served through a web server (not opened directly as a file) to avoid CORS issues.

**Option 1: Using Python's built-in server**
```bash
cd /Users/farukhasan/Desktop/python/python_projects/my_website/my_webpage
python3 -m http.server 8000
```
Then open: http://localhost:8000/finance/tqqq.html

**Option 2: Deploy to your web hosting**
Upload the updated Excel file along with the HTML file to your web server.

## Update Frequency

- **Market Data**: Yahoo Finance provides data up to the previous trading day
- **Recommended**: Run the update script weekly or monthly to keep data current
- **Note**: The script fetches all historical data each time, so it will automatically include any missing days

## Troubleshooting

### "Failed to fetch" error in browser
- **Cause**: Opening the HTML file directly (file://) instead of through a web server
- **Solution**: Use a local web server as described above

### "No data received from Yahoo Finance"
- **Cause**: Network issues or Yahoo Finance API problems
- **Solution**: 
  - Check your internet connection
  - Try again later
  - Update yfinance: `pip3 install --upgrade yfinance`

### Excel file not updating
- **Cause**: File permissions or path issues
- **Solution**: Make sure you're running the script from the finance directory

## Strategy Details

- **Signal Logic**: 
  - BUY when TQQQ price > 200-Day MA
  - CASH when TQQQ price ≤ 200-Day MA
- **Initial Capital**: $10,000
- **Equity Calculation**: 
  - When BUY: All cash invested in TQQQ shares
  - When CASH: All shares sold, holding cash

## Last Updated
- Script created: February 5, 2026
- Data current as of: February 4, 2026
