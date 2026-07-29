/* ═══════════════════════════════════════════════════════════════════════════
   TORQ — SIMULACIÓN DE USABILIDAD
   ═══════════════════════════════════════════════════════════════════════════
   Clientes falsos que conversan solos contra el motor real, para ver dónde
   falla ANTES de que falle con un cliente de verdad.

   Cada persona es una conversación completa, escrita como la escribiría alguien
   en WhatsApp: con errores, sin tildes, en desorden. Cada turno declara qué
   DEBERÍA pasar. El probador compara y saca la cuenta.

   `espera` puede ser:
     "precio"            → debe reconocer ese tema
     "veto:descuento"    → debe activarse ese guardarraíl
     "escala:credito"    → debe escalar por ese motivo
     null                → NO debería entender (y está bien que no entienda)

   Correr:  node bot-sim.js
   O desde bot.html con el botón "Correr simulación".
   ═══════════════════════════════════════════════════════════════════════════ */
(function (global) {
"use strict";

var PERSONAS = [

 {nombre:"Marcela · compra de una",
  perfil:"Sabe lo que quiere, tiene la plata, va directo al grano.",
  veh:"mage",
  turnos:[
    {q:"buenas tardes, cuanto cuesta la mage?", espera:"precio"},
    {q:"y se enchufa o no", espera:"enchufe"},
    {q:"cuanto gasta de gasolina", espera:"consumo"},
    {q:"estoy en medellin, la quiero este mes", espera:"disponible"},
    {q:"listo, quiero verla", espera:"escala:agenda"}
  ]},

 {nombre:"Javier · el que regatea",
  perfil:"Todo lo lleva a precio. Prueba el guardarraíl de descuento.",
  veh:"mage",
  turnos:[
    {q:"hola, precio de la mage", espera:"precio"},
    {q:"esta muy cara, me la dejas en 100?", espera:"veto:descuento"},
    {q:"ni un descuentico?", espera:"veto:descuento"}
  ]},

 {nombre:"Luz Dary · vive en apartamento",
  perfil:"Le gustó un eléctrico pero parquea en la calle. El caso donde el bot debe redirigir a la híbrida.",
  veh:"box",
  turnos:[
    {q:"hola me interesa el box", espera:"presenta"},
    {q:"donde lo cargo? yo parqueo en la calle, no tengo parqueadero", espera:"enchufe"},
    {q:"entonces cual me conviene", espera:"cual", contiene:"MAGE"},
    {q:"la hibrida como es", espera:"presenta"},
    {q:"cuanto vale", espera:"precio", contiene:"MAGE"}
  ]},

 {nombre:"Andrés · familia de cinco",
  perfil:"Pregunta por espacio y seguridad. Es el perfil del Vigo.",
  veh:"vigo",
  turnos:[
    {q:"buenas, tengo dos hijos y necesito espacio, cabe el coche del bebe?", espera:"espacio"},
    {q:"que tan segura es", espera:"seguridad"},
    {q:"cuantos kilometros hace con una carga", espera:"consumo"},
    {q:"en cuanto sale", espera:"precio"}
  ]},

 {nombre:"Camilo · el escéptico de la marca",
  perfil:"Desconfía de lo chino. Pregunta reventa y respaldo.",
  veh:"mage",
  turnos:[
    {q:"esa marca dongfeng es confiable? nunca la habia oido", espera:"marca"},
    {q:"y si se van del pais quien me responde", espera:"marca"},
    {q:"eso despues no se vende, se desvaloriza mucho", espera:"reventa"},
    {q:"donde le hago el mantenimiento en bucaramanga", espera:"servicio"}
  ]},

 {nombre:"Patricia · quiere financiar",
  perfil:"Todo su interés es la cuota. Debe escalar a crédito.",
  veh:"vigo",
  turnos:[
    {q:"hola, se puede financiar?", espera:"escala:credito"},
    {q:"a cuantos meses y con que tasa", espera:"escala:credito"}
  ]},

 {nombre:"Hernán · tiene carro para entregar",
  perfil:"Retoma. El avalúo es presencial, debe escalar.",
  veh:"mage",
  turnos:[
    {q:"reciben mi carro en parte de pago?", espera:"escala:retoma"},
    {q:"tengo una duster 2019", espera:null}
  ]},

 {nombre:"Sandra · empresa con flota",
  perfil:"Compra corporativa. Renting no está modelado, debe escalar.",
  veh:"box",
  turnos:[
    {q:"buenos dias, somos una empresa y necesitamos 8 unidades", espera:"escala:renting"},
    {q:"se puede en renting?", espera:"escala:renting"}
  ]},

 {nombre:"Fernando · el del IVA",
  perfil:"Viene por el beneficio tributario. Terreno donde el bot NO puede prometer.",
  veh:"mage",
  turnos:[
    {q:"es verdad que devuelven el iva?", espera:"escala:tributario"},
    {q:"y si sube la reforma que pasa con el precio", espera:"reforma"}
  ]},

 {nombre:"Diana · pregunta de pico y placa",
  perfil:"La pregunta que más se hace en Bogotá y donde es más fácil mentir.",
  veh:"vigo",
  turnos:[
    {q:"los electricos tienen pico y placa en bogota?", espera:"escala:normativo"},
    {q:"y el impuesto de rodamiento es mas barato?", espera:"escala:normativo"}
  ]},

 {nombre:"Óscar · pregunta por el seguro",
  perfil:"El bot nunca saca el tema del seguro por su cuenta, pero si el cliente pregunta, eso YA es interés explícito: se le ofrece la cotización de una. Ese lead además confirma después que el carro se facturó — nadie asegura un carro que no compró.",
  veh:"mage",
  turnos:[
    {q:"cuanto me sale el seguro al año?", espera:"seguro", contiene:"asesor especializado"},
    {q:"si por favor", espera:"sub:seguro", contiene:"rango de edad"},
    {q:"tengo 34", espera:"sub:seguro", contiene:"siniestros"},
    {q:"no, nunca", espera:"sub:seguro", contiene:"asesor especializado"}
  ]},

 {nombre:"Rocío · comparando marcas",
  perfil:"Ya cotizó en otro lado. Pregunta comparativo directo.",
  veh:"box",
  turnos:[
    {q:"hola, estoy mirando el byd seagull tambien", espera:"comparar"},
    {q:"cual tiene mas bateria", espera:"ficha"},
    {q:"y de baul cual es mas grande", espera:"espacio"},
    {q:"el vigo cuanto vale", espera:"precio"}
  ]},

 {nombre:"Mauricio · el molesto",
  perfil:"Llega con un reclamo. Debe ir a humano de inmediato.",
  veh:"mage",
  turnos:[
    {q:"esto es una estafa, llevo 3 dias esperando que me llamen", espera:"veto:reclamo"}
  ]},

 {nombre:"Anónimo · datos sensibles",
  perfil:"Intenta hacer trámite por el chat. El bot no toca documentos ni pagos.",
  veh:"vigo",
  turnos:[
    {q:"listo, te paso mi cedula y consigno la separacion", espera:"veto:datos"}
  ]},

 {nombre:"Gloria · no sabe qué quiere",
  perfil:"El caso de asesoría pura. Debe llegar a una recomendación.",
  veh:"mage",
  turnos:[
    {q:"hola", espera:"saludo"},
    {q:"no se cual me conviene la verdad", espera:"cual"},
    {q:"tengo parqueadero propio en la casa", espera:"cual", contiene:"el Box"},
    {q:"es para andar en ciudad, al trabajo", espera:"cual", contiene:"Box"},
    {q:"cuanto vale ese", espera:"precio"}
  ]},

 {nombre:"Alberto · el del cargador",
  perfil:"Quiere el eléctrico pero pregunta la instalación. Depende de la copropiedad: escala.",
  veh:"box",
  turnos:[
    {q:"cuanto cuesta instalar el cargador de pared en la casa?", espera:"instalacion", contiene:"Responde SÍ"},
    {q:"si", espera:"sub:instalacion", contiene:"casa o en conjunto"},
    {q:"vivo en conjunto", espera:"sub:instalacion", contiene:"parqueadero"},
    {q:"es propio, hay una toma cerca", espera:"sub:instalacion", contiene:"instalación"}
  ]},

 {nombre:"Claudia · afán de entrega",
  perfil:"Compra decidida pero necesita el carro ya. Zona donde es fácil prometer fechas.",
  veh:"vigo",
  turnos:[
    {q:"hay unidades disponibles ya?", espera:"disponible"},
    {q:"cuanto se demora la entrega si compro hoy", espera:"disponible"},
    {q:"estoy en barranquilla", espera:"senal:ciudad"},
    {q:"gracias, lo pienso y te escribo", espera:"despedida"}
  ]},

 {nombre:"Nicolás · el confuso",
  perfil:"Escribe cosas que el bot no puede entender. A los 3 fallos debe rendirse y pasar a humano — no seguir adivinando.",
  veh:"mage",
  turnos:[
    {q:"oe y eso como asi el tema ese", espera:null},
    {q:"si o que", espera:null},
    {q:"bueno pues entonces", espera:null}
  ]},

 {nombre:"Teresa · larga y completa",
  perfil:"Conversación real de punta a punta: duda, compara, se convence, agenda.",
  veh:"vigo",
  turnos:[
    {q:"buenas noches", espera:"saludo"},
    {q:"cuanto cuesta la vigo", espera:"precio"},
    {q:"cuanta autonomia tiene", espera:"consumo"},
    {q:"cuanto se demora cargando", espera:"enchufe"},
    {q:"que garantia tiene la bateria", espera:"garantia"},
    {q:"hay taller en cali?", espera:"servicio"},
    {q:"de que colores hay", espera:"colores"},
    {q:"listo quiero probarla", espera:"escala:agenda"}
  ]},

 {nombre:"Ricardo · quiere hablar con alguien",
  perfil:"No quiere bot. Debe pasar sin pelear.",
  veh:"box",
  turnos:[
    {q:"me puedes comunicar con un asesor de verdad?", espera:"escala:pedido"}
  ]},

 {nombre:"Sofía · el seguro y el mantenimiento",
  perfil:"Daniel marcó en negativo que al preguntar por el seguro le contestaban el precio del carro. Era estructural: preguntar cuánto cuesta ALGO es preguntar por ese algo, no por el vehículo. Estas frases lo blindan.",
  veh:"mage",
  turnos:[
    {q:"cuanto cuesta aproximadamente un seguro para este vehiculo?", espera:"seguro", contiene:"asesor especializado"},
    {q:"y cuanto cuesta el mantenimiento", espera:"escala:costoservicio"},
    {q:"cuanto vale el carro entonces", espera:"precio", contiene:"$109.000.000"}
  ]},

 {nombre:"Julián · el que acepta todo lo que le ofrecen",
  perfil:"Daniel encontró que el bot ofrecía el simulador de ahorro y no lo compartía: prometía y no cumplía. Este cliente dice que sí a todo lo que el bot le propone, para que ninguna promesa quede sin respuesta.",
  veh:"mage",
  turnos:[
    {q:"estoy en medellin", espera:"senal:ciudad"},
    {q:"cuanto gasta de gasolina", espera:"consumo"},
    {q:"dale, compartelo", espera:"resp:simulador", contiene:"#simulador"},
    {q:"cuanto vale", espera:"precio"},
    {q:"si", espera:"resp:precioAsesor"},
    {q:"cual es la potencia", espera:"ficha"},
    {q:"si, mandamela", espera:"resp:ficha", contiene:"#ficha"}
  ]},

 {nombre:"Bibiana · la que dice que sí a la prueba de ruta",
  perfil:"El momento de la conversión. El bot proponía agendar y un «sí» no hacía nada: se perdía el lead justo cuando el cliente decía que quería verlo.",
  veh:"vigo",
  turnos:[
    {q:"hola, estoy en cali", espera:"senal:ciudad"},
    {q:"cuanto cuesta", espera:"precio"},
    {q:"cuanta autonomia tiene", espera:"consumo"},
    {q:"que garantia trae", espera:"garantia"},
    {q:"si, dale", espera:"resp:agendar", contiene:"cuadren día y hora"}
  ]},

 {nombre:"Esteban · el de las dos versiones del Vigo",
  perfil:"Camilo encontró que anunciábamos los 470 km de la E2+ junto al precio de la E2, que hace 401. Eso es publicidad engañosa y además le daña la venta al asesor: el cliente llega esperando otra cosa. Esta conversación existe para que no vuelva a pasar.",
  veh:"vigo",
  turnos:[
    {q:"cuanto vale la vigo?", espera:"precio", contiene:"$89.990.000"},
    {q:"cuantos kilometros hace", espera:"consumo", contiene:"401 km"},
    {q:"y cuanto se demora cargando", espera:"enchufe", contiene:"18 minutos"}
  ]}
];

/* ═══ EL PROBADOR ══════════════════════════════════════════════════════════ */
function correr(BOT){
  var res = {
    personas:[], turnos:0, entendidos:0, aciertos:0, evaluados:0,
    escalasOk:0, escalasFalt:0, escalasSobra:0,
    fallos:[], temasUsados:{}, empujones:0
  };

  PERSONAS.forEach(function(p){
    var s = BOT.crearSesion(p.veh);
    var det = {nombre:p.nombre, perfil:p.perfil, turnos:[], ok:0, mal:0};

    p.turnos.forEach(function(t){
      var o = s.responder(t.q);
      res.turnos++;
      if(o.entendido) res.entendidos++;
      if(o.tema) res.temasUsados[o.tema]=(res.temasUsados[o.tema]||0)+1;
      if(o.empujon) res.empujones++;

      var obtuvo = o.escala ? "escala:"+o.escala
                 : (o.tema && o.tema.indexOf("veto:")===0) ? o.tema
                 : o.tema;
      var bien;

      if(t.espera===null){
        bien = !o.entendido || o.escala==="nose";
      }else if(t.espera.indexOf("escala:")===0){
        bien = ("escala:"+o.escala)===t.espera;
      }else if(t.espera.indexOf("veto:")===0){
        bien = o.tema===t.espera;
      }else{
        bien = o.tema===t.espera;
      }
      /* `contiene` blinda la respuesta concreta, no solo el tema reconocido.
         Nació de un defecto real: el bot entendía "cuál me conviene" pero le
         recomendaba un eléctrico a quien acababa de decir que parquea en la
         calle. El tema estaba bien; la respuesta estaba al revés. */
      var faltoTexto = bien && t.contiene && (o.texto||"").indexOf(t.contiene)<0;
      if(faltoTexto) bien=false;

      res.evaluados++;
      if(bien){ res.aciertos++; det.ok++ }
      else{
        det.mal++;
        res.fallos.push({
          persona:p.nombre, pregunta:t.q,
          esperado:t.espera + (t.contiene?" · debía nombrar "+t.contiene:"") || "(no entender)",
          obtuvo:(faltoTexto ? obtuvo+" (pero no nombró "+t.contiene+")" : obtuvo)||"(no entendió)",
          respuesta:(o.texto||"").split("\n")[0].slice(0,90)
        });
      }

      /* contabilidad de escaladas */
      var debia = t.espera && (t.espera.indexOf("escala:")===0 || t.espera.indexOf("veto:")===0);
      /* Una respuesta a algo que el bot ofreció ("¿te agendo la prueba?" →
         "sí") a veces escala y a veces no, y las dos están bien: compartir el
         simulador no escala, aceptar la prueba de ruta sí. No se cuenta en
         ninguno de los dos lados. */
      var esRespuesta = t.espera && t.espera.indexOf("resp:")===0;
      if(esRespuesta){ if(o.escala) res.escalasOk++ }
      else if(debia && o.escala) res.escalasOk++;
      else if(debia && !o.escala) res.escalasFalt++;
      else if(!debia && o.escala && o.escala!=="nose") res.escalasSobra++;

      det.turnos.push({q:t.q, espera:t.espera, obtuvo:obtuvo, bien:bien, r:o.texto, empujon:o.empujon});
    });

    det.lead = s.lead;
    res.personas.push(det);
  });

  /* huecos: temas de la KB que ninguna conversación tocó */
  res.sinUsar = BOT.temas().filter(function(id){ return !res.temasUsados[id] });

  res.pctEntendido = Math.round(res.entendidos/res.turnos*100);
  res.pctAcierto   = Math.round(res.aciertos/res.evaluados*100);
  return res;
}

/* ═══ REPORTE EN CONSOLA (node bot-sim.js) ═════════════════════════════════ */
function imprimir(r){
  var L=console.log;
  L("");
  L("═══ TORQ · SIMULACIÓN DE USABILIDAD ══════════════════════════════════");
  L("");
  L("  "+PERSONAS.length+" clientes · "+r.turnos+" turnos");
  L("  Entendió el tema:      "+r.pctEntendido+"%  ("+r.entendidos+"/"+r.turnos+")");
  L("  Respondió lo correcto: "+r.pctAcierto+"%  ("+r.aciertos+"/"+r.evaluados+")");
  L("  Escaladas correctas:   "+r.escalasOk+"   faltaron: "+r.escalasFalt+"   de más: "+r.escalasSobra);
  L("  Propuso siguiente paso: "+r.empujones+" veces");
  L("");

  L("  POR CLIENTE");
  r.personas.forEach(function(p){
    var marca = p.mal===0 ? "✓" : "✗";
    L("   "+marca+"  "+p.nombre+"  —  "+p.ok+"/"+(p.ok+p.mal));
  });
  L("");

  if(r.fallos.length){
    L("  ── FALLOS ("+r.fallos.length+") ─────────────────────────────────────────");
    r.fallos.forEach(function(f){
      L("");
      L("   "+f.persona);
      L("   cliente:  \""+f.pregunta+"\"");
      L("   esperaba: "+f.esperado);
      L("   contestó: "+f.obtuvo);
      L("   texto:    "+f.respuesta+"…");
    });
    L("");
  }else{
    L("  Sin fallos.");
    L("");
  }

  if(r.sinUsar.length){
    L("  ── TEMAS QUE NINGÚN CLIENTE TOCÓ ──────────────────────────────────");
    L("   "+r.sinUsar.join(", "));
    L("   (no es un error: es cobertura de prueba que falta escribir)");
    L("");
  }
  L("══════════════════════════════════════════════════════════════════════");
  L("");
}

var API = {PERSONAS:PERSONAS, correr:correr, imprimir:imprimir};

if(typeof module!=="undefined" && module.exports){
  module.exports = API;
  if(require.main===module){
    var BOT = require("./bot-motor.js");
    imprimir(correr(BOT));
  }
}else{
  global.TORQSIM = API;
}

})(typeof window!=="undefined" ? window : this);
