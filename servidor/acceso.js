/* ═══════════════════════════════════════════════════════════════════════════
   TORQUE — la puerta

   Hasta el 4 de agosto de 2026 el sitio no tenía puerta: cualquiera con la
   dirección leía el centro de inteligencia, el cubo del RUNT, las piezas de
   pauta y los documentos de estrategia. Daniel lo notó y pidió cerrarlo con
   usuario y contraseña para dos personas: él y Camilo.

   Decisiones, y por qué:

   · Autenticación básica de HTTP, no un formulario. El navegador la recuerda
     en el llavero del teléfono -Daniel trabaja desde el móvil- y protege
     TODO, incluidos los .js, los .json y los .md, que un formulario no
     alcanza a cubrir porque no pasan por ninguna página.

   · Las contraseñas no se guardan: se guarda su hash con scrypt y una sal
     distinta por usuario. Si alguien se lleva `usuarios.json` no se lleva
     las contraseñas.

   · La comparación es en tiempo constante. Comparar hashes con === filtra,
     por cuánto tarda en fallar, cuántos caracteres acertó quien adivina.

   · `usuarios.json` NO se versiona -está en .gitignore-. El repositorio del
     proyecto es público; cualquier cosa que se suba ahí queda pública.
     Esa es exactamente la razón por la que existe este archivo.

   · Sin credenciales válidas se responde 401. Aquí sí conviene el 401 y no
     un 404: el sitio entero está detrás de la puerta, así que no revela
     nada que no se sepa ya —que hay algo y pide clave—.

   Crear o cambiar una clave:
       node servidor/acceso.js nueva Daniel
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ARCHIVO = path.join(__dirname, "usuarios.json");

/* Parámetros de scrypt. El coste está calibrado para tardar ~100 ms en este
   equipo: imperceptible al entrar, caro para quien pruebe millones. */
const N = 16384, r = 8, p = 1, LARGO = 64;

function derivar(clave, sal){
  return crypto.scryptSync(clave, sal, LARGO, { N: N, r: r, p: p }).toString("hex");
}

function leer(){
  try { return JSON.parse(fs.readFileSync(ARCHIVO, "utf8")) }
  catch(e){ return null }
}

/* Compara sin filtrar por tiempo. timingSafeEqual exige el mismo largo, así
   que si difiere se compara contra sí mismo para gastar lo mismo y devolver
   false igual: nunca se sale antes por una diferencia de tamaño. */
function iguales(a, b){
  const A = Buffer.from(a, "utf8"), B = Buffer.from(b, "utf8");
  if (A.length !== B.length) { crypto.timingSafeEqual(A, A); return false }
  return crypto.timingSafeEqual(A, B);
}

/* Devuelve el nombre del usuario si las credenciales sirven, o null.
   Cuando el usuario no existe igual se deriva un hash contra una sal falsa:
   así responder "usuario inexistente" cuesta lo mismo que "clave errada" y
   no se puede averiguar quién tiene cuenta midiendo el tiempo. */
function verificar(cabecera){
  const usuarios = leer();
  if (!usuarios) return null;
  if (!cabecera || !/^Basic /i.test(cabecera)) return null;

  let plano;
  try { plano = Buffer.from(cabecera.slice(6).trim(), "base64").toString("utf8") }
  catch(e){ return null }

  const corte = plano.indexOf(":");
  if (corte < 0) return null;
  const nombre = plano.slice(0, corte), clave = plano.slice(corte + 1);

  const u = usuarios[nombre];
  if (!u) { derivar(clave, "sal-que-no-existe"); return null }
  return iguales(derivar(clave, u.sal), u.hash) ? nombre : null;
}

function exigir(req, res){
  const quien = verificar(req.headers.authorization);
  if (quien) return quien;
  res.writeHead(401, {
    "www-authenticate": 'Basic realm="TORQUE", charset="UTF-8"',
    "content-type": "text/html; charset=utf-8",
    /* que ni el navegador ni Cloudflare guarden una respuesta de la puerta */
    "cache-control": "no-store, private"
  });
  res.end("<!doctype html><meta charset=utf-8>" +
          "<title>TORQUE</title>" +
          "<body style=\"background:#08090a;color:#8b9199;font:15px/1.7 system-ui;" +
          "display:grid;place-items:center;height:100vh;margin:0;text-align:center\">" +
          "<div><p style=\"color:#c8f24a;font-weight:700;letter-spacing:.2em\">TORQUE</p>" +
          "<p>Esta vista es interna. Se necesita usuario y contrase&ntilde;a.</p></div>");
  return null;
}

module.exports = { verificar, exigir, ARCHIVO };

/* ── uso desde la terminal: crear o cambiar una clave ───────────────────── */
if (require.main === module) {
  const [,, orden, nombre] = process.argv;
  if (orden !== "nueva" || !nombre) {
    console.log("uso: node servidor/acceso.js nueva <usuario>");
    process.exit(1);
  }
  /* 12 bytes en base64url ≈ 16 caracteres sin ambigüedades tipográficas.
     La genera la máquina, no una persona: nadie elige "Torque2026". */
  const clave = crypto.randomBytes(12).toString("base64url");
  const sal = crypto.randomBytes(16).toString("hex");
  const usuarios = leer() || {};
  usuarios[nombre] = { sal: sal, hash: derivar(clave, sal), creado: new Date().toISOString().slice(0,10) };
  fs.writeFileSync(ARCHIVO, JSON.stringify(usuarios, null, 2) + "\n", { mode: 0o600 });
  console.log("");
  console.log("  usuario:    " + nombre);
  console.log("  contraseña: " + clave);
  console.log("");
  console.log("  Guardada solo como hash en " + ARCHIVO);
  console.log("  Esta es la única vez que se puede ver. Si se pierde, se genera otra.");
  console.log("");
}
