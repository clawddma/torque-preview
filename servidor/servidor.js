/* ═══════════════════════════════════════════════════════════════════════════
   TORQ — SERVIDOR
   ═══════════════════════════════════════════════════════════════════════════
   El cuerpo del bot. Recibe los mensajes que Meta empuja desde WhatsApp, los
   pasa por el motor, contesta y guarda todo.

   El orden de cada mensaje entrante, y por qué ese orden:

     1. Firma      · si no viene firmado por Meta, no existe. Sin esto,
                     cualquiera con la URL le hace decir lo que quiera.
     2. Repetido   · Meta reintenta si tardamos. Sin control, el cliente
                     recibe la misma respuesta tres veces.
     3. Memoria    · se recupera el estado de esa conversación.
     4. Reglas     · el motor. Los vetos ganan siempre.
     5. Intérprete · solo si las reglas no entendieron, y solo para elegir
                     tema. El texto nunca lo escribe el modelo.
     6. Responder  · se envía por la API de WhatsApp.
     7. Escalar    · si toca humano: se registra el lead y se avisa por
                     Telegram con el hilo completo.

   Nada de esto vive en la misma máquina que los bots de trading. Es un
   servicio de cara al cliente: va en su propio contenedor.
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

const http = require("http");
const crypto = require("crypto");
const path = require("path");

const BOT = require(path.join(__dirname, "..", "bot-motor.js"));
const almacen = require("./almacen.js");
const { interpretar, activo: interpreteActivo, MODELO } = require("./interprete.js");

const CFG = {
  puerto:   parseInt(process.env.PORT || "8787", 10),
  token:    process.env.WA_TOKEN || "",          // token permanente de Meta
  telefono: process.env.WA_PHONE_ID || "",       // id del número emisor
  verificar:process.env.WA_VERIFY || "torq",     // clave del webhook
  secreto:  process.env.WA_APP_SECRET || "",     // para validar la firma
  asesor:   process.env.WA_ASESOR || "",         // WhatsApp del asesor: aquí llegan los avisos
  plantilla:process.env.WA_PLANTILLA_AVISO || "", // plantilla aprobada, para avisar a cualquier hora
  tgToken:  process.env.TG_TOKEN || "",          // respaldo opcional
  tgChat:   process.env.TG_CHAT || "",
  sitio:    process.env.TORQ_SITIO || "https://clawddma.github.io/torque-preview/"
};

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

/* ═══ SALIDA HACIA WHATSAPP ══════════════════════════════════════════════════
   Se aísla en una función para poder sustituirla en las pruebas: el probador
   local corre el sistema completo sin tocar la red ni la cuenta real. */
let enviar = async function (waId, texto) {
  if (!CFG.token || !CFG.telefono) { log("SIN CREDENCIALES · no se envió a", waId); return false }
  const res = await fetch(`https://graph.facebook.com/v21.0/${CFG.telefono}/messages`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer " + CFG.token },
    body: JSON.stringify({
      messaging_product: "whatsapp", to: waId,
      type: "text", text: { preview_url: false, body: texto }
    })
  });
  if (!res.ok) log("ERROR al enviar:", res.status, (await res.text()).slice(0, 200));
  return res.ok;
};
const usarEnvio = (fn) => { enviar = fn };

/* ═══ AVISO DE ESCALADA ══════════════════════════════════════════════════════
   EL CLIENTE HABLA POR WHATSAPP Y SOLO POR WHATSAPP. Esto es otra cosa: es el
   aviso que recibe el ASESOR cuando una conversación necesita a un humano.

   Por defecto también va por WhatsApp, al número del asesor. Hay una regla de
   Meta que conviene saber: a un número que no te ha escrito en las últimas 24
   horas solo se le puede mandar una PLANTILLA aprobada. Por eso:

     · si hay plantilla configurada (WA_PLANTILLA_AVISO) → se usa y llega
       siempre, a cualquier hora;
     · si no, se manda texto plano, que funciona mientras el asesor haya
       escrito al bot en las últimas 24 h;
     · Telegram queda como respaldo opcional, para el caso de que Meta
       rechace o demore la plantilla. Es un canal de respaldo, no el principal.

   El asesor recibe el hilo completo, no un teléfono suelto: si le llega solo el
   número, el cliente tiene que repetir todo y la conversación se enfría. */
async function avisar(waId, motivo, lead, nombre) {
  const conv = almacen.hilo(waId, 20)
    .map(m => (m.direccion === "entra" ? "▸ " : "  ") + m.texto.split("\n")[0].slice(0, 110))
    .join("\n");

  const texto =
`🔔 LEAD PARA ATENDER — ${BOT.ESC[motivo] || motivo}

${nombre ? nombre + " · " : ""}wa.me/${waId}

Vehículo: ${BOT.VEH[lead.vehiculo] ? BOT.VEH[lead.vehiculo].nombre : "—"}
Ciudad: ${lead.ciudad || "—"}   ·   Compra: ${lead.plazo || "—"}
Pago: ${lead.pago || "—"}   ·   Carga en casa: ${lead.carga || "—"}
Temas: ${lead.interes.join(", ") || "—"}

Conversación:
${conv}`;

  let llegó = false;

  /* 1 · WhatsApp del asesor — el canal principal */
  if (CFG.asesor) {
    if (CFG.plantilla && CFG.token && CFG.telefono) {
      try {
        const res = await fetch(`https://graph.facebook.com/v21.0/${CFG.telefono}/messages`, {
          method: "POST",
          headers: { "content-type": "application/json", authorization: "Bearer " + CFG.token },
          body: JSON.stringify({
            messaging_product: "whatsapp", to: CFG.asesor, type: "template",
            template: { name: CFG.plantilla, language: { code: "es" },
              components: [{ type: "body", parameters: [
                { type: "text", text: (nombre || "Un cliente").slice(0, 60) },
                { type: "text", text: (BOT.ESC[motivo] || motivo).slice(0, 120) },
                { type: "text", text: waId }
              ]}]}
          })
        });
        llegó = res.ok;
        if (!res.ok) log("plantilla rechazada:", res.status, (await res.text()).slice(0, 160));
      } catch (e) { log("no se pudo avisar por plantilla:", e.message) }
    }
    /* sin plantilla: texto plano. Llega si el asesor escribió al bot en las
       últimas 24 h. Se intenta igual — si falla, queda el respaldo. */
    if (!llegó) llegó = await enviar(CFG.asesor, texto);
  }

  /* 2 · Telegram — respaldo, solo si el aviso por WhatsApp no salió */
  if (!llegó && CFG.tgToken && CFG.tgChat) {
    try {
      await fetch(`https://api.telegram.org/bot${CFG.tgToken}/sendMessage`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: CFG.tgChat, text: texto, disable_web_page_preview: true })
      });
      llegó = true;
    } catch (e) { log("respaldo Telegram falló:", e.message) }
  }

  if (!llegó) log("AVISO (sin canal configurado):\n" + texto);
}

/* Aviso del segundo negocio. Va aparte del de escalada porque no lo atiende
   la misma persona: el lead del carro va a la sala; el del seguro o el del
   cargador, al aliado correspondiente. */
async function avisarSecundario(waId, ls, lead, nombre) {
  const datos = Object.keys(ls.datos || {})
    .map(k => "· " + k + ": " + ls.datos[k]).join("\n");
  const texto =
`💼 LEAD NUEVO — ${ls.etiqueta}

${nombre ? nombre + " · " : ""}wa.me/${waId}

Vehículo: ${BOT.VEH[lead.vehiculo] ? BOT.VEH[lead.vehiculo].nombre : "—"}
Ciudad: ${lead.ciudad || "—"}

Lo que contestó:
${datos || "—"}

(Sale de la misma conversación del carro, que sigue abierta.)`;

  if (CFG.asesor) { if (await enviar(CFG.asesor, texto)) return }
  if (CFG.tgToken && CFG.tgChat) {
    try {
      await fetch(`https://api.telegram.org/bot${CFG.tgToken}/sendMessage`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: CFG.tgChat, text: texto, disable_web_page_preview: true })
      });
      return;
    } catch (e) {}
  }
  log("LEAD SECUNDARIO (sin canal configurado):\n" + texto);
}

/* ═══ EL TURNO ═══════════════════════════════════════════════════════════════ */
async function atender(waId, texto, nombre, campana) {
  /* 3 · memoria */
  const guardado = almacen.leerConversacion(waId);
  const ses = BOT.crearSesion(guardado ? guardado.estado.vehiculo : "mage");
  if (guardado) {
    Object.assign(ses.lead, guardado.estado);
    /* Estos dos NO son parte del lead, son del hilo — y olvidarlos costaba
       caro: como la sesión se rearma en cada mensaje, el contador de "no
       entendí" volvía a cero siempre y el bot nunca llegaba a los tres
       intentos. Un cliente confundido se quedaba dando vueltas para siempre
       sin que nadie lo rescatara. Lo mismo con el empujón: se repetía. */
    ses.fallos   = guardado.estado._fallos   || 0;
    ses.empujado = !!guardado.estado._empujado;
    /* la cotización a medio hacer también es del hilo, no del lead: sin esto
       el cliente contesta "26 a 40" y el bot no sabe qué le preguntó */
    ses.sub      = guardado.estado._sub || null;
    delete ses.lead._fallos; delete ses.lead._empujado; delete ses.lead._sub;
  }

  almacen.anotarMensaje(waId, "entra", texto);

  const primera = !guardado;
  const salidas = [];

  /* Primer contacto: el bot se presenta antes de responder. Nadie escribe a un
     número desconocido y recibe un dato suelto sin saber con quién habla. */
  if (primera) salidas.push({ texto: ses.saludo(), fuente: "saludo" });

  /* 4 · reglas */
  let o = ses.responder(texto);
  let fuente = o.entendido ? "reglas" : "ninguna";

  /* 5 · intérprete: solo si las reglas fallaron */
  if (!o.entendido && interpreteActivo()) {
    const idea = await interpretar(BOT, texto, { hilo: almacen.hilo(waId, 6) });
    if (idea) {
      /* se rebobina el turno: el fallo anterior no debe contar contra los tres
         intentos, porque en realidad sí se entendió */
      ses.fallos = Math.max(0, ses.fallos - 1);
      ses.lead.turnos--;
      o = ses.responder(texto, { tema: idea.id });
      fuente = "interprete";
    }
  }

  if (o.texto) salidas.push({ texto: o.texto, fuente, tema: o.tema, escala: o.escala });
  if (o.empujon) salidas.push({ texto: o.empujon, fuente: "empujon" });

  /* 6 · responder */
  for (const s of salidas) {
    await enviar(waId, s.texto);
    almacen.anotarMensaje(waId, "sale", s.texto,
      { tema: s.tema, escala: s.escala, fuente: s.fuente });
  }

  almacen.guardarConversacion(waId,
    Object.assign({}, ses.lead, { _fallos: ses.fallos, _empujado: ses.empujado, _sub: ses.sub }),
    nombre, campana);

  /* 7a · el segundo negocio de la misma conversación.
     No es una escalada: el cliente sigue hablando con el bot del carro. Es un
     lead aparte —seguro, instalación de cargador— que se le entrega a otro
     aliado y se cobra distinto, así que lleva su propio ciclo de estados. */
  if (o.leadSecundario) {
    const ls = o.leadSecundario;
    almacen.registrarLeadSecundario(waId, ls.tipo, ls.etiqueta, ls.datos, ses.lead, nombre, campana);
    await avisarSecundario(waId, ls, ses.lead, nombre);
    log(`lead secundario ${ls.tipo} · ${waId}`);
  }

  /* 7b · escalar */
  if (o.escala) {
    const r = almacen.registrarLead(waId, ses.lead, o.escala, nombre, campana);
    await avisar(waId, o.escala, ses.lead, nombre);
    log(`escala ${o.escala} · ${waId} · lead ${r.nuevo ? "nuevo" : "actualizado"}`);
  }

  return { salidas, out: o, lead: ses.lead };
}

/* ═══ FIRMA ══════════════════════════════════════════════════════════════════ */
function firmaValida(crudo, cabecera) {
  if (!CFG.secreto) return true;               // en pruebas locales, sin secreto
  if (!cabecera) return false;
  const mia = "sha256=" + crypto.createHmac("sha256", CFG.secreto).update(crudo).digest("hex");
  const a = Buffer.from(mia), b = Buffer.from(cabecera);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* ═══ SERVIDOR HTTP ══════════════════════════════════════════════════════════ */
function crearServidor() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, "http://x");

    /* Meta verifica el webhook una vez, con un GET */
    if (req.method === "GET" && url.pathname === "/webhook") {
      const reto = url.searchParams.get("hub.challenge");
      const ok = url.searchParams.get("hub.verify_token") === CFG.verificar;
      res.writeHead(ok ? 200 : 403, { "content-type": "text/plain" });
      return res.end(ok ? reto : "no");
    }

    if (req.method === "GET" && url.pathname === "/salud") {
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({
        ok: true,
        credenciales: !!(CFG.token && CFG.telefono),
        interprete: interpreteActivo() ? MODELO : "apagado (solo reglas)",
        avisos: !!(CFG.tgToken && CFG.tgChat),
        leads: almacen.listarLeads(1).length
      }));
    }

    if (req.method === "POST" && url.pathname === "/webhook") {
      let crudo = "";
      req.on("data", c => { crudo += c; if (crudo.length > 1e6) req.destroy() });
      req.on("end", async () => {
        /* 1 · firma */
        if (!firmaValida(crudo, req.headers["x-hub-signature-256"])) {
          log("firma inválida — se descarta");
          res.writeHead(401); return res.end();
        }
        /* A Meta se le responde YA. Si tardamos, reintenta y el cliente recibe
           la respuesta repetida. El trabajo real sigue después. */
        res.writeHead(200); res.end();

        let cuerpo;
        try { cuerpo = JSON.parse(crudo) } catch { return }

        for (const entrada of cuerpo.entry || []) {
          for (const cambio of entrada.changes || []) {
            const val = cambio.value || {};
            const perfil = (val.contacts || [])[0] || {};
            for (const m of val.messages || []) {
              /* 2 · repetido */
              if (almacen.yaVisto(m.id)) { log("repetido, se ignora:", m.id); continue }

              const waId = m.from;
              const nombre = (perfil.profile || {}).name || null;

              if (m.type !== "text") {
                await enviar(waId, "Por ahora solo puedo leer mensajes de texto.\n\nEscríbeme tu pregunta y te respondo, o dime «asesor» y te paso con una persona.");
                continue;
              }
              const texto = (m.text || {}).body || "";
              /* el código de campaña viaja en el primer mensaje que arma el
                 calificador del sitio: "— ref BOG-MAGE-01" */
              const ref = texto.match(/—\s*ref\s+([\w-]+)/i);
              try {
                await atender(waId, texto, nombre, ref ? ref[1] : null);
              } catch (e) {
                log("ERROR atendiendo", waId, e.stack);
                await enviar(waId, "Se me cruzaron los cables un segundo. ¿Me repites la pregunta?");
              }
            }
          }
        }
      });
      return;
    }

    res.writeHead(404); res.end();
  });
}

if (require.main === module) {
  crearServidor().listen(CFG.puerto, () => {
    log(`TORQ escuchando en :${CFG.puerto}`);
    log(`base de datos: ${almacen.RUTA}`);
    log(`credenciales WhatsApp: ${CFG.token && CFG.telefono ? "sí" : "NO — no podrá responder"}`);
    log(`intérprete: ${interpreteActivo() ? MODELO : "apagado (solo reglas)"}`);
    log(`avisos de escalada: ${CFG.tgToken && CFG.tgChat ? "Telegram" : "solo consola"}`);
  });
}

module.exports = { crearServidor, atender, usarEnvio, CFG };
