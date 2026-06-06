param(
  [int]$IntervalSeconds = 10,
  [switch]$NoFocusTonghuashun,
  [switch]$Once,
  [switch]$TestAlert
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class Win32Window {
  [DllImport("user32.dll")]
  public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")]
  public static extern bool ShowWindowAsync(IntPtr hWnd, int nCmdShow);
}
"@

$script:LastAlertAt = @{}
$script:AlertCooldownSeconds = 90

$watchList = @(
  [pscustomobject]@{
    Symbol = 'sz002185'
    Name = 'Huatian Tech'
    Role = 'Primary'
    BuyLow = 16.70
    BuyHigh = 17.80
    HighOpenRisk = 17.82
    ReduceStop = 15.90
    ClearStop = 15.43
    Target1 = 19.50
    Target2 = 21.20
    Target3 = 22.00
  },
  [pscustomobject]@{
    Symbol = 'sz002156'
    Name = 'Tongfu Micro'
    Role = 'Backup1'
    BuyLow = 67.00
    BuyHigh = 69.00
    HighOpenRisk = 73.27
    ReduceStop = 64.00
    ClearStop = 62.80
    Target1 = 80.00
    Target2 = 87.00
    Target3 = 90.00
  },
  [pscustomobject]@{
    Symbol = 'sh603005'
    Name = 'Jingfang Tech'
    Role = 'Backup2'
    BuyLow = 40.00
    BuyHigh = 43.00
    HighOpenRisk = 45.20
    ReduceStop = 39.60
    ClearStop = 39.14
    Target1 = 49.50
    Target2 = 53.80
    Target3 = 56.00
  }
)

function Get-Quote {
  param([string[]]$Symbols)

  $url = 'https://qt.gtimg.cn/q=' + ($Symbols -join ',')
  $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 8
  $content = [Text.Encoding]::GetEncoding('GB18030').GetString($response.RawContentStream.ToArray())
  $quotes = @()

  foreach ($line in ($content -split "`n")) {
    if ($line -notmatch 'v_(?<symbol>[a-z]{2}\d{6})="(?<body>.*)";') {
      continue
    }

    $parts = $Matches.body -split '~'
    if ($parts.Count -lt 39) {
      continue
    }

    $quotes += [pscustomobject]@{
      Symbol = $Matches.symbol
      Name = $parts[1]
      Code = $parts[2]
      Price = [double]$parts[3]
      PreviousClose = [double]$parts[4]
      Open = [double]$parts[5]
      Buy1 = [double]$parts[9]
      Buy1Lots = [int]$parts[10]
      Sell1 = [double]$parts[19]
      Sell1Lots = [int]$parts[20]
      Time = $parts[30]
      Change = [double]$parts[31]
      ChangePercent = [double]$parts[32]
      High = [double]$parts[33]
      Low = [double]$parts[34]
      VolumeHands = [int]$parts[36]
      AmountWan = [double]$parts[37]
      TurnoverPercent = [double]$parts[38]
    }
  }

  return $quotes
}

function Bring-TonghuashunToFront {
  if ($NoFocusTonghuashun) {
    return
  }

  $proc = Get-Process -ErrorAction SilentlyContinue |
    Where-Object { $_.ProcessName -match 'hexin|10jqka|ths' -and $_.MainWindowHandle -ne 0 } |
    Select-Object -First 1

  if ($proc) {
    [Win32Window]::ShowWindowAsync($proc.MainWindowHandle, 9) | Out-Null
    [Win32Window]::SetForegroundWindow($proc.MainWindowHandle) | Out-Null
  }
}

function Test-ShouldAlert {
  param([pscustomobject]$Quote)

  if (-not $Quote.Time -or $Quote.Time.Length -lt 8) {
    return $false
  }

  $quoteDateText = $Quote.Time.Substring(0, 8)
  $todayText = (Get-Date).ToString('yyyyMMdd')
  if ($quoteDateText -ne $todayText) {
    return $false
  }

  $now = Get-Date
  $minutes = ($now.Hour * 60) + $now.Minute
  $morningStart = (9 * 60) + 25
  $morningEnd = (11 * 60) + 30
  $afternoonStart = 13 * 60
  $afternoonEnd = (15 * 60) + 1

  return (($minutes -ge $morningStart -and $minutes -le $morningEnd) -or
    ($minutes -ge $afternoonStart -and $minutes -le $afternoonEnd))
}

function Show-Alert {
  param(
    [string]$Key,
    [string]$Title,
    [string]$Message,
    [int]$BeepFrequency = 900
  )

  $now = Get-Date
  if ($script:LastAlertAt.ContainsKey($Key)) {
    $elapsed = ($now - $script:LastAlertAt[$Key]).TotalSeconds
    if ($elapsed -lt $script:AlertCooldownSeconds) {
      return
    }
  }

  $script:LastAlertAt[$Key] = $now
  Write-Host "[$($now.ToString('HH:mm:ss'))] ALERT $Title - $Message" -ForegroundColor Yellow

  try {
    [console]::Beep($BeepFrequency, 550)
  } catch {}

  try {
    $notify = New-Object System.Windows.Forms.NotifyIcon
    $notify.Icon = [System.Drawing.SystemIcons]::Information
    $notify.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Warning
    $notify.BalloonTipTitle = $Title
    $notify.BalloonTipText = $Message
    $notify.Visible = $true
    $notify.ShowBalloonTip(8000)
    Start-Sleep -Milliseconds 300
    $notify.Dispose()
  } catch {}

  Bring-TonghuashunToFront
}

if ($TestAlert) {
  Show-Alert -Key 'manual-test' -Title 'A-share Watch Test' -Message 'Popup, beep, and Tonghuashun focus test. No order action.'
  return
}

function Test-QuoteRules {
  param(
    [pscustomobject]$Quote,
    [pscustomobject]$Plan
  )

  $price = $Quote.Price
  if (-not (Test-ShouldAlert -Quote $Quote)) {
    return
  }

  $isLimitPinned = $Quote.Sell1 -eq 0 -and $Quote.Buy1 -eq $price -and $Quote.Buy1Lots -gt 1000
  $isMovingUpFromOpen = $price -ge $Quote.Open -and $Quote.ChangePercent -gt 0
  $titlePrefix = "$($Plan.Name) $($Plan.Symbol.Substring(2))"

  if ($price -ge $Plan.Target3) {
    Show-Alert -Key "$($Plan.Symbol)-target3" -Title "$titlePrefix Target3" -Message "Price $price >= $($Plan.Target3). Lock most profit." -BeepFrequency 1350
  } elseif ($price -ge $Plan.Target2) {
    Show-Alert -Key "$($Plan.Symbol)-target2" -Title "$titlePrefix Target2" -Message "Price $price >= $($Plan.Target2). Consider taking another 1/3 profit." -BeepFrequency 1250
  } elseif ($price -ge $Plan.Target1) {
    Show-Alert -Key "$($Plan.Symbol)-target1" -Title "$titlePrefix Target1" -Message "Price $price >= $($Plan.Target1). Consider taking 1/3 profit." -BeepFrequency 1150
  }

  if ($price -le $Plan.ClearStop) {
    Show-Alert -Key "$($Plan.Symbol)-clear-stop" -Title "$titlePrefix Clear Stop" -Message "Price $price <= $($Plan.ClearStop). Clear position by plan." -BeepFrequency 650
  } elseif ($price -le $Plan.ReduceStop) {
    Show-Alert -Key "$($Plan.Symbol)-reduce-stop" -Title "$titlePrefix Reduce Stop" -Message "Price $price <= $($Plan.ReduceStop). Reduce risk first." -BeepFrequency 750
  }

  if ($price -ge $Plan.HighOpenRisk -and -not $isLimitPinned) {
    Show-Alert -Key "$($Plan.Symbol)-high-open" -Title "$titlePrefix High Open Risk" -Message "Price $price >= $($Plan.HighOpenRisk). Wait for turnover; do not chase." -BeepFrequency 850
  }

  if ($price -ge $Plan.BuyLow -and $price -le $Plan.BuyHigh -and $isMovingUpFromOpen -and -not $isLimitPinned) {
    Show-Alert -Key "$($Plan.Symbol)-buy-zone" -Title "$titlePrefix Buy Zone" -Message "Price $price is in $($Plan.BuyLow)-$($Plan.BuyHigh). Confirm intraday chart and sector in Tonghuashun." -BeepFrequency 1050
  }

  if ($isLimitPinned) {
    Show-Alert -Key "$($Plan.Symbol)-limit-pinned" -Title "$titlePrefix Limit Pinned" -Message "Sell1 is 0; Buy1 queue $($Quote.Buy1Lots) lots. Do not chase without turnover." -BeepFrequency 950
  }
}

function Write-QuoteTable {
  param([object[]]$Rows)

  Clear-Host
  Write-Host "A-share watch $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  interval ${IntervalSeconds}s  Ctrl+C to stop" -ForegroundColor Cyan
  Write-Host "Alerts fire only during A-share trading windows and only when quote date is today." -ForegroundColor DarkGray
  Write-Host "Confirm and place orders manually in Tonghuashun.`n" -ForegroundColor DarkGray

  $Rows |
    Select-Object Role,Name,Code,Price,ChangePercent,Open,High,Low,Buy1,Buy1Lots,Sell1,Sell1Lots,TurnoverPercent,Time |
    Format-Table -AutoSize
}

Write-Host "Watching: $($watchList.Name -join ' / ')" -ForegroundColor Green
Write-Host "When an alert triggers, the script will try to focus the logged-in Tonghuashun window. Use Ctrl+C to stop.`n" -ForegroundColor DarkGray

do {
  try {
    $quotes = Get-Quote -Symbols $watchList.Symbol
    $rows = @()

    foreach ($plan in $watchList) {
      $quote = $quotes | Where-Object { $_.Symbol -eq $plan.Symbol } | Select-Object -First 1
      if (-not $quote) {
        continue
      }

      $row = $quote | Select-Object *, @{Name='Role'; Expression={ $plan.Role }}
      $rows += $row
      Test-QuoteRules -Quote $quote -Plan $plan
    }

    Write-QuoteTable -Rows $rows
  } catch {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Quote fetch failed: $($_.Exception.Message)" -ForegroundColor Red
  }

  if ($Once) {
    break
  }

  Start-Sleep -Seconds $IntervalSeconds
} while ($true)
