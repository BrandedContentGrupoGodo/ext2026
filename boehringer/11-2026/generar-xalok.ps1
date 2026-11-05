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
# GitHub Pages usa el h1 del hero. Xalok ya genera el h1 editorial, así que el fragmento repite el titular como párrafo, con la misma clase.
$piece = [regex]::Replace($piece, '<h1 class="bc-obesidad-hero__title">([\s\S]*?)</h1>', '<p class="bc-obesidad-hero__title">$1</p>', 1)

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

$version = "2"
$css = @"
<link rel="stylesheet" href="$base/assets/css/styles.css?v=$version">
"@

$loader = @"
<script>
(function () {
  var src = "$base/assets/js/scripts.js?v=$version";
  function load() {
    var root = document.querySelector(".bc-obesidad");
    if (root && root.getAttribute("data-bc-obesidad-init") === "1") return;
    if (document.querySelector("script[data-bc-obesidad-src='1']")) return;
    var script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.setAttribute("data-bc-obesidad-src", "1");
    document.head.appendChild(script);
  }
  function boot() {
    if (document.documentElement.getAttribute("data-bc-obesidad-boot") === "1") return;
    document.documentElement.setAttribute("data-bc-obesidad-boot", "1");
    if (document.querySelector(".bc-obesidad")) { load(); return; }
    var tries = 0;
    var timer = window.setInterval(function () {
      tries += 1;
      if (document.querySelector(".bc-obesidad")) { window.clearInterval(timer); load(); }
      else if (tries >= 50) { window.clearInterval(timer); }
    }, 100);
  }
  boot();
})();
</script>
"@

$articleBody = @'
<script>
/* articleBody para Google: rellena el NewsArticle que genera Xalok con el texto de la maqueta.
   Va inline para no depender de GitHub Pages. Solo actúa si articleBody está vacío. */
(function () {
  var ROOT = '.bc-obesidad';
  function fillArticleBody() {
    var root = document.querySelector(ROOT);
    if (!root) return;
    var parts = [];
    root.querySelectorAll('h2, h3, p, li').forEach(function (el) {
      if (el.tagName === 'LI' && el.querySelector('p')) return;
      if (el.closest('[aria-hidden="true"], [data-bc-nobody], [class*="-credits"]')) return;
      if (el.getAttribute('role') === 'heading' && el.getAttribute('aria-level') === '1') return;
      var t = el.textContent.replace(/\s+/g, ' ').trim();
      if (t) parts.push(t);
    });
    var body = parts.join('\n\n');
    if (!body) return;
    document.querySelectorAll('script[type="application/ld+json"]').forEach(function (s) {
      var data;
      try { data = JSON.parse(s.textContent); } catch (e) { return; }
      var items = Array.isArray(data) ? data : (data['@graph'] || [data]);
      var changed = false;
      items.forEach(function (it) {
        if (/Article/.test([].concat(it['@type'] || []).join(',')) && !it.articleBody) {
          it.articleBody = body;
          changed = true;
        }
      });
      if (changed) s.textContent = JSON.stringify(data);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fillArticleBody);
  } else {
    fillArticleBody();
  }
})();
</script>
'@

$doc = $fonts + "`r`n" + $css + "`r`n" + $hostCss + "`r`n" + "<!-- Fragmento integrable. Sin documento, cabecera ni pie de La Vanguardia. -->" + "`r`n" + $piece + "`r`n" + $loader + "`r`n" + $articleBody + "`r`n"
[System.IO.File]::WriteAllText($out, $doc, [System.Text.UTF8Encoding]::new($false))
Write-Output $out
