#!/usr/bin/env python3
"""
Add manual TQQQ data entry for a specific date
"""

import pandas as pd
import os

def add_manual_entry(date_str, close_price, filename='TQQQ_signals_updated_with_new_data_formatted.xlsx'):
    """
    Add a manual data entry to the TQQQ Excel file
    """
    filepath = os.path.join(os.path.dirname(__file__), filename)
    
    print(f"Loading existing data from {filename}...")
    df = pd.read_excel(filepath)
    
    print(f"Current data: {len(df)} rows")
    print(f"Last date: {df.iloc[-1]['Date']}")
    print(f"Last close: ${df.iloc[-1]['Close']:.2f}")
    
    # Calculate 200-day MA for the new entry
    # Get the last 199 close prices and add the new one
    recent_closes = df['Close'].tail(199).tolist() + [close_price]
    new_ma_200 = sum(recent_closes) / 200
    
    # Determine signal (1 = BUY if price > MA, 0 = CASH if price <= MA)
    new_signal = 1 if close_price > new_ma_200 else 0
    
    # Get previous signal to determine instruction
    prev_signal = df.iloc[-1]['Signal']
    if new_signal != prev_signal:
        if new_signal == 1:
            instruction = 'BUY TQQQ'
        else:
            instruction = 'SELL TQQQ, HOLD CASH'
    else:
        instruction = ''
    
    # Calculate equity
    prev_equity = df.iloc[-1]['Equity']
    prev_close = df.iloc[-1]['Close']
    
    if prev_signal == 1:  # Was holding TQQQ
        # Calculate shares from previous equity
        shares = prev_equity / prev_close
        if new_signal == 1:  # Still holding TQQQ
            new_equity = shares * close_price
        else:  # Selling TQQQ
            new_equity = shares * close_price  # Convert to cash
    else:  # Was holding cash
        if new_signal == 1:  # Buying TQQQ
            shares = prev_equity / close_price
            new_equity = shares * close_price
        else:  # Still holding cash
            new_equity = prev_equity
    
    # Create new row
    new_row = {
        'Date': date_str,
        'Close': close_price,
        '200-Day MA': new_ma_200,
        'Signal': new_signal,
        'Instruction': instruction,
        'Equity': new_equity
    }
    
    print(f"\nAdding new entry:")
    print(f"  Date: {date_str}")
    print(f"  Close: ${close_price:.2f}")
    print(f"  200-Day MA: ${new_ma_200:.2f}")
    print(f"  Signal: {'BUY' if new_signal == 1 else 'CASH'}")
    print(f"  Instruction: {instruction if instruction else 'No change'}")
    print(f"  Equity: ${new_equity:,.2f}")
    
    # Append new row
    df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
    
    # Save to Excel
    print(f"\nSaving updated data to {filename}...")
    with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='TQQQ Strategy', index=False)
        
        # Auto-adjust column widths
        worksheet = writer.sheets['TQQQ Strategy']
        for idx, col in enumerate(df.columns):
            max_length = max(
                df[col].astype(str).apply(len).max(),
                len(col)
            ) + 2
            worksheet.column_dimensions[chr(65 + idx)].width = max_length
    
    print(f"✅ Successfully added entry for {date_str}")
    print(f"📊 Total rows: {len(df)}")
    
    return df

if __name__ == "__main__":
    # Add February 5, 2026 data
    add_manual_entry('02/05/2026', 47.61)
