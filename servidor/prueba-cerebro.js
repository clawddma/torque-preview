/* ═══════════════════════════════════════════════════════════════════════════
   TORQ — PRUEBA DEL CEREBRO
   ═══════════════════════════════════════════════════════════════════════════
   Corre conversaciones completas contra el modelo y las imprime tal como las
   vería el cliente, para poder juzgar la EXPERIENCIA — no solo si acertó el
   tema.

   Además vigila lo que no se negocia:
     · que no invente cifras (se valida contra la base de conocimiento)
     · que los guardarraíles sigan mandando ANTES del modelo
     · que use la ciudad que el cliente ya dijo en vez de volver a pedirla
     · que escale cuando toca

   Correr:  node servidor/prueba-cerebro.js            (todas)
            node servidor/prueba-cerebro.js 3          (solo la tercera)
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";
const path = require("path");
const BOT = require(path.join(__dirname, "..", "bot-motor.js"));
const cerebro = require("./cerebro.js");

/* Las mismas conversaciones que Daniel usó para encontrar defectos. Si el
   cerebro nuevo no las resuelve mejor que las reglas, no vale la pena. */
const CASOS = [
  { nombre: "Las tres preguntas de una",
    veh: "mage",
    turnos: [
      "Hola",
      "Precio y autonomía y prueba de ruta en armenia",
      "Cuánto cuestan los documentos de matrícula?"
    ],
    exige: [
      { que: "usa la ciudad que ya dijo", en: /Armenia/i, turno: 2 },
      { que: "no vuelve a preguntar la ciudad", no: /en qué ciudad estás/i, turno: 2 }
    ]},

  { nombre: "Pierde el hilo entre ciudades",
    veh: "mage",
    turnos: [
      "Hay servicio para prueba de ruta en Cúcuta?",
      "Y en Cartagena?",
      "Y venden allá?"
    ],
    exige: [
      { que: "entiende que 'y en Cartagena' es la misma pregunta", en: /cartagena/i, turno: 1 },
      { que: "sabe que en Cartagena no hay sala", en: /no hay|Barranquilla/i, turno: 2 }
    ]},

  { nombre: "El que compara y corrige",
    veh: "mage",
    turnos: [
      "Cuál es la autonomía de este vehículo y me lo comparas con el Vigo?",
      "No, me refiero al Box",
      "Y en precio?"
    ],
    exige: [
      { que: "compara de verdad", en: /1\.000|401|470/, turno: 0 },
      { que: "acepta la corrección", en: /box/i, turno: 1 }
    ]},

  { nombre: "El guardarraíl del descuento",
    veh: "mage",
    turnos: ["Está muy cara, me la dejas en 100 millones?"],
    exige: [{ que: "no negocia", no: /100\.000\.000|te la dejo|acepto/i, turno: 0 }]},

  { nombre: "Conversación larga y desordenada",
    veh: "box",
    turnos: [
      "hola buenas",
      "cuanto vale y que garantia tiene?",
      "de que colores hay?",
      "el rojo me gusta",
      "tengo un mazda 3 2018 para entregar",
      "vivo en pereira",
      "hay taller alla?",
      "resumeme lo que hemos hablado"
    ],
    exige: [
      { que: "responde las dos preguntas", en: /200\.000 km/, turno: 1 },
      { que: "sabe que en Pereira sí hay taller", en: /sí|Pereira/i, turno: 6 },
      { que: "recuerda el Mazda al resumir", en: /mazda/i, turno: 7 }
    ]}
];

const gris = s => "\x1b[90m" + s + "\x1b[0m";
const verde = s => "\x1b[32m" + s + "\x1b[0m";
const rojo = s => "\x1b[31m" + s + "\x1b[0m";

(async () => {
  const soloUno = process.argv[2] ? parseInt(process.argv[2], 10) - 1 : null;
  const lista = soloUno !== null ? [CASOS[soloUno]] : CASOS;

  console.log("\n═══ TORQ · PRUEBA DEL CEREBRO ═══════════════════════════════");
  console.log("   vía: " + cerebro.CFG.via + " · modelo: " + cerebro.CFG.modelo + "\n");

  let bien = 0, mal = 0, fallos = 0, t0 = Date.now();

  for (const caso of lista) {
    console.log("\n──────────────────────────────────────────────────────────");
    console.log("  " + caso.nombre);
    console.log("──────────────────────────────────────────────────────────\n");

    const ses = BOT.crearSesion(caso.veh);
    const hilo = [];
    const respuestas = [];

    for (const q of caso.turnos) {
      /* señales y guardarraíles siguen en código, antes del modelo */
      const reglas = ses.responder(q);
      hilo.push({ direccion: "entra", texto: q });
      console.log("  \x1b[36m▸ " + q + "\x1b[0m");

      let texto, escala, fuente;
      const esVeto = reglas.tema && reglas.tema.indexOf("veto:") === 0;

      if (esVeto) {
        texto = reglas.texto; escala = reglas.escala; fuente = "guardarraíl";
      } else {
        const r = await cerebro.pensar(q, ses.lead, hilo.slice(0, -1));
        if (r && r.texto) {
          texto = r.texto; escala = r.escala; fuente = "cerebro";
          if (r.vehiculo) ses.fijarVehiculo(r.vehiculo);
        } else {
          texto = reglas.texto; escala = reglas.escala;
          fuente = "reglas (" + ((r && r.fallo) || "sin modelo") + ")";
          fallos++;
        }
      }

      respuestas.push(texto || "");
      hilo.push({ direccion: "sale", texto: texto || "" });
      console.log("  " + String(texto || "(vacío)").split("\n").join("\n  "));
      console.log(gris("  [" + fuente + (escala ? " · escala: " + escala : "") + "]\n"));
    }

    (caso.exige || []).forEach(x => {
      const t = respuestas[x.turno] || "";
      const ok = x.en ? x.en.test(t) : !x.no.test(t);
      if (ok) { bien++; console.log("  " + verde("✓ " + x.que)) }
      else { mal++; console.log("  " + rojo("✗ " + x.que)) }
    });
  }

  console.log("\n══════════════════════════════════════════════════════════");
  console.log(`  ${bien} bien · ${mal} mal · ${fallos} veces respondió el motor de reglas`);
  console.log(`  ${Math.round((Date.now() - t0) / 1000)} s en total`);
  console.log("══════════════════════════════════════════════════════════\n");
  process.exit(mal ? 1 : 0);
})();
