/* ═══════════════════════════════════════════════════════════════════════════
   TORQUE — la vitrina pública

   El espejo del showroom, y nada más. Es el sitio que ve quien está
   probando: los tres vehículos, el simulador y la política de datos.

   Por qué un servidor aparte y no una ruta dentro de sala.js: porque la
   seguridad de una lista blanca depende de que sea imposible salirse de
   ella. Aquí el proceso solo conoce los archivos que puede servir; no hay
   forma de pedirle `CONTEXTO.md` o `cubo.js` porque no están en la lista, y
   una ruta nueva en el proyecto no queda expuesta por olvido: nace fuera de
   la vitrina y hay que meterla a mano.

   La regla es al revés de lo habitual: no se bloquea lo privado, se permite
   lo público. Lo que no esté escrito abajo, no existe para este servidor.

   Correr:  node servidor/vitrina.js
   Sale a:  torque.themesa.co
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const PUERTO = parseInt(process.env.PORT_VITRINA || "8795", 10);

/* ── LA LISTA BLANCA ──────────────────────────────────────────────────────
   Las seis páginas del showroom y los tres scripts que necesitan. `admin.js`
   NO está y no puede estar: es la consola interna, y su solo contenido
   revela los catorce módulos privados con sus nombres y direcciones. */
const PAGINAS = new Set([
  "/index.html", "/vigo.html", "/box.html", "/mage.html",
  "/simulador.html", "/politica-datos.html"
]);
const SUELTOS = new Set([
  "/torq.css",                       /* la hoja de estilos de TODO el sitio */
  "/tema.js", "/menu.js", "/contacto.js", "/favicon.ico"
]);
/* Las fotos de los vehículos. Solo `img/`: `fuentes/` tiene capturas de
   inventario y de cobertura que son material de trabajo, no de vitrina. */
const CARPETAS = ["/img/"];

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".jpg":  "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".svg":  "image/svg+xml", ".webp": "image/webp", ".ico": "image/x-icon"
};

/* Extensiones servibles dentro de las carpetas permitidas: aunque alguien
   dejara un .md o un .json dentro de img/, no saldría. */
const EXT_OK = new Set([".jpg",".jpeg",".png",".svg",".webp",".ico",".css"]);

/* La marca de tiempo del CSS, leida al arrancar. Se recalcula en cada
   arranque, que es cuando puede haber cambiado el archivo. */
function versionCss(){
  try { return String(Math.floor(fs.statSync(path.join(RAIZ, "torq.css")).mtimeMs)) }
  catch(e){ return "0" }
}
const VERSION_CSS = versionCss();

function permitido(rel){
  if (PAGINAS.has(rel) || SUELTOS.has(rel)) return true;
  if (!CARPETAS.some(c => rel.startsWith(c))) return false;
  return EXT_OK.has(path.extname(rel).toLowerCase());
}

/* La vitrina sirve el MISMO index.html que el sitio interno —una sola fuente
   de verdad, sin copias que se desincronicen— pero le quita la consola al
   vuelo. Así Daniel conserva su navegación cuando entra autenticado, y el
   público jamás recibe el archivo que enumera los módulos privados. */
function limpiar(html, anfitrion){
  html = html.replace(/[ \t]*<script[^>]*src=["']admin\.js["'][^>]*>\s*<\/script>\s*\n?/gi, "");

  /* El canonical y el og:url de las páginas apuntan a torq.bellapop.co, que
     desde el 4 de agosto pide usuario y clave. Servidos tal cual desde la
     vitrina le dirían a Google -y a la vista previa de WhatsApp- que la
     versión buena de esta página está detrás de un login: la vista previa
     saldría vacía y el buscador seguiría un 401. Se reescriben al dominio
     por el que realmente entró la visita, que es el público. */
  if (anfitrion && /^[a-z0-9.-]+$/i.test(anfitrion)) {
    html = html.replace(/https:\/\/torq\.bellapop\.co/g, "https://" + anfitrion);
  }
  /* La hoja de estilos se pide con su version pegada: torq.css?v=<mtime>.
     Sirve para dos cosas. La primera es la que jodio hoy: mientras torq.css
     estuvo fuera de la lista blanca devolvio 404, y ese 404 se le quedo
     cacheado a todo el que abrio la pagina en esa ventana -se veia cruda,
     con el logo gigante-. Arreglar el servidor no los arregla a ellos:
     su navegador ni vuelve a preguntar. Cambiar la URL si, y sin que
     nadie tenga que saber lo que es un refresco forzado.
     La segunda es permanente: al editar el CSS cambia el mtime, cambia la
     URL, y nadie se queda con la version vieja. */
  html = html.replace(/(href=["'])torq\.css(["'])/gi, "$1torq.css?v=" + VERSION_CSS + "$2");

  /* solo si la página no trae ya el suyo: dos <meta robots> en el mismo
     documento es basura que además deja el resultado a interpretación */
  if (!/name=["']robots["']/i.test(html)) {
    html = html.replace(/<\/head>/i, '<meta name="robots" content="noindex, nofollow">\n</head>');
  }
  return html;
}

const log = (...a) => console.log(new Date().toISOString().slice(11,19), ...a);

const servidor = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405); return res.end();
  }

  /* `new URL(req.url, base)` REVIENTA con rutas como "//" -las lee como
     autoridad sin host- y una excepción aquí no devuelve un 500: mata el
     proceso y tumba el sitio. Lo encontró la propia prueba de humo pidiendo
     "//". Se parsea a mano, que además es todo lo que hace falta. */
  let rel;
  try {
    rel = decodeURIComponent(req.url.split("?")[0].split("#")[0]);
  } catch(e) {                       /* %ZZ y demás basura mal codificada */
    res.writeHead(404); return res.end();
  }
  if (!rel.startsWith("/")) rel = "/" + rel;
  rel = rel.replace(/\/{2,}/g, "/");            /* "//" y "///" son "/" */
  if (rel === "/") rel = "/index.html";
  if (rel.indexOf("\0") >= 0) { res.writeHead(404); return res.end() }

  /* 404 y no 403: un 403 confirma que el recurso existe. Quien pruebe
     /CONTEXTO.md desde la vitrina no debe poder deducir que está ahí. */
  if (!permitido(rel)) {
    log("bloqueado", rel);
    /* no-store en los 404: sin esto el navegador -y Cloudflare- se guardan
       el fallo. Paso justo eso con torq.css: bastaron unos minutos con la
       hoja fuera de la lista blanca para que el sitio se viera crudo aun
       despues de arreglado, porque el 404 seguia cacheado. */
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8",
                         "cache-control": "no-store" });
    return res.end("no está");
  }

  const archivo = path.join(RAIZ, rel);
  /* cinturón sobre la lista blanca, por si un %2e%2e se colara */
  if (!archivo.startsWith(RAIZ + path.sep)) { res.writeHead(404); return res.end() }

  fs.readFile(archivo, (err, datos) => {
    if (err) { res.writeHead(404, { "content-type": "text/plain; charset=utf-8",
                                    "cache-control": "no-store" }); return res.end("no está") }
    const ext = path.extname(archivo).toLowerCase();
    if (ext === ".html") {
      /* el host que pidió: Cloudflare lo pasa tal cual, sin el puerto */
      const anfitrion = String(req.headers.host || "").split(":")[0];
      datos = Buffer.from(limpiar(datos.toString("utf8"), anfitrion), "utf8");
    }
    res.writeHead(200, {
      "content-type": TIPOS[ext] || "application/octet-stream",
      "cache-control": ext === ".html" ? "no-cache" : "public, max-age=3600",
      "x-content-type-options": "nosniff",
      "referrer-policy": "same-origin"
    });
    res.end(req.method === "HEAD" ? undefined : datos);
  });
});

servidor.listen(PUERTO, () => {
  console.log("");
  console.log("  ╭──────────────────────────────────────────────────╮");
  console.log("  │  TORQUE · Vitrina pública (solo showroom)         │");
  console.log("  ╰──────────────────────────────────────────────────╯");
  console.log("");
  console.log("     Local:  http://localhost:" + PUERTO + "/");
  console.log("     Sale a: torque.themesa.co");
  console.log("");
  console.log("     Sirve " + PAGINAS.size + " páginas, " + SUELTOS.size +
              " scripts y las fotos de img/. Nada más.");
  console.log("     Todo lo interno vive en sala.js, detrás de usuario y clave.");
  console.log("");
});
