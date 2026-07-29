/* ═══════════════════════════════════════════════════════════════════════════
   TORQ — EL CEREBRO
   ═══════════════════════════════════════════════════════════════════════════
   El cambio de fondo: hasta ahora el bot ENTENDÍA por palabras clave y eso
   llegó a su techo. El español tiene infinitas formas de preguntar lo mismo,
   y cada corrección era un parche a una palabra. Aquí un modelo lee la base
   de conocimiento y razona sobre ella.

   Lo que NO cambia, y es lo que hace que esto sea seguro:

     1. Los guardarraíles se evalúan en CÓDIGO, antes del modelo. Una petición
        de descuento, un reclamo o un intento de dar la cédula ni siquiera
        llegan a la IA: los atiende la regla, como siempre.
     2. Las señales del lead —ciudad, plazo, forma de pago, si puede cargar,
        color, carro de retoma— se extraen en CÓDIGO. Son datos de negocio y
        no se le confían a un modelo.
     3. Cada cifra de la respuesta se verifica contra la base. Si el modelo
        inventa un precio, la respuesta se descarta y contesta el motor de
        reglas. Un modelo no puede inventar lo que no puede publicar.
     4. Si la API falla, tarda o devuelve basura, responde el motor de reglas.
        Nunca hay un turno en blanco.

   La distinción que sostiene todo: el modelo NO SABE, el modelo ENTIENDE Y
   REDACTA. Todo lo que puede afirmar viene en el prompt.

   ⚠️ ESTADO: escrito y con pruebas de estructura, pero SIN PROBAR contra la
   API — en esta máquina no hay ANTHROPIC_API_KEY. Antes de usarlo en
   producción hay que correr `node servidor/prueba-cerebro.js` con la llave.
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

const path = require("path");
const BOT = require(path.join(__dirname, "..", "bot-motor.js"));
const CONOCIMIENTO = require(path.join(__dirname, "..", "conocimiento.js"));

const { execFile } = require("child_process");

const CFG = {
  /* "cli" usa el Claude Code local (suscripción Max, sin llave ni costo por
     token) — es como se prueba ahora. "api" es lo de producción. */
  via:    process.env.TORQ_VIA || (process.env.ANTHROPIC_API_KEY ? "api" : "cli"),
  modelo: process.env.TORQ_MODELO || "claude-haiku-4-5",
  llave:  process.env.ANTHROPIC_API_KEY || "",
  /* 6 segundos: en WhatsApp, más que eso y el cliente ya escribió otra cosa */
  timeout: parseInt(process.env.TORQ_TIMEOUT || "6000", 10)
};

const activo = () => CFG.via === "cli" || !!CFG.llave;

/* ═══ EL PROMPT ═══════════════════════════════════════════════════════════
   La base de conocimiento va marcada para caché: es idéntica en cada llamada
   y así se paga una vez, no en cada mensaje. Con Haiku eso deja el costo por
   conversación en centavos. */
function sistema() {
  return [
    { type: "text",
      text: CONOCIMIENTO.documento(),
      cache_control: { type: "ephemeral" } },
    { type: "text",
      text:
`Devuelve SOLO un objeto JSON, sin texto alrededor y sin bloque de código:

{
  "respuesta": "lo que le dices al cliente, en WhatsApp",
  "escala": null | "pedido" | "agenda" | "credito" | "retoma" | "renting" | "tributario" | "normativo" | "seguro" | "costoservicio" | "instalacion" | "matricula",
  "vehiculo": "vigo" | "box" | "mage",
  "temas": ["los temas que tocaste, en minúscula"]
}

"escala" va con motivo SOLO si tu respuesta le dice al cliente que lo pasas
con un asesor. Si resolviste con datos, va en null.
"vehiculo" es de cuál están hablando AHORA — si el cliente nombró otro, cambia.` }
  ];
}

function contexto(lead) {
  const V = BOT.VEH[lead.vehiculo];
  const L = [`Vehículo en foco: ${V ? V.largo : "sin definir"}`];
  if (lead.ciudad) L.push(`Ciudad del cliente: ${lead.ciudad} — YA LA DIJO, no se la vuelvas a preguntar`);
  if (lead.plazo)  L.push(`Cuándo compra: ${lead.plazo}`);
  if (lead.pago)   L.push(`Forma de pago: ${lead.pago}`);
  if (lead.carga)  L.push(`¿Puede cargar en casa?: ${lead.carga}`);
  if (lead.uso)    L.push(`Uso: ${lead.uso}`);
  if (lead.color)  L.push(`Color que le gustó: ${lead.color}`);
  if (lead.usado)  L.push(`Entrega en parte de pago: ${lead.usado}`);
  if (lead.interes && lead.interes.length) L.push(`Ya hablaron de: ${lead.interes.join(", ")}`);
  return L.join("\n");
}

/* ═══ LA RED DE SEGURIDAD ═════════════════════════════════════════════════
   Toda cifra de la respuesta tiene que existir en la base. Es lo que hace
   que un modelo barato sea seguro para hablar de precios: puede equivocarse
   redactando, no puede inventar un número y publicarlo. */
let PERMITIDAS = null;
function cifrasInventadas(texto) {
  if (!PERMITIDAS) PERMITIDAS = CONOCIMIENTO.cifrasPermitidas();
  const halladas = texto.match(/\$[\d.]+|\b\d[\d.,]*\s*(?:km|kWh|hp|Nm|litros|años|minutos)\b/gi) || [];
  return halladas.filter(x => {
    const k = x.toLowerCase().replace(/\s+/g, " ").trim();
    if (PERMITIDAS[k]) return false;
    /* tolerancia: "8 años" aparece como "8 años o 200.000 km" en la base */
    return !Object.keys(PERMITIDAS).some(p => p.indexOf(k) === 0 || k.indexOf(p) === 0);
  });
}

/* ═══ POR EL CLAUDE CODE LOCAL ════════════════════════════════════════════
   Mismo prompt, mismo contrato de salida, sin llave y sin costo por token:
   corre contra la suscripción. Sirve para probar la experiencia antes de
   montar nada. En producción se cambia una variable y se va por la API. */
function pensarCLI(prompt) {
  return new Promise(resolve => {
    execFile("claude", ["-p", "--model", "haiku"],
      { timeout: CFG.timeout * 12, maxBuffer: 1 << 20 },
      (err, stdout) => {
        if (err && !stdout) return resolve({ fallo: "cli: " + (err.killed ? "timeout" : err.message) });
        resolve({ bruto: String(stdout || "").trim() });
      }
    ).stdin.end(prompt);
  });
}

function promptPlano(texto, lead, hilo) {
  const sis = sistema().map(b => b.text).join("\n\n");
  const conv = (hilo || []).slice(-10)
    .map(m => (m.direccion === "entra" ? "Cliente: " : "Tú: ") + m.texto)
    .join("\n");
  return sis + "\n\n## Estado de esta conversación\n" + contexto(lead) +
    (conv ? "\n\n## Lo que se han dicho\n" + conv : "") +
    "\n\n## Mensaje nuevo del cliente\n" + texto +
    "\n\nResponde SOLO con el JSON.";
}

/* ═══ EL TURNO ════════════════════════════════════════════════════════════ */
async function pensar(texto, lead, hilo) {
  if (!activo()) return null;

  if (CFG.via === "cli") {
    const r = await pensarCLI(promptPlano(texto, lead, hilo));
    if (r.fallo) return r;
    return interpretar(r.bruto);
  }

  const mensajes = (hilo || []).slice(-10).map(m => ({
    role: m.direccion === "entra" ? "user" : "assistant",
    content: m.texto
  }));
  mensajes.push({ role: "user", content: contexto(lead) + "\n\nMensaje del cliente:\n" + texto });

  try {
    const ctl = new AbortController();
    const reloj = setTimeout(() => ctl.abort(), CFG.timeout);
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": CFG.llave,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: CFG.modelo,
        max_tokens: 700,
        system: sistema(),
        messages: mensajes
      }),
      signal: ctl.signal
    });
    clearTimeout(reloj);
    if (!res.ok) return { fallo: "http " + res.status };

    const j = await res.json();
    const r = interpretar((j.content || []).map(c => c.text || "").join(""));
    if (r && !r.fallo) r.uso = j.usage || null;
    return r;
  } catch (e) {
    return { fallo: e.name === "AbortError" ? "timeout" : e.message };
  }
}

/* Interpreta y VALIDA lo que devolvió el modelo, venga de donde venga. */
function interpretar(bruto) {
  const jsonTxt = (String(bruto || "").match(/\{[\s\S]*\}/) || [""])[0];
  let out;
  try { out = JSON.parse(jsonTxt) } catch (e) { return { fallo: "json ilegible" } }
  if (!out.respuesta || typeof out.respuesta !== "string") return { fallo: "sin respuesta" };

  /* la red de seguridad: ninguna cifra puede salir de la nada */
  const inventadas = cifrasInventadas(out.respuesta);
  if (inventadas.length) return { fallo: "cifra inventada: " + inventadas.join(", ") };

  if (out.escala && !BOT.ESC[out.escala]) out.escala = "pedido";
  if (out.vehiculo && !BOT.VEH[out.vehiculo]) out.vehiculo = null;

  return {
    texto: out.respuesta.trim(),
    escala: out.escala || null,
    vehiculo: out.vehiculo || null,
    temas: Array.isArray(out.temas) ? out.temas.slice(0, 5) : []
  };
}

module.exports = { pensar, activo, cifrasInventadas, contexto, interpretar, CFG };
