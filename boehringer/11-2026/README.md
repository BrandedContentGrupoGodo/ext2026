# Boehringer — Obesidad: cambiar la mirada · 11-2026

Landing editorial de Brandslab para La Vanguardia, en colaboración con Boehringer Ingelheim. HTML, CSS y JavaScript vanilla, encapsulados en `.bc-obesidad`.

Fuente de verdad: frame v7 [Obesidad · Cambiar la mirada · v7 LV](https://www.figma.com/design/D2CUGobn9VZs8LQ2UpqPSm/Boehringer?node-id=8434-6156) (`8434:6156`).

## Preview

Servir esta carpeta por HTTP:

`boehringer/11-2026/index.html`

Ruta pública:

`https://brandedcontentgrupogodo.github.io/ext2026/boehringer/11-2026/`

## Estructura

```text
boehringer/11-2026/
├── index.html
├── README.md
├── generar-xalok.ps1
├── assets/
│   ├── css/styles.css
│   ├── js/scripts.js
│   ├── fonts/
│   └── img/
└── .cursor/xalok-borrador.html
```

`.cursor/` es local y no se versiona.

## Regenerar el fragmento Xalok

El fragmento sale del mismo markup del `index.html`, entre `<!-- bc-obesidad:piece -->` y `<!-- /bc-obesidad:piece -->`. No hay una segunda copia manual del contenido.

```powershell
powershell -ExecutionPolicy Bypass -File .\generar-xalok.ps1
```

La base por defecto es `https://brandedcontentgrupogodo.github.io/ext2026/boehringer/11-2026`. Para otra base:

```powershell
powershell -ExecutionPolicy Bypass -File .\generar-xalok.ps1 -Base "https://ejemplo/boehringer/11-2026"
```

El script reescribe las rutas `assets/` del fragmento a URLs absolutas y añade el CSS del marco. Ese CSS no está en `styles.css`. El `margin: 0` del `body` solo vive en el `index.html` de preview.

No hay id de noticia confirmado, así que el fragmento no usa `data-wf-page-id`. El reset queda limitado a `article.visual__story--free:has(.bc-obesidad)`. Hay dos `!important` documentados: el margen de `.content-free-html` y `overflow: visible` en el artículo, para que la barra sticky no quede recortada.

## Tipografía

Producción: Tiempos Headline Light (300) y Semibold (600) para titulares, citas, cifras y frases puente; Tiempos Text Regular (400) para el cuerpo. UI, navegación, nombres, botones y pies: Open Sans. No hay negrita ni cursiva de Tiempos Text en el contenido, así que esos archivos no se publican. Headline Regular no forma parte del juego usado: la frase de vitalidad va en Headline Light 300.

Los WOFF2 están en `assets/fonts/` y el `@font-face` vive en `styles.css`, con rutas relativas a esa hoja. El fallback, si el archivo no carga, es Georgia. Open Sans sigue viniendo de Google Fonts. Los OTF originales no se versionan.

## Comportamiento

- Barra sticky con `--bc-obesidad-host-offset` (0 en la preview) y `--bc-obesidad-nav-height`. En Xalok, el script mide `.main-header` si está fijo o sticky en el borde superior. No oculta la franja «Ofrecido por».
- IMC, seis factores, panel ANPO/FEH y dos desplegables. Los cortes de vídeo están en `CLIPS`, dentro de `assets/js/scripts.js`.
- Ningún iframe de YouTube hasta que se pulsa un reproductor. Al activar uno, se retira el anterior.
- El revelado por scroll y el parpadeo del ojo solo se activan con JavaScript y sin `prefers-reduced-motion`. Sin JS el contenido sigue visible.

## Pendientes reales

- Fotogramas definitivos 1920×1080. Los actuales salen del frame v7 y varios siguen marcados como provisionales. El de Deborah García Bello llegó a 480×360. El cartel del reproductor completo es la cartela de entrada, con marca, no un plano de la doctora Ana Sánchez Bao.
- Pasar las fotografías a WebP: en esta máquina no hay ffmpeg, cwebp ni ImageMagick.
- Revisión de los cortes con el vídeo, al final natural de cada frase.
- Respuesta editorial si el capítulo 05 debe ampliar Corazón y Riñones. El diagrama conserva los tres órganos; no se han recuperado los bloques explicativos eliminados.
- Probar el fragmento dentro de Xalok, en desktop y móvil, después de la carga. Esta preview no valida Xalok.
- Confirmar el id de noticia si más adelante se pide la regla `data-wf-page-id`.
