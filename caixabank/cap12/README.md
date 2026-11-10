# CaixaBank — Historia 12 · Javier Aguilar

Capítulo 12 de Constelaciones. La plantilla técnica es la Historia 11 (`cap11`), reutilizada en `caixabank/cap12`. El texto y la estructura visible siguen el frame de Figma `8259:112`.

No está terminado: faltan las URLs de publicación, los vídeos y la confirmación de Qualifio.

## Origen

Copia de `caixabank/cap11`. Ese original no se ha modificado.

## Estado

- Preview LV: `index.html`
- Preview MD: `index-md.html`
- Root: `.bc-caixabank`
- CSS y JS acotados a ese root
- Assets gráficos de la serie, en local
- Fotografías de Javier, exportadas desde Figma
- Fragmento Xalok: no generado

Base prevista en GitHub Pages: `https://brandedcontentgrupogodo.github.io/ext2026/caixabank/cap12/`

## Estructura

Se mantiene el esqueleto de cap11: hero con constelaciones, barra social, vídeo, relato, fotografía horizontal con cita, cuatro tarjetas, cita centrada sobre constelaciones, fotografía horizontal con cita, galería de cuatro, Qualifio, cierre y créditos.

En el frame `8259:112` no hay STILL 03. La cita de José Miguel Martín va sobre la banda de estrellas. `fondo-estrellas.jpg` se queda.

Las tarjetas conservan el desfase de la plantilla. De izquierda a derecha y de arriba abajo: «El apoyo que permite seguir escalando», «Detrás de cada ascensión hay un equipo», «Una apuesta por el talento sin barreras», «Impulsar historias que inspiran».

## Qualifio

El bloque es el de cap11, con el id `1789279`. Está después del último relato y antes de «Conoce otras historias».

Hay que confirmar este id antes de publicar. El frame no lo dibuja.

## Barra social

Es el componente de la serie: iframe de Facebook a 95×20 y botón de X. El frame pinta además un icono de Instagram; no forma parte del componente funcional.

`SHARE_URL_LV` y `SHARE_URL_MD` están vacíos en `assets/js/scripts.js`. Hasta rellenarlos, los botones no se pueden pulsar. El cromo oficial usa temporalmente la home del medio solo para pintarse.

## Vídeo

Un solo hueco, a 16:9. La Vanguardia usa `kAMfLIWDoA0` (`https://youtu.be/kAMfLIWDoA0`). El póster se sustituye por el embed al pulsar; la página no arranca el vídeo sola.

Mundo Deportivo sigue con el placeholder. `YOUTUBE_ID_MD` está vacío y no debe reutilizar el de La Vanguardia.

## Navegación

La flecha «historia anterior» está visible y desactivada en las dos versiones. Falta la URL publicada de la Historia 11 en cada medio.

«Volver a las estrellas» y el icono de inicio apuntan al hub de Constelaciones de cada medio.

## Assets en uso

- `assets/img/hero.png` — STILL 01, recorte sin fondo. El CSS recorta el encuadre del frame.
- `assets/img/historia-01.jpg` — STILL 02, 2894×1188
- `assets/img/historia-02.jpg` — STILL 04, 2892×1232
- `assets/img/galeria-01.jpg` a `galeria-04.jpg` — STILL 05 a 08, 646×898
- `assets/img/fondo-cabecera.png` — fondo del hero
- `assets/img/fondo-estrellas.jpg` — banda de la cita de José Miguel Martín
- `assets/img/circulos.svg` — fondo de las tarjetas
- `assets/img/home.svg`
- `assets/img/logo_caixabank.svg`
- `assets/css/main.css`
- `assets/js/scripts.js`

## Resolución

Las fotos anchas cubren escritorio. La galería sale de Figma a 646×898: basta en la parrilla y se amplía en el lightbox. El recorte visible del hero usa una ventana de unos 443×402 px dentro del PNG de 1146×1040. Si hay másters de cámara, pueden sustituir estos archivos sin cambiar los nombres.

## Encapsulado Xalok

El contenido está dentro de `.bc-caixabank`. El CSS no redefine `html`, `body` ni `:root`. El JavaScript consulta y observa ese root.

No hay fragmento de Xalok en esta carpeta. Hay que generarlo desde este código cuando el capítulo esté validado.

## Pendientes antes de publicar

1. Rellenar `SHARE_URL_LV` y `SHARE_URL_MD`.
2. Rellenar `YOUTUBE_ID_MD`. No copiar `kAMfLIWDoA0`.
3. Enlazar la flecha «historia anterior» con la Historia 11 publicada en cada medio.
4. Confirmar el id de Qualifio `1789279`.
5. Confirmar el ID de noticia y comprobar el margen en Xalok, en escritorio y en móvil.
6. Generar el fragmento de Xalok desde este código. No está generado.
