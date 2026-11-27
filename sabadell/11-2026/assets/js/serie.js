/* Hacer empresa · pinta el hub y los capítulos a partir de episodios.js */
(function () {
  var LOCAL_PAGES = { "01": "01-nox.html", "02": "02-vicio.html" };
  var PREVIEW_DAYS = [
    { n: "01", label: "30 nov", fecha: "2026-11-30T09:00", page: "01-nox.html" },
    { n: "02", label: "28 dic", fecha: "2026-12-28T09:00", page: "02-vicio.html" },
    { n: "03", label: "11 ene", fecha: "2027-01-11T09:00", page: "plantilla-capitulo.html?ep=03" },
    { n: "04", label: "25 ene", fecha: "2027-01-25T09:00", page: "plantilla-capitulo.html?ep=04" },
    { n: "05", label: "8 feb", fecha: "2027-02-08T09:00", page: "plantilla-capitulo.html?ep=05" },
    { n: "06", label: "22 feb", fecha: "2027-02-22T09:00", page: "plantilla-capitulo.html?ep=06" }
  ];
  var LOREM = {
    titular: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    titularCorto: "Lorem ipsum dolor sit amet",
    entradilla: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore",
    decision: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    cita: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
  };
  var BASE = "";
  var fechaQuery = "";
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  var MESES_C = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  var TOTAL = 6;

  function boot() {
    var root = document.querySelector(".bc-sabadell[data-hacer-empresa]");
    if (!root) return false;
    if (root.getAttribute("data-bc-sabadell-init") === "1") return true;
    var data = window.HACER_EMPRESA;
    if (!data || !data.episodios) return false;
    root.setAttribute("data-bc-sabadell-init", "1");
    BASE = detectBase();

    var local = previewClock();
    var params = local ? new URLSearchParams(window.location.search) : new URLSearchParams();
    var sinurl = local && params.get("sinurl") === "1";
    var now = resolveNow(local, params);
    fechaQuery = "";
    if (local) {
      var rawFecha = params.get("fecha");
      fechaQuery = rawFecha ? String(rawFecha).trim() : "2026-11-30T09:00";
    }
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.add(reduce ? "is-reduced" : "is-motion");

    var eps = data.episodios.map(function (ep) {
      var n = ep.n || "";
      var fill = local && !sinurl && !(ep.url && String(ep.url).trim()) && /^0[3-6]$/.test(n);
      var href = resolveHref(ep, local, sinurl);
      return {
        raw: ep,
        n: n,
        empresa: fill ? "Empresa " + n : (ep.empresa || ""),
        sale: ep.sale || "",
        titular: fill ? LOREM.titular : (ep.titular || ""),
        titularCorto: fill ? LOREM.titularCorto : (ep.titularCorto || ep.titular || ""),
        entradilla: fill ? LOREM.entradilla : (ep.entradilla || ""),
        img: ep.img || "",
        imgSrcset: ep.imgSrcset || "",
        imgMini: ep.imgMini || "",
        imgAlt: ep.imgAlt || "",
        imgMiniAlt: ep.imgMiniAlt || "",
        youtubeId: (ep.youtubeId || "").trim(),
        decision: fill ? LOREM.decision : (ep.decision || ""),
        cita: fill ? LOREM.cita : (ep.cita || ""),
        autorCita: fill ? "Lorem ipsum" : (ep.autorCita || ""),
        href: href,
        preview: fill,
        publicado: !!(href && ep.sale && now.getTime() >= new Date(ep.sale).getTime())
      };
    });

    var pieza = root.getAttribute("data-hacer-empresa");
    if (local && pieza === "00") {
      var asked = (params.get("ep") || "").trim();
      if (/^0[3-6]$/.test(asked)) pieza = asked;
    }
    var hubHref = (data.hub && String(data.hub).trim()) || (local ? withFecha("index.html") : "");
    applyHubLinks(root, hubHref);

    if (pieza === "hub") renderHub(root, eps, now);
    else renderCapitulo(root, pieza, eps, hubHref);

    bindVideo(root);
    bindFalls(root);
    bindFloat(root, reduce);
    bindAncla(root, reduce);
    bindReading(root, reduce);
    if (local) renderSim(root, now, root.getAttribute("data-hacer-empresa") === "hub");
    return true;
  }

  function previewClock() {
    var host = "";
    try { host = String(window.location.hostname || "").toLowerCase(); } catch (e) { host = ""; }
    if (/(^|\.)lavanguardia\.com$/.test(host)) return false;
    if (/(^|\.)github\.io$/.test(host)) return true;
    return host === "" || host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]";
  }

  function resolveNow(local, params) {
    if (local) {
      var q = params.get("fecha");
      var parsed = q ? parseFecha(q) : null;
      if (parsed) return parsed;
      return new Date("2026-11-30T09:00:00+01:00");
    }
    return new Date();
  }

  function parseFecha(value) {
    var v = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) v += "T09:00:00+01:00";
    else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) v += ":00+01:00";
    var d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  function withFecha(href) {
    if (!fechaQuery || !href || /^(https?:|mailto:|#)/.test(href) || /[?&]fecha=/.test(href)) return href;
    return href + (href.indexOf("?") >= 0 ? "&" : "?") + "fecha=" + fechaQuery;
  }

  function resolveHref(ep, local, sinurl) {
    var url = ep.url && String(ep.url).trim();
    if (url) return url;
    if (!(local && !sinurl && ep.n)) return "";
    if (LOCAL_PAGES[ep.n]) return withFecha(LOCAL_PAGES[ep.n]);
    if (/^0[3-6]$/.test(ep.n)) return withFecha("plantilla-capitulo.html?ep=" + ep.n);
    return "";
  }

  function detectBase() {
    var s = document.querySelector("script[src*='serie.js']");
    if (!s) return "";
    try {
      return new URL("../../", new URL(s.src, window.location.href)).href;
    } catch (e) {
      return "";
    }
  }

  function asset(path) {
    if (!path) return "";
    if (/^(https?:|data:|\.\.\/|\.\/)/.test(path)) return path;
    return BASE + String(path).replace(/^\//, "");
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function madrid(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    var s = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Madrid",
      day: "numeric",
      month: "numeric",
      year: "numeric"
    }).format(d);
    var bits = s.split("/");
    return { day: Number(bits[0]), month: Number(bits[1]) - 1, year: Number(bits[2]) };
  }

  function fechaCorta(iso) {
    var p = madrid(iso);
    if (!p) return "";
    return p.day + " " + MESES_C[p.month] + " " + p.year;
  }

  function fechaLarga(iso) {
    var p = madrid(iso);
    if (!p) return "";
    return p.day + " de " + MESES[p.month];
  }

  function nPlain(n) {
    var v = parseInt(n, 10);
    return isNaN(v) ? n : String(v);
  }

  function conCursiva(texto) {
    var t = esc(texto);
    return t.replace(/Hacer empresa/g, "<em>Hacer empresa</em>");
  }

  function citaHtml(texto) {
    var t = String(texto || "").replace(/^["“]|["”]$/g, "");
    return "“" + esc(t) + "”";
  }

  function youtubeList(ep) {
    if (!ep.youtubeId) return [];
    var base = "https://i.ytimg.com/vi/" + encodeURIComponent(ep.youtubeId) + "/";
    return [base + "maxresdefault.jpg", base + "sddefault.jpg", base + "hqdefault.jpg"];
  }

  function isMini(donde) {
    return donde === "thumb" || donde === "mini" || donde === "float";
  }

  function sources(ep, mini) {
    var own = mini ? (ep.imgMini || ep.img) : ep.img;
    if (own) return [asset(own)];
    return youtubeList(ep);
  }

  function srcsetValue(ep) {
    if (!ep.img || !ep.imgSrcset) return "";
    return String(ep.imgSrcset).split(",").map(function (part) {
      var bits = part.trim().split(/\s+/);
      if (!bits[0]) return "";
      bits[0] = asset(bits[0]);
      return bits.join(" ");
    }).filter(Boolean).join(", ");
  }

  function posterAttrs(ep) {
    var urls = sources(ep, true);
    if (!urls.length) return "";
    var falls = urls.length > 1 ? '" data-falls="' + esc(urls.slice(1).join("|")) : "";
    return ' data-poster="' + esc(urls[0]) + falls + '"';
  }

  function still(ep, donde) {
    var mini = isMini(donde);
    var urls = sources(ep, mini);
    if (!urls.length) return "";
    var alt = mini ? (ep.imgMiniAlt || ep.imgAlt || "") : (ep.imgAlt || "");
    var srcset = !mini && ep.img ? srcsetValue(ep) : "";
    var sizes = "";
    if (srcset && donde === "cover") sizes = "(min-width: 1024px) 656px, 100vw";
    if (srcset && donde === "stage") sizes = "(min-width: 1440px) 1280px, 100vw";
    var wh = mini ? ' width="800" height="450"' : ' width="1920" height="1080"';
    var load = donde === "cover"
      ? ' loading="eager" fetchpriority="high"'
      : ' loading="lazy"';
    var falls = urls.length > 1 ? ' data-bc-falls="' + esc(urls.slice(1).join("|")) + '"' : "";
    return '<img class="bc-sabadell-still is-' + donde + '" src="' + esc(urls[0]) + '"'
      + (srcset ? ' srcset="' + esc(srcset) + '"' : "")
      + (sizes ? ' sizes="' + sizes + '"' : "")
      + falls
      + ' alt="' + esc(alt) + '"' + wh + load + ">";
  }

  function arrowSvg(extra) {
    return '<svg class="bc-sabadell-arrow' + (extra ? " " + extra : "") + '" width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true" focusable="false"><path d="M4.58333 11H17.4167M11.9167 16.5L17.4167 11L11.9167 5.5" stroke="currentColor" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function bindFalls(scope) {
    scope.querySelectorAll("img[data-bc-falls]").forEach(function (img) {
      if (img.getAttribute("data-bc-fall") === "1") return;
      img.setAttribute("data-bc-fall", "1");
      function advance() {
        var rest = (img.getAttribute("data-bc-falls") || "").split("|").filter(Boolean);
        img.removeAttribute("srcset");
        img.removeAttribute("sizes");
        if (!rest.length) {
          img.remove();
          return;
        }
        img.setAttribute("data-bc-falls", rest.slice(1).join("|"));
        img.src = rest[0];
      }
      function tooSmall() {
        return img.complete && (!img.naturalWidth || img.naturalWidth < 200);
      }
      img.addEventListener("error", advance);
      img.addEventListener("load", function () {
        if (tooSmall()) advance();
      });
      if (tooSmall()) advance();
    });
  }

  function bindAncla(root, reduce) {
    root.querySelectorAll("a.bc-sabadell-ancla[href^='#']").forEach(function (a) {
      a.addEventListener("click", function (event) {
        var id = a.getAttribute("href").slice(1);
        var target = document.getElementById(id);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        if (history.replaceState) history.replaceState(null, "", "#" + id);
      });
    });
  }

  function play(size) {
    var lg = size === "lg";
    var file = asset(lg ? "img/icon-play-lg.svg" : "img/icon-play.svg");
    var px = lg ? 38 : 30;
    return '<span class="bc-sabadell-play is-' + size + '" aria-hidden="true"><img src="' + file + '" width="' + px + '" height="' + px + '" alt=""></span>';
  }

  function ultimoPublicado(eps) {
    var last = null;
    eps.forEach(function (ep) { if (ep.publicado) last = ep; });
    return last;
  }

  function siguientePendiente(eps) {
    for (var i = 0; i < eps.length; i++) {
      if (!eps[i].publicado) return eps[i];
    }
    return null;
  }

  function applyHubLinks(root, hubHref) {
    if (!hubHref) return;
    root.querySelectorAll("[data-bc-sabadell-hub]").forEach(function (a) {
      a.setAttribute("href", hubHref);
    });
  }

  function renderHub(root, eps, now) {
    var feature = root.querySelector("[data-bc-sabadell-feature]");
    var list = root.querySelector("[data-bc-sabadell-index]");
    var decision = root.querySelector("[data-bc-sabadell-decision]");
    var destacado = ultimoPublicado(eps);
    if (feature) feature.innerHTML = destacado ? featurePublicado(destacado) : featureVacio(siguientePendiente(eps), now);
    if (list) list.innerHTML = eps.map(fila).join("");
    if (decision) {
      if (destacado && (destacado.decision || destacado.cita)) {
        decision.hidden = false;
        decision.innerHTML = decisionHtml(destacado, true, true);
      } else {
        decision.hidden = true;
        decision.innerHTML = "";
      }
    }
    var nota = root.querySelector("[data-bc-sabadell-rango]");
    if (nota && eps.length) nota.textContent = eps.length + " episodios";
  }

  function featurePublicado(ep) {
    return ''
      + '<div class="bc-sabadell-feature-tag">'
      + '<p class="bc-sabadell-badge">Nuevo</p>'
      + '<p class="bc-sabadell-feature-ep">Episodio ' + esc(ep.n) + " · " + esc(fechaCorta(ep.sale)) + "</p>"
      + "</div>"
      + '<a class="bc-sabadell-cover" href="' + esc(ep.href) + '" data-track="hub-portada" aria-label="Ver el episodio ' + esc(nPlain(ep.n)) + ': ' + esc(ep.empresa) + '">'
      + still(ep, "cover", true)
      + '<span class="bc-sabadell-playrow">' + play("md") + '<span class="bc-sabadell-play-label">Ver episodio</span></span>'
      + "</a>"
      + '<div class="bc-sabadell-feature-copy">'
      + '<p class="bc-sabadell-feature-brand">' + esc(ep.empresa) + "</p>"
      + '<p class="bc-sabadell-feature-title">' + esc(ep.titular) + "</p>"
      + '<p class="bc-sabadell-feature-lead">' + conCursiva(ep.entradilla) + "</p>"
      + "</div>"
      + '<a class="bc-sabadell-btn" href="' + esc(ep.href) + '" data-track="hub-cta-episodio" data-bc-nobody>'
      + "<span>Ver el episodio</span><span aria-hidden=\"true\">→</span></a>";
  }

  function featureVacio(ep, now) {
    if (!ep) {
      return '<p class="bc-sabadell-feature-lead">Los episodios se irán publicando a lo largo de la serie</p>';
    }
    var pasado = ep.sale && now.getTime() >= new Date(ep.sale).getTime();
    var cuando = pasado
      ? "Pendiente de publicación · " + esc(fechaCorta(ep.sale))
      : 'Se publica el <time datetime="' + esc(ep.sale) + '">' + esc(fechaLarga(ep.sale)) + "</time>";
    return ''
      + '<div class="bc-sabadell-feature-tag"><p class="bc-sabadell-badge">Próximamente</p>'
      + '<p class="bc-sabadell-feature-ep">Episodio ' + esc(ep.n) + "</p></div>"
      + '<div class="bc-sabadell-cover is-static">' + still(ep, "cover", true) + "</div>"
      + '<p class="bc-sabadell-feature-lead">' + cuando + "</p>";
  }

  function fila(ep) {
    if (ep.publicado) {
      return ''
        + "<li>"
        + '<a class="bc-sabadell-row is-live" href="' + esc(ep.href) + '" data-track="hub-indice"' + posterAttrs(ep) + ' aria-label="Ver el episodio ' + esc(nPlain(ep.n)) + ': ' + esc(ep.empresa) + '">'
        + '<p class="bc-sabadell-num">' + esc(ep.n) + "</p>"
        + '<p class="bc-sabadell-row-name">' + esc(ep.empresa) + "</p>"
        + '<span class="bc-sabadell-row-copy">'
        + still(ep, "thumb", false)
        + "<div>"
        + '<p class="bc-sabadell-row-meta"><time datetime="' + esc(ep.sale) + '">' + esc(fechaCorta(ep.sale)) + "</time></p>"
        + '<p class="bc-sabadell-row-title">' + esc(ep.titularCorto) + "</p>"
        + "</div></span>"
        + '<span class="bc-sabadell-go" aria-hidden="true">' + arrowSvg() + "</span>"
        + "</a></li>";
    }
    return ''
      + "<li>"
      + '<div class="bc-sabadell-row is-soon">'
      + '<p class="bc-sabadell-num">' + esc(ep.n) + "</p>"
      + '<p class="bc-sabadell-row-state">Próximamente</p>'
      + '<p class="bc-sabadell-row-when"><time datetime="' + esc(ep.sale) + '">' + esc(fechaCorta(ep.sale)) + "</time></p>"
      + "</div></li>";
  }

  function decisionHtml(ep, conCta, comoH2) {
    var etiqueta = comoH2
      ? '<h2 class="bc-sabadell-kicker" id="bc-sabadell-decision-title">La decisión</h2>'
      : '<p class="bc-sabadell-kicker">La decisión</p>';
    return ''
      + '<div class="bc-sabadell-wrap bc-sabadell-decision-grid">'
      + '<div class="bc-sabadell-decision-label">'
      + '<div class="bc-sabadell-rule" aria-hidden="true"><img src="' + asset("img/punto-blanco.svg") + '" width="14" height="14" alt=""><span class="bc-sabadell-rule-line"></span></div>'
      + etiqueta
      + '<p class="bc-sabadell-decision-ep">Episodio ' + esc(ep.n) + " · " + esc(ep.empresa) + "</p>"
      + "</div>"
      + '<div class="bc-sabadell-decision-copy">'
      + '<p class="bc-sabadell-decision-phrase">' + esc(ep.decision) + "</p>"
      + '<blockquote class="bc-sabadell-decision-quote">'
      + "<p>" + citaHtml(ep.cita) + "</p>"
      + '<p class="bc-sabadell-decision-by">' + esc(ep.autorCita) + "</p>"
      + "</blockquote>"
      + (conCta
        ? '<a class="bc-sabadell-btn is-ghost" href="' + esc(ep.href) + '" data-track="hub-decision" data-bc-nobody><span>Ver el episodio</span><span aria-hidden="true">→</span></a>'
        : "")
      + "</div></div>";
  }

  function renderCapitulo(root, pieza, eps, hubHref) {
    var idx = -1;
    eps.forEach(function (ep, i) { if (ep.n === pieza) idx = i; });
    var actual = idx >= 0 ? eps[idx] : null;
    var count = root.querySelector("[data-bc-sabadell-count]");
    if (count && actual) count.textContent = "Episodio " + actual.n + " de " + TOTAL;

    var dots = root.querySelector("[data-bc-sabadell-dots]");
    if (dots) dots.innerHTML = eps.map(function (ep, i) { return punto(ep, i, idx); }).join("");

    var nav = root.querySelector("[data-bc-sabadell-nav]");
    if (nav && idx >= 0) {
      var prev = idx > 0 ? eps[idx - 1] : null;
      var next = idx < eps.length - 1 ? eps[idx + 1] : null;
      var html = "";
      if (prev) html += tarjetaNav(prev, "prev");
      if (next) html += tarjetaNav(next, "next");
      nav.innerHTML = html;
    }

    if (actual && actual.preview && root.getAttribute("data-hacer-empresa") === "00") paintPreviewChapter(root, actual);

    if (actual) {
      var stage = root.querySelector("[data-youtube-id]");
      if (stage) {
        if (actual.youtubeId) {
          stage.setAttribute("data-youtube-id", actual.youtubeId);
          stage.setAttribute("data-video-title", "Hacer empresa · Episodio " + actual.n + " · " + (actual.empresa || ""));
        }
        var existing = stage.querySelector(".bc-sabadell-still");
        var ph = stage.querySelector(".bc-sabadell-ph");
        var img = still(actual, "stage");
        if (img) {
          if (existing) existing.outerHTML = img;
          else if (ph) ph.outerHTML = img;
          else stage.insertAdjacentHTML("afterbegin", img);
        } else {
          if (existing) existing.remove();
          if (ph) ph.remove();
        }
        var facade = stage.querySelector(".bc-sabadell-facade");
        if (facade && actual.youtubeId) facade.disabled = false;
      }
    }

    var decision = root.querySelector("[data-bc-sabadell-decision-capitulo]");
    if (decision && actual && (actual.decision || actual.cita)) {
      decision.innerHTML = decisionHtml(actual, false, false);
    }
  }

  function punto(ep, i, idx) {
    var clase = "bc-sabadell-dot";
    var estado = "pendiente";
    if (i === idx) { clase += " is-current"; estado = "en lectura"; }
    else if (ep.publicado) { clase += " is-done"; estado = "publicado"; }
    var label = "Episodio " + nPlain(ep.n) + (ep.empresa ? ": " + ep.empresa : "") + ", " + estado;
    var dot = '<span class="' + clase + '" aria-hidden="true"></span><span class="bc-sabadell-sr">' + esc(label) + "</span>";
    if (ep.publicado && i !== idx) {
      return '<li><a href="' + esc(ep.href) + '" data-track="capitulo-progreso" aria-label="Ver el episodio ' + esc(nPlain(ep.n)) + ': ' + esc(ep.empresa || "sin título") + '">' + dot + "</a></li>";
    }
    return "<li><span>" + dot + "</span></li>";
  }

  function tarjetaNav(ep, lado) {
    if (ep.publicado) {
      var kicker = lado === "prev"
        ? "← Episodio anterior · " + ep.n
        : "Siguiente episodio · " + ep.n;
      var track = lado === "prev" ? "capitulo-anterior" : "capitulo-siguiente";
      return ''
        + '<a class="bc-sabadell-jump is-live" href="' + esc(ep.href) + '" data-track="' + track + '" aria-label="Ver el episodio ' + esc(nPlain(ep.n)) + ': ' + esc(ep.empresa) + '">'
        + still(ep, "mini", false)
        + "<div>"
        + '<p class="bc-sabadell-jump-kicker">' + esc(kicker) + "</p>"
        + '<p class="bc-sabadell-jump-name">' + esc(ep.empresa) + "</p>"
        + '<p class="bc-sabadell-jump-title">' + esc(ep.titularCorto) + "</p>"
        + "</div></a>";
    }
    var kickerSoon = lado === "prev" ? "Episodio anterior · " + ep.n : "Siguiente episodio · " + ep.n;
    var cuando = ep.sale
      ? 'Disponible el <time datetime="' + esc(ep.sale) + '">' + esc(fechaLarga(ep.sale)) + "</time>"
      : "Disponible el [fecha]";
    return ''
      + '<div class="bc-sabadell-jump is-soon">'
      + "<div>"
      + '<p class="bc-sabadell-jump-kicker">' + esc(kickerSoon) + "</p>"
      + '<p class="bc-sabadell-jump-name">' + cuando + "</p>"
      + "</div></div>";
  }

  function bindVideo(root) {
    root.querySelectorAll("[data-youtube-id]").forEach(function (stage) {
      var id = (stage.getAttribute("data-youtube-id") || "").trim();
      var facade = stage.querySelector(".bc-sabadell-facade");
      if (!id || !facade || facade.getAttribute("data-bc-sabadell-video") === "1") return;
      facade.setAttribute("data-bc-sabadell-video", "1");
      if (!facade.getAttribute("data-track")) facade.setAttribute("data-track", "capitulo-play");
      if (facade.tagName === "A" && !facade.getAttribute("href")) {
        facade.setAttribute("href", "https://www.youtube.com/watch?v=" + encodeURIComponent(id));
      }
      facade.addEventListener("click", function (event) {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button === 1) return;
        event.preventDefault();
        var iframe = document.createElement("iframe");
        iframe.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0";
        iframe.title = stage.getAttribute("data-video-title") || "Vídeo de la conversación";
        iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
        iframe.setAttribute("tabindex", "0");
        stage.replaceChildren(iframe);
        iframe.addEventListener("load", function () {
          iframe.focus();
        });
      });
    });
  }

  function bindFloat(root, reduce) {
    var list = root.querySelector("[data-bc-sabadell-index]");
    if (!list) return;
    var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    var float = document.createElement("div");
    float.className = "bc-sabadell-float";
    float.setAttribute("hidden", "");
    float.setAttribute("aria-hidden", "true");
    root.appendChild(float);
    var current = null;

    function show(row, event) {
      var live = row.classList.contains("is-live") ? row : null;
      if (!live) { hide(); return; }
      if (current !== live) {
        current = live;
        var src = live.getAttribute("data-poster") || "";
        if (!src) { hide(); return; }
        float.innerHTML = '<img class="bc-sabadell-still is-float" src="' + esc(src) + '"' + (live.getAttribute("data-falls") ? ' data-bc-falls="' + esc(live.getAttribute("data-falls")) + '"' : "") + ' alt="" width="800" height="450">'
          + '<span class="bc-sabadell-float-play">' + play("sm") + '<span>Ver episodio</span></span>';
        bindFalls(float);
      }
      float.removeAttribute("hidden");
      place(live, event);
    }

    function place(row, event) {
      var w = 296;
      var h = w * 9 / 16;
      var x;
      var y;
      if (reduce || !event) {
        var rect = row.getBoundingClientRect();
        x = rect.left + Math.min(360, rect.width * 0.28);
        y = rect.top + 8;
      } else {
        x = event.clientX + 22;
        y = event.clientY - h * 0.45;
      }
      var pad = 12;
      if (x + w > window.innerWidth - pad) x = (event ? event.clientX : x) - w - 22;
      if (x < pad) x = pad;
      if (y < pad) y = pad;
      if (y + h > window.innerHeight - pad) y = window.innerHeight - h - pad;
      var tilt = reduce ? "rotate(0deg)" : "rotate(-3deg)";
      float.style.transform = "translate3d(" + Math.round(x) + "px," + Math.round(y) + "px,0) " + tilt;
    }

    function hide() {
      current = null;
      float.setAttribute("hidden", "");
    }

    list.addEventListener("pointerover", function (event) {
      var row = event.target.closest(".bc-sabadell-row");
      if (!row || !list.contains(row)) return;
      show(row, reduce ? null : event);
    });
    list.addEventListener("pointermove", function (event) {
      if (reduce) return;
      var row = event.target.closest(".bc-sabadell-row");
      if (!row || !row.classList.contains("is-live")) return;
      show(row, event);
    });
    list.addEventListener("pointerleave", hide);
    list.addEventListener("focusin", function (event) {
      var row = event.target.closest(".bc-sabadell-row");
      if (!row) return;
      show(row, null);
    });
    list.addEventListener("focusout", function (event) {
      if (!list.contains(event.relatedTarget)) hide();
    });
  }

  function bindReading(root, reduce) {
    var bar = root.querySelector("[data-bc-sabadell-read]");
    if (!bar) return;
    var ticking = false;
    function update() {
      ticking = false;
      var rect = root.getBoundingClientRect();
      var total = root.offsetHeight - window.innerHeight;
      var scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 0));
      var p = total > 0 ? scrolled / total : 0;
      bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    if (reduce) bar.style.transition = "none";
  }

  function sameDay(now, fecha) {
    var parsed = parseFecha(fecha);
    if (!parsed) return false;
    var a = madrid(now.toISOString());
    var b = madrid(parsed.toISOString());
    return !!(a && b && a.day === b.day && a.month === b.month && a.year === b.year);
  }

  function paintPreviewChapter(root, ep) {
    var badge = root.querySelector(".bc-sabadell-badge");
    if (badge) badge.textContent = "Episodio " + ep.n;
    var series = root.querySelector(".bc-sabadell-mast-series");
    if (series) series.textContent = "Hacer empresa · " + ep.empresa;
    var title = root.querySelector(".bc-sabadell-chapter-title");
    if (title) title.textContent = ep.titular;
    var lead = root.querySelector(".bc-sabadell-chapter-lead");
    if (lead) lead.textContent = ep.entradilla;
    var meta = root.querySelector(".bc-sabadell-meta");
    if (meta) {
      meta.innerHTML = '<time datetime="' + esc(ep.sale) + '">' + esc(fechaCorta(ep.sale)) + "</time> · 6 min de lectura";
    }
  }

  function renderSim(root, now, onHub) {
    if (root.querySelector(".bc-sabadell-sim")) return;
    var links = PREVIEW_DAYS.map(function (item) {
      var base = onHub ? "index.html" : item.page;
      var href = base + (base.indexOf("?") >= 0 ? "&" : "?") + "fecha=" + item.fecha;
      var label = sameDay(now, item.fecha) ? "<strong>" + esc(item.label) + "</strong>" : esc(item.label);
      return '<a href="' + esc(href) + '">' + label + "</a>";
    }).join(" · ");
    var nota = document.createElement("div");
    nota.className = "bc-sabadell-sim";
    nota.setAttribute("data-bc-nobody", "");
    nota.innerHTML = "<p>Versión de prueba · Ver la serie el: " + links
      + ' · <a href="' + esc("index.html?fecha=" + fechaQuery) + '">Ver hub</a></p>';
    root.appendChild(nota);
  }

  function start() {
    if (boot()) return;
    var tries = 0;
    var timer = window.setInterval(function () {
      tries += 1;
      if (boot() || tries >= 50) window.clearInterval(timer);
    }, 100);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
