# Optimización de imágenes – carga lenta

## Peso actual de los assets (aprox.)

| Archivo            | Tamaño  | Nota                          |
|--------------------|---------|-------------------------------|
| hero-delonghi.jpg  | ~104 KB | Aceptable                     |
| delonghi-1.jpg     | ~128 KB | Aceptable                     |
| delonghi-2.png     | **~414 KB** | Muy pesado, conviene optimizar |
| delonghi-3.jpg     | ~116 KB | Aceptable                     |
| delonghi-4.png     | **~320 KB** | Muy pesado                    |
| delonghi-5.jpg     | ~81 KB  | Aceptable                     |
| delonghi-6.png     | **~328 KB** | Muy pesado                    |
| delonghi-7.png     | **~547 KB** | Muy pesado                    |
| delonghi-8.png     | **~627 KB** | Muy pesado                    |
| Intro-delonghi.mp4 | **~3 MB**  | Vídeo hero, el más pesado     |

**Total imágenes:** ~2,6 MB. **Con el vídeo:** ~5,6 MB.

## Recomendaciones para que cargue más rápido

1. **PNG → WebP (o JPG si no necesitas transparencia)**  
   Los 5 PNG (delonghi-2, 4, 6, 7, 8) suman ~2,2 MB. Pasarlos a WebP suele reducir un 60–80% el peso manteniendo buena calidad. Herramientas: [Squoosh](https://squoosh.app), ImageMagick, o exportar desde Photoshop/Figma a WebP.

2. **Comprimir JPG y PNG**  
   Sin cambiar formato, se puede reducir tamaño con TinyPNG, Squoosh o `mozjpeg`/`oxipng`. Objetivo: que ninguna imagen supere ~150–200 KB salvo el hero si hace falta.

3. **Vídeo del hero**  
   - Reducir resolución o bitrate (ej. 720p en vez de 1080p).  
   - Recortar duración si es muy largo.  
   - Considerar servir una versión corta en móvil (por ejemplo con `<source media="(max-width: 768px)" src="...">`).

4. **Responsive (opcional)**  
   Usar `srcset` y `sizes` para que móvil cargue imágenes más pequeñas (ej. 400px de ancho en lugar de 800px). Requiere generar varias resoluciones (p. ej. 400w, 800w, 1200w).

## Cambios ya aplicados en el HTML

- **Preload** del poster del hero (`hero-delonghi.jpg`) para mejorar el LCP.
- **`decoding="async"`** en todas las imágenes para no bloquear el hilo principal al decodificar.
- **`loading="lazy"`** en todas las imágenes salvo la del hero (ya estaba).
- **Script duplicado** de Instagram eliminado; **`</div>` sobrante** corregido.
- **`defer`** en GSAP y en `scripts.js` para no bloquear el parsing.

La mejora más grande seguirá siendo **reducir el peso de los PNG y del vídeo** (puntos 1–3).
