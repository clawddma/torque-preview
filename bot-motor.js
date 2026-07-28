/* ═══════════════════════════════════════════════════════════════════════════
   TORQ — MOTOR DEL BOT
   ═══════════════════════════════════════════════════════════════════════════
   La lógica vive aquí y en ningún otro lado. La usa el simulador (bot.html)
   para conversar, y la usa el probador automático (sim.js) para correr cientos
   de conversaciones de golpe. Es el mismo motor: si algo pasa la prueba, pasa
   en el chat, y al revés.

   Tres reglas que no se negocian:
   1. Toda cifra sale de la ficha o de una fuente ya verificada. Si no está, se
      escala. El bot nunca rellena un hueco.
   2. Los motivos de escalamiento se deciden ANTES de redactar, con reglas, no
      con criterio. Un veto gana siempre, sin importar qué tan bien puntúe otro
      tema.
   3. El bot conoce los tres vehículos y sabe de cuál le están hablando.
   ═══════════════════════════════════════════════════════════════════════════ */
(function (global) {
"use strict";

/* ═══ LOS TRES VEHÍCULOS ═══════════════════════════════════════════════════
   Toda cifra de aquí está publicada hoy en el sitio. Cambiar un precio es
   editar UNA fila, no reescribir respuestas. */
var VEH = {
  mage: {
    id:"mage", nombre:"MAGE", art:"la", Art:"La", largo:"Dongfeng MAGE HEV", url:"mage.html",
    clase:"SUV híbrida autorecargable", tec:"hibrido",
    precio:"$109.000.000", precioNum:109000000,
    autonomia:"más de 1.000 km con el tanque lleno",
    consumo:"4,9 litros cada 100 km en ciclo WLTC",
    motor:"288 caballos combinados y 565 Nm, con motor 1.5T turbo más motor eléctrico y transmisión híbrida de 4 velocidades",
    bateria:"1,9 kWh — no se enchufa, se recarga sola andando",
    carga:null,
    baul:"360 litros",
    medidas:"4.650 mm de largo, 1.905 de ancho y 1.630 de alto, con 2.775 mm entre ejes",
    colores:"Plata, Azul, Blanco y Negro, más dos bicolor: Blanco/Negro y Plata/Negro",
    gancho:"288 caballos que se recargan solos",
    llaves:["mage","mague","magge","hibrida","híbrida","hibrido","híbrido","hev","la que no se enchufa","autorecargable"]
  },
  vigo: {
    id:"vigo", nombre:"Vigo", art:"el", Art:"El", largo:"Dongfeng Vigo", url:"vigo.html",
    clase:"SUV 100% eléctrica", tec:"electrico",
    precio:"$84.990.000", precioNum:84990000,
    /* OJO — el Vigo tiene dos versiones y las cifras NO son las mismas.
       El error que hubo aquí: se anunciaban los 470 km y los 18 minutos de la
       E2+ junto al precio de entrada, que es el de la E2 de 401 km. Eso es
       exactamente lo que la Ley 1480 llama publicidad engañosa, y además le
       daña la venta al asesor: el cliente llega esperando otra cosa.
       Toda cifra de aquí es de la E2. La E2+ va aparte, con su precio. */
    versiones:[
      {n:"E2",  precio:"$84.990.000", bateria:"44,94 kWh LFP", autonomia:"401 km CLTC", carga:"30 minutos del 30 al 80%"},
      {n:"E2+", precio:"$89.990.000", bateria:"51,87 kWh LFP", autonomia:"470 km CLTC", carga:"18 minutos del 30 al 80%"}
    ],
    autonomia:"401 km CLTC en la E2, y 470 km en la E2+ de $89.990.000",
    consumo:"no consume gasolina: se carga con electricidad",
    motor:"161 caballos y 230 Nm en las dos versiones",
    bateria:"44,94 kWh en la E2 y 51,87 kWh en la E2+",
    carga:"30 minutos del 30% al 80% en la E2, y 18 minutos en la E2+",
    baul:"500 litros — el más grande de su trío de competencia",
    medidas:null,
    colores:null,
    gancho:"Cinco puestos, hasta 470 km, cero gasolina",
    llaves:["vigo","bigo","suv electrica","suv eléctrica","la grande","la de 470"]
  },
  box: {
    id:"box", nombre:"Box", art:"el", Art:"El", largo:"Dongfeng Box", url:"box.html",
    clase:"hatchback 100% eléctrico", tec:"electrico",
    precio:"$69.990.000", precioNum:69990000,
    autonomia:"430 km CLTC",
    consumo:"no consume gasolina: se carga con electricidad",
    motor:"94 caballos y 160 Nm",
    bateria:"43,89 kWh de tipo LFP",
    carga:"30 minutos",
    baul:"326 litros",
    medidas:null,
    colores:null,
    gancho:"Se carga en tu casa mientras duermes",
    llaves:["box","boxe","bocs","urbano","pequeño","pequeno","chiquito","hatchback","el barato","el económico","el economico"]
  }
};
var ORDEN = ["vigo","box","mage"];

/* Datos que son iguales para los tres. Una sola fuente. */
var COMUN = {
  garantia:"La batería y el motor eléctrico tienen 8 años o 200.000 km de garantía. El vehículo completo, 5 años o 150.000 km.",
  red:"26 centros de servicio en 19 ciudades del país y más de 100 puntos de repuestos.",
  seguridad:"Seis airbags, control electrónico de estabilidad, ABS, control de tracción y asistente de arranque en pendiente."
};

/* ═══ TEMAS QUE NUNCA RESPONDE ═════════════════════════════════════════════
   Se evalúan primero y ganan siempre. Es el guardarraíl duro. */
var VETO = [
 {id:"descuento", k:["descuento","descuentico","descuentito","rebaja","rebajita","negociar","ultimo precio","último precio","promocion","promoción","oferta especial","me lo deja","me la deja","me lo dejas","me la dejas","dejas en","deja en","mejor precio","precio final","esta cara","está cara","muy caro","muy cara","bajale","bájale","hazme precio"],
  r:"Los descuentos y las condiciones especiales las define la sala de ventas, no yo.\n\nTe paso con un asesor para que negocien directamente.", esc:"descuento"},
 {id:"reclamo", k:["reclamo","queja","demanda","estafa","problema con","mal servicio","denuncia","me robaron","incumplieron","tutela"],
  r:"Lamento que estés pasando por eso. Un reclamo lo tiene que atender una persona, no un chat.\n\nTe paso de inmediato con alguien del equipo.", esc:"reclamo"},
 {id:"datos", k:["cedula","cédula","mi documento","numero de cuenta","número de cuenta","tarjeta de credito","tarjeta de crédito","consignar","transferir","anticipo","separar con"],
  r:"Por seguridad tuya, yo no pido ni recibo documentos, cuentas ni pagos por este chat.\n\nCualquier trámite de ese tipo se hace directamente con la sala de ventas. Te paso con un asesor.", esc:"datos"}
];

/* ═══ BASE DE CONOCIMIENTO ═════════════════════════════════════════════════
   `r` puede ser texto (igual para los tres) o función (depende del vehículo
   y de lo que el bot ya sabe del cliente). */
var KB = [

 {id:"precio", k:["precio","cuesta","vale","valor","costo","cuanto vale","cuanto cuesta","que precio","cuanto sale","presupuesto"],
  r:function(v){
    var otros = ORDEN.filter(function(x){return x!==v.id}).map(function(x){
      return VEH[x].nombre+" "+VEH[x].precio;
    }).join(" · ");
    /* Si el vehículo tiene dos versiones, se dicen las DOS con su precio. Dar
       solo el "desde" y dejar que el cliente asuma que trae las cifras de la
       de arriba es cómo se pierde una venta en la sala — y cómo se incumple
       la Ley 1480. */
    if(v.versiones){
      var t = v.Art+" "+v.nombre+" tiene dos versiones:\n\n";
      v.versiones.forEach(function(x){
        t += "· "+v.nombre+" "+x.n+" — "+x.precio+": "+x.autonomia+", batería de "+x.bateria+", carga en "+x.carga+".\n";
      });
      return t+"\nLos dos con IVA incluido y sujetos a confirmación con la sala.\n\n"+
        "Para que compares: "+otros+". ¿Quieres que un asesor te confirme el precio vigente para tu ciudad?";
    }
    return v.Art+" "+v.nombre+" está en "+v.precio+", con IVA incluido.\n\n"+
      "Ese valor está sujeto a confirmación con la sala, porque depende de la versión exacta y de disponibilidad.\n\n"+
      "Para que compares: "+otros+". ¿Quieres que un asesor te confirme el precio vigente para tu ciudad?";
  }},

 {id:"cual", k:["cual me conviene","cuál me conviene","cual es mejor","cuál es mejor","que me recomiendas","qué me recomiendas","no se cual","no sé cuál","ayudame a elegir","ayúdame a elegir","cual elijo","cuál elijo","estoy entre","diferencia entre"],
  r:function(v,lead){
    /* La recomendación se decide con reglas, no con la conversación anterior.
       El eje que manda es uno solo: si puede cargar en casa o no. */
    if(!lead.carga) return "Buena pregunta, y la respuesta depende de una sola cosa: ¿puedes cargar en tu casa o parqueadero?\n\n"+
      "· Si SÍ puedes cargar → Vigo o Box, 100% eléctricos, cero gasolina.\n"+
      "· Si NO puedes cargar → MAGE híbrida: nunca se enchufa, tanqueas normal y hace 4,9 litros a los 100.\n\n"+
      "Y entre los dos eléctricos: Box si es para ciudad y quieres el precio más bajo ("+VEH.box.precio+"); Vigo si necesitas espacio de familia y más autonomía ("+VEH.vigo.precio+").\n\n"+
      "¿Tienes dónde cargar?";

    var rec, por;
    if(lead.carga==="No"){
      rec=VEH.mage; por="como no puedes cargar en casa, un eléctrico te complicaría la vida. La MAGE nunca se enchufa: tanqueas gasolina normal y ella se recarga sola andando";
    }else if(lead.uso==="Familia" || lead.uso==="Carretera"){
      rec=VEH.vigo; por="puedes cargar en casa y necesitas espacio y autonomía: 500 litros de baúl y 470 km";
    }else{
      rec=VEH.box;  por="puedes cargar en casa y es para ciudad: es el más barato de la línea y el que mejor se mueve en el tráfico";
    }
    /* Si el bot recomienda otro vehículo, la conversación se mueve con él:
       el "cuánto vale" siguiente debe ser el del recomendado, no el anterior. */
    lead.vehiculo = rec.id;
    return "Por lo que me cuentas, "+(rec.art==="la"?"la que":"el que")+" te cuadra es "+rec.art+" "+rec.nombre+" — "+por+".\n\n"+
      rec.largo+", desde "+rec.precio+". "+rec.gancho+".\n\n"+
      "¿Quieres que un asesor te lo muestre en detalle?";
  }},

 {id:"enchufe", k:["enchuf","cargar","cargador","carga","estacion","estación","electrolinera","poste","como se carga","cómo se carga","donde cargo","dónde cargo","donde lo cargo","donde la cargo","dónde lo cargo","cuanto se demora cargando","parqueo en la calle","no tengo parqueadero","sin parqueadero"],
  r:function(v,lead){
    if(v.tec==="hibrido") return v.Art+" "+v.nombre+" NO se enchufa. Es "+(v.art==="la"?"híbrida":"híbrido")+" autorecargable: recupera energía sola mientras andas.\n\n"+
      "No necesitas cargador, ni instalación en la casa, ni buscar estación. Tanqueas gasolina como siempre, solo que mucho menos seguido: "+v.consumo+".";

    /* Si el cliente YA dijo que parquea en la calle, explicarle cómo cargar en
       casa y volver a preguntarle si tiene parqueadero es tratarlo como si no
       hubiera hablado. Se le contesta lo que preguntó y se le abre la salida. */
    if(lead.carga==="No") return v.Art+" "+v.nombre+" es 100% eléctrico: se carga en casa con un cargador de pared, o en carga rápida en "+v.carga+".\n\n"+
      "Pero me dijiste que parqueas en la calle, y ahí te voy a ser honesto: un eléctrico sin dónde cargar de noche es un dolor de cabeza. Cargar solo en estaciones públicas se vuelve una vuelta cada semana.\n\n"+
      "Para tu caso miraría la MAGE: es híbrida y NUNCA se enchufa. Tanqueas gasolina normal y hace 4,9 litros a los 100 km. ¿Te la muestro?";

    var detalle = v.versiones
      ? v.versiones.map(function(x){ return "· "+x.n+": carga rápida en "+x.carga+" ("+x.autonomia+")." }).join("\n")
      : "En carga rápida, "+v.carga+". Batería de "+v.bateria+" y "+v.autonomia+".";
    return v.Art+" "+v.nombre+" es 100% eléctrico, así que sí se carga.\n\n"+
      "En casa, con un cargador de pared: lo dejas conectado en la noche y amaneces al 100%.\n\n"+
      detalle+
      (lead.carga ? "" : "\n\n¿Tienes parqueadero propio donde instalar el cargador?");
  }},

 {id:"instalacion", k:["instalar cargador","instalar el cargador","cuesta instalar","instalacion","instalación","instalacion del cargador","instalación del cargador","wallbox","cargador de pared","obra","electricista","conjunto","administracion","administración","copropiedad","permiso de la"],
  r:function(v){
    if(v.tec==="hibrido") return "Con la "+v.nombre+" no aplica: no se enchufa, así que no hay cargador que instalar ni permiso que pedir en el conjunto.\n\nEse es justamente su argumento.";
    return "La instalación del cargador en casa depende de tu acometida eléctrica y, si vives en conjunto, del permiso de la copropiedad.\n\n"+
      "No te puedo dar un costo por aquí porque cambia caso por caso. Te paso con un asesor para que te lo coticen con un técnico.";
  }, esc:"instalacion"},

 {id:"consumo", k:["consumo","gasolina","litros","rinde","tanque","tanquear","galon","galón","km/l","economico","económico","gasto","cuanto gasta","ahorro","autonomia","autonomía","cuanto recorre","kilometros","kilómetros"],
  r:function(v){
    if(v.tec==="hibrido") return v.consumo.charAt(0).toUpperCase()+v.consumo.slice(1)+", y "+v.autonomia+".\n\n"+
      "En la página hay un simulador donde pones tu consumo actual y los kilómetros que haces al mes, y te dice cuánto cambiaría tu gasto. ¿Te lo comparto?";
    if(v.versiones) return v.Art+" "+v.nombre+" no gasta gasolina.\n\n"+
      v.versiones.map(function(x){
        return "· "+x.n+" ("+x.precio+"): "+x.autonomia+" con una carga, batería de "+x.bateria+".";
      }).join("\n")+"\n\n"+
      "Cargando en casa, el costo por kilómetro es una fracción del de un carro a gasolina. La cifra exacta depende de tu tarifa de energía y de tu estrato — no te la invento aquí; un asesor te la calcula con tu recibo.";
    return v.Art+" "+v.nombre+" no gasta gasolina: da "+v.autonomia+" con una carga, y la batería es de "+v.bateria+".\n\n"+
      "Cargando en casa, el costo por kilómetro es una fracción del de un carro a gasolina. La cifra exacta depende de tu tarifa de energía y de tu estrato — no te la invento aquí; un asesor te la calcula con tu recibo.";
  }},

 {id:"ficha", k:["potencia","caballos","hp","torque","motor","especificac","ficha","tecnica","técnica","velocidad","transmision","transmisión","bateria","batería","kwh","cuanta bateria","cuánta batería"],
  r:function(v){
    var t = v.Art+" "+v.nombre+" da "+v.motor+".";
    if(v.tec==="electrico") t += "\n\nBatería de "+v.bateria+", "+v.autonomia+" y "+v.carga+".";
    else t += "\n\nBatería de "+v.bateria+".";
    return t+"\n\n¿Quieres la ficha completa? Está en "+v.url;
  }},

 {id:"espacio", k:["espacio","tamaño","grande","baul","baúl","maleta","familia","asientos","cabe","caben","puestos","dimension","dimensión","mercado","coche de bebe","coche de bebé"],
  r:function(v){
    var t = v.Art+" "+v.nombre+" tiene "+v.baul+" de baúl";
    t += v.medidas ? " y mide "+v.medidas+"." : ", con cinco puestos.";
    if(v.id==="box") t += "\n\nOjo: el Box es el urbano de la línea. Si necesitas espacio de familia, el Vigo tiene 500 litros y la MAGE 360 con carrocería de SUV grande.";
    return t;
  }},

 {id:"garantia", k:["garantia","garantía","respaldo","dura","años","duracion","duración","se daña","vida util","vida útil","cuanto dura la bateria","que garantia","qué garantía","garantia tiene","garantía tiene","garantia de la bateria","garantía de la batería"],
  r:function(v){ return COMUN.garantia+"\n\nEs de las garantías más largas del segmento en Colombia, y aplica igual para los tres vehículos de la línea." }},

 {id:"servicio", k:["servicio","mantenimiento","taller","repuesto","posventa","atienden","arreglan","revision","revisión","centro de servicio","donde lo reviso"],
  r:function(v,lead){
    if(lead.ciudad) return "En "+lead.ciudad+" hay centro de servicio de la red. En total son "+COMUN.red+"\n\n¿Quieres que un asesor te dé la dirección exacta?";
    return "Hay "+COMUN.red+"\n\nSon más sitios para atenderla que para comprarla. Dime tu ciudad y te digo cuál te queda más cerca.";
  }},

 /* Sale del mismo hallazgo del seguro: al arreglar "cuánto cuesta el
    mantenimiento" el bot pasó a contestar cuántos talleres hay, que no es lo
    que preguntaron. No tenemos tarifas de mantenimiento; inventarlas sería
    exactamente lo que este bot no hace. */
 {id:"costoservicio", k:["cuanto cuesta el mantenimiento","cuanto vale el mantenimiento","cuanto sale el mantenimiento","precio del mantenimiento","costo del mantenimiento","costo de mantenimiento","valor del mantenimiento","cuanto cuesta la revision","mantenimiento cuanto"],
  r:"El costo de los mantenimientos lo fija cada centro de servicio y depende del kilometraje de la revisión, así que no te voy a dar una cifra que no pueda sostener.\n\nLo que sí es cierto: un eléctrico no lleva cambios de aceite ni filtros de combustible, y los mantenimientos son más espaciados y más baratos que los de un carro a gasolina.\n\nTe paso con un asesor para que te den el plan de mantenimiento con valores reales.", esc:"costoservicio"},

 {id:"seguridad", k:["seguridad","airbag","frenos","abs","asistencia","adas","camara","cámara","punto ciego","carril","choque","segura","es seguro"],
  r:function(v){ return COMUN.seguridad+"\n\nLa línea suma conducción asistida nivel 2: frenado automático de emergencia, control crucero adaptativo, mantenimiento de carril, monitoreo de punto ciego y visión 360°.\n\nLa dotación exacta cambia por versión; te la confirma la sala." }},

 {id:"colores", k:["color","colores","blanco","negro","azul","plata","gris","rojo"],
  r:function(v){
    if(v.colores) return v.Art+" "+v.nombre+" viene en "+v.colores+".\n\nLa disponibilidad por color cambia según el lote. ¿Cuál te interesa? Lo confirmo con la sala.";
    return "La carta de colores del "+v.nombre+" cambia por lote y por versión, así que prefiero no darte una lista que no pueda sostener.\n\n¿Qué color buscas? Se lo pregunto a la sala y te confirman qué hay disponible hoy.";
  }},

 {id:"reforma", k:["reforma","reforma tributaria","proyecto","sube el iva","subir","aumenta el precio","van a subir"],
  r:"Hoy los híbridos pagan 5% de IVA. El gobierno radicó el 22 de julio un proyecto que lo subiría a 19%.\n\nSi ese proyecto se aprueba, la MAGE pasaría de $109.000.000 a unos $123.500.000. Ojo: está radicado, no aprobado — todavía puede cambiar o no pasar.\n\nNo te lo pongo como presión de venta: es un hecho público que conviene que sepas."},

 {id:"devolucion", k:["devolucion","devolución","devuelven","recuperar","upme","dian","beneficio tributario","exencion","exención","iva","impuesto"],
  r:"La DIAN fijó un procedimiento para devolver el IVA de vehículos certificados por la UPME, dentro de los 5 años siguientes a la factura.\n\nNo te lo puedo dar por hecho: depende de tu caso particular y el criterio ha cambiado. Lo que sí puedo es ponerte con alguien que lo revise contigo con tus documentos.", esc:"tributario"},

 {id:"picoyplaca", k:["pico y placa","pico placa","restriccion","restricción","circulacion","circulación","dia sin carro","día sin carro","exento","impuesto vehicular","impuesto de rodamiento","soat","matricula","matrícula"],
  r:"Esa es de las preguntas donde no te quiero dar un dato bonito y equivocado: **el pico y placa y el impuesto vehicular los define cada ciudad y cada departamento, y las reglas para eléctricos e híbridos han cambiado varias veces.**\n\nHay beneficios reales, pero dependen de dónde vives y del año. Te paso con un asesor para que te confirme exactamente qué aplica en tu ciudad hoy.", esc:"normativo"},

 {id:"seguro", k:["seguro","poliza","póliza","aseguradora","cuanto vale el seguro","asegurar"],
  r:"El costo del seguro lo cotiza la aseguradora según tu edad, tu historial y tu ciudad — yo no tengo esa tarifa y no te la voy a estimar.\n\nLa sala trabaja con aliados que te lo cotizan junto con el vehículo. Te paso con un asesor.", esc:"seguro"},

 {id:"prueba", k:["prueba","probar","manejar","test drive","ruta","ver el carro","conocer","visitar","cita","agendar","donde queda","dónde queda","vitrina","sala","direccion","dirección","horario","verla","verlo","quiero verla","quiero verlo","quiero conocerla","me gustaria verla","me gustaría verla","ir a mirarla"],
  r:"Claro que sí. La prueba de ruta y la visita a sala se agendan directamente con la sala de tu ciudad.\n\nTe paso con un asesor para que cuadren día y hora.", esc:"agenda"},

 {id:"credito", k:["credito","crédito","cuota","financia","banco","tasa","plazo","inicial","aprobar","aprobacion","aprobación","cuotas","mensual","leasing"],
  r:"El crédito lo estudia y aprueba la sala con sus aliados financieros; yo no puedo aprobarlo ni darte una tasa.\n\nLo que sí tenemos es un simulador de costo en la página, pero es ilustrativo y no constituye una oferta. Te paso con un asesor para que te dé condiciones reales.", esc:"credito"},

 {id:"retoma", k:["retoma","parte de pago","entregar mi","mi carro","cambio","permuta","usado","recibir mi"],
  r:"Sí se recibe vehículo en parte de pago. El avalúo lo hace la sala directamente, porque depende del estado, el modelo y el kilometraje.\n\n¿Qué carro tienes? Se lo paso al asesor para que vaya adelantando.", esc:"retoma"},

 {id:"renting", k:["renting","arriendo","alquiler","suscripcion","suscripción","empresa","flota","varias unidades","corporativo","facturar a nombre"],
  r:"El renting y los planes para empresa los manejamos caso por caso, porque cambian según el plazo, el kilometraje y el número de unidades.\n\nTe paso con un asesor para armarte una propuesta concreta.", esc:"renting"},

 {id:"disponible", k:["disponible","inventario","entrega","entregan","stock","unidades","llega","cuando llega","hay disponible","cuanto se demora la entrega","inmediata","la quiero","lo quiero","quiero comprar","me la llevo","me lo llevo","cuando me la entregan","hay en"],
  r:function(v,lead){
    return "Hay unidades del "+v.nombre+" y viene más inventario en camino, pero la existencia por color y ciudad cambia de un día a otro.\n\n"+
      "No te quiero dar una fecha que no pueda sostener: eso lo confirma la sala en el momento."+
      (lead.ciudad ? " Se lo pregunto para "+lead.ciudad+"." : " ¿En qué ciudad estás?");
  }},

 {id:"marca", k:["dongfeng","china","chino","marca","confiable","confianza","corautos","ustedes","quienes son","quiénes son","es buena","reputacion","reputación","quiebra","se van del pais"],
  r:"Dongfeng es uno de los fabricantes más grandes de China y en Colombia lo representa Corautos Andino, del grupo Colombiana de Comercio (Corbeta) — el mismo grupo detrás de Foton.\n\nEn el primer semestre de 2026 la marca creció 217% en matrículas en el país. Y el respaldo se mide en cosas concretas: "+COMUN.red+" Y 8 años de garantía de batería."},

 {id:"reventa", k:["reventa","revender","se desvaloriza","desvalorizacion","desvalorización","precio de venta despues","valor futuro","depreciacion","depreciación"],
  r:"Te contesto con honestidad: la reventa de marcas chinas y de eléctricos en Colombia todavía tiene poco histórico, así que cualquier cifra que te dé sería inventada.\n\nLo que sí es objetivo: 8 años de garantía de batería y 26 centros de servicio son lo que sostiene un valor de reventa. Un carro sin red de servicio es el que no se vende después.", esc:null},

 {id:"comparar", k:["comparar","versus","vs","mejor que","corolla","sportage","territory","mazda","toyota","kia","byd","geely","chery","mg","competencia","seagull","dolphin"],
  r:function(v){
    if(v.id==="mage") return "Contra las híbridas que se venden hoy en Colombia: la MAGE da 288 hp y 565 Nm por $109.000.000.\n\nLa Corolla Cross híbrida da 122 hp y cuesta $136.200.000. El Sportage Zenith híbrido da 231 hp y cuesta $176.990.000. La Territory Trend híbrida da 240 hp y cuesta $148.990.000.\n\nEs la de más potencia y la de menor precio del grupo. En la página está el comparador completo.";
    if(v.id==="box") return "Contra los eléctricos urbanos: el Box cuesta $69.990.000 con batería de 43,89 kWh y 430 km.\n\nEl BYD Seagull cuesta $76.990.000 con 30,08 kWh y 310 km. El MG4 EV Urban, $74.990.000 con 42,8 kWh.\n\nEl Box empata en el precio más bajo del grupo y tiene la segunda mejor batería. Contra el Seagull: 46% más batería, 120 km más y 6 airbags contra 4, por $7.000.000 menos.";
    return "Contra los eléctricos de su rango: el Vigo tiene batería de 51,87 kWh y 500 litros de baúl.\n\nEl Kia EV2 Air cuesta lo mismo con 42,2 kWh y 362 litros. El Geely EX5 SE cuesta más y tiene menos batería.\n\nEl Vigo lleva la batería más grande y el baúl más grande del trío. Donde pierde: el Kia es de fabricación europea y trae un airbag más — te lo digo para que decidas con todo sobre la mesa.";
  }},

 {id:"humano", k:["asesor","persona","humano","hablar con","llamar","telefono","teléfono","alguien","atienda","un vendedor","no me sirves","eres un bot","eres un robot"],
  r:"Con gusto. Te paso con un asesor especializado.", esc:"pedido"},

 {id:"saludo", debil:true, k:["hola","buenas","buenos dias","buenos días","buenas tardes","buenas noches","que tal","qué tal","hey","saludos","alo","aló"],
  r:function(v,lead){
    if(lead.turnos<=1) return null; // el saludo inicial lo da arrancar()
    return "¡Hola! Aquí sigo. ¿En qué más te ayudo con el "+v.nombre+"?";
  }},

 {id:"gracias", debil:true, k:["gracias","muchas gracias","listo","perfecto","ok","dale","vale","bueno","entendido","chevere","chévere"],
  r:"Con gusto. Si te queda cualquier otra duda, aquí estoy. Y cuando quieras, te paso con un asesor para agendar la prueba de ruta."},

 {id:"despedida", debil:true, k:["chao","adios","adiós","hasta luego","nos vemos","luego te escribo","lo pienso","despues","después"],
  r:"Listo, quedo atento. Cuando quieras retomas por aquí y no perdemos el hilo de lo que ya hablamos.\n\nSi prefieres que un asesor te escriba, dime y te paso con él."}
];

/* ═══ MOTIVOS DE ESCALAMIENTO ══════════════════════════════════════════════ */
var ESC = {
  pedido:      "El cliente pidió hablar con una persona.",
  agenda:      "Quiere prueba de ruta o visitar sala — se cierra con humano.",
  credito:     "Pregunta por crédito, tasa o cuota. El bot no aprueba ni cotiza financiación.",
  retoma:      "Tiene vehículo para parte de pago. El avalúo es presencial.",
  renting:     "Renting o flota: propuesta caso por caso, todavía no modelada.",
  tributario:  "Devolución de IVA: depende del caso y el criterio DIAN ha cambiado.",
  normativo:   "Pico y placa o impuesto vehicular: la norma cambia por ciudad y por año.",
  seguro:      "Costo de póliza: lo cotiza la aseguradora, no el bot.",
  costoservicio:"Costo de mantenimiento: lo fija cada centro de servicio, no el bot.",
  instalacion: "Instalación de cargador: depende de la acometida y de la copropiedad.",
  descuento:   "Pide descuento. Negociación es de la sala, nunca del bot.",
  reclamo:     "Reclamo o queja. Va a humano de inmediato.",
  datos:       "Pidió o intentó dar datos sensibles o pagos. El bot no los toca.",
  nose:        "Tres intentos sin entender. Antes de frustrar al cliente, pasa a humano."
};

/* ═══ SEÑALES QUE EL BOT VA APRENDIENDO DEL CLIENTE ════════════════════════ */
var CIUDADES = ["bogotá","bogota","medellín","medellin","cali","barranquilla","bucaramanga","cúcuta","cucuta","villavicencio","montería","monteria","valledupar","pasto","pereira","manizales","ibagué","ibague","neiva","popayán","popayan","duitama","tunja","cartagena","santa marta","copacabana","armenia","sincelejo","riohacha","yopal"];

var PLAZO = [
  {k:["ya","de una","esta semana","este mes","urgente","cuanto antes","lo antes posible","inmediato"], v:"Este mes"},
  {k:["proximo mes","próximo mes","en un mes","dos meses","tres meses","trimestre"], v:"1–3 meses"},
  {k:["este año","este ano","fin de año","diciembre","el otro año","el próximo año","proximo año"], v:"Este año"},
  {k:["estoy mirando","solo mirando","por curiosidad","averiguando","apenas estoy","no tengo afan","no tengo afán"], v:"Explorando"}
];

var PAGO = [
  {k:["contado","de contado","en efectivo","pago completo","tengo la plata"], v:"Contado"},
  {k:["credito","crédito","financiar","financiado","cuotas","banco","prestamo","préstamo"], v:"Crédito"},
  {k:["retoma","parte de pago","entrego mi","permuta"], v:"Con retoma"}
];

/* El orden IMPORTA y aquí casi cuesta una recomendación al revés: "no tengo
   parqueadero" contiene "tengo parqueadero", así que el positivo ganaba y el
   bot le recomendaba un eléctrico justo al cliente que no puede cargarlo.
   Las negaciones van primero, siempre. */
var CARGA = [
  {k:["no tengo parqueadero","no tengo garaje","parqueo en la calle","no puedo cargar","no tengo donde cargar","vivo en apartamento sin","sin parqueadero"], v:"No"},
  {k:["tengo parqueadero","parqueadero propio","garaje","puedo cargar","casa propia","tengo donde cargar"], v:"Sí"}
];

var USO = [
  {k:["ciudad","trancon","trancón","trafico","tráfico","al trabajo","urbano","corto"], v:"Ciudad"},
  {k:["carretera","viajar","viajes","finca","carreteo","largo","tierra caliente"], v:"Carretera"},
  {k:["familia","hijos","niños","ninos","bebe","bebé","esposa","esposo","cinco personas"], v:"Familia"}
];

/* ═══ UTILIDADES ═══════════════════════════════════════════════════════════ */
function norm(s){
  return (s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^\w\s]/g," ").replace(/\s+/g," ").trim();
}

/* Coincidencia por palabra completa, no por subcadena: buscar "cuanto" dentro
   de la frase hacía que casi toda pregunta cayera en "precio". Una frase de
   dos o más palabras pesa mucho más que una palabra suelta. */
function puntuarUno(tema, n, toks){
  var p=0, hits=[];
  for(var j=0;j<tema.k.length;j++){
    var wn=norm(tema.k[j]), hit=false;
    if(wn.indexOf(" ")>-1){
      if(n.indexOf(wn)>-1){ p+=6; hit=true }
    }else{
      for(var i=0;i<toks.length;i++){
        if(toks[i]===wn || (wn.length>=5 && toks[i].indexOf(wn)===0)){ hit=true; break }
      }
      if(hit) p += (wn.length>=7?3:2);
    }
    if(hit) hits.push(wn);
  }
  return {p:p, hits:hits};
}

/* Los temas "débiles" son las muletillas: hola, listo, ok, bueno, chao. El
   problema real que resolvieron: "listo, quiero verla" caía en `gracias`
   porque "listo" hace match, y el cliente que pedía cita recibía un "con
   gusto". Regla: una muletilla solo manda si es prácticamente todo el
   mensaje —cubre la mitad de las palabras— y nadie más entendió. En
   "bueno pues entonces" no cubre nada real: mejor admitir que no entendió
   que fingir que sí. */
function puntuar(q){
  var n=norm(q), toks=n.split(" ").filter(Boolean), fuertes=[], debiles=[];
  KB.forEach(function(t){
    var s=puntuarUno(t,n,toks);
    if(s.p<=0) return;
    var item={t:t,p:s.p,hits:s.hits};
    if(t.debil){
      var frase = s.hits.some(function(h){ return h.indexOf(" ")>-1 });
      var cubre = s.hits.reduce(function(a,h){ return a + h.split(" ").length }, 0);
      /* pasa si el mensaje ES la muletilla ("hola"), si trae una despedida
         explícita de dos palabras ("lo pienso"), o si cubre medio mensaje.
         "bueno pues entonces" no cumple ninguna: se admite que no entendió. */
      if(toks.length<=2 || frase || cubre/toks.length >= .5) debiles.push(item);
    }else fuertes.push(item);
  });
  fuertes.sort(function(a,b){ return b.p-a.p });
  debiles.sort(function(a,b){ return b.p-a.p });

  /* ── La regla del sujeto ────────────────────────────────────────────────
     "cuánto cuesta el SEGURO" contestaba con el precio del carro. Y peor:
     "cuánto cuesta el MANTENIMIENTO" también. El motivo es que "cuesta",
     "vale" y "cuánto cuesta" son palabras de `precio` y pesan mucho, mientras
     que el sujeto real de la pregunta —seguro, mantenimiento, cargador— pesa
     poco por ser una sola palabra.

     Preguntar cuánto cuesta ALGO es preguntar por ese algo, no por el carro.
     Entonces: `precio` solo gana si nadie más aportó un sujeto. Si otro tema
     reconoció una palabra que no es un verbo de precio, ese manda. */
  if(fuertes.length>1 && fuertes[0].t.id==="precio"){
    var genericas={};
    for(var g=0;g<KB.length;g++) if(KB[g].id==="precio")
      KB[g].k.forEach(function(w){ genericas[norm(w)]=1 });

    for(var f=1;f<fuertes.length;f++){
      var sujeto = fuertes[f].hits.some(function(h){ return !genericas[h] });
      if(sujeto){
        var mejor=fuertes.splice(f,1)[0];
        fuertes.unshift(mejor);
        break;
      }
    }
  }

  return fuertes.concat(debiles);
}

function vetoDe(q){
  var n=norm(q), toks=n.split(" ").filter(Boolean), mejor=null;
  VETO.forEach(function(t){
    var s=puntuarUno(t,n,toks);
    if(s.p>0 && (!mejor || s.p>mejor.p)) mejor={t:t,p:s.p,hits:s.hits};
  });
  return mejor;
}

function detectarVehiculo(q){
  var n=norm(q), mejor=null, mp=0;
  ORDEN.forEach(function(id){
    var v=VEH[id], p=0;
    v.llaves.forEach(function(w){
      var wn=norm(w);
      if(wn.indexOf(" ")>-1){ if(n.indexOf(wn)>-1) p+=6 }
      else{ n.split(" ").forEach(function(tk){ if(tk===wn) p+=4 }) }
    });
    if(p>mp){ mp=p; mejor=id }
  });
  return mejor;
}

function detectarLista(q, lista){
  var n=norm(q);
  for(var i=0;i<lista.length;i++){
    for(var j=0;j<lista[i].k.length;j++){
      if(n.indexOf(norm(lista[i].k[j]))>-1) return lista[i].v;
    }
  }
  return null;
}

function detectarCiudad(q){
  var n=norm(q);
  for(var i=0;i<CIUDADES.length;i++){
    if(n.indexOf(norm(CIUDADES[i]))>-1){
      return CIUDADES[i].charAt(0).toUpperCase()+CIUDADES[i].slice(1);
    }
  }
  return null;
}

/* ═══ LA SESIÓN ════════════════════════════════════════════════════════════
   Una conversación. `responder(texto)` devuelve todo lo que pasó en ese turno,
   sin tocar la pantalla: el simulador lo pinta, el probador lo cuenta. */
function crearSesion(vehiculoInicial){
  var s = {
    lead: {
      vehiculo: vehiculoInicial && VEH[vehiculoInicial] ? vehiculoInicial : "mage",
      ciudad:null, plazo:null, pago:null, uso:null, carga:null,
      interes:[], escalado:null, turnos:0
    },
    fallos: 0,
    empujado: false,
    historia: []
  };

  s.vehiculo = function(){ return VEH[s.lead.vehiculo] };

  s.fijarVehiculo = function(id){
    if(VEH[id]) s.lead.vehiculo = id;
  };

  s.saludo = function(){
    var v = s.vehiculo();
    return "¡Hola! Soy el asesor digital de TORQ.\n\n"+
      "Veo que vienes por "+v.art+" "+v.largo+" — "+v.clase+", desde "+v.precio+".\n\n"+
      "Puedo resolverte dudas de precio, ficha, autonomía, garantía o servicio. También te comparo contra los otros dos de la línea. Y si necesitas algo que solo resuelve una persona, te paso con un asesor.\n\n"+
      "¿Qué quieres saber?";
  };

  s.responder = function(q, opciones){
    s.lead.turnos++;
    var out = {
      pregunta:q, tema:null, puntaje:0, candidatos:[],
      texto:null, escala:null, cambioVehiculo:null, entendido:false, empujon:null
    };

    /* 1 · señales del cliente: se leen SIEMPRE, aunque no se entienda el tema */
    var nuevas=[];
    var c=detectarCiudad(q); if(c && c!==s.lead.ciudad){ s.lead.ciudad=c; nuevas.push("ciudad") }
    var pl=detectarLista(q,PLAZO); if(pl && pl!==s.lead.plazo){ s.lead.plazo=pl; nuevas.push("plazo") }
    var pg=detectarLista(q,PAGO);  if(pg && pg!==s.lead.pago){ s.lead.pago=pg;  nuevas.push("pago") }
    var us=detectarLista(q,USO);   if(us && us!==s.lead.uso){ s.lead.uso=us;    nuevas.push("uso") }
    var cg=detectarLista(q,CARGA); if(cg && cg!==s.lead.carga){ s.lead.carga=cg; nuevas.push("carga") }
    out.senales=nuevas;

    /* 2 · ¿de cuál vehículo habla? El router va antes de responder. */
    var nuevo=detectarVehiculo(q);
    out.vehiculoNombrado = nuevo;
    if(nuevo && nuevo!==s.lead.vehiculo){
      out.cambioVehiculo = {de:s.lead.vehiculo, a:nuevo};
      s.lead.vehiculo = nuevo;
    }
    var v = s.vehiculo();

    /* 3 · GUARDARRAÍL DURO: el veto gana siempre, sin consultar nada más. */
    var veto = vetoDe(q);
    if(veto){
      out.tema="veto:"+veto.t.id; out.puntaje=veto.p; out.entendido=true;
      out.texto=veto.t.r; out.escala=veto.t.esc;
      s.lead.escalado=veto.t.esc; s.fallos=0;
      s.historia.push(out); return out;
    }

    /* 4 · tema normal */
    var items = puntuar(q);
    out.candidatos = items.slice(0,5).map(function(x){ return {id:x.t.id,p:x.p,hits:x.hits} });

    /* 4a · el intérprete.
       Cuando las palabras clave no reconocen nada, el servidor puede pedirle a
       un modelo que diga a QUÉ TEMA se parece el mensaje — y solo eso. El texto
       lo sigue poniendo esta base de conocimiento, nunca el modelo. Un modelo
       que redacta sobre carros inventa cifras; uno que solo clasifica no puede.
       Si el intérprete propone un veto, se trata como veto: gana igual. */
    if(!items.length && opciones && opciones.tema){
      var forzado=null, esVeto=false;
      for(var w=0;w<VETO.length;w++) if(VETO[w].id===opciones.tema){ forzado=VETO[w]; esVeto=true }
      if(!forzado) for(var y=0;y<KB.length;y++) if(KB[y].id===opciones.tema) forzado=KB[y];
      if(forzado){
        out.interpretado=true;
        items=[{t:forzado,p:0,hits:[]}];
        out.candidatos=[{id:forzado.id,p:0,hits:["intérprete"]}];
        if(esVeto){
          out.tema="veto:"+forzado.id; out.entendido=true;
          out.texto=forzado.r; out.escala=forzado.esc;
          s.lead.escalado=forzado.esc; s.fallos=0;
          s.historia.push(out); return out;
        }
      }
    }

    /* 4b · el cliente contestó lo que el bot le preguntó.
       "es para andar en ciudad, al trabajo" no es un tema de la base: es la
       respuesta a "¿para qué lo vas a usar?". Decirle "no entendí" ahí es el
       peor momento posible para decirlo — acaba de colaborar. Si el turno
       trajo una señal nueva, el bot la usa y sigue. */
    /* "hola me interesa el box" no pregunta nada concreto, pero SÍ dice de cuál
       vehículo habla. Presentarlo es mejor respuesta que un saludo genérico. */
    if(!items.length && out.vehiculoNombrado){
      s.fallos=0; out.entendido=true; out.tema="presenta";
      out.texto = v.Art+" "+v.largo+" — "+v.clase+", desde "+v.precio+".\n\n"+
        v.gancho+". Autonomía: "+v.autonomia+".\n\n"+
        "¿Qué quieres saber: precio en detalle, ficha, garantía o servicio?";
      s.historia.push(out); return out;
    }

    if(!items.length && nuevas.length){
      s.fallos=0; out.entendido=true; out.tema="senal:"+nuevas[0];
      var tCual=null;
      for(var z=0;z<KB.length;z++) if(KB[z].id==="cual") tCual=KB[z];
      if((nuevas.indexOf("uso")>-1 || nuevas.indexOf("carga")>-1) && tCual){
        out.tema="cual";
        out.texto = tCual.r(v, s.lead);
      }else if(nuevas.indexOf("ciudad")>-1){
        out.texto = "Anotado, "+s.lead.ciudad+".\n\nAllá hay red de servicio. ¿Qué te gustaría saber del "+v.nombre+" — precio, autonomía, garantía?";
      }else if(nuevas.indexOf("plazo")>-1){
        out.texto = "Perfecto, lo tengo en cuenta.\n\n¿Qué necesitas saber del "+v.nombre+" para decidir?";
      }else{
        out.texto = "Anotado.\n\n¿Qué más quieres saber del "+v.nombre+"?";
      }
      s.historia.push(out); return out;
    }

    if(!items.length){
      s.fallos++;
      if(s.fallos>=3){
        out.texto="Prefiero no adivinar. Te paso con un asesor para que te responda bien.";
        out.escala="nose"; s.lead.escalado="nose"; s.fallos=0;
      }else{
        out.texto="No estoy seguro de haber entendido. Te puedo ayudar con precio, autonomía, ficha técnica, garantía, servicio, retoma o beneficios tributarios.\n\n¿Cuál de esos te sirve?";
      }
      s.historia.push(out); return out;
    }

    s.fallos=0;
    var top=items[0];
    out.tema=top.t.id; out.puntaje=top.p; out.entendido=true;

    var r = (typeof top.t.r==="function") ? top.t.r(v, s.lead) : top.t.r;
    if(r===null){ // el tema decidió no hablar (ej. saludo repetido en turno 1)
      s.historia.push(out); return out;
    }

    if(top.t.id!=="saludo" && top.t.id!=="gracias" && top.t.id!=="despedida" &&
       s.lead.interes.indexOf(top.t.id)<0) s.lead.interes.push(top.t.id);

    if(out.cambioVehiculo) r = "Perfecto, hablemos "+(v.art==="la"?"de la ":"del ")+v.nombre+".\n\n"+r;
    out.texto=r;

    if(top.t.esc){ out.escala=top.t.esc; s.lead.escalado=top.t.esc }

    /* 5 · el empujón: el bot no se queda contestando para siempre. Después de
       tres temas resueltos sin escalar, propone el siguiente paso UNA vez. */
    if(!out.escala && !s.empujado && !s.lead.escalado && s.lead.interes.length>=3){
      s.empujado = true;
      out.empujon = "Por lo que hemos hablado, creo que ya tienes lo que necesitas para decidir si te vale la pena verlo en persona."+
        (s.lead.ciudad ? " ¿Te agendo una prueba de ruta en "+s.lead.ciudad+"?" : " ¿En qué ciudad estás? Te agendo una prueba de ruta.");
    }

    s.historia.push(out);
    return out;
  };

  return s;
}

/* ═══ SALIDA ═══════════════════════════════════════════════════════════════ */
var API = {
  VEH:VEH, ORDEN:ORDEN, KB:KB, VETO:VETO, ESC:ESC, COMUN:COMUN,
  crearSesion:crearSesion, puntuar:puntuar, norm:norm,
  temas: function(){ return KB.map(function(t){return t.id}) },
  vetos: function(){ return VETO.map(function(t){return t.id}) }
};

if(typeof module!=="undefined" && module.exports) module.exports = API;
else global.TORQBOT = API;

})(typeof window!=="undefined" ? window : this);
