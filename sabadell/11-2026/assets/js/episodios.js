/* Hacer empresa · datos de la serie
   Este es el archivo que se edita al publicar un capítulo.
   Un episodio está publicado si `url` tiene la dirección en La Vanguardia
   y ya llegó su hora de salida (05:00, Europe/Madrid, en Xalok).
   El 01 lleva `lanzamiento: true`: con `url` está publicado siempre,
   sin mirar la fecha. En admin.lavanguardia.com, cualquiera con `url`
   cuenta como publicado para poder revisarlo el día antes.
   En www.lavanguardia.com se aplica la hora. Sin `url`, «Próximamente».

   El reloj de prueba (?fecha=, ?sinurl= y los enlaces del pie) solo
   corre en local y en github.io. En lavanguardia.com se ignora.
   - sin ?fecha, simula el lanzamiento: 30 nov 2026, 09:00 (Europe/Madrid)
   - ?fecha=2026-12-28T09:00  (también vale ?fecha=2026-12-28)
   - ?sinurl=1  no usa los enlaces de maqueta; solo cuenta `url`
   En local y en github.io, 01 y 02 enlazan a su HTML de maqueta aunque `url` esté vacía.
   Los episodios 03 a 06 no llevan `url`: el relleno de prueba lo aplica serie.js, no este archivo.
   En La Vanguardia ese respaldo no existe: sin URL no hay enlace.

   Imagen: primero `img` / `imgMini`. Si faltan y hay `youtubeId`, la miniatura de YouTube.
   Los campos marcados como provisionales puede cambiarlos el cliente.
*/
window.HACER_EMPRESA = {
  hub: "https://www.lavanguardia.com/economia/20261130/11694871/hacer-empresa-decisiones-cambian-rumbo-empresa-sabadell-brl.html",
  episodios: [
    {
      n: "01",
      empresa: "NOX",
      sale: "2026-11-30T08:00:00+01:00",
      lanzamiento: true,
      url: "https://www.lavanguardia.com/economia/20261130/11694860/hacer-empresa-decisiones-cambian-rumbo-empresa-sabadell-nox-brl.html",
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
    { n: "03", sale: "2027-01-11T05:00:00+01:00", youtubeId: "", imgAlt: "", imgMiniAlt: "" },
    { n: "04", sale: "2027-01-25T05:00:00+01:00", youtubeId: "", imgAlt: "", imgMiniAlt: "" },
    { n: "05", sale: "2027-02-08T05:00:00+01:00", youtubeId: "", imgAlt: "", imgMiniAlt: "" },
    { n: "06", sale: "2027-02-22T05:00:00+01:00", youtubeId: "", imgAlt: "", imgMiniAlt: "" }
  ]
};
