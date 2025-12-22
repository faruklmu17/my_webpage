import pandas as pd

try:
    df = pd.read_excel('portfolio_data.xlsx')
    print("Columns:", df.columns.tolist())
    print("First row:", df.iloc[0].to_dict())
    print("Data types:", df.dtypes)
except Exception as e:
    print(f"Error reading excel: {e}")
