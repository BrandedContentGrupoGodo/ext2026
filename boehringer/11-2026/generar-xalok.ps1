# Regenera el fragmento Xalok desde index.html, sin duplicar el contenido a mano.
# Uso, desde boehringer/11-2026:
#   powershell -ExecutionPolicy Bypass -File .\generar-xalok.ps1
# Opcional: -Base "https://brandedcontentgrupogodo.github.io/ext2026/boehringer/11-2026"

param(
  [string]$Base = "https://brandedcontentgrupogodo.github.io/ext2026/boehringer/11-2026"
)

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$indexPath = Join-Path $here "index.html"
$index = Get-Content -Raw -Encoding UTF8 $indexPath

$startMark = "<!-- bc-obesidad:piece -->"
$endMark = "<!-- /bc-obesidad:piece -->"
$start = $index.IndexOf($startMark)
$end = $index.IndexOf($endMark)
if ($start -lt 0 -or $end -lt 0 -or $end -le $start) {
  throw "No se encontraron las marcas de la pieza en index.html"
}

$piece = $index.Substring($start + $startMark.Length, $end - $start - $startMark.Length).Trim()
$base = $Base.TrimEnd("/")
$piece = $piece -replace '(?<=["''])assets/', ($base + "/assets/")

$outDir = Join-Path $here ".cursor"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$out = Join-Path $outDir "xalok-borrador.html"

$hostCss = @'
<style>
/* Marco solo del artículo que contiene esta pieza. !important acotado:
   1) margin del content-free-html, colisión habitual de Xalok (14px).
   2) overflow visible del article, para que la barra sticky no quede recortada.
   No hay id de noticia confirmado: no se usa data-wf-page-id. */
article.visual__story--free:has(.bc-obesidad) {
  overflow: visible !important;
}
article.visual__story--free:has(.bc-obesidad) > .container-fluid {
  padding-left: 0;
  padding-right: 0;
}
article.visual__story--free:has(.bc-obesidad) > .container-fluid > .row {
  margin-left: 0;
  margin-right: 0;
}
article.visual__story--free:has(.bc-obesidad) .visual-article-free.col-12 {
  padding-left: 0;
  padding-right: 0;
}
article.visual__story--free:has(.bc-obesidad) .visual-article-free.col-12 > .content-free-html {
  margin: 0 !important;
}
</style>
'@

$fonts = @"
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" href="$base/assets/fonts/tiempos-headline-semibold.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="$base/assets/fonts/tiempos-headline-light.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="$base/assets/fonts/tiempos-text-regular.woff2" as="font" type="font/woff2" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
"@

$links = @"
<link rel="stylesheet" href="$base/assets/css/styles.css">
<script src="$base/assets/js/scripts.js" defer></script>
"@

$doc = $hostCss + "`r`n" + $fonts + "`r`n" + $links + "`r`n" + "<!-- Fragmento integrable. Sin documento, cabecera ni pie de La Vanguardia. -->" + "`r`n" + $piece + "`r`n"
[System.IO.File]::WriteAllText($out, $doc, [System.Text.UTF8Encoding]::new($false))
Write-Output $out
