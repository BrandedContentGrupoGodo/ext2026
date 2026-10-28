# Glovo — Barcelona no se detiene · 10-2026

Landing de branded content para La Vanguardia. Implementa el frame `landing-desktop_V4 (revisión UX-a11y)`.

Preview local: servir la carpeta `glovo/10-2026/`.

Preview publicada:

`https://brandedcontentgrupogodo.github.io/ext2026/glovo/10-2026/`

## Figma

- Archivo: [Glovo](https://www.figma.com/design/BZ0UBlPXA812H9I9ZzeCtP/Glovo?node-id=109-606)
- Desktop: `landing-desktop_V4 (revisión UX-a11y)` · `109:606` · 1718 × 5702

No hay frame móvil en el archivo. El responsive se recompone a partir del desktop.

## Qué entra

1. Hero. Ilustración, onda amarilla, «En colaboración con Glovo», titular y «Empieza el recorrido».
2. Artículos. Dos historias activas y tres «Próximamente».
3. Cierre. Fotografía, «La ciudad sigue en movimiento» y el párrafo amarillo.
4. Créditos.

La cabecera y el pie de La Vanguardia del Figma no se maquetan.

## Estructura

```text
glovo/10-2026/
├── index.html
├── README.md
├── assets/
│   ├── css/styles.css
│   ├── js/scripts.js
│   └── img/
```

## Convenciones

- HTML, CSS y JavaScript vanilla. Montserrat 400, 500, 600, 700 y 900 desde Google Fonts.
- Raíz `.bc-glovo`. Clases con prefijo `.bc-glovo`.
- El CSS no toca `html`, `body` ni `:root`. El margen cero del preview vive solo en `index.html`.
- JavaScript en una IIFE. Si no hay raíz, no hace nada. Guard `data-bc-glovo-init`.
- «Empieza el recorrido» es un enlace a `#articulos`. El scroll es suave salvo con `prefers-reduced-motion`.
- Las dos historias activas son un único enlace en el título. El foco dibuja el contorno de la tarjeta.
- Las tres «Próximamente» no son enlace, no tienen botón y no entran en el tabulador. El candado es decorativo.

## URLs

El único sitio para cambiarlas es `STORY_URLS` en `assets/js/scripts.js`. El enlace de cada card usa esa URL y se abre en la misma pestaña.

- Gastronomía: `https://www.lavanguardia.com/comer/20261028/11593743/nietos-bulli-nueva-cocina-catalana-asi-cuece-futuro-gastronomico-barcelona-brl.html`
- Arquitectura: `https://www.lavanguardia.com/vida/20261031/11664765/barcelona-futuro-como-cambiara-ciudad-habitamos-brl.html`

Las tres «Próximamente» siguen sin enlace.

## Integración Xalok

El fragmento todavía no está generado. El id de noticia no está confirmado.

Cuando se prepare, el margen cero va solo en el fragmento, con el id real:

```css
[data-wf-page-id="ID_NOTICIA"]
.visual-article-free.col-12 > .content-free-html {
  margin: 0 !important;
}
```

`--bc-glovo-sticky-top` está en `0px` en el preview. En el fragmento habrá que subirlo si el ancla queda bajo la cabecera del medio.
