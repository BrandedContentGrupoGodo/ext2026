/**
 * Genera el HTML estático del destacado y de la parrilla
 * a partir de episodios.json. No tiene dependencias.
 *
 * Uso: node build.js
 */
const fs = require("fs");
const path = require("path");

const root = __dirname;
const dataPath = path.join(root, "episodios.json");
const pagePath = path.join(root, "index.html");
const startMark = "<!-- oe-build:episodes -->";
const endMark = "<!-- /oe-build:episodes -->";

function pad(numero) {
  return String(numero).padStart(2, "0");
}

function escapeText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value) {
  return escapeText(value).replace(/"/g, "&quot;");
}

function jpgOf(imagen) {
  return String(imagen).replace(/\.webp$/i, ".jpg");
}

function hasUrl(episodio) {
  return Boolean(episodio.url) && episodio.url !== "TODO";
}

function reviewHref(episodio) {
  if (hasUrl(episodio)) return episodio.url;
  if (episodio.url === "TODO") return "#";
  return "";
}

function upcomingTitle(episodio) {
  const titulo = String(episodio.titulo || "").trim();
  return titulo || "Una nueva historia de cambio";
}

function picture(episodio, width, height, lazy) {
  const loading = lazy ? ' loading="lazy"' : "";
  return [
    "<picture>",
    `            <source srcset="${escapeAttr(episodio.imagen)}" type="image/webp">`,
    `            <img src="${escapeAttr(jpgOf(episodio.imagen))}" alt="${escapeAttr(episodio.alt || "")}" width="${width}" height="${height}"${loading}>`,
    "          </picture>"
  ].join("\n");
}

function playIcon(size, modifier) {
  const cls = modifier ? "oe-play " + modifier : "oe-play";
  return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 61 61" aria-hidden="true" focusable="false">
            <circle cx="30.2046" cy="30.2046" r="29.2046" fill="currentColor" fill-opacity="0.8" stroke="#ffffff" stroke-width="2"/>
            <path d="M39.4659 28.7609C40.0501 29.1577 40.0501 30.0186 39.4659 30.4154L26.5269 39.204C25.863 39.655 24.9651 39.1794 24.9651 38.3768L24.9651 20.7996C24.9651 19.9969 25.863 19.5214 26.5269 19.9723L39.4659 28.7609Z" fill="#ffffff"/>
          </svg>`;
}

function featuredMarkup(episodio, soloUno) {
  const etiqueta = soloUno
    ? `Episodio ${pad(episodio.numero)}`
    : `Nuevo · Episodio ${pad(episodio.numero)}`;
  const href = reviewHref(episodio);
  const titulo = href
    ? `<a class="oe-hit" href="${escapeAttr(href)}">${escapeText(episodio.titulo)}</a>`
    : escapeText(episodio.titulo);

  return `    <section class="oe-block" id="episodios" aria-labelledby="oe-episodes-title">
      <h2 class="oe-block__title" id="oe-episodes-title">Episodios</h2>
      <article class="oe-feature${href ? " oe-feature--link" : ""}">
        <div class="oe-feature__media">
          ${picture(episodio, 830, 529, false)}
          ${playIcon(60)}
        </div>
        <div class="oe-feature__body">
          <div class="oe-feature__head">
            <p class="oe-kicker">${escapeText(etiqueta)}</p>
            <h3 class="oe-feature__title">${titulo}</h3>
          </div>
          <div class="oe-feature__foot">
            <p class="oe-feature__text">${escapeText(episodio.descripcion)}</p>
            <span class="oe-btn" data-oe-nobody>Ver episodio</span>
          </div>
        </div>
      </article>
    </section>`;
}

function publishedCard(episodio) {
  const href = reviewHref(episodio);
  const titulo = href
    ? `<a class="oe-hit" href="${escapeAttr(href)}">${escapeText(episodio.titulo)}</a>`
    : escapeText(episodio.titulo);

  return `        <li class="oe-card oe-card--pub${href ? " oe-card--link" : ""}">
          <div class="oe-card__media">
            ${picture(episodio, 400, 209, true)}
            ${playIcon(42, "oe-play--sm")}
          </div>
          <div class="oe-card__body">
            <div class="oe-card__head">
              <p class="oe-kicker">Episodio ${pad(episodio.numero)}</p>
              <h3 class="oe-card__title">${titulo}</h3>
            </div>
            <p class="oe-card__text">${escapeText(episodio.descripcion)}</p>
            <span class="oe-more" data-oe-nobody>Ver episodio</span>
          </div>
        </li>`;
}

function upcomingCard(episodio) {
  return `        <li class="oe-card oe-card--soon">
          <div class="oe-card__media">
            ${picture(episodio, 400, 209, true)}
            <p class="oe-card__num" aria-hidden="true">${pad(episodio.numero)}</p>
          </div>
          <div class="oe-card__body">
            <p class="oe-kicker">Episodio ${pad(episodio.numero)}</p>
            <h3 class="oe-card__title">${escapeText(upcomingTitle(episodio))}</h3>
            <p class="oe-card__state">Próximamente</p>
          </div>
        </li>`;
}

function listMarkup(className, items) {
  if (!items.length) return "";
  return `      <ul class="${className}">
${items.join("\n")}
      </ul>`;
}

function gridMarkup(publicadas, proximas, titulo) {
  if (!publicadas.length && !proximas.length) return "";
  const id = "oe-more-title";
  return `    <section class="oe-block oe-block--more" aria-labelledby="${id}">
      <h2 class="oe-block__title" id="${id}">${escapeText(titulo)}</h2>
      <div class="oe-grid">
${listMarkup("oe-grid__pubs", publicadas)}
${listMarkup("oe-grid__soon", proximas)}
      </div>
    </section>`;
}

const episodios = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const publicados = episodios
  .filter((episodio) => episodio.estado === "publicado")
  .sort((a, b) => b.numero - a.numero);
const proximos = episodios
  .filter((episodio) => episodio.estado === "proximo")
  .sort((a, b) => a.numero - b.numero);

episodios.forEach((episodio) => {
  if (episodio.estado !== "publicado" && episodio.estado !== "proximo") {
    console.warn(`Aviso: el episodio ${pad(episodio.numero)} tiene un estado desconocido («${episodio.estado}») y no se pinta.`);
  }
});

if (!publicados.length) {
  console.warn("Aviso: no hay ningún episodio publicado. El destacado no se genera.");
}

publicados.forEach((episodio) => {
  if (episodio.url === "TODO") {
    console.warn(`Aviso: el episodio ${pad(episodio.numero)} está publicado pero su URL es «TODO». La card enlaza a «#» hasta tener la URL definitiva.`);
  } else if (!hasUrl(episodio)) {
    console.warn(`Aviso: el episodio ${pad(episodio.numero)} está publicado pero su URL está vacía. La card se pinta sin enlace.`);
  }
});

const destacado = publicados[0];
const resto = publicados.slice(1);
const tituloParrilla = resto.length ? "Más episodios" : "Próximos episodios";
const publicadas = resto.map(publishedCard);
const proximas = proximos.map(upcomingCard);

const partes = [];
if (destacado) partes.push(featuredMarkup(destacado, publicados.length === 1));
const parrillaHtml = gridMarkup(publicadas, proximas, tituloParrilla);
if (parrillaHtml) partes.push(parrillaHtml);

const html = fs.readFileSync(pagePath, "utf8");
const start = html.indexOf(startMark);
const end = html.indexOf(endMark);
if (start === -1 || end === -1 || end < start) {
  console.error("No están los marcadores oe-build:episodes en index.html.");
  process.exit(1);
}

const bloque = `${startMark}\n${partes.join("\n")}\n    ${endMark}`;
const siguiente = html.slice(0, start) + bloque + html.slice(end + endMark.length);
fs.writeFileSync(pagePath, siguiente);
console.log(`Hub actualizado: ${publicados.length} publicado(s), ${proximos.length} próximo(s).`);

if (process.argv.includes("--qa")) {
  const pendientes = episodios.filter((episodio) => episodio.url === "TODO");
  if (pendientes.length) {
    console.error(`QA: quedan ${pendientes.length} URL «TODO». No se puede publicar en GitHub Pages.`);
    process.exit(1);
  }
}
