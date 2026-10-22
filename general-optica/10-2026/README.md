# General Optica — Halloween 2026

Landing de branded content para La Vanguardia. Implementa la V3 aprobada.

Preview local: `http://127.0.0.1:8777/` (servidor estático de la carpeta).

Prueba publicada: `https://brandedcontentgrupogodo.github.io/ext2026/general-optica/10-2026/`

## Figma

- Archivo: [LV Brandslab · General Optica · Halloween — Landing](https://www.figma.com/design/tAieLB3dbCh5A1jfxfX0x4/LV-Brandslab-%C2%B7-General-Optica-%C2%B7-Halloween-%E2%80%94-Landing)
- Desktop: `Landing V3 · Desktop 1440 · texto del redactor` · `60:160` · 1440 × 8251
- Móvil: `Mobile V3 · 375 · pantallas clave` · `67:102` · 375 px

La página `06 — Archivo (V1, V2)` no se ha usado.

El manuscrito publicado es el de los nodos de texto del desktop. El frame móvil es una referencia de composición de pantallas clave: recortes, tamaños y bloques a sangre. Donde el móvil abrevia o anota, se mantiene el texto completo del desktop.

## Orden de lectura

El cliente fijó el orden 1 → 3 → 8 → 2 → 4 → 5 → 6 → 7 → 9, con los números de los bloques originales. Es el mismo en desktop y en móvil. Los créditos quedan después del cierre.

1. Hero. Que el susto de Halloween no te lo den tus ojos.
2. Ojo con los ojos. Dato 7 de cada 10.
3. Hazlo bien.
4. Miradas de miedo.
5. Las lentillas no son un accesorio.
6. Que la noche no te confunda.
7. Tres pasos a tener en cuenta antes de disfrazarte los ojos.
8. Cuándo hay que quitárselas.
9. Miedo del bueno.

## Movimiento

`assets/js/scripts.js` activa las entradas con IntersectionObserver. Solo cambian `opacity` y `transform`. Sin la clase `data-bc-go-hw-motion`, o con `prefers-reduced-motion`, el contenido se ve entero. Los CTA no se animan. La cifra «7» permanece visible; entran en secuencia los siete anillos llenos.

## Espaciado

Cada bloque conserva el relleno de la V3. Los ajustes respecto a la primera implementación:

- «Alerta»: 20 px entre antetítulo, titular, párrafo y lista, como la columna del desktop.
- «Hazlo bien»: 24 px entre antetítulo, titular y entradilla.
- Cronología: 14 px entre el título de cada paso y su texto.
- El reset de márgenes de títulos y párrafos anulaba, por especificidad, el espacio del lead, del statement de «Miradas», de la fuente del dato, de las tarjetas de la visita y del antetítulo cuando no tenía una regla más específica. El reset ahora no pisa esos márgenes.

El cambio de orden separa los dos bloques arena. Cada uno mantiene su propio relleno.

## Estructura

```text
general-optica/10-2026/
├── index.html
├── README.md
├── assets/
│   ├── css/styles.css
│   ├── js/scripts.js
│   └── img/
```

El fragmento de Xalok está en `general-optica/10-2026/.cursor/xalok-borrador.html`. `.cursor/` no se versiona.

## Convenciones

- HTML, CSS y JavaScript vanilla. Sin frameworks.
- Raíz `.bc-go-hw`. Clases con prefijo `.bc-go-hw-`.
- Sin cabecera ni pie de La Vanguardia. Esos bloques del Figma son contexto, no se maquetan.
- El CSS del preview no toca `html`, `body` ni `:root`. El margen cero del preview vive solo en `index.html`.
- Fuentes: Newsreader, Source Serif 4 y Schibsted Grotesk, desde Google Fonts.
- La columna de «Tres pasos…» es sticky solo en desktop. En el fragmento, `--bc-go-hw-sticky-top` sube el anclaje para dejar sitio al header del medio. Hay que comprobarlo con el header real.
- Los enlaces viven solo bajo `.bc-go-hw`. Color, subrayado, fondo, borde y flecha quedan declarados en normal, `:visited`, `:hover`, `:focus`, `:focus-visible` y `:active`, con especificidad `.bc-go-hw a.bc-go-hw-cta.bc-go-hw-cta--*`, para que Xalok no los reescriba. Sin `!important`. La regla local está en `.cursor/rules/enlaces-xalok.mdc`.

## Integración Xalok

El id de noticia no está confirmado. Por eso el fragmento no incluye `[data-wf-page-id]`. Cuando exista, hay que añadir en el fragmento, y solo ahí:

```css
[data-wf-page-id="ID_NOTICIA"]
.visual-article-free.col-12 > .content-free-html {
  margin: 0 !important;
}
```

Mientras tanto, el fragmento anula el margen con `article.visual__story--free:has(.bc-go-hw) .content-free-html`. Ese `!important` es solo para ese margen.

Base prevista de los assets, cuando se publique:

`https://brandedcontentgrupogodo.github.io/ext2026/general-optica/10-2026/`

## Incidencias editoriales, sin cambiar el texto

- Los nombres de frame B05 y B06 no coinciden con sus H2. En el desktop, B05 dice «Que la noche no te confunda» y B06 «Tres pasos a tener en cuenta antes de disfrazarte los ojos». En el móvil de pantallas clave, esos titulares están al revés: «Tres cosas a tener en cuenta antes de «disfrazarte los ojos»» y «Que la noche no te confunda». Se ha publicado el texto del desktop.
- El móvil pregunta «¿Son para mí?». El desktop, «¿Son para ti?». Se ha publicado «¿Son para ti?».
- La entradilla del desktop no lleva punto final. La del móvil sí. La capa se llama «punto final», pero el nodo de texto del desktop no lo tiene. Se ha publicado sin punto.
- El antetítulo «Alerta» lleva la nota «A DECIDIR: tono». El texto visible es «Alerta».
- La lista de complicaciones está en la V3. Una nota dice que la V2 la eliminaba y que está por decidir. Se ha mantenido la lista visible.
- En el móvil, la fuente del dato va precedida de «REFERENCIA PENDIENTE ·». Es una anotación de producción. El crédito publicado es el del desktop, sin ese prefijo.
- El cuerpo de «Cuándo hay que quitárselas» en el móvil usa puntos suspensivos. Se ha publicado el párrafo completo del desktop.
- La nota del móvil «2 y 3 llevan su texto debajo, igual que el 1» no es copy. Los tres puntos se publican enteros.
- Créditos: el diseño decía «Redacción: xx». El texto publicado es «Àngela Zorrilla».
- «Encuentra tu óptica» enlaza a la landing de campaña de Halloween, no a un buscador de ópticas. El texto del botón es el aprobado.
- Las fotografías están en WebP, con los mismos píxeles que el PNG exportado de Figma. Los iconos siguen en SVG.

## Pendiente

1. Id de noticia de Xalok, para el selector de margen.
2. Comprobar en Xalok, al terminar la carga y en móvil, que no queda marco blanco y que el sticky no choca con el header.
3. Pegar el fragmento en un borrador de Xalok. Los assets ya apuntan a GitHub Pages.
4. Revisar si el botón «Encuentra tu óptica» debe seguir con ese texto: su URL es la landing de campaña.
