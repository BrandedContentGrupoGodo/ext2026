# CaixaBank — Historia 11 · Isabel Fernández

Capítulo 11 de Constelaciones. La plantilla técnica es la Historia 10 (`cap10`), reutilizada en `caixabank/cap11`. El texto y la estructura visible siguen el frame de Figma `8234:103`.

No está terminado: faltan los vídeos.

## Origen

Copia de `C:\Users\asantander\Documents\2026\Caixabank\caixabank\cap10\cap10`. Ese original no se ha modificado.

## Estado

- Preview LV: `index.html`
- Preview MD: `index-md.html`
- Root: `.bc-caixabank`
- CSS y JS acotados a ese root
- Assets gráficos de la serie, en local
- Fotografías de Isabel, en local
- Fragmento Xalok: no generado

Base prevista en GitHub Pages: `https://brandedcontentgrupogodo.github.io/ext2026/caixabank/cap11/`

## Diferencias estructurales respecto a cap10

Se mantiene el esqueleto: hero con constelaciones, barra social de cap10, vídeo, relato, fotografía horizontal con cita, cuatro tarjetas, cita centrada sobre constelaciones, fotografía horizontal con cita, galería de cuatro, Qualifio, cierre y créditos.

En el frame `8234:103`, la cita de Juan Antonio Fernández va sobre la banda de estrellas, no sobre una fotografía. `fondo-estrellas.jpg` se queda. La segunda foto con cita es `historia-02.jpg`. No hay `historia-03`.

Las tarjetas conservan el desfase de cap10. En el frame, de izquierda a derecha y de arriba abajo: «Creer en las personas…», «El valor de sentirse acompañado», «Una apuesta por el deporte paralímpico», «Valores que van más allá…».

## Qualifio

El bloque es el de cap10, con el id `1789279`. Está después del último relato y antes de «Conoce otras historias».

## Barra social

Es el componente de cap10: iframe de Facebook a 95×20 y botón de X. El fondo, la altura, el hueco y la alineación no cambian.

`SHARE_URL_LV` y `SHARE_URL_MD` están vacíos en `assets/js/scripts.js`. Hasta rellenarlos, los botones no se pueden pulsar y no apuntan al artículo de Martín. El cromo oficial usa temporalmente la home del medio solo para pintarse.

## Assets en uso

- `assets/img/hero.png` — retrato del hero
- `assets/img/historia-01.jpg` — primera foto con cita
- `assets/img/historia-02.jpg` — segunda foto con cita
- `assets/img/galeria-01.png` a `galeria-04.png` — galería
- `assets/img/fondo-cabecera.png` — fondo del hero
- `assets/img/fondo-estrellas.jpg` — banda de la cita de Juan Antonio Fernández
- `assets/img/circulos.svg` — fondo de las tarjetas
- `assets/img/home.svg`
- `assets/img/logo_caixabank.svg`
- `assets/css/main.css`
- `assets/js/scripts.js`

## Assets que faltan

Ninguna de las siete fotografías. Los archivos exportados son PNG y JPG, no WebP.

## TODO YouTube LV

`YOUTUBE_ID_LV` en `assets/js/scripts.js`. Vacío. El preview muestra un recuadro gris, sin iframe.

## TODO YouTube MD

`YOUTUBE_ID_MD` en el mismo archivo. Vacío. `index-md.html` usa `data-youtube-slot="md"`.

## TODO URLs definitivas LV/MD

Rellenar `SHARE_URL_LV` y `SHARE_URL_MD` en `assets/js/scripts.js`. No usar la URL de la historia anterior.

La flecha «historia anterior» apunta a la Historia 10 ya publicada. «Volver a las estrellas» y el icono de inicio apuntan al hub de Constelaciones de cada medio.

## Encapsulado Xalok

El contenido está dentro de `.bc-caixabank`. El CSS no redefine `html`, `body` ni `:root`. El JavaScript consulta y observa ese root.

El ajuste de margen de Xalok no está aplicado: el fragmento todavía no se genera. Irá en `.cursor/xalok-borrador.html`, sin versionar, cuando toque integrarlo.

## Pendientes antes de publicar

1. Rellenar los dos IDs de YouTube.
2. Rellenar `SHARE_URL_LV` y `SHARE_URL_MD`.
3. Generar el fragmento Xalok y comprobar el margen en el CMS, en escritorio y en móvil.
