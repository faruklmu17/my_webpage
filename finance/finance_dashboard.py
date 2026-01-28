from taipy.gui import Gui
import pandas as pd
import plotly.graph_objects as go

# -----------------------------------------------------------------------------
# 1. DATA PREPARATION
# -----------------------------------------------------------------------------
# We'll consolidate all the years of data into a single list of dictionaries
# and then create a Pandas DataFrame.

raw_data = []

# --- 2019 ---
raw_data.extend([
    { "year": 2019, "month_idx": 1, "month": "Jan", "liquid": 30000, "retirement": 10000, "property": 0, "net_worth": 40000, "debt": 0 },
    { "year": 2019, "month_idx": 2, "month": "Feb", "liquid": 31000, "retirement": 10500, "property": 0, "net_worth": 41500, "debt": 0 },
    { "year": 2019, "month_idx": 3, "month": "Mar", "liquid": 32000, "retirement": 11000, "property": 0, "net_worth": 43000, "debt": 0 },
    { "year": 2019, "month_idx": 4, "month": "Apr", "liquid": 33000, "retirement": 11500, "property": 0, "net_worth": 44500, "debt": 0 },
    { "year": 2019, "month_idx": 5, "month": "May", "liquid": 34000, "retirement": 12000, "property": 0, "net_worth": 46000, "debt": 0 },
    { "year": 2019, "month_idx": 6, "month": "Jun", "liquid": 35000, "retirement": 12500, "property": 0, "net_worth": 47500, "debt": 0 },
    { "year": 2019, "month_idx": 7, "month": "Jul", "liquid": 34800, "retirement": 13000, "property": 0, "net_worth": 47800, "debt": 0 },
    { "year": 2019, "month_idx": 8, "month": "Aug", "liquid": 35186, "retirement": 17843, "property": 0, "net_worth": 53029, "debt": 0 },
    { "year": 2019, "month_idx": 9, "month": "Sep", "liquid": 34245, "retirement": 22624, "property": 0, "net_worth": 56869, "debt": 0 },
    { "year": 2019, "month_idx": 10, "month": "Oct", "liquid": 34708, "retirement": 25759, "property": 0, "net_worth": 60467, "debt": 0 },
    { "year": 2019, "month_idx": 11, "month": "Nov", "liquid": 35468, "retirement": 26135, "property": 0, "net_worth": 61603, "debt": 0 },
    { "year": 2019, "month_idx": 12, "month": "Dec", "liquid": 36223, "retirement": 26318, "property": 0, "net_worth": 62541, "debt": 0 },
])

# --- 2020 ---
raw_data.extend([
    { "year": 2020, "month_idx": 1, "month": "Jan", "liquid": 36980, "retirement": 25188, "property": 0, "net_worth": 62168, "debt": 0 },
    { "year": 2020, "month_idx": 2, "month": "Feb", "liquid": 36000, "retirement": 26000, "property": 0, "net_worth": 62000, "debt": 0 },
    { "year": 2020, "month_idx": 3, "month": "Mar", "liquid": 35000, "retirement": 27000, "property": 0, "net_worth": 62000, "debt": 0 },
    { "year": 2020, "month_idx": 4, "month": "Apr", "liquid": 34170, "retirement": 31279, "property": 0, "net_worth": 65449, "debt": 0 },
    { "year": 2020, "month_idx": 5, "month": "May", "liquid": 32312, "retirement": 35564, "property": 0, "net_worth": 67876, "debt": 0 },
    { "year": 2020, "month_idx": 6, "month": "Jun", "liquid": 32500, "retirement": 40000, "property": 0, "net_worth": 72500, "debt": 0 },
    { "year": 2020, "month_idx": 7, "month": "Jul", "liquid": 32778, "retirement": 42230, "property": 0, "net_worth": 75008, "debt": 0 },
    { "year": 2020, "month_idx": 8, "month": "Aug", "liquid": 35100, "retirement": 44731, "property": 0, "net_worth": 79831, "debt": 0 },
    { "year": 2020, "month_idx": 9, "month": "Sep", "liquid": 36000, "retirement": 51163, "property": 0, "net_worth": 87163, "debt": 0 },
    { "year": 2020, "month_idx": 10, "month": "Oct", "liquid": 40000, "retirement": 54231, "property": 0, "net_worth": 94231, "debt": 0 },
    { "year": 2020, "month_idx": 11, "month": "Nov", "liquid": 40000, "retirement": 61789, "property": 0, "net_worth": 101789, "debt": 0 },
    { "year": 2020, "month_idx": 12, "month": "Dec", "liquid": 40000, "retirement": 70908, "property": 0, "net_worth": 110908, "debt": 0 },
])

# --- 2021 ---
raw_data.extend([
    { "year": 2021, "month_idx": 1, "month": "Jan", "liquid": 45000, "retirement": 71637, "property": 0, "net_worth": 116637, "debt": 0 },
    { "year": 2021, "month_idx": 2, "month": "Feb", "liquid": 50000, "retirement": 77172, "property": 0, "net_worth": 127172, "debt": 0 },
    { "year": 2021, "month_idx": 3, "month": "Mar", "liquid": 60000, "retirement": 81844, "property": 0, "net_worth": 141844, "debt": 0 },
    { "year": 2021, "month_idx": 4, "month": "Apr", "liquid": 62000, "retirement": 91109, "property": 0, "net_worth": 153109, "debt": 0 },
    { "year": 2021, "month_idx": 5, "month": "May", "liquid": 65000, "retirement": 94732, "property": 0, "net_worth": 159732, "debt": 0 },
    { "year": 2021, "month_idx": 6, "month": "Jun", "liquid": 60000, "retirement": 95898, "property": 0, "net_worth": 155898, "debt": 0 },
    { "year": 2021, "month_idx": 7, "month": "Jul", "liquid": 66000, "retirement": 91916, "property": 0, "net_worth": 157916, "debt": 0 },
    { "year": 2021, "month_idx": 8, "month": "Aug", "liquid": 73000, "retirement": 97792, "property": 0, "net_worth": 170792, "debt": 0 },
    { "year": 2021, "month_idx": 9, "month": "Sep", "liquid": 80000, "retirement": 100784, "property": 0, "net_worth": 180784, "debt": 0 },
    { "year": 2021, "month_idx": 10, "month": "Oct", "liquid": 83000, "retirement": 100294, "property": 0, "net_worth": 183294, "debt": 0 },
    { "year": 2021, "month_idx": 11, "month": "Nov", "liquid": 83000, "retirement": 88580, "property": 0, "net_worth": 171580, "debt": 0 },
    { "year": 2021, "month_idx": 12, "month": "Dec", "liquid": 88000, "retirement": 95971, "property": 0, "net_worth": 183971, "debt": 0 },
])

# --- 2022 ---
raw_data.extend([
    { "year": 2022, "month_idx": 1, "month": "Jan", "liquid": 92000, "retirement": 96735, "property": 450000, "net_worth": 638735, "debt": 0 },
    { "year": 2022, "month_idx": 2, "month": "Feb", "liquid": 92146, "retirement": 90181, "property": 451250, "net_worth": 633577, "debt": 0 },
    { "year": 2022, "month_idx": 3, "month": "Mar", "liquid": 92292, "retirement": 83627, "property": 452500, "net_worth": 628419, "debt": 0 },
    { "year": 2022, "month_idx": 4, "month": "Apr", "liquid": 92438, "retirement": 77073, "property": 453750, "net_worth": 623261, "debt": 0 },
    { "year": 2022, "month_idx": 5, "month": "May", "liquid": 92584, "retirement": 70519, "property": 455000, "net_worth": 618103, "debt": 0 },
    { "year": 2022, "month_idx": 6, "month": "Jun", "liquid": 92730, "retirement": 63965, "property": 456250, "net_worth": 612945, "debt": 0 },
    { "year": 2022, "month_idx": 7, "month": "Jul", "liquid": 92876, "retirement": 57411, "property": 457500, "net_worth": 607787, "debt": 0 },
    { "year": 2022, "month_idx": 8, "month": "Aug", "liquid": 93022, "retirement": 50857, "property": 458750, "net_worth": 602629, "debt": 0 },
    { "year": 2022, "month_idx": 9, "month": "Sep", "liquid": 93168, "retirement": 44303, "property": 460000, "net_worth": 597471, "debt": 0 },
    { "year": 2022, "month_idx": 10, "month": "Oct", "liquid": 93314, "retirement": 37749, "property": 461250, "net_worth": 592313, "debt": 0 },
    { "year": 2022, "month_idx": 11, "month": "Nov", "liquid": 93460, "retirement": 31195, "property": 462500, "net_worth": 587155, "debt": 0 },
    { "year": 2022, "month_idx": 12, "month": "Dec", "liquid": 93606, "retirement": 24641, "property": 463750, "net_worth": 581997, "debt": 0 },
])

# --- 2023 ---
raw_data.extend([
    { "year": 2023, "month_idx": 1, "month": "Jan", "liquid": 93754, "retirement": 18085, "property": 465000, "net_worth": 576839, "debt": 0 },
    { "year": 2023, "month_idx": 2, "month": "Feb", "liquid": 100405, "retirement": 18899, "property": 474828, "net_worth": 594132, "debt": 0 },
    { "year": 2023, "month_idx": 3, "month": "Mar", "liquid": 107042, "retirement": 19641, "property": 473024, "net_worth": 599707, "debt": 0 },
    { "year": 2023, "month_idx": 4, "month": "Apr", "liquid": 115335, "retirement": 21797, "property": 466279, "net_worth": 603411, "debt": 0 },
    { "year": 2023, "month_idx": 5, "month": "May", "liquid": 119194, "retirement": 22620, "property": 474993, "net_worth": 616807, "debt": 0 },
    { "year": 2023, "month_idx": 6, "month": "Jun", "liquid": 134528, "retirement": 24552, "property": 489786, "net_worth": 648866, "debt": 0 },
    { "year": 2023, "month_idx": 7, "month": "Jul", "liquid": 140373, "retirement": 26690, "property": 496885, "net_worth": 663948, "debt": 0 },
    { "year": 2023, "month_idx": 8, "month": "Aug", "liquid": 134641, "retirement": 26176, "property": 486000, "net_worth": 646817, "debt": 0 },
    { "year": 2023, "month_idx": 9, "month": "Sep", "liquid": 134782, "retirement": 26068, "property": 491000, "net_worth": 651850, "debt": 0 },
])

# --- 2024 ---
raw_data.extend([
    { "year": 2024, "month_idx": 1, "month": "Jan", "liquid": 41486, "retirement": 32527, "property": 1018176, "net_worth": 270189, "debt": 822000 },
    { "year": 2024, "month_idx": 2, "month": "Feb", "liquid": 44101, "retirement": 34671, "property": 1075710, "net_worth": 333133, "debt": 821349 },
    { "year": 2024, "month_idx": 3, "month": "Mar", "liquid": 47125, "retirement": 35532, "property": 1098992, "net_worth": 364424, "debt": 817225 },
    { "year": 2024, "month_idx": 4, "month": "Apr", "liquid": 43485, "retirement": 34305, "property": 1122817, "net_worth": 385230, "debt": 815377 },
    { "year": 2024, "month_idx": 5, "month": "May", "liquid": 47904, "retirement": 36151, "property": 1138000, "net_worth": 407055, "debt": 815000 },
    { "year": 2024, "month_idx": 6, "month": "Jun", "liquid": 54543, "retirement": 37658, "property": 1159000, "net_worth": 436266, "debt": 814935 },
    { "year": 2024, "month_idx": 7, "month": "Jul", "liquid": 54454, "retirement": 39125, "property": 1156483, "net_worth": 438741, "debt": 811321 },
    { "year": 2024, "month_idx": 8, "month": "Aug", "liquid": 53914, "retirement": 39411, "property": 1176950, "net_worth": 460368, "debt": 809907 },
    { "year": 2024, "month_idx": 9, "month": "Sep", "liquid": 59970, "retirement": 42589, "property": 1181841, "net_worth": 477367, "debt": 807033 },
    { "year": 2024, "month_idx": 10, "month": "Oct", "liquid": 66150, "retirement": 44143, "property": 1205926, "net_worth": 512165, "debt": 804054 },
    { "year": 2024, "month_idx": 11, "month": "Nov", "liquid": 76598, "retirement": 46620, "property": 1200148, "net_worth": 522297, "debt": 801069 },
    { "year": 2024, "month_idx": 12, "month": "Dec", "liquid": 78121, "retirement": 46217, "property": 1211756, "net_worth": 538377, "debt": 797717 },
])

# --- 2025 ---
raw_data.extend([
    { "year": 2025, "month_idx": 1, "month": "Jan", "liquid": 79784, "retirement": 47896, "property": 1199709, "net_worth": 532228, "debt": 795161 },
    { "year": 2025, "month_idx": 2, "month": "Feb", "liquid": 82386, "retirement": 49821, "property": 1203522, "net_worth": 543189, "debt": 789243 },
    { "year": 2025, "month_idx": 3, "month": "Mar", "liquid": 85779, "retirement": 50007, "property": 1193000, "net_worth": 542085, "debt": 786701 },
    { "year": 2025, "month_idx": 4, "month": "Apr", "liquid": 89003, "retirement": 51055, "property": 1180069, "net_worth": 535050, "debt": 785077 },
    { "year": 2025, "month_idx": 5, "month": "May", "liquid": 93435, "retirement": 53886, "property": 1164386, "net_worth": 529677, "debt": 782030 },
    { "year": 2025, "month_idx": 6, "month": "Jun", "liquid": 97407, "retirement": 56367, "property": 1211716, "net_worth": 585021, "debt": 780469 },
    { "year": 2025, "month_idx": 7, "month": "Jul", "liquid": 95240, "retirement": 57689, "property": 1211805, "net_worth": 585335, "debt": 779399 },
    { "year": 2025, "month_idx": 8, "month": "Aug", "liquid": 98474, "retirement": 60719, "property": 1229025, "net_worth": 609893, "debt": 778325 },
    { "year": 2025, "month_idx": 9, "month": "Sep", "liquid": 101425, "retirement": 64600, "property": 1179060, "net_worth": 568839, "debt": 776246 },
    { "year": 2025, "month_idx": 10, "month": "Oct", "liquid": 102630, "retirement": 68191, "property": 1181957, "net_worth": 579683, "debt": 773095 },
    { "year": 2025, "month_idx": 11, "month": "Nov", "liquid": 105514, "retirement": 69946, "property": 1209000, "net_worth": 613403, "debt": 771057 },
    { "year": 2025, "month_idx": 12, "month": "Dec", "liquid": 109605, "retirement": 71190, "property": 1186000, "net_worth": 598352, "debt": 768443 },
])

# --- 2026 ---
raw_data.extend([
    { "year": 2026, "month_idx": 1, "month": "Jan", "liquid": 114489, "retirement": 76596, "property": 1169000, "net_worth": 594268, "debt": 765817 },
])

# Create Global DataFrame
df = pd.DataFrame(raw_data)
# Ensure correct types
df['date_label'] = df['month'] + ' ' + df['year'].astype(str)
df['year'] = df['year'].astype(int)

# Projection Data (2025 - 2030)
proj_data = [
    {"year": 2025, "investments": 1200000, "debt": 766000},
    {"year": 2026, "investments": 1300000, "debt": 731000},
    {"year": 2027, "investments": 1400000, "debt": 696000},
    {"year": 2028, "investments": 1500000, "debt": 661000},
    {"year": 2029, "investments": 1600000, "debt": 626000},
    {"year": 2030, "investments": 1700000, "debt": 591000},
]
df_proj = pd.DataFrame(proj_data)
df_proj['net_worth'] = df_proj['investments'] - df_proj['debt']


# -----------------------------------------------------------------------------
# 2. STATE & CALLBACKS
# -----------------------------------------------------------------------------
# -----------------------------------------------------------------------------
# 2. STATE & CALLBACKS
# -----------------------------------------------------------------------------
years_available = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]
selected_year = 2026
BDT_RATE = 122

# --- Plotly Layouts (Data Science Style) ---
def get_chart_layout(title="", height=300):
    return {
        "title": {"text": title, "font": {"color": "#f1f5f9", "size": 14}},
        "paper_bgcolor": "rgba(0,0,0,0)",
        "plot_bgcolor": "rgba(0,0,0,0)",
        "font": {"color": "#94a3b8", "family": "Inter"},
        "margin": {"t": 40, "l": 40, "r": 20, "b": 40},
        "xaxis": {"gridcolor": "rgba(255,255,255,0.05)", "zeroline": False},
        "yaxis": {"gridcolor": "rgba(255,255,255,0.05)", "zeroline": False},
        "height": height,
        "showlegend": False
    }

layout_growth = get_chart_layout("")
layout_pie = {
    "paper_bgcolor": "rgba(0,0,0,0)",
    "font": {"color": "#94a3b8", "family": "Inter"},
    "margin": {"t": 20, "l": 20, "r": 20, "b": 20},
    "showlegend": True,
    "legend": {"font": {"color": "#f1f5f9"}, "orientation": "v", "yanchor": "middle", "y": 0.5}
}
layout_proj = get_chart_layout("", height=400)
# Add specific projection styling
layout_proj['xaxis']['title'] = "Fiscal Year"
layout_proj['showlegend'] = True
layout_proj['legend'] = {"x": 0, "y": 1, "bgcolor": "rgba(0,0,0,0)"}

# --- State Variables ---
current_table = pd.DataFrame()
current_nw = "0"
current_nw_bdt = "0"
current_liquid = "0"
current_ret = "0"
current_prop = "0"
current_debt = "0"

chart_data = pd.DataFrame()
pie_data = pd.DataFrame()

# Projection with calculated fields for the chart
proj_chart_data = df_proj.copy()

def on_init(state):
    update_dashboard(state)

def on_year_change(state):
    update_dashboard(state)

def update_dashboard(state):
    # FORCE INT cast just in case
    try:
        y_int = int(state.selected_year)
    except:
        y_int = 2025 # Fallback
        
    print(f"DEBUG: Updating dashboard for year {y_int}") # Console debug

    # 1. Filter Main Dataframe
    # We must assign to a temp variable then to state to ensure Taipy detects change
    sub_df = df[df['year'] == y_int].copy()
    
    if sub_df.empty:
        # Reset everything if no data
        state.current_nw = "$0"
        state.chart_data = pd.DataFrame({'month':[], 'net_worth':[]})
        state.current_table = pd.DataFrame()
        return

    # 2. Update KPI Strings
    latest = sub_df.iloc[-1] # Get last available month
    state.current_nw = f"${latest['net_worth']:,}"
    state.current_nw_bdt = f"৳ {int(latest['net_worth'] * BDT_RATE):,}"
    state.current_liquid = f"${latest['liquid']:,}"
    state.current_ret = f"${latest['retirement']:,}"
    state.current_prop = f"${latest['property']:,}"
    state.current_debt = f"${latest['debt']:,}"

    # 3. Update Chart Data
    # Taipy charts react to the dataframe being replaced
    print(f"DEBUG: Found {len(sub_df)} rows")
    state.chart_data = sub_df

    # 4. Update Pie Data (Snapshot of latest)
    new_pie = pd.DataFrame({
        "Asset": ["Liquid", "Retirement", "Property"],
        "Value": [latest['liquid'], latest['retirement'], latest['property']]
    })
    state.pie_data = new_pie

    # 5. Update Table (Formatted strings for display)
    tbl = sub_df[['month', 'liquid', 'retirement', 'property', 'net_worth', 'debt']].copy()
    # Format currency columns
    for c in ['liquid', 'retirement', 'property', 'net_worth', 'debt']:
        tbl[c] = tbl[c].apply(lambda x: f"${x:,.0f}")
    state.current_table = tbl


# -----------------------------------------------------------------------------
# 3. LAYOUT
# -----------------------------------------------------------------------------
page = """
<|container|
<|layout|columns=1 4|gap=2rem|
<|
<|{selected_year}|selector|lov={years_available}|dropdown|label=Select Year|class_name=year-selector|>
|>
<|
<|Wealth Overview|text|class_name=h1-title|>
<|USD and BDT tracking of financial growth and asset allocation.|text|class_name=subtitle|>
|>
|>

<br/>

<|layout|columns=1 4|gap=1.5rem|
<|part|class_name=glass-card sidebar-card|
<|🎯 **2030 GOALS**|text|class_name=sidebar-header|>

<|Target Net Worth|text|class_name=kpi-label|>
<|$1.1M|text|class_name=kpi-value accent-green big-target|>
<|90% Achieved|text|class_name=kpi-sub|>
<|progress|value=54|class_name=mini-progress|>

<br/>

<|Monthly Contrib.|text|class_name=kpi-label|>
<|$2,600|text|class_name=kpi-value accent-blue|>
<|Inv. + Retirement|text|class_name=kpi-sub|>

<br/>

<|Debt Reduction|text|class_name=kpi-label|>
<|-$175k|text|class_name=kpi-value accent-red|>
<|5 Year Plan|text|class_name=kpi-sub|>
|>

<|
<|layout|columns=1 1 1 1 1|gap=1rem|
<|part|class_name=glass-card kpi-card|
<|Net Worth|text|class_name=kpi-label|>
<|{current_nw}|text|class_name=kpi-value accent-green|>
<|{current_nw_bdt}|text|class_name=kpi-sub|>
|>
<|part|class_name=glass-card kpi-card|
<|Liquid Assets|text|class_name=kpi-label|>
<|{current_liquid}|text|class_name=kpi-value accent-blue|>
|>
<|part|class_name=glass-card kpi-card|
<|Retirement|text|class_name=kpi-label|>
<|{current_ret}|text|class_name=kpi-value accent-green|>
|>
<|part|class_name=glass-card kpi-card|
<|Property|text|class_name=kpi-label|>
<|{current_prop}|text|class_name=kpi-value accent-yellow|>
|>
<|part|class_name=glass-card kpi-card|
<|Total Debt|text|class_name=kpi-label|>
<|{current_debt}|text|class_name=kpi-value accent-red|>
|>
|>

<br/>

<|layout|columns=2 1|gap=1.5rem|
<|part|class_name=glass-card|
<|Growth Trend|text|class_name=h3-title|>
<|{chart_data}|chart|mode=lines+markers|x=month|y=net_worth|line_shape=spline|color=#4ade80|layout={layout_growth}|>
|>

<|part|class_name=glass-card|
<|Asset Allocation|text|class_name=h3-title|>
<|{pie_data}|chart|type=pie|values=Value|labels=Asset|layout={layout_pie}|>
|>
|>

<br/>

<|part|class_name=glass-card|
<|Monthly Ledger|text|class_name=h3-title|>
<|{current_table}|table|show_all=True|class_name=glass-table|>
|>

<br/>
<br/>

<|2030 Strategic Projection|text|class_name=h1-title|>
<|part|class_name=glass-card|
<|{proj_chart_data}|chart|mode=lines|x=year|y[1]=net_worth|y[2]=investments|y[3]=debt|label[1]=Net Worth|label[2]=Investments|label[3]=Debt|color[1]=#ffffff|color[2]=#4ade80|color[3]=#f87171|line_dash[1]=dash|layout={layout_proj}|>
|>
|>
|>
|>
"""

css = """
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');

body {
    font-family: 'Inter', sans-serif !important;
    background: radial-gradient(circle at top left, #111827, #020617) !important;
    color: #ffffff;
}
.sidebar-header {
    font-size: 0.9rem;
    color: #f1f5f9;
    letter-spacing: 1px;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    padding-bottom: 0.5rem;
}
.big-target { font-size: 2.2rem !important; }
.mini-progress { height: 4px; margin-top: 0.5rem; background-color: #334155; }
.mini-progress::-webkit-progress-value { background-color: #4ade80; }

.h1-title {
    font-size: 2.2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    background: linear-gradient(to right, #f8fafc, #94a3b8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.2rem;
}
.subtitle { color: #64748b; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }
.h3-title {
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
    color: #94a3b8;
    margin-bottom: 1rem;
}
.glass-card {
    background: linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
}
.kpi-label { font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.kpi-value { font-size: 1.6rem; font-weight: 700; letter-spacing: -0.02em; font-family: 'Inter', sans-serif; }
.kpi-sub { font-size: 0.75rem; color: #475569; font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

.accent-green { color: #4ade80; }
.accent-blue { color: #38bdf8; }
.accent-red { color: #f87171; }
.accent-yellow { color: #fbbf24; }

.glass-table table { background: transparent !important; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }
.glass-table th { background-color: rgba(30, 41, 59, 0.8) !important; color: #e2e8f0 !important; text-transform: uppercase; font-size: 0.75rem; }
.glass-table td { border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important; color: #94a3b8 !important; }
"""

if __name__ == "__main__":
    Gui(page=page, css_file=None).run(dark_mode=True, use_reloader=True, title="Finance Dashboard", port="auto")
