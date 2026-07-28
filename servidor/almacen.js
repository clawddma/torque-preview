/* ═══════════════════════════════════════════════════════════════════════════
   TORQ — ALMACÉN
   ═══════════════════════════════════════════════════════════════════════════
   Todo lo que pasa por el bot queda escrito. Tres tablas y ninguna más:

   conversaciones · el estado vivo de cada chat (de qué carro habla, qué sabe
                    del cliente, si ya se escaló). Es lo que le da memoria:
                    sin esto el bot saluda igual en el turno 1 y en el 9.
   mensajes       · el registro completo, entrante y saliente. Sirve para dos
                    cosas: pasarle el hilo al asesor cuando escala, y poder
                    responder "¿qué le dijo el bot a este cliente?".
   leads          · los estados que exige el contrato con Corautos:
                    entregado → contactado → agendado → facturado.
                    Sin esta tabla no hay comisión defendible.

   SQLite en un archivo. Sin servidor de base de datos, sin dependencias.
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";
const { DatabaseSync } = require("node:sqlite");
const path = require("path");
const fs = require("fs");

const RUTA = process.env.TORQ_DB || path.join(__dirname, "datos", "torq.db");

fs.mkdirSync(path.dirname(RUTA), { recursive: true });
const db = new DatabaseSync(RUTA);

db.exec(`
CREATE TABLE IF NOT EXISTS conversaciones (
  wa_id       TEXT PRIMARY KEY,
  nombre      TEXT,
  estado      TEXT NOT NULL,          -- el lead del motor, en JSON
  campana     TEXT,
  creado      TEXT NOT NULL,
  actualizado TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mensajes (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  wa_id     TEXT NOT NULL,
  direccion TEXT NOT NULL,            -- entra | sale
  texto     TEXT NOT NULL,
  tema      TEXT,
  escala    TEXT,
  fuente    TEXT,                     -- reglas | interprete | guardarrail
  creado    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_msg_wa ON mensajes(wa_id, id);

CREATE TABLE IF NOT EXISTS leads (
  wa_id      TEXT PRIMARY KEY,
  nombre     TEXT,
  vehiculo   TEXT,
  ciudad     TEXT,
  plazo      TEXT,
  pago       TEXT,
  uso        TEXT,
  carga      TEXT,
  motivo     TEXT,                    -- por qué escaló
  campana    TEXT,
  estado     TEXT NOT NULL DEFAULT 'entregado',
  entregado  TEXT,
  contactado TEXT,
  agendado   TEXT,
  facturado  TEXT,
  creado     TEXT NOT NULL,
  actualizado TEXT NOT NULL
);
`);

const ahora = () => new Date().toISOString();

/* ── conversaciones ────────────────────────────────────────────────────── */

function leerConversacion(waId) {
  const f = db.prepare("SELECT * FROM conversaciones WHERE wa_id=?").get(waId);
  if (!f) return null;
  return { ...f, estado: JSON.parse(f.estado) };
}

function guardarConversacion(waId, estado, nombre, campana) {
  const t = ahora();
  const existe = db.prepare("SELECT wa_id FROM conversaciones WHERE wa_id=?").get(waId);
  if (existe) {
    db.prepare(`UPDATE conversaciones SET estado=?, nombre=COALESCE(?,nombre),
                campana=COALESCE(?,campana), actualizado=? WHERE wa_id=?`)
      .run(JSON.stringify(estado), nombre || null, campana || null, t, waId);
  } else {
    db.prepare(`INSERT INTO conversaciones (wa_id,nombre,estado,campana,creado,actualizado)
                VALUES (?,?,?,?,?,?)`)
      .run(waId, nombre || null, JSON.stringify(estado), campana || null, t, t);
  }
}

/* ── mensajes ──────────────────────────────────────────────────────────── */

function anotarMensaje(waId, direccion, texto, extra = {}) {
  db.prepare(`INSERT INTO mensajes (wa_id,direccion,texto,tema,escala,fuente,creado)
              VALUES (?,?,?,?,?,?,?)`)
    .run(waId, direccion, texto, extra.tema || null, extra.escala || null,
         extra.fuente || null, ahora());
}

/* El hilo que se le manda al asesor cuando escala. Sin esto, el asesor recibe
   un teléfono y nada más, y el cliente tiene que repetir todo. */
function hilo(waId, limite = 40) {
  return db.prepare(`SELECT direccion,texto,creado FROM mensajes
                     WHERE wa_id=? ORDER BY id DESC LIMIT ?`)
    .all(waId, limite).reverse();
}

/* ── leads ─────────────────────────────────────────────────────────────── */

/* Se crea o actualiza cuando la conversación escala. El estado arranca en
   `entregado` con su marca de tiempo: la distancia entre ese sello y el de
   `contactado` es el SLA que se le mide a la sala. */
function registrarLead(waId, lead, motivo, nombre, campana) {
  const t = ahora();
  const existe = db.prepare("SELECT wa_id,estado FROM leads WHERE wa_id=?").get(waId);
  const campos = [lead.vehiculo || null, lead.ciudad || null, lead.plazo || null,
                  lead.pago || null, lead.uso || null, lead.carga || null];
  if (existe) {
    db.prepare(`UPDATE leads SET vehiculo=COALESCE(?,vehiculo), ciudad=COALESCE(?,ciudad),
                plazo=COALESCE(?,plazo), pago=COALESCE(?,pago), uso=COALESCE(?,uso),
                carga=COALESCE(?,carga), motivo=?, nombre=COALESCE(?,nombre),
                actualizado=? WHERE wa_id=?`)
      .run(...campos, motivo || null, nombre || null, t, waId);
    return { nuevo: false };
  }
  db.prepare(`INSERT INTO leads (wa_id,nombre,vehiculo,ciudad,plazo,pago,uso,carga,
              motivo,campana,estado,entregado,creado,actualizado)
              VALUES (?,?,?,?,?,?,?,?,?,?,'entregado',?,?,?)`)
    .run(waId, nombre || null, ...campos, motivo || null, campana || null, t, t, t);
  return { nuevo: true };
}

function avanzarLead(waId, estado) {
  const validos = ["entregado", "contactado", "agendado", "facturado", "no_califica"];
  if (!validos.includes(estado)) throw new Error("estado inválido: " + estado);
  const col = { contactado: "contactado", agendado: "agendado", facturado: "facturado" }[estado];
  const t = ahora();
  if (col) db.prepare(`UPDATE leads SET estado=?, ${col}=COALESCE(${col},?), actualizado=? WHERE wa_id=?`)
             .run(estado, t, t, waId);
  else db.prepare("UPDATE leads SET estado=?, actualizado=? WHERE wa_id=?").run(estado, t, waId);
}

function listarLeads(limite = 200) {
  return db.prepare("SELECT * FROM leads ORDER BY creado DESC LIMIT ?").all(limite);
}

/* ── idempotencia ──────────────────────────────────────────────────────────
   Meta reintenta el mismo webhook si no le respondemos rápido. Sin esto, el
   cliente recibe la misma respuesta dos y tres veces. */
db.exec(`CREATE TABLE IF NOT EXISTS vistos (id TEXT PRIMARY KEY, creado TEXT NOT NULL)`);

function yaVisto(idMensaje) {
  if (!idMensaje) return false;
  const hay = db.prepare("SELECT id FROM vistos WHERE id=?").get(idMensaje);
  if (hay) return true;
  db.prepare("INSERT INTO vistos (id,creado) VALUES (?,?)").run(idMensaje, ahora());
  return false;
}

module.exports = {
  db, RUTA,
  leerConversacion, guardarConversacion,
  anotarMensaje, hilo,
  registrarLead, avanzarLead, listarLeads,
  yaVisto
};
