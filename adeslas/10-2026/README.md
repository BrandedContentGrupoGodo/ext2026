# Adeslas — Vivir más y mejor · 10-2026

Landing de branded content para La Vanguardia. Implementa el frame `LV - Premium-V3`.

Preview local: servir la carpeta `adeslas/10-2026/`.

Base prevista de los assets, cuando se publique:

`https://brandedcontentgrupogodo.github.io/ext2026/adeslas/10-2026/`

## Figma

- Archivo: [Adeslas](https://www.figma.com/design/9ok7ICV5wO3hzPVgytMWqo/Adeslas?node-id=8215-4)
- Desktop: `LV - Premium-V3` · `8215:4` · 1440 × 3170
- Móvil: `LV - Premium-V3 · Mobile` · `8220:4` · 390 × 4397
- Notas: `Notas V3` · `8217:6`

`LV - Premium-V2` está oculto y no se ha usado. No hay frame de tablet: entre 760 y 1099 px la rejilla pasa a dos columnas, sin contenido nuevo.

## Qué entra

1. Hero. «en colaboración con Adeslas», titular «Vivir más y mejor» y accesos Videopódcast y Artículos.
2. Último episodio. Episodio 03, con la Dra. Amanda Fernández. La imagen del destacado sigue siendo la del episodio 01 hasta que haya una propia.
3. Todos los episodios. Seis videopódcasts. 01, 02 y 03 disponibles; 04 a 06 con «Próximamente».
4. Claves para vivir mejor. El artículo del sueño ya enlaza a La Vanguardia. El de la actividad en familia y los dos huecos sin título siguen en «Próximamente».
5. Logotipo de Adeslas.
6. Créditos.

La cabecera y el pie de La Vanguardia del Figma no se maquetan: ya los pone la página del medio.

## Interacciones

Definidas en las notas de la V3:

- «Videopódcast» hace scroll a «Último episodio». «Artículos», a «Claves para vivir mejor». El scroll es suave salvo con `prefers-reduced-motion`. `scroll-margin-top` usa `--bc-adeslas-sticky-top` para no quedar bajo la cabecera.
- La zona clicable de esos enlaces mide 44 px. El separador conserva la altura del texto.
- Las tarjetas publicadas (episodio destacado, 01 y 02) son un único enlace. Al pasar el cursor, la foto escala al 103 % en 200 ms. El foco es un outline navy de 2 px con 3 px de separación.
- Las tarjetas «Próximamente» no son enlace, no tienen hover y llevan `aria-disabled="true"`.
- Jerarquía: h1 en el hero, h2 en las secciones, h3 en las tarjetas.

## Estructura

```text
adeslas/10-2026/
├── index.html
├── README.md
├── assets/
│   ├── css/styles.css
│   ├── js/scripts.js
│   └── img/
```

El fragmento de Xalok está en `adeslas/10-2026/.cursor/xalok-borrador.html`. `.cursor/` no se versiona.

## Convenciones

- HTML, CSS y JavaScript vanilla. Fuentes DM Serif Text, Manrope y Open Sans desde Google Fonts, solo los pesos del diseño.
- Raíz `.bc-adeslas`. Clases con prefijo `.bc-adeslas-`.
- El CSS no toca `html`, `body` ni `:root`. El margen cero del preview vive solo en `index.html`.
- JavaScript en una IIFE. Si no hay raíz, no hace nada. Guard `data-bc-adeslas-init`.

## Integración Xalok

El id de noticia no está confirmado. El fragmento no incluye `[data-wf-page-id]`. Anula el marco con `article.visual__story--free:has(.bc-adeslas)`.

En el fragmento, y solo ahí, `--bc-adeslas-sticky-top` pasa a `40px` para la cabecera del medio. En el preview es `0`.

## Pendiente

1. Títulos, imágenes y URLs de los dos artículos que en la V3 solo dicen «Próximamente».
2. URLs de los episodios 04 a 06 y del artículo «Moverse en familia», cuando dejen de ser «Próximamente».

La disponibilidad de los seis episodios está en `episodeState`, dentro de `assets/js/scripts.js`.

3. Id de noticia de Xalok, si hace falta afinar el selector de margen.
4. Comprobar en Xalok, al terminar la carga y en móvil, que no queda marco blanco y que el scroll no choca con la cabecera.
