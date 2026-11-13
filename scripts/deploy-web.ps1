#Requires -Version 7.2
[CmdletBinding()]
param(
    [string]$Profile = 'aural-target',
    [string]$AccountId = '218a03e65d9ac7602168bbb28d0b96eb',
    [string]$ProjectName = 'xiaod',
    [string]$ProductionBranch = 'refactor/frontend-architecture',
    [uri]$SiteUrl = 'https://xiaod.dpdns.org',
    [string]$WranglerPath,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$frontendRoot = Split-Path $PSScriptRoot -Parent
if (!$WranglerPath) {
    $WranglerPath = Join-Path (Split-Path $frontendRoot -Parent) 'xander-lab-backend/workers/node_modules/wrangler/bin/wrangler.js'
}
$WranglerPath = (Resolve-Path -LiteralPath $WranglerPath).Path
if ($SiteUrl.Scheme -ne 'https') { throw 'SiteUrl must use HTTPS.' }
Get-Command node, pnpm -ErrorAction Stop | Out-Null

function Invoke-CheckedCommand {
    param([string]$Command, [string[]]$Arguments)
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) { throw "$Command failed (exit $LASTEXITCODE). Deployment stopped." }
}

$previousAccount = $env:CLOUDFLARE_ACCOUNT_ID
$client = $null
Push-Location $frontendRoot
try {
    Write-Host "Target: $ProjectName / $ProductionBranch / $SiteUrl"
    Write-Host 'Deploying the current working tree, including any uncommitted changes:'
    Invoke-CheckedCommand git @('status', '--short')
    Invoke-CheckedCommand git @('log', '-1', '--oneline')
    Invoke-CheckedCommand pnpm @('run', 'check:architecture')
    Invoke-CheckedCommand pnpm @('run', 'check:i18n')
    Invoke-CheckedCommand pnpm @('run', 'build')

    $dist = Join-Path $frontendRoot 'dist'
    $version = (Get-Content (Join-Path $dist 'version.json') -Raw | ConvertFrom-Json).version
    if (!$version) { throw 'Build did not produce a version.' }
    foreach ($file in @('index.html', '_headers', '_redirects')) {
        if (!(Test-Path -LiteralPath (Join-Path $dist $file))) { throw "Missing build artifact: $file" }
    }
    $deployArgs = @($WranglerPath, 'pages', 'deploy', $dist, '--project-name', $ProjectName,
        '--branch', $ProductionBranch, '--commit-dirty=true', '--profile', $Profile)
    if ($DryRun) {
        Write-Host "Dry run passed. Build version: $version"
        Write-Host "Would deploy with profile '$Profile', account '$AccountId', and verify $SiteUrl"
        return
    }

    $env:CLOUDFLARE_ACCOUNT_ID = $AccountId
    Invoke-CheckedCommand node $deployArgs

    # Verify the custom production domain, not just the temporary deployment URL.
    $client = [System.Net.Http.HttpClient]::new()
    $client.Timeout = [TimeSpan]::FromSeconds(20)
    $client.DefaultRequestHeaders.UserAgent.ParseAdd('Mozilla/5.0 WebDeploymentVerifier')
    $origin = $SiteUrl.AbsoluteUri.TrimEnd('/')
    $verified = $false
    for ($attempt = 1; $attempt -le 6; $attempt++) {
        try {
            $remote = $client.GetStringAsync("$origin/version.json?verify=$version-$attempt").GetAwaiter().GetResult() | ConvertFrom-Json
            if ($remote.version -ne $version) { throw "Production version is still $($remote.version); expected $version." }
            $html = $client.GetStringAsync("$origin/workspace/agent").GetAwaiter().GetResult()
            $localHtml = Get-Content (Join-Path $dist 'index.html') -Raw
            $assets = [regex]::Matches($localHtml, '(?:src|href)="(/assets/[^" ]+\.(?:js|css))"')
            if (!$assets.Count) { throw 'No entry assets in the build.' }
            foreach ($asset in $assets) {
                if (!$html.Contains($asset.Groups[1].Value)) { throw 'Production HTML has stale entry assets.' }
            }
            $chat = @(Get-ChildItem (Join-Path $dist 'assets/WorkspaceAgentChat-*.js'))
            if ($chat.Count -ne 1) { throw 'Expected one workspace chat bundle.' }
            $bytes = $client.GetByteArrayAsync("$origin/assets/$($chat[0].Name)").GetAwaiter().GetResult()
            $actualHash = [Convert]::ToHexString([System.Security.Cryptography.SHA256]::HashData($bytes))
            if ($actualHash -ne (Get-FileHash $chat[0].FullName -Algorithm SHA256).Hash) {
                throw 'Production chat bundle differs from the local build.'
            }
            $verified = $true
            break
        } catch {
            Write-Warning "Verification $attempt/6: $($_.Exception.Message)"
            if ($attempt -lt 6) { Start-Sleep -Seconds 5 }
        }
    }
    if (!$verified) { throw 'Upload completed, but production verification failed. Check Pages deployment status before deploying again.' }
    Write-Host "Production verified: $origin (version $version)"
} finally {
    if ($client) { $client.Dispose() }
    if ($null -eq $previousAccount) { Remove-Item Env:CLOUDFLARE_ACCOUNT_ID -ErrorAction SilentlyContinue }
    else { $env:CLOUDFLARE_ACCOUNT_ID = $previousAccount }
    Pop-Location
}
