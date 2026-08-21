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
    {q:"estoy en medellin, la quiero este mes", espera:"disponible", contiene:"Medellín"},
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
    {q:"tengo una duster 2019", espera:"retoma", contiene:"Duster 2019", escalaOk:true}
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
    {q:"y si sube la reforma que pasa con el precio", espera:"reforma"},
    /* al preguntar el precio de la MAGE no se le ponen al lado los dos más
       baratos: es ponerle competencia propia a una venta que ya iba */
    {q:"y cuanto vale la mage sola", espera:"precio", noContiene:"$69.990.000"}
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
    /* al decir la ciudad, repite la disponibilidad para ESA ciudad */
    {q:"estoy en barranquilla", espera:"disponible", contiene:"Barranquilla"},
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
    {q:"hay taller en cali?", espera:"cobertura", contiene:"Sí, en Cali hay taller"},
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
    {q:"cuanto vale el carro entonces", espera:"precio", contiene:"$109.990.000"}
  ]},

 {nombre:"Sandra · pregunta el ahorro de un eléctrico",
  perfil:"El hueco que encontró Daniel el 16-ago: la oferta del simulador estaba condicionada a que el carro fuera híbrido, así que los DOS eléctricos —los más baratos y los de volumen— nunca la recibían. A quien preguntaba por el ahorro de la Vigo o el Box se le mandaba a un asesor a calcular con el recibo de la luz justo lo que la página ya resuelve. Esta clienta cubre esa rama para que no vuelva a cerrarse.",
  veh:"vigo",
  turnos:[
    {q:"cuanto me ahorro de gasolina", espera:"consumo", contiene:"simulador"},
    {q:"si comparteme", espera:"resp:simulador", contiene:"simulador.html?v=vigo"}
  ]},

 {nombre:"Camilo A. · pregunta por el E70, que no tiene ficha",
  perfil:"El E70 entró al catálogo en agosto sin ficha técnica. El motor interpola v.autonomia directo en la frase, así que sin guardarraíl le diría al cliente 'da null con una carga'. Esta persona cubre esa rama: el bot tiene que decir que no lo tiene y ofrecer confirmarlo, no inventarlo.",
  veh:"e70",
  turnos:[
    {q:"cuanta autonomia tiene", espera:"consumo", contiene:"todavía no la publica"},
    {q:"y cuantos caballos", espera:"ficha", contiene:"no te voy a dar"},
    {q:"bueno y cuanto vale", espera:"precio", contiene:"$79.990.000"}
  ]},

 {nombre:"Rocío · la Huge, que es la grande",
  perfil:"La Huge entró en agosto. Es híbrida, así que la respuesta del dato ausente NO puede decirle '100% eléctrico' —el primer intento lo hacía— ni tratarla en masculino.",
  veh:"huge",
  turnos:[
    {q:"cuanto gasta de gasolina", espera:"consumo", contiene:"5,8"},
    {q:"cuanto baul tiene", espera:"espacio", contiene:"híbrida"},
    {q:"que precio tiene", espera:"precio", contiene:"$124.990.000"}
  ]},

 {nombre:"Julián · el que acepta todo lo que le ofrecen",
  perfil:"Daniel encontró que el bot ofrecía el simulador de ahorro y no lo compartía: prometía y no cumplía. Este cliente dice que sí a todo lo que el bot le propone, para que ninguna promesa quede sin respuesta.",
  veh:"mage",
  turnos:[
    {q:"estoy en medellin", espera:"senal:ciudad"},
    {q:"cuanto gasta de gasolina", espera:"consumo"},
    /* La prueba exigía "#simulador", que era el ancla ROTA: solo existe en
       mage.html, así que para Vigo y Box el cliente aterrizaba en la ficha del
       carro sin ver simulador alguno. Ahora se exige la página de verdad. */
    {q:"dale, compartelo", espera:"resp:simulador", contiene:"simulador.html?v="},
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

 {nombre:"Mauricio D. · el que compara entre los nuestros",
  perfil:"Daniel pidió «cuál es la autonomía y me lo comparas con el Vigo» y el bot habló solo de la carga del Vigo, además de mudarse de carro. Faltaba lo más básico de una línea de tres: poder ponerlos uno al lado del otro.",
  veh:"mage",
  turnos:[
    {q:"cual es la autonomia de este vehiculo y me lo puedes comparar con el vigo?", espera:"compara:mage-vigo:autonomia", contiene:"1.000 km"},
    /* el cierre no puede volver a ofrecer lo que acaba de responder */
    {q:"cual es la autonomia de este vehiculo y me lo puedes comparar con el vigo?", espera:"compara:mage-vigo:autonomia", noContiene:"Tengo autonomía"},
    /* y la comparación sigue sola: un fragmento mantiene los mismos carros */
    {q:"y en precio?", espera:"resp:otraDimension", contiene:"$84.990.000"},
    {q:"cuanto vale la mage", espera:"precio"},
    /* Decía `vigo-box-mage` de cuando la línea eran tres carros. Desde agosto
       son cinco familias y el comparador las trae todas: la prueba fijaba el
       catálogo viejo, no una conducta. */
    {q:"comparame los tres en potencia", espera:"compara:box-e70-vigo-mage-huge:potencia", contiene:"288"},
    {q:"cual es la diferencia entre la e2 y la e2+", espera:"compara:box-e70-vigo-mage-huge"}
  ]},

 {nombre:"Sara · las versiones de un mismo carro",
  perfil:"Donde está la plata que el cliente sube o no sube. Comparar E2 contra E2+ no es comparar carros: es comparar versiones del mismo.",
  veh:"vigo",
  turnos:[
    {q:"que versiones tiene el vigo?", espera:"versiones:vigo", contiene:"$5.000.000"},
    {q:"si", espera:"resp:precioAsesor"}
  ]},

 {nombre:"Wilson · el de Barrancabermeja",
  perfil:"Daniel encontró que el bot le preguntaba la ciudad al cliente que acababa de decirla en la misma frase. La causa: el bot solo conocía 30 ciudades de las 1.100 del país. Ahora conoce las capitales y los municipios grandes, y las demás las saca de la frase.",
  veh:"mage",
  turnos:[
    {q:"tienes el vehiculo para entrega inmediata? me encuentro en barrancabermeja", espera:"disponible", noContiene:"¿En qué ciudad estás?"},
    {q:"si", espera:"resp:precioAsesor", contiene:"Barrancabermeja"}
  ]},

 {nombre:"Álvaro · el de Bucaramanga y las cuatro coberturas",
  perfil:"El bot afirmaba cobertura ciudad por ciudad sin tener la lista. Ahora la tiene, de la pieza oficial de Corautos: 22 puntos de venta y 26 talleres en 20 ciudades. Y son cuatro coberturas distintas, no una.",
  veh:"mage",
  turnos:[
    {q:"hola, estoy en bucaramanga", espera:"senal:ciudad", noContiene:"hay red de servicio"},
    {q:"y venden alla? hay sala?", espera:"cobertura", contiene:"Sí, en Bucaramanga hay punto de venta"},
    {q:"hay taller alla?", espera:"cobertura", contiene:"Sí, en Bucaramanga hay taller"},
    {q:"se puede hacer la prueba de ruta en mi ciudad?", espera:"escala:agenda", contiene:"unidad disponible"}
  ]},

 {nombre:"Nubia · Cartagena, donde hay taller pero no sala",
  perfil:"La excepción que evita el error caro. En Cartagena y Santa Marta hay taller pero NO punto de venta; en Tunja al revés. Decir «sí hay» en bloque manda al cliente a un sitio que no existe.",
  veh:"box",
  turnos:[
    {q:"buenas, estoy en cartagena", espera:"senal:ciudad"},
    {q:"hay sala de ventas alla?", espera:"cobertura", contiene:"no hay punto de venta", escalaOk:true},
    {q:"y taller si hay?", espera:"servicio", contiene:"Sí, en Cartagena hay taller"}
  ]},

 {nombre:"Hugo · Tunja, donde es al revés",
  perfil:"Tunja tiene punto de venta pero no taller. El más cercano es Duitama, y el bot lo dice en vez de dejarlo buscando.",
  veh:"mage",
  turnos:[
    {q:"vivo en tunja", espera:"senal:ciudad"},
    {q:"hay taller alla?", espera:"cobertura", contiene:"Duitama", escalaOk:true},
    {q:"y venden en tunja?", espera:"cobertura", contiene:"Sí, en Tunja hay punto de venta"}
  ]},

 {nombre:"Liliana · la que compara dos ciudades",
  perfil:"Daniel: «mira esta conversación cómo pierde contexto». Preguntó por prueba de ruta en Cúcuta y luego «¿y en Cartagena?» — el bot anotaba la ciudad y volvía al menú. Un «y en X?» no es un dato suelto: es LA MISMA pregunta con otra ciudad, y quien pregunta por dos ciudades está decidiendo dónde comprar.",
  veh:"mage",
  turnos:[
    {q:"hay servicio para prueba de ruta en cucuta?", espera:"escala:agenda", contiene:"Cúcuta"},
    {q:"y en cartagena?", espera:"prueba", contiene:"Cartagena", escalaOk:true},
    {q:"y donde le hacen el mantenimiento?", espera:"servicio", contiene:"Cartagena"},
    {q:"y en bogota?", espera:"servicio", contiene:"Bogotá", escalaOk:true}
  ]},

 {nombre:"Fabián · el embudo completo",
  perfil:"El recorrido que tiene que funcionar de punta a punta: llega por un anuncio, compara, cambia de carro sin repetir la pregunta, resuelve la cobertura de su ciudad y termina agendando. Si esto se rompe en cualquier punto, se cae el lead.",
  veh:"box",
  turnos:[
    {q:"hola, vivo en pereira", espera:"senal:ciudad"},
    {q:"cuanto vale?", espera:"precio", contiene:"$69.990.000"},
    {q:"y el vigo?", espera:"precio", contiene:"$84.990.000"},
    {q:"cual me conviene? no tengo parqueadero", espera:"cual", contiene:"MAGE"},
    {q:"hay taller en mi ciudad?", espera:"cobertura", contiene:"Sí, en Pereira"},
    {q:"listo, quiero verla", espera:"escala:agenda"}
  ]},

 {nombre:"Patricia R. · la conversación larga y desordenada",
  perfil:"La prueba que pidió Daniel: un interesado que hace muchas preguntas seguidas y espera resolverlo todo en un solo chat. Si el bot se pierde, olvida algo o vuelve al menú, el lead se cae. Aquí se vigila cada unión.",
  veh:"box",
  turnos:[
    {q:"hola buenas", espera:"saludo", contiene:"Cuéntame"},
    {q:"cuanto vale y que garantia tiene?", espera:"precio+garantia", contiene:"200.000 km"},
    {q:"de que colores hay?", espera:"colores"},
    {q:"el rojo me gusta", espera:"colores", contiene:"Anotado: Rojo"},
    {q:"tengo un mazda 3 2018 para entregar", espera:"escala:retoma"},
    {q:"vivo en pereira", espera:"senal:ciudad"},
    {q:"en que mas me puedes ayudar?", espera:"capacidades", contiene:"Comparar"},
    {q:"resumeme lo que hemos hablado", espera:"resumen", contiene:"Mazda 3 2018"}
  ]},

 {nombre:"Marta L. · tres preguntas en un mensaje",
  perfil:"Daniel: «3 preguntas y solo responde una». Pidió precio, autonomía y prueba de ruta en Armenia y el bot contestó solo la última. La regla anterior excluía del multi-intento los temas que escalan — justo el que cierra la venta. Ahora responde todo y escala al final.",
  veh:"mage",
  turnos:[
    /* la ciudad se reconoce aunque venga con un dedazo pegado */
    {q:"Precio y autonomia y prueba de ruta en armenia1010", espera:"precio+consumo+prueba", contiene:"Armenia", escalaOk:true},
    /* y no se le ofrecen otros carros a quien ya preguntó por uno */
    {q:"cuanto vale la mage?", espera:"precio", noContiene:"comparo"},
    {q:"y si sube la reforma que pasa con el precio", espera:"reforma"},
    /* al preguntar el precio de la MAGE no se le ponen al lado los dos más
       baratos: es ponerle competencia propia a una venta que ya iba */
    {q:"y cuanto vale la mage sola", espera:"precio", noContiene:"$69.990.000"}
  ]},

 {nombre:"Germán · el que suma la plata real",
  perfil:"Daniel: «sigues respondiendo lo que no te han preguntado». Preguntó cuánto cuestan los documentos de matrícula y el bot le habló de pico y placa — compartían la palabra «matrícula». Es de las preguntas que más se hacen: es plata que NO está en el precio publicado, y contestarle otra cosa lo deja pensando que le escondimos un costo.",
  veh:"mage",
  turnos:[
    {q:"estoy en armenia", espera:"senal:ciudad"},
    {q:"cuanto cuestan los documentos de matricula?", espera:"matricula", contiene:"van aparte del precio", noContiene:"pico y placa"},
    {q:"y el soat?", espera:"matricula"},
    {q:"hay pico y placa para electricos en mi ciudad?", espera:"escala:normativo", contiene:"pico y placa"}
  ]},

 {nombre:"Óscar E. · el que corrige y compra a nombre de empresa",
  perfil:"Daniel probó tres cosas que fallaron seguidas: preguntó por el IVA de una empresa y le contestaron renting; corrigió con «no te hablé de renting, es compra» y le repitieron renting —porque la palabra estaba en la frase—; y el bot ofreció confirmar disponibilidad en una ciudad donde acababa de decir que no hay nada.",
  veh:"vigo",
  turnos:[
    {q:"taller en buga?", espera:"servicio", contiene:"no hay taller"},
    {q:"y precio de vigo?", espera:"precio", noContiene:"disponibilidad en Buga"},
    {q:"y si es empresa tengo beneficio de iva?", espera:"escala:tributario", contiene:"contador", noContiene:"renting"},
    {q:"no te hable de renting es compra", espera:"descarta:renting"},
    {q:"eso despues no se vende se desvaloriza mucho", espera:"reventa"}
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
      /* `noContiene` blinda lo contrario: que una frase NO aparezca. Nació de
         que el bot ofrecía comparar en la dimensión que acababa de comparar. */
      var sobroTexto = bien && t.noContiene && (o.texto||"").indexOf(t.noContiene)>-1;
      if(sobroTexto) bien=false;

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
      /* `escalaOk` marca los turnos donde escalar es correcto aunque el tema
         no sea de escalada: una pregunta de cobertura que no podemos
         responder termina, con razón, en un asesor. */
      else if(!debia && o.escala && o.escala!=="nose" && !t.escalaOk) res.escalasSobra++;
      else if(t.escalaOk && o.escala) res.escalasOk++;

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
