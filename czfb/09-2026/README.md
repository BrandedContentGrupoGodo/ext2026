# CZFB — Nueva industria (DFactory) · 09-2026

Landing branded content (vanilla HTML/CSS/JS). Preview en GitHub Pages; integración en Xalok.

## Estado

- Diseño aprobado y validado en preview manual.
- Assets WebP y textos literales incorporados.
- Capítulos 01 y 02 con URLs definitivas (tarjeta 02 enlazada también sin JS).
- Root: `.bc-czfb`.
- Fragmento Xalok borrador listo (local, no versionado).

## Rutas útiles

| Uso | Ruta |
|-----|------|
| Preview | `czfb/09-2026/index.html` |
| Fragmento Xalok | `czfb/09-2026/.cursor/xalok-borrador.html` |
| Auditoría | `czfb/09-2026/.cursor/commands/xalok-audit.md` |
| Regla del proyecto | `.cursor/rules/czfb-09-2026.mdc` (raíz del repo) |
| Assets producción | `https://brandedcontentgrupogodo.github.io/ext2026/czfb/09-2026/` |

### Capítulo 02

- Constante: `BC_CZFB_CHAPTER_02_URL` en `assets/js/scripts.js`
- Misma URL en el `href` del HTML (preview y fragmento)

## Pendientes

- Validación visual en Xalok (desktop + móvil) tras pegar el fragmento.
- Publicación en Xalok cuando esa validación esté OK.

## Contenedores Xalok

Ámbito: `article.visual__story--free:has(.bc-czfb)` — ver regla local y fragmento.

## Próximo paso

Auditar con `xalok-audit.md`, pegar el fragmento en Xalok y validar en CMS.
