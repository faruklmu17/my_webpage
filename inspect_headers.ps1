$excelPath = "c:\Users\faruk\Desktop\my_website\my_webpage\portfolio_data.xlsx"
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$workbook = $excel.Workbooks.Open($excelPath)
$sheet = $workbook.Sheets.Item(1)

$columns = @()
for ($i = 1; $i -le 20; $i++) {
    $cellValue = $sheet.Cells.Item(1, $i).Text
    if ([string]::IsNullOrWhiteSpace($cellValue)) { break }
    $columns += $cellValue
}

Write-Output "Excel Headers detected:"
$columns -join ", "

$workbook.Close($false)
$excel.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
Remove-Variable excel
