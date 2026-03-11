#!/usr/bin/env python3
"""
TQQQ Strategy Data Updater
Updates the TQQQ_signals_updated_with_new_data_formatted.xlsx file with latest market data
"""

import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
import os

def fetch_tqqq_data(start_date='2020-01-01'):
    """
    Fetch TQQQ historical data from Yahoo Finance
    """
    print(f"Fetching TQQQ data from {start_date} to today...")
    
    try:
        # Use yf.download instead of Ticker for more reliable data fetching
        end_date = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        df = yf.download('TQQQ', start=start_date, end=end_date, progress=False)
        
        if df.empty:
            raise ValueError("No data received from Yahoo Finance")
        
        # Reset index to make Date a column
        df = df.reset_index()
        
        # Handle multi-level columns if present
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)
        
        # Keep only necessary columns
        df = df[['Date', 'Close']]
        
        print(f"✅ Fetched {len(df)} days of data")
        return df
        
    except Exception as e:
        print(f"❌ Error fetching data: {e}")
        raise

def calculate_strategy(df, initial_capital=10000):
    """
    Calculate 200-day SMA strategy signals and equity
    """
    print("Calculating 200-day moving average and signals...")
    
    if df.empty or len(df) < 200:
        raise ValueError(f"Insufficient data: need at least 200 days, got {len(df)}")
    
    # Calculate 200-day moving average
    df['200-Day MA'] = df['Close'].rolling(window=200).mean()
    
    # Generate signals: 1 = BUY (price > MA), 0 = CASH (price <= MA)
    df['Signal'] = (df['Close'] > df['200-Day MA']).astype(int)
    
    # Calculate instruction (when signal changes)
    df['Instruction'] = ''
    df.loc[df['Signal'] != df['Signal'].shift(1), 'Instruction'] = df['Signal'].apply(
        lambda x: 'BUY TQQQ' if x == 1 else 'SELL TQQQ, HOLD CASH'
    )
    
    # Calculate equity - initialize as float to avoid type errors
    df['Equity'] = float(initial_capital)
    shares = 0
    cash = initial_capital
    
    for i in range(1, len(df)):
        prev_signal = df.loc[i-1, 'Signal']
        curr_signal = df.loc[i, 'Signal']
        curr_price = df.loc[i, 'Close']
        
        # Signal changed from CASH to BUY
        if prev_signal == 0 and curr_signal == 1:
            shares = cash / curr_price
            cash = 0
        
        # Signal changed from BUY to CASH
        elif prev_signal == 1 and curr_signal == 0:
            cash = shares * curr_price
            shares = 0
        
        # Calculate current equity
        if curr_signal == 1:  # Holding TQQQ
            df.loc[i, 'Equity'] = shares * curr_price
        else:  # Holding cash
            df.loc[i, 'Equity'] = cash
    
    # Format Date column
    df['Date'] = pd.to_datetime(df['Date']).dt.strftime('%m/%d/%Y')
    
    # Reorder columns
    df = df[['Date', 'Close', '200-Day MA', 'Signal', 'Instruction', 'Equity']]
    
    if len(df) > 0:
        print(f"Strategy calculation complete. Latest signal: {'BUY' if df.iloc[-1]['Signal'] == 1 else 'CASH'}")
    
    return df

def save_to_excel(df, filename='TQQQ_signals_updated_with_new_data_formatted.xlsx'):
    """
    Save the dataframe to Excel file
    """
    filepath = os.path.join(os.path.dirname(__file__), filename)
    
    print(f"Saving data to {filepath}...")
    
    # Create Excel writer
    with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='TQQQ Strategy', index=False)
        
        # Get the worksheet
        worksheet = writer.sheets['TQQQ Strategy']
        
        # Auto-adjust column widths
        for idx, col in enumerate(df.columns):
            try:
                max_length = max(
                    df[col].astype(str).str.len().max(),
                    len(col)
                ) + 2
                worksheet.column_dimensions[chr(65 + idx)].width = max_length
            except:
                # Fallback to default width if calculation fails
                worksheet.column_dimensions[chr(65 + idx)].width = 15
    
    print(f"✅ Data saved successfully!")
    print(f"📊 Total rows: {len(df)}")
    print(f"📅 Date range: {df.iloc[0]['Date']} to {df.iloc[-1]['Date']}")
    print(f"💰 Current TQQQ Price: ${df.iloc[-1]['Close']:.2f}")
    print(f"📈 200-Day MA: ${df.iloc[-1]['200-Day MA']:.2f}")
    print(f"🎯 Current Signal: {'BUY' if df.iloc[-1]['Signal'] == 1 else 'CASH'}")
    print(f"💵 Strategy Equity: ${df.iloc[-1]['Equity']:,.0f}")

def main():
    """
    Main function to update TQQQ data
    """
    print("=" * 60)
    print("TQQQ 200-Day SMA Strategy Data Updater")
    print("=" * 60)
    print()
    
    try:
        # Fetch data
        df = fetch_tqqq_data(start_date='2020-01-01')
        
        # Calculate strategy
        df = calculate_strategy(df, initial_capital=10000)
        
        # Save to Excel
        save_to_excel(df)
        
        print()
        print("=" * 60)
        print("✅ Update completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
