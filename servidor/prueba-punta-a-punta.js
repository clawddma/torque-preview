/* ═══════════════════════════════════════════════════════════════════════════
   TORQ — PRUEBA DE PUNTA A PUNTA
   ═══════════════════════════════════════════════════════════════════════════
   Levanta el servidor de verdad y le mete mensajes con la MISMA forma que
   manda Meta. Nada está simulado salvo la salida a WhatsApp, que se captura
   en vez de enviarse: así se prueba el sistema completo —firma, repetidos,
   memoria, reglas, escalada, base de datos— sin cuenta, sin token y sin
   gastar un solo mensaje.

   Correr:  node servidor/prueba-punta-a-punta.js
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";
process.env.TORQ_DB = require("path").join(__dirname, "datos", "prueba.db");

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/* base limpia en cada corrida: una prueba que arrastra estado no prueba nada */
const RUTA = process.env.TORQ_DB;
fs.mkdirSync(path.dirname(RUTA), { recursive: true });
for (const f of [RUTA, RUTA + "-journal", RUTA + "-wal", RUTA + "-shm"])
  if (fs.existsSync(f)) fs.unlinkSync(f);

process.env.WA_APP_SECRET = process.env.WA_APP_SECRET || "secreto-de-prueba";
process.env.WA_VERIFY = "torq-prueba";

const { crearServidor, usarEnvio, CFG } = require("./servidor.js");
const almacen = require("./almacen.js");

/* la salida a WhatsApp se captura */
const enviados = [];
usarEnvio(async (waId, texto) => { enviados.push({ waId, texto }); return true });

const PUERTO = 8791;
const srv = crearServidor();

function sobreMeta(waId, texto, nombre, id) {
  return {
    object: "whatsapp_business_account",
    entry: [{ id: "0", changes: [{ field: "messages", value: {
      messaging_product: "whatsapp",
      metadata: { phone_number_id: "0" },
      contacts: [{ profile: { name: nombre }, wa_id: waId }],
      messages: [{ from: waId, id, timestamp: "0", type: "text", text: { body: texto } }]
    }}]}]
  };
}

async function empujar(waId, texto, nombre, id, firmar = true) {
  const crudo = JSON.stringify(sobreMeta(waId, texto, nombre, id));
  const firma = "sha256=" + crypto.createHmac("sha256", CFG.secreto).update(crudo).digest("hex");
  const cab = { "content-type": "application/json" };
  if (firmar) cab["x-hub-signature-256"] = firma;
  else cab["x-hub-signature-256"] = "sha256=" + "0".repeat(64);
  const res = await fetch(`http://127.0.0.1:${PUERTO}/webhook`, { method: "POST", headers: cab, body: crudo });
  /* A Meta se le responde 200 de inmediato y el trabajo sigue después, así que
     la prueba espera a que la fila de esa conversación termine antes de mirar
     el resultado. */
  await new Promise(r => setTimeout(r, 160));
  return res.status;
}

let pasa = 0, falla = 0;
function revisar(nombre, cond, detalle) {
  if (cond) { pasa++; console.log("  ✓ " + nombre) }
  else { falla++; console.log("  ✗ " + nombre + (detalle ? "\n      " + detalle : "")) }
}

(async () => {
  await new Promise(r => srv.listen(PUERTO, r));
  console.log("\n═══ TORQ · PRUEBA DE PUNTA A PUNTA ═══════════════════════════════\n");

  /* ── 1 · verificación del webhook ─────────────────────────────────────── */
  console.log("1 · Meta verifica el webhook");
  const v1 = await fetch(`http://127.0.0.1:${PUERTO}/webhook?hub.mode=subscribe&hub.verify_token=torq-prueba&hub.challenge=12345`);
  revisar("responde el reto con la clave correcta", v1.status === 200 && (await v1.text()) === "12345");
  const v2 = await fetch(`http://127.0.0.1:${PUERTO}/webhook?hub.verify_token=equivocada&hub.challenge=1`);
  revisar("rechaza la clave equivocada", v2.status === 403);

  /* ── 2 · firma ────────────────────────────────────────────────────────── */
  console.log("\n2 · Seguridad: solo Meta puede hacerlo hablar");
  enviados.length = 0;
  const est = await empujar("573001112233", "hola", "Intruso", "falso-1", false);
  revisar("descarta el mensaje sin firma válida", est === 401 && enviados.length === 0,
          "estado " + est + ", enviados " + enviados.length);

  /* ── 3 · primer contacto ──────────────────────────────────────────────── */
  console.log("\n3 · Primer contacto");
  enviados.length = 0;
  await empujar("573001112233", "hola, cuanto vale la mage?", "Marcela", "m1");
  revisar("se presenta antes de responder", enviados.length === 2 && /asesor digital de TORQ/.test(enviados[0].texto),
          JSON.stringify(enviados.map(e => e.texto.slice(0, 40))));
  revisar("responde el precio con la cifra correcta", /\$109\.000\.000/.test(enviados[1].texto),
          (enviados[1] || {}).texto);

  /* ── 4 · repetidos ────────────────────────────────────────────────────── */
  console.log("\n4 · Meta reintenta el mismo mensaje");
  enviados.length = 0;
  await empujar("573001112233", "hola, cuanto vale la mage?", "Marcela", "m1");
  revisar("no contesta dos veces lo mismo", enviados.length === 0, enviados.length + " envíos");

  /* ── 5 · memoria entre mensajes ───────────────────────────────────────── */
  console.log("\n5 · Memoria: el bot no empieza de cero en cada mensaje");
  enviados.length = 0;
  await empujar("573001112233", "estoy en medellin", "Marcela", "m2");
  await empujar("573001112233", "y se enchufa?", "Marcela", "m3");
  const conv = almacen.leerConversacion("573001112233");
  revisar("recuerda la ciudad de un mensaje anterior", conv.estado.ciudad === "Medellín",
          JSON.stringify(conv.estado.ciudad));
  revisar("no vuelve a presentarse", !enviados.some(e => /Soy el asesor digital/.test(e.texto)));
  revisar("sabe que la MAGE no se enchufa", enviados.some(e => /NO se enchufa/.test(e.texto)));

  /* ── 6 · guardarraíl ──────────────────────────────────────────────────── */
  console.log("\n6 · Guardarraíl: pide descuento");
  enviados.length = 0;
  await empujar("573001112233", "me la dejas mas barata?", "Marcela", "m4");
  revisar("no negocia", enviados.some(e => /define la sala de ventas/.test(e.texto)));
  const lead = almacen.listarLeads().find(l => l.wa_id === "573001112233");
  revisar("registró el lead con su motivo", lead && lead.motivo === "descuento",
          JSON.stringify(lead && lead.motivo));
  revisar("el lead arranca en 'entregado' con marca de tiempo", lead && lead.estado === "entregado" && !!lead.entregado);
  revisar("el lead guarda la ciudad capturada en la charla", lead && lead.ciudad === "Medellín");

  /* ── 7 · el que no puede cargar ───────────────────────────────────────── */
  console.log("\n7 · Conversación completa: no tiene dónde cargar");
  enviados.length = 0;
  await empujar("573009998877", "buenas, me interesa el box", "Luz Dary", "n1");
  await empujar("573009998877", "yo parqueo en la calle, no tengo parqueadero", "Luz Dary", "n2");
  await empujar("573009998877", "entonces cual me conviene?", "Luz Dary", "n3");
  revisar("le recomienda la híbrida, no un eléctrico",
          enviados.some(e => /te cuadra es la MAGE/.test(e.texto)),
          enviados.map(e => e.texto.slice(0, 50)).join(" | "));
  const c2 = almacen.leerConversacion("573009998877");
  revisar("anotó que no puede cargar en casa", c2.estado.carga === "No");
  revisar("la conversación se mudó a la MAGE", c2.estado.vehiculo === "mage");

  /* ── 8 · datos sensibles ──────────────────────────────────────────────── */
  console.log("\n8 · Intenta hacer un trámite por el chat");
  enviados.length = 0;
  await empujar("573005554444", "hola, le paso mi cedula y consigno la separacion", "Anónimo", "p1");
  revisar("no recibe documentos ni pagos", enviados.some(e => /no pido ni recibo documentos/.test(e.texto)));

  /* ── 9 · lo que no entiende ───────────────────────────────────────────── */
  console.log("\n9 · Tres mensajes que no entiende");
  enviados.length = 0;
  await empujar("573007776666", "oe y eso como asi la vaina esa", "Nicolás", "q1");
  await empujar("573007776666", "si o que", "Nicolás", "q2");
  await empujar("573007776666", "bueno pues entonces", "Nicolás", "q3");
  revisar("admite que no entiende en vez de inventar",
          enviados.some(e => /No estoy seguro de haber entendido/.test(e.texto)));
  revisar("a los tres intentos pasa a humano",
          enviados.some(e => /Prefiero no adivinar/.test(e.texto)),
          enviados.map(e => e.texto.slice(0, 35)).join(" | "));

  /* ── 10 · el código de campaña ────────────────────────────────────────── */
  console.log("\n10 · Lead que llega del calificador del sitio");
  enviados.length = 0;
  await empujar("573002223333",
    "Hola, soy Andrés. Vi la Vigo en TORQ y me interesa.\n\nEstoy en Cali y la quiero este mes. La compraría con crédito.\n\n— ref BOG-VIGO-01",
    "Andrés", "r1");
  const lead2 = almacen.listarLeads().find(l => l.wa_id === "573002223333");
  revisar("escala por crédito", lead2 && lead2.motivo === "credito", JSON.stringify(lead2 && lead2.motivo));
  revisar("guarda el código de campaña del anuncio", lead2 && lead2.campana === "BOG-VIGO-01",
          JSON.stringify(lead2 && lead2.campana));
  revisar("guarda la ciudad y el plazo del mensaje", lead2 && lead2.ciudad === "Cali" && lead2.plazo === "Este mes",
          JSON.stringify(lead2 && [lead2.ciudad, lead2.plazo]));

  /* ── 11 · estados del contrato ────────────────────────────────────────── */
  console.log("\n11 · Estados del contrato con Corautos");
  almacen.avanzarLead("573002223333", "contactado");
  almacen.avanzarLead("573002223333", "agendado");
  const lead3 = almacen.listarLeads().find(l => l.wa_id === "573002223333");
  revisar("avanza entregado → contactado → agendado",
          lead3.estado === "agendado" && !!lead3.contactado && !!lead3.agendado);
  revisar("conserva el sello de 'entregado' para medir el SLA", !!lead3.entregado);

  /* ── 11b · dos leads de una misma conversación ────────────────────────── */
  console.log("\n11b · El seguro: segundo negocio sin cortar la charla del carro");
  enviados.length = 0;
  await empujar("573004445555", "hola, me interesa la mage, estoy en pereira", "Marta", "s1");
  await empujar("573004445555", "sabes cuanto cuesta un seguro para este vehiculo?", "Marta", "s2");
  await empujar("573004445555", "si claro", "Marta", "s3");
  await empujar("573004445555", "entre 26 y 40", "Marta", "s4");
  await empujar("573004445555", "no he tenido ninguno", "Marta", "s5");
  revisar("cierra la cotizacion y devuelve la charla al carro",
          enviados.some(e => /Sigamos con el carro/.test(e.texto)),
          enviados.map(e => e.texto.slice(0,40)).join(" | "));
  const todos = almacen.listarLeads();
  const lv = todos.find(l => l.id === "573004445555");
  const lsg = todos.find(l => l.id === "573004445555:seguro");
  revisar("quedan DOS leads de la misma conversacion", !!lv || !!lsg);
  revisar("el lead de seguro guarda lo que contesto",
          lsg && /26 a 40|26 y 40/.test(lsg.detalle || ""), JSON.stringify(lsg && lsg.detalle));
  revisar("el lead de seguro hereda vehiculo y ciudad",
          lsg && lsg.vehiculo === "mage" && lsg.ciudad === "Pereira",
          JSON.stringify(lsg && [lsg.vehiculo, lsg.ciudad]));
  revisar("la conversacion sigue viva despues de cotizar", (function(){
            const c = almacen.leerConversacion("573004445555");
            return c && !c.estado._sub;
          })());
  enviados.length = 0;
  await empujar("573004445555", "y que garantia tiene la bateria?", "Marta", "s6");
  revisar("responde normal el siguiente tema del carro",
          enviados.some(e => /8 años o 200.000 km/.test(e.texto)),
          enviados.map(e => e.texto.slice(0,50)).join(" | "));

  /* ── 12 · salud ───────────────────────────────────────────────────────── */
  console.log("\n12 · Reporte de salud");
  const s = await (await fetch(`http://127.0.0.1:${PUERTO}/salud`)).json();
  revisar("responde y dice si le faltan credenciales", s.ok === true && "credenciales" in s,
          JSON.stringify(s));

  console.log("\n──────────────────────────────────────────────────────────────────");
  console.log(`  ${pasa} bien · ${falla} mal · ${almacen.listarLeads().length} leads en la base`);
  console.log("──────────────────────────────────────────────────────────────────\n");
  srv.close();
  process.exit(falla ? 1 : 0);
})();
