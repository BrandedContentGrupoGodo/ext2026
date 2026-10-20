# Endesa — Hub editorial · 10-2026

Landing de branded content para La Vanguardia, en colaboración con Endesa.
Preview prevista en GitHub Pages. Integración posterior en Xalok.

Preview publicado en GitHub Pages. El fragmento de Xalok está preparado en local y todavía no se ha pegado en el CMS.

## Objetivo

Reproducir el frame aprobado `HUB` (`6601:130`) como fragmento encapsulado bajo `.bc-endesa`, sin cabecera ni footer de La Vanguardia, con el hero en vídeo de fondo.

## Figma

- Archivo: [ENDESA](https://www.figma.com/design/ahkfLE1Nq5pxRhUvG1JFMh/ENDESA?node-id=6601-130)
- Página: `endesa HUB 2026`
- Frame de referencia: `HUB` · nodo `6601:130`
- Medida leída en el canvas: **1440 × 5297 px**

No hay servidor MCP de Figma en esta sesión. La lectura se hizo en el visor (archivo compartido, sin Dev Mode). Los textos de abajo salen del canvas a zoom 50 %, no del inspector tipográfico: hay que contrastarlos antes de maquetar. No se han exportado assets ni se usarán URLs temporales de Figma.

### Cómo se usa

El archivo es referencia visual y de contenido. La construcción interna no es una referencia técnica: puede haber capas duplicadas, absolutos, grupos mal armados, medidas poco limpias, efectos solo para llegar al resultado y componentes mal construidos.

No se traduce la estructura de capas a HTML/CSS. La landing se reconstruye con HTML semántico, CSS limpio y responsive, y un comportamiento visual equivalente.

Sirve para fijar jerarquía visual, espaciados, proporciones, tipografías, colores, imágenes, contenido y el comportamiento que se ve. No sirve para copiar su arquitectura.

Prioridad al implementar:

1. Fidelidad visual al diseño aprobado.
2. Buena estructura HTML.
3. CSS limpio y responsive.
4. Integración segura en Xalok.
5. Buen rendimiento.
6. Accesibilidad.
7. Evitar hacks innecesarios.

## Convenciones técnicas

Reutilizan `fira/09-2026`, `czfb/09-2026` y `santander/09-2026`, más `.cursor/rules/xalok-integration.mdc`.

- HTML, CSS y JavaScript vanilla. Sin React, Tailwind, GSAP, npm ni otras librerías salvo autorización.
- Root único: `.bc-endesa`.
- Preview: `index.html`, `assets/css/main.css`, `assets/js/scripts.js`, rutas relativas.
- Fragmento Xalok: `endesa/10-2026/.cursor/xalok-borrador.html` (local, no versionado). CSS, JS, fuentes y medios en URLs absolutas. Base: `https://brandedcontentgrupogodo.github.io/ext2026/endesa/10-2026/`.
- Selectores, variables (`--bc-endesa-`), clases, ids y keyframes bajo el root. El reset de `box-sizing` también.
- Sin estilos sobre `html`, `body` o `:root`.
- El margen y el padding de Xalok se anulan solo dentro de `article.visual__story--free:has(.bc-endesa)`, al principio del fragmento, no en el CSS del preview. `overflow: visible !important` va en ese `article` para que el sticky no lo rompa un wrapper con recorte. No usan id de noticia ni `data-wf-page-id`.
- JavaScript en IIFE. Consultas desde el root. Si no hay root, salir. Guard `data-bc-endesa-init`. Arranque también si el script carga después de `DOMContentLoaded`.
- Reveals con `IntersectionObserver`, contenido visible si JS falla, `prefers-reduced-motion`, y salvaguarda de scroll rápido / anclas. Sin listeners de scroll continuos para un reveal simple.
- Capítulos publicados: un enlace real por capítulo, usable sin JS. Pendientes: sin `<a>`, sin `href="#"` y sin control interactivo.
- Hero en vídeo: `<video autoplay muted loop playsinline>`, sin controles, `object-fit: cover`. El archivo no se sustituye por una captura del Figma.
- Fuentes: Anton y Albert Sans desde Google Fonts, solo los pesos que confirme el diseño.
- `.cursor/` es local (está en `.git/info/exclude`) y no se versiona.

## Estructura

```
endesa/10-2026/
  README.md
  index.html
  assets/
    css/main.css
    js/scripts.js
    img/                  fotos, fondos de capítulo y hero-endesa.webm
```

El fragmento está en `endesa/10-2026/.cursor/xalok-borrador.html`. La auditoría estática está en `endesa/10-2026/.cursor/commands/xalok-audit.md`.

## Qué entra en el fragmento

Orden leído en el frame, de arriba a abajo:

1. Hero. Texto «EN COLABORACIÓN CON ENDESA», titular, subtítulo, botón «Ver los capítulos» y vídeo de fondo.
2. Bloque editorial en blanco, con titular, párrafo y tres fotografías.
3. Índice horizontal de cinco capítulos.
4. Capítulos 01 a 05, a pantalla completa.
5. Cierre en negro: texto de Endesa a la izquierda y tres citas a la derecha.
6. Créditos, sobre el mismo negro del cierre, encima del footer de LV.

## Qué no entra

Simulan la página de La Vanguardia y no forman parte del branded content:

- Franja superior azul con el wordmark «LA VANGUARDIA».
- Footer azul oscuro: wordmark, «© La Vanguardia Ediciones, SLU Todos los derechos reservados.» y enlaces Quiénes somos, Contacto, Aviso legal, Política de cookies, Otras webs del sitio, Política de privacidad, Área de privacidad.

La franja de créditos, justo encima de ese footer, sí entra en el fragmento.

## Lectura del frame

Textos tal como se leyeron en el canvas. Pendientes de contraste en Dev Mode.

### Hero

- EN COLABORACIÓN CON ENDESA
- SACANDO A LA LUZ
- Lo que hay detrás de las historias que nos rodean
- Botón: Ver los capítulos
- Fondo: plano de un operario en una plataforma elevadora, entre tendido eléctrico. En el archivo es una imagen estática. El hero de producción es vídeo.

### Introducción

- La energía forma parte de nuestra vida incluso cuando no pensamos en ella
- Cada día, una extensa red de infraestructuras y personas trabaja detrás de algo tan cotidiano como encender una luz. *Sacando a la luz* se adentra en cinco realidades complejas para conocer sus protagonistas, comprender sus consecuencias y descubrir aquello que normalmente permanece fuera de nuestra mirada. En el HTML, solo el nombre del proyecto va en `<em>`.
- Tres fotos: ave en un cable, torre eléctrica, operario con casco.

### Índice

- 01 Avifauna
- 02 Temporales
- 03 Fraude eléctrico
- 04 Energía nuclear
- 05 Phishing

El índice es `position: sticky` dentro de `.bc-endesa-story`, que envuelve el menú y los capítulos 01–05. Al terminar ese wrapper deja de pegarse. El offset superior es `--bc-endesa-sticky-offset`: `0px` en el preview y `40px` dentro de `article.visual__story--free:has(.bc-endesa)`, la altura de la cabecera sticky de La Vanguardia. El destino de cada capítulo usa `--bc-endesa-anchor-offset`, la suma de ese offset y `--bc-endesa-index-space`. «Ver los capítulos» y los ítems del menú hacen scroll suave solo dentro de `.bc-endesa`; con `prefers-reduced-motion` el salto es instantáneo. El ítem del capítulo visible pasa a azul con IntersectionObserver. Durante el scroll suave el capítulo pulsado se mantiene activo hasta que el desplazamiento se detiene. Los enlaces funcionan sin JavaScript.

### Capítulos

| | Kicker | Título | Estado en el diseño |
|---|---|---|---|
| 01 | Capítulo 01 · Avifauna | El mismo cielo | Enlace «Descubrir la historia» a `https://www.lavanguardia.com/vida/20261005/11646741/cielo-como-proteger-aves-pais-clave-biodiversidad-europea-brl.html`. Fondo: gaviotas sobre cables. |
| 02 | Capítulo 02 · Temporales | Hasta el último tramo | Enlace «Descubrir la historia» a `https://www.lavanguardia.com/vida/20261019/11658951/ultimo-tramo-trabajo-invisible-luz-apague-brl.html`. Fondo: paisaje con tendido. |
| 03 | Capítulo 03 · Fraude eléctrico | A oscuras | Próximamente |
| 04 | Capítulo 04 · Centrales nucleares | A plena luz | Próximamente. En el índice la etiqueta es Energía nuclear. |
| 05 | Capítulo 05 · Phishing | El anzuelo | Próximamente |

Cuerpos leídos:

- 01. Cómo se adaptan las redes de distribución para proteger a las aves y hacer posible la convivencia entre infraestructura y naturaleza.
- 02. Cuando el temporal golpea, una red humana trabaja para recuperar algo cuya importancia solo comprendemos cuando desaparece: la electricidad.
- 03. Los enganches ilegales asociados a plantaciones de marihuana sobrecargan la red y afectan a la seguridad y la vida cotidiana de comunidades enteras.
- 04. ¿Qué implicaciones tendría el cierre progresivo de las centrales nucleares para el sistema energético y la economía española?
- 05. Un experto nos ayuda a reconocer las señales del phishing y explica cómo protegernos frente a uno de los fraudes digitales más extendidos.

Los capítulos 01 y 02 enlazan a su artículo en La Vanguardia, en la misma pestaña. Los capítulos 03–05 siguen en «Próximamente», sin enlace.

### Cierre

Titular en azul sobre negro:

«En Endesa sabemos que detrás de cada dato hay personas, decisiones difíciles e historias que rara vez salen a la luz. Por eso hemos querido contarlas tal y como son»

Párrafos sobre las entrevistas y un agradecimiento a quienes participaron. A la derecha, tres citas:

- «Cuando fuimos a la universidad no imaginábamos volver al pueblo» — Ibtissam Mahjouba y Oxana Bonjorn, ingenieras trabajadoras en la central nuclear de Ascó
- «Aquí en España viven especies que casi han desaparecido de otros países del continente» — Jordi Prieto, técnico de SEO/Birdlife
- «La electricidad es el pilar del negocio de la marihuana en España» — Ramon Chacón, jefe de la Comisaría General de Investigación Criminal de los Mossos

### Créditos

Coordinación: Helena Moreno | Diseño y maquetación: Alejandra Santander | Producción audiovisual: Ramen Production House. Un proyecto de Brandslab. Godó Nexus.

### Tipografía y color

Anton y Albert Sans están pedidos para producción. El panel de Dev Mode no estaba disponible, así que los pesos y los hex no se han podido leer.

- Anton, en Google Fonts, solo publica el peso 400. Encaja con los titulares condensados (hero, títulos de capítulo, números 01–05).
- Albert Sans cubriría colaboración, cuerpo, índice, botones, citas y créditos. Pesos concretos: pendientes.
- Botones azules con texto blanco. Titular del cierre en azul sobre negro. Índice en negro con etiqueta en acento azul. Capítulos con foto a sangre y velo oscuro. Introducción en blanco. Créditos en texto gris claro sobre el negro del cierre.

## Assets en uso

- `assets/img/hero-endesa.webm`
- `assets/img/endesa-1.jpg`, `endesa-2.jpg`, `endesa-3.jpg`
- `assets/img/cap-1.jpg`, `cap-2.jpg`
- `assets/img/cap-bloq.jpg` en los capítulos 03, 04 y 05

## Assets pendientes

- Póster del vídeo, si existe. No hay un archivo de póster en `assets/`.
- Logo de Endesa, si debe aparecer aparte del texto «EN COLABORACIÓN CON ENDESA». En el diseño aprobado solo se lee ese texto.
- Ninguna URL pendiente en 01 y 02. Los capítulos 03–05 no tienen artículo todavía.

No exportar el frame como imagen de producción ni enlazar medios temporales de Figma.

## Preview

Hay un solo `<video>`. Un canvas copia ese fotograma, un poco más luminoso, y una máscara lo recorta a los glifos. El velo oscuro sigue en otra capa. No hay segunda descarga del WebM. Si JavaScript no corre, el titular se queda en blanco sólido. Con `prefers-reduced-motion`, la máscara aparece completa, sin barrido.

Los capítulos 01 y 02 usan un `<a class="bc-endesa-chapter__cta">` con la URL real. No hay `href="#"`. Los capítulos 03–05 son texto «Próximamente» sobre `cap-bloq.jpg`.

El cierre está maquetado con la lectura visual del canvas. No salió del inspector: hay que contrastarlo antes de darlo por cerrado. El comentario HTML lo marca.

Albert Sans se carga en 400, 500 y 700. Anton, en 400. El azul `#1568f0` es provisional: Dev Mode no estaba disponible.

## Decisiones pendientes

- Pesos de Albert Sans y hex exactos (hace falta Dev Mode o una spec).
- URLs de 03–05, cuando se publiquen.
- Póster del vídeo, si se entrega, y si con `prefers-reduced-motion` el vídeo debe quedar parado en ese póster. Ahora el loop sigue en mute y solo se anula la animación de entrada.
- Contraste literal del cierre y de las tres citas.

## Integración Xalok

El fragmento local ya se puede pegar. Las reglas de contenedor viven solo ahí:

- `article.visual__story--free:has(.bc-endesa)` con `overflow: visible !important`
- sin padding en `.container-fluid` ni en `.visual-article-free.col-12`
- sin margen lateral en `.row`
- `margin: 0 !important` en `.content-free-html`

El menú sticky está dentro de `.bc-endesa-story` y el texto izquierdo del cierre es sticky dentro de la rejilla de esa sección. Ninguno usa `position: fixed`. Los créditos quedan fuera de ambos contenedores.

## Estado

El hub está cerrado para publicación. El preview quita el margen del navegador solo en `index.html`. El fragmento Xalok, local y no versionado, neutraliza los wrappers con `article.visual__story--free:has(.bc-endesa)`.

- 01 El mismo cielo: enlace real, misma pestaña.
- 02 Hasta el último tramo: enlace real, misma pestaña.
- 03 A oscuras, 04 A plena luz y 05 El anzuelo: «Próximamente», sin enlace.
- Índice interno a `#capitulo-01` … `#capitulo-05`, con sticky y scroll suave.
- Créditos: Producción audiovisual: Ramen Production House.
- En la introducción, solo «Sacando a la luz» va en `<em>`.

## Qué queda

1. Pegar el fragmento en Xalok y comprobar, en desktop y móvil, que no queda marco blanco y que los dos sticky se sueltan al acabar su zona.
2. Si La Vanguardia cambia la altura de `.main-header.is-sticky`, actualizar los `40px` de `--bc-endesa-sticky-offset`.
3. Activar 03–05 cuando existan sus URLs.
4. Cerrar hex y pesos si llega Dev Mode.

El fragmento y la auditoría no se versionan.
