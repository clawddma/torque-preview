/* ═══════════════════════════════════════════════════════════════════════════
   TORQ — LA BASE DE CONOCIMIENTO
   ═══════════════════════════════════════════════════════════════════════════
   Todo lo que el bot puede afirmar, en un solo documento, armado a partir de
   `bot-motor.js`. No hay datos escritos a mano aquí: si mañana cambia un
   precio en el motor, cambia aquí solo.

   Existe porque el bot cambia de cerebro. Hasta hoy entendía por palabras
   clave y eso llegó a su techo: el español tiene infinitas formas de
   preguntar lo mismo y cada arreglo era un parche a una palabra. Ahora un
   modelo lee ESTE documento y responde razonando sobre él.

   La distinción que sostiene todo el diseño:

       el modelo NO SABE — el modelo ENTIENDE Y REDACTA.

   Cada cifra que sale en una respuesta tiene que estar aquí. Lo que no está
   aquí, no existe, y el bot lo dice o escala. Un modelo suelto inventa
   precios; un modelo con esta base y con validación de cifras, no puede.
   ═══════════════════════════════════════════════════════════════════════════ */
(function (global) {
"use strict";

var BOT = (typeof require !== "undefined") ? require("./bot-motor.js") : global.TORQBOT;

/* ═══ 1 · LOS HECHOS, EN PROSA ═════════════════════════════════════════════
   Se escribe en el formato que mejor lee un modelo: encabezados cortos,
   datos en líneas sueltas, sin adornos. */
function fichaVehiculo(id){
  var v = BOT.VEH[id], L = [];
  L.push("### " + v.largo + " (" + v.clase + ")");
  L.push("Se le dice: " + v.nombre + ". Artículo: " + v.art + " " + v.nombre + ".");
  L.push("Precio desde: " + v.precio + " con IVA incluido, SIN gastos de matrícula.");
  if (v.versiones) {
    L.push("Versiones:");
    v.versiones.forEach(function (x) {
      L.push("  - " + v.nombre + " " + x.n + ": " + x.precio + " · " + x.autonomia +
             " · batería " + x.bateria + " · carga rápida " + x.carga +
             (x.extra ? " · suma " + x.extra : ""));
    });
  }
  L.push("Autonomía: " + v.autonomia);
  L.push("Motor: " + v.motor);
  L.push("Batería: " + v.bateria);
  if (v.carga) L.push("Carga rápida: " + v.carga);
  if (v.tec === "hibrido") L.push("NO SE ENCHUFA NUNCA. Híbrido autorecargable: se carga solo andando. Consumo: " + v.consumo);
  else L.push("100% eléctrico. Se carga en casa o en carga rápida. No consume gasolina.");
  L.push("Baúl: " + v.baul);
  if (v.medidas) L.push("Medidas: " + v.medidas);
  if (v.colores) L.push("Colores: " + v.colores);
  L.push("Página: " + v.url);
  return L.join("\n");
}

function cobertura(){
  var L = ["### Cobertura de Corautos en Colombia"];
  L.push("22 puntos de venta · 26 talleres de servicio técnico · más de 100 puntos de repuestos.");
  ["servicio","venta"].forEach(function(k){
    var c = BOT.COBERTURA && BOT.COBERTURA[k];
    if(!c || !c.ciudades) return;
    L.push("Ciudades CON " + c.nombre + ": " + c.ciudades.join(", ") + ".");
    if (c.cercana) Object.keys(c.cercana).forEach(function(x){
      L.push("En " + x + " NO hay " + c.nombre + "; el más cercano está en " + c.cercana[x] + ".");
    });
  });
  L.push("Prueba de ruta: NO sabemos en cuáles salas hay unidad de demostración. Nunca afirmar que la hay en una ciudad concreta.");
  L.push("Cualquier ciudad que no esté en las listas de arriba: NO tiene ese servicio. Decirlo de frente para que el cliente no se desplace en vano.");
  return L.join("\n");
}

function comunes(){
  return ["### Válido para los tres vehículos",
    "Garantía: " + BOT.COMUN.garantia,
    "Red: " + BOT.COMUN.red,
    "Seguridad: " + BOT.COMUN.seguridad,
    "Conducción asistida nivel 2 (frenado de emergencia, crucero adaptativo, carril, punto ciego, 360°). La dotación exacta cambia por versión.",
    "Los precios NO incluyen gastos de matrícula: los derechos de tránsito los fija cada municipio, más SOAT y placas.",
    "Hoy los híbridos pagan 5% de IVA. El 22 de julio de 2026 se radicó un proyecto que lo subiría a 19%: está RADICADO, no aprobado."
  ].join("\n");
}

function competencia(){
  return ["### Contra la competencia (cifras verificadas)",
    "MAGE $109.000.000 / 288 hp · Corolla Cross híbrida $136.200.000 / 122 hp · Sportage Zenith híbrido $176.990.000 / 231 hp · Territory Trend híbrida $148.990.000 / 240 hp.",
    "Box $69.990.000 / 43,89 kWh / 430 km · BYD Seagull $76.990.000 / 30,08 kWh / 310 km · MG4 EV Urban $74.990.000 / 42,8 kWh.",
    "Vigo · Kia EV2 Air $89.990.000 / 42,2 kWh / 362 L de baúl · Geely EX5 SE $92.990.000 / 49,52 kWh.",
    "Dongfeng creció 217% en matrículas en Colombia en el primer semestre de 2026. Lo representa Corautos Andino, del grupo Colombiana de Comercio (Corbeta), el mismo de Foton."
  ].join("\n");
}

/* ═══ 2 · LO QUE NO SE RESPONDE NUNCA ══════════════════════════════════════
   Se le dice al modelo, pero además se evalúa en código ANTES de llamarlo:
   una petición de descuento no llega al modelo. Esto es el cinturón; el
   código es el tirante. */
function limites(){
  var L = ["### Prohibido — se pasa a un asesor humano"];
  Object.keys(BOT.ESC).forEach(function (k) { L.push("- " + k + ": " + BOT.ESC[k]); });
  L.push("");
  L.push("Nunca: dar un descuento o negociar · dar una tasa o aprobar crédito · prometer una fecha de entrega ·");
  L.push("dar por hecho la devolución del IVA · afirmar pico y placa o impuesto vehicular de una ciudad ·");
  L.push("cotizar un seguro o una póliza · dar un avalúo de retoma · pedir cédula, cuenta o pago ·");
  L.push("decir una cifra que no esté en este documento.");
  return L.join("\n");
}

/* ═══ 3 · CÓMO HABLA ═══════════════════════════════════════════════════════
   Sale de las correcciones que ha ido haciendo Daniel probando el bot. Cada
   línea aquí costó un reporte. */
var ESTILO = [
"### Cómo responder",
"Eres el asesor digital de TORQ, comercializador autorizado de Corautos Andino (Dongfeng) en Colombia.",
"Hablas por WhatsApp con alguien que está pensando comprar un carro. Tu trabajo NO es vender: es",
"resolverle todo lo que pueda resolverse con datos ciertos y llevarlo a un asesor cuando toca.",
"",
"- Español colombiano, de tú. Cálido y directo, nunca de ventanilla ni acartonado.",
"- CORTO. Dos o tres frases por idea. En WhatsApp un mensaje largo no se lee.",
"- Si te hacen varias preguntas, respóndelas TODAS, en el orden en que las escribieron.",
"- Cierra con UNA sola pregunta al final del mensaje. Nunca con tres.",
"- No ofrezcas comparar con otros carros ni con la competencia a quien ya preguntó por uno:",
"  lo distrae de decidirse. Compara solo si te lo piden.",
"- Nunca repitas una pregunta que el cliente ya respondió. Si dijo su ciudad, úsala.",
"- Si el cliente corrige algo ('no, me refiero al Box'), acepta la corrección y sigue por ahí.",
"- Si dice 'y en Cartagena?' después de una pregunta, es LA MISMA pregunta con otra ciudad.",
"- Cuando no sepas algo, dilo sin rodeos y pasa a un asesor. Nunca rellenes con algo que suene bien.",
"- Formato WhatsApp: negrita con UN asterisco. Nunca dos. Sin markdown de títulos ni listas numeradas largas.",
"- No uses emojis salvo un saludo ocasional.",
""
].join("\n");

/* ═══ 4 · EL DOCUMENTO COMPLETO ════════════════════════════════════════════ */
function documento(){
  return [
    ESTILO,
    "## Los tres vehículos",
    BOT.ORDEN.map(fichaVehiculo).join("\n\n"),
    comunes(),
    cobertura(),
    competencia(),
    limites()
  ].join("\n\n");
}

/* ═══ 5 · LAS CIFRAS QUE PUEDEN APARECER ═══════════════════════════════════
   Se extraen del documento para poder revisar que el modelo no invente una.
   Es la red de seguridad: si una respuesta trae un número de pesos, de km o
   de kWh que no está aquí, la respuesta se descarta. */
function cifrasPermitidas(){
  var texto = documento();
  var set = {};
  (texto.match(/\$[\d.]+|\b\d[\d.,]*\s*(?:km|kWh|hp|Nm|L|litros|años|minutos|%)\b/gi) || [])
    .forEach(function (x) { set[x.toLowerCase().replace(/\s+/g," ").trim()] = 1 });
  return set;
}

var API = { documento:documento, cifrasPermitidas:cifrasPermitidas, ESTILO:ESTILO };
if (typeof module !== "undefined" && module.exports) module.exports = API;
else global.TORQCONOCIMIENTO = API;

})(typeof window !== "undefined" ? window : this);
