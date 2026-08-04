/* ═══════════════════════════════════════════════════════════════════════════
   TORQ — LA SALA DE PRUEBAS CON HAIKU
   ═══════════════════════════════════════════════════════════════════════════
   Un puente para poder probar el bot con un modelo de verdad usando la
   suscripción Max, sin llave de API y sin costo por token.

   El navegador no puede ejecutar el Claude Code local, así que este servidor
   hace dos cosas:
     · sirve las páginas del proyecto
     · expone POST /pensar, que le pasa el mensaje al modelo y devuelve la
       respuesta ya validada

   El reparto de responsabilidades es el mismo de producción y no cambia:

     el navegador  · captura las señales del lead y evalúa los guardarraíles.
                     Una petición de descuento se resuelve ahí y no llega al
                     modelo, igual que en el servidor real.
     este puente   · le pide al modelo que entienda y redacte sobre la base
                     de conocimiento.
     si algo falla · responde el motor de reglas. Nunca hay turno en blanco.

   Correr:  node servidor/sala.js
   Abrir:   http://localhost:8790/chat.html
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const cerebro = require("./cerebro.js");
const acceso = require("./acceso.js");

const RAIZ = path.join(__dirname, "..");
const PUERTO = parseInt(process.env.PORT || "8790", 10);
/* Cuando esto sale a un túnel público, cualquiera con la dirección podría
   gastar la suscripción de Daniel. La llave va en la URL, como en los otros
   tableros del proyecto. */
const LLAVE = process.env.TORQ_LLAVE || "torq2026";

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg":  "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml",
  ".webp": "image/webp", ".ico": "image/x-icon"
};

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

const servidor = http.createServer(async (req, res) => {
  /* `new URL(req.url, base)` lanza con rutas como "//", y una excepción aquí
     no da un 500: mata el proceso. Cualquiera podía apagar este servidor
     pidiendo "//". Se envuelve en try y se normaliza. */
  let url;
  try { url = new URL(req.url.replace(/^\/{2,}/, "/"), "http://x") }
  catch(e) { res.writeHead(400); return res.end() }
  /* El comodín de CORS estaba bien cuando todo era público; con la puerta
     puesta permitiría que cualquier página ajena leyera estas vistas desde
     el navegador de quien ya entró. Este servidor no lo necesita: nadie lo
     consume desde otro origen. */
  res.setHeader("access-control-allow-headers", "content-type");
  res.setHeader("x-robots-tag", "noindex, nofollow");
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end() }

  /* ── la puerta ──────────────────────────────────────────────────────────
     Va ANTES que todo lo demás, incluido /pensar y /cerebro: este servidor
     sirve el proyecto entero -inteligencia, cubo del RUNT, piezas de pauta,
     documentos de estrategia-, así que aquí no hay nada público. El showroom
     abierto vive en su propio servidor (vitrina.js), que solo tiene copia de
     las páginas que sí pueden verse. */
  if (!acceso.exigir(req, res)) return;

  /* ── el puente al modelo ───────────────────────────────────────────── */
  if (req.method === "POST" && url.pathname === "/pensar") {
    let crudo = "";
    req.on("data", c => { crudo += c; if (crudo.length > 2e5) req.destroy() });
    req.on("end", async () => {
      let cuerpo;
      try { cuerpo = JSON.parse(crudo) } catch { cuerpo = null }
      if (!cuerpo || cuerpo.k !== LLAVE) {
        log("llave inválida — se descarta");
        res.writeHead(401, { "content-type": "application/json" });
        return res.end(JSON.stringify({ fallo: "sin llave" }));
      }
      if (!cuerpo || !cuerpo.texto) {
        res.writeHead(400, { "content-type": "application/json" });
        return res.end(JSON.stringify({ fallo: "sin texto" }));
      }

      const t0 = Date.now();
      const r = await cerebro.pensar(cuerpo.texto, cuerpo.lead || {}, cuerpo.hilo || []);
      const ms = Date.now() - t0;

      if (r && r.texto) log(`✓ ${ms} ms · "${cuerpo.texto.slice(0, 45)}"`);
      else log(`✗ ${ms} ms · ${(r && r.fallo) || "sin modelo"} · "${cuerpo.texto.slice(0, 45)}"`);

      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(Object.assign({ ms: ms }, r || { fallo: "sin modelo" })));
    });
    return;
  }

  /* ── estado, para que la página sepa si hay cerebro ────────────────── */
  if (url.pathname === "/cerebro") {
    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify({
      activo: cerebro.activo(), via: cerebro.CFG.via, modelo: cerebro.CFG.modelo
    }));
  }

  /* ── archivos del proyecto ─────────────────────────────────────────── */
  let rel = decodeURIComponent(url.pathname);
  /* La raíz es el sitio, no la sala de pruebas: torq.bellapop.co es la
     dirección que se comparte. La sala vive en /chat.html?k= */
  if (rel === "/" || rel === "") rel = "/index.html";
  const archivo = path.join(RAIZ, rel);
  if (!archivo.startsWith(RAIZ)) { res.writeHead(403); return res.end() }

  fs.readFile(archivo, (err, datos) => {
    if (err) { res.writeHead(404, { "content-type": "text/plain" }); return res.end("no está") }
    const ext = path.extname(archivo).toLowerCase();

    /* La hoja se pide versionada, igual que en la vitrina. Aquí el
       cache-control ya es no-store, así que en teoría no haría falta —pero
       eso solo vale para lo que se pide DE AHORA EN ADELANTE. Quien tenga
       una copia vieja de torq.css guardada de antes se queda con ella y no
       vuelve a preguntar; cambiarle la URL es lo unico que lo despega. Pasó
       hoy con el contraste de los logos: el servidor ya servía la hoja
       nueva y el navegador seguía pintando la vieja. */
    if (ext === ".html") {
      let mt = "0";
      try { mt = String(Math.floor(fs.statSync(path.join(RAIZ, "torq.css")).mtimeMs)) } catch(e){}
      datos = Buffer.from(
        datos.toString("utf8").replace(/(href=["'])torq\.css(["'])/gi, "$1torq.css?v=" + mt + "$2"),
        "utf8");
    }

    res.writeHead(200, {
      "content-type": TIPOS[ext] || "application/octet-stream",
      "cache-control": "no-store"   /* en pruebas, nunca servir una copia vieja */
    });
    res.end(datos);
  });
});

servidor.listen(PUERTO, () => {
  console.log("");
  console.log("  ╭──────────────────────────────────────────────────╮");
  console.log("  │  TORQ · Sala de pruebas con modelo                │");
  console.log("  ╰──────────────────────────────────────────────────╯");
  console.log("");
  console.log("     Abre:    http://localhost:" + PUERTO + "/chat.html?k=" + LLAVE);
  console.log("     Cerebro: " + (cerebro.activo() ? cerebro.CFG.modelo + " (vía " + cerebro.CFG.via + ")" : "APAGADO — responde el motor de reglas"));
  console.log("");
  console.log("     El modelo tarda entre 10 y 25 segundos por respuesta:");
  console.log("     es el arranque del Claude Code local, no el modelo.");
  console.log("     Por API son 1 o 2 segundos.");
  console.log("");
});
