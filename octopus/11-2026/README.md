# La energía del cambio

Hub local de Octopus Energy. El HTML de los episodios sale de `episodios.json`; no se pinta en el navegador.

## Publicar un capítulo

1. En `episodios.json`, cambia el `estado` de ese episodio a `publicado`.
2. Sustituye el título, la descripción, la imagen (WebP y JPG con el mismo nombre) y la URL. La imagen del destacado es la del último episodio publicado.
3. Ejecuta `node build.js` (hace falta Node.js instalado y `node` disponible en la terminal).

Si un próximo no trae título, el build usa «Una nueva historia de cambio». Si un episodio publicado tiene la URL `TODO`, la card enlaza a `#` para poder revisar los estados y el build lo avisa. Antes de GitHub Pages, `node build.js --qa` termina con error si queda alguna URL `TODO`. Una URL vacía sigue pintando la card sin enlace.

Abrir el preview: `index.html` en el navegador.
