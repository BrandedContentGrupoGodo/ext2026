/* Hacer empresa · datos de la serie
   Este es el archivo que se edita al publicar un capítulo.

   Producción (www.lavanguardia.com y admin.lavanguardia.com):
   se usan `url` y `hub`. `urlPrueba` y `hubPrueba` no se leen.
   Publicado = hora de salida cumplida (05:00, Europe/Madrid) y `url` no vacía.
   El 01 lleva `lanzamiento: true`: con `url` está publicado siempre.
   En admin, cualquiera con `url` cuenta como publicado. Sin `url`, «Próximamente».

   Prueba (local y github.io):
   los enlaces salen de `urlPrueba` y `hubPrueba`, nunca de `url` ni de `hub`.
   Publicado solo por la fecha simulada; el 01, siempre. No hace falta `url`.
   Los episodios 03 a 06 se rellenan con lorem ipsum a partir de su fecha.
   - sin ?fecha, simula el lanzamiento: 30 nov 2026, 09:00 (Europe/Madrid)
   - ?fecha=2026-12-28T09:00  (también vale ?fecha=2026-12-28)
   - ?sinurl=1  usa `url` y `hub` también en la maqueta
   En lavanguardia.com el reloj de prueba se ignora.

   Imagen: primero `img` / `imgMini`. Si faltan y hay `youtubeId`, la miniatura de YouTube.
   Los campos marcados como provisionales puede cambiarlos el cliente.
*/
window.HACER_EMPRESA = {
  hub: "https://www.lavanguardia.com/economia/20261130/11694871/hacer-empresa-decisiones-cambian-rumbo-empresa-sabadell-brl.html",
  hubPrueba: "index.html",
  episodios: [
    {
      n: "01",
      empresa: "NOX",
      sale: "2026-11-30T08:00:00+01:00",
      lanzamiento: true,
      url: "https://www.lavanguardia.com/economia/20261130/11694860/hacer-empresa-decisiones-cambian-rumbo-empresa-sabadell-nox-brl.html",
      urlPrueba: "01-nox.html",
      titular: "Emprender a los 40 años en un negocio donde pocos veían oportunidades",
      entradilla: "Jesús Ballvé, fundador de NOX, recuerda los errores que casi acabaron con su empresa y las decisiones que le permitieron seguir adelante",
      titularCorto: "Emprender a los 40 y desafiar las dudas", /* provisional */
      img: "img/nox.webp",
      imgSrcset: "img/nox-800.webp 800w, img/nox-1280.webp 1280w, img/nox.webp 1920w",
      imgMini: "img/nox-mini.webp",
      imgAlt: "Jesús Ballvé, Alfonso Bastida, Paula Ballvé y Miguel Lamperti en la conversación de Hacer empresa",
      imgMiniAlt: "Jesús Ballvé, fundador y CEO de NOX",
      youtubeId: "Q5CPpiYf7tk",
      decision: "Viajar a China con una pala y una última oportunidad", /* provisional */
      cita: "“Los fallos habían sido nuestros y estaba en nuestra mano rectificar y aprender, y volver a hacerlo bien”", /* provisional */
      autorCita: "Jesús Ballvé, fundador y CEO de NOX"
    },
    {
      n: "02",
      empresa: "VICIO",
      sale: "2026-12-28T05:00:00+01:00",
      url: "",
      urlPrueba: "02-vicio.html",
      titular: "“Elegir es renunciar”: la decisión que ayudó a transformar una pequeña empresa en una marca de éxito",
      /* El Figma no trae un titular corto distinto. Se usa el titular completo. */
      titularCorto: "“Elegir es renunciar”: la decisión que ayudó a transformar una pequeña empresa en una marca de éxito",
      entradilla: "VICIO empezó vendiendo pizzas y hamburguesas hasta que decidió concentrarse en un solo producto. Banco Sabadell recupera esta historia de decisiones y aprendizajes en su serie Hacer empresa",
      img: "",
      imgAlt: "",
      imgMiniAlt: "",
      youtubeId: "",
      decision: "Dejar las pizzas para centrarse solo en las hamburguesas",
      cita: "Elegir es renunciar, y cuando eliges algo estás dispuesto a asumir la peor de las consecuencias de la decisión que no has tomado",
      autorCita: "Oriol de Pablo, CEO & Co-Founder de VICIO"
    },
    { n: "03", sale: "2027-01-11T05:00:00+01:00", urlPrueba: "plantilla-capitulo.html?ep=03", youtubeId: "", imgAlt: "", imgMiniAlt: "" },
    { n: "04", sale: "2027-01-25T05:00:00+01:00", urlPrueba: "plantilla-capitulo.html?ep=04", youtubeId: "", imgAlt: "", imgMiniAlt: "" },
    { n: "05", sale: "2027-02-08T05:00:00+01:00", urlPrueba: "plantilla-capitulo.html?ep=05", youtubeId: "", imgAlt: "", imgMiniAlt: "" },
    { n: "06", sale: "2027-02-22T05:00:00+01:00", urlPrueba: "plantilla-capitulo.html?ep=06", youtubeId: "", imgAlt: "", imgMiniAlt: "" }
  ]
};
