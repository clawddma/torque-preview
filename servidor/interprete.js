/* ═══════════════════════════════════════════════════════════════════════════
   TORQ — INTÉRPRETE
   ═══════════════════════════════════════════════════════════════════════════
   El único trabajo de la IA en este sistema es ENTENDER, nunca RESPONDER.

   Cuando las palabras clave no reconocen la pregunta —"oiga y esa vaina se
   enchufa o toca gasolina?"— este módulo le pregunta al modelo a cuál de los
   temas de la base se parece. El modelo devuelve un identificador de una lista
   cerrada. Nada más. El texto que ve el cliente sale siempre de `bot-motor.js`.

   Por qué así y no dejando que el modelo redacte:
   · Un modelo que redacta sobre carros inventa cifras. Un precio inventado o
     una fecha de entrega prometida rompe la relación con Corautos y expone
     bajo la Ley 1480.
   · Un modelo que solo clasifica no puede inventar: o acierta el tema, o dice
     que no sabe y la conversación pasa a un humano.

   Si no hay llave de API configurada, el sistema sigue funcionando: se queda
   con las palabras clave y escala a los tres intentos fallidos.
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

const MODELO = process.env.TORQ_MODELO || "claude-opus-5";
const LLAVE  = process.env.ANTHROPIC_API_KEY || "";

const activo = () => !!LLAVE;

/* Lista cerrada de salidas. `ninguno` es una respuesta legítima y necesaria:
   es lo que dispara el paso a humano en vez de una respuesta a la fuerza. */
function catalogo(BOT) {
  const temas = BOT.KB.map(t => t.id);
  const vetos = BOT.VETO.map(t => "veto_" + t.id);
  return [...temas, ...vetos, "ninguno"];
}

function instrucciones(BOT) {
  const desc = {
    precio:"cuánto cuesta el vehículo",
    cual:"no sabe cuál de los tres elegir, pide recomendación",
    enchufe:"si se enchufa, cómo y dónde se carga, cuánto tarda",
    instalacion:"instalar el cargador en casa, permisos, obra eléctrica",
    consumo:"consumo de gasolina, autonomía, cuánto rinde, ahorro",
    ficha:"potencia, torque, motor, batería, especificaciones técnicas",
    espacio:"tamaño, baúl, puestos, si cabe la familia",
    garantia:"cuánta garantía tiene, cuánto dura la batería",
    servicio:"talleres, mantenimiento, repuestos, dónde lo atienden",
    seguridad:"airbags, frenos, asistencias, qué tan seguro es",
    colores:"en qué colores viene",
    reforma:"la reforma tributaria y si sube el precio",
    devolucion:"devolución del IVA, beneficio tributario, UPME, DIAN",
    picoyplaca:"pico y placa, restricción de circulación, impuesto vehicular",
    seguro:"cuánto cuesta el seguro o la póliza",
    prueba:"quiere probarlo, verlo, visitar la sala, agendar cita",
    credito:"financiación, cuota, tasa, plazo, banco",
    retoma:"entregar su carro usado en parte de pago",
    renting:"renting, arriendo, flota, compra para empresa",
    disponible:"si hay unidades, inventario, cuándo lo entregan",
    marca:"si Dongfeng es confiable, quién responde, quiénes son ustedes",
    reventa:"si se desvaloriza, cuánto vale después",
    comparar:"lo compara con otra marca o modelo",
    humano:"quiere hablar con una persona",
    saludo:"saluda", gracias:"agradece", despedida:"se despide",
    veto_descuento:"pide rebaja, descuento o negociar el precio",
    veto_reclamo:"reclamo, queja, está molesto",
    veto_datos:"quiere dar cédula, cuenta bancaria o hacer un pago por el chat"
  };
  const lista = catalogo(BOT)
    .filter(id => id !== "ninguno")
    .map(id => `- ${id}: ${desc[id] || id}`)
    .join("\n");

  return `Clasificas mensajes de WhatsApp de clientes interesados en carros de una sala de ventas colombiana.

Tu ÚNICA salida es un identificador de esta lista:

${lista}
- ninguno: el mensaje no corresponde a ningún tema de la lista, o no se entiende

Reglas:
- Devuelve exactamente un identificador, sin explicación y sin puntuación.
- El cliente escribe en español coloquial colombiano, con errores y sin tildes.
- Si dudas entre dos, elige el más específico.
- Si no estás seguro, devuelve "ninguno". Prefiero pasar la conversación a un
  asesor humano antes que responder el tema equivocado.
- Nunca inventes un identificador que no esté en la lista.`;
}

/* Devuelve {id, veto} o null. Nunca lanza: si la API falla, el sistema sigue
   con reglas. Un bot caído por un timeout es peor que un bot menos listo. */
async function interpretar(BOT, texto, contexto = {}) {
  if (!activo()) return null;

  const historia = (contexto.hilo || []).slice(-4)
    .map(m => (m.direccion === "entra" ? "Cliente: " : "Bot: ") + m.texto.split("\n")[0])
    .join("\n");

  const cuerpo = {
    model: MODELO,
    max_tokens: 16,
    system: instrucciones(BOT),
    messages: [{
      role: "user",
      content: (historia ? "Contexto de los últimos turnos:\n" + historia + "\n\n" : "") +
               "Mensaje a clasificar:\n" + texto
    }]
  };

  try {
    const ctl = new AbortController();
    const reloj = setTimeout(() => ctl.abort(), 6000);
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": LLAVE,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(cuerpo),
      signal: ctl.signal
    });
    clearTimeout(reloj);
    if (!res.ok) return null;

    const j = await res.json();
    const bruto = (j.content || []).map(c => c.text || "").join("").trim().toLowerCase();
    const id = bruto.replace(/[^a-z_]/g, "");

    if (!catalogo(BOT).includes(id) || id === "ninguno") return null;
    if (id.startsWith("veto_")) return { id: id.slice(5), veto: true };
    return { id, veto: false };
  } catch (e) {
    return null;
  }
}

module.exports = { interpretar, activo, MODELO };
