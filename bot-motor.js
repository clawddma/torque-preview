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
    /* Del tablero de inventario de Corautos, 28 de julio de 2026 (ver
       COBERTURA.md). Antes decía "Negro" a secas, que no existe: son
       bicolores. */
    colores:"Azul, Blanco y Plata, más dos bicolor: Blanco/Negro y Plata/Negro",
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
      {n:"E2",  precio:"$84.990.000", bateria:"44,94 kWh LFP", autonomia:"401 km CLTC", carga:"30 minutos del 30 al 80%",
       extra:"rines de 17 pulgadas"},
      {n:"E2+", precio:"$89.990.000", bateria:"51,87 kWh LFP", autonomia:"470 km CLTC", carga:"18 minutos del 30 al 80%",
       extra:"rines de 18 pulgadas y luces LED adaptativas"}
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
    versiones:[
      {n:"E2", precio:"$69.990.000", bateria:"43,89 kWh LFP", autonomia:"430 km CLTC", carga:"30 minutos",
       extra:"cámara de reversa, rines de acero y 4 parlantes"},
      {n:"E3", precio:"$74.990.000", bateria:"43,89 kWh LFP", autonomia:"430 km CLTC", carga:"30 minutos",
       extra:"cámara panorámica de 360°, rines de aluminio y asiento eléctrico con memoria, calefacción y ventilación"}
    ],
    baul:"326 litros",
    medidas:null,
    colores:null,
    colores:"Azul, Blanco y Plata, y varios bicolor: Azul/Blanco, Rojo/Blanco, Verde/Blanco, Rosa Perlado/Blanco y Violeta Perlado/Blanco. Es el de la línea con más carta de color",
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
  r:function(v,lead){
    /* Antes esta respuesta listaba el precio de los otros dos SIEMPRE. Con la
       MAGE eso era un autogol: al cliente que ya se decidió por la de
       $109.000.000 se le ponían al lado dos carros más baratos que no pidió.
       Ningún vendedor hace eso.

       La comparación se OFRECE, no se impone. Si el cliente la quiere —y
       muchos la quieren— la pide, y ahí el bot la da completa y con criterio.
       Lo que sí se dice sin que lo pidan es cuando hay una versión más
       económica DEL MISMO carro, porque eso no le quita la venta a nadie. */
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
        "¿Quieres que un asesor te confirme el precio vigente para tu ciudad? Y si te sirve, te lo comparo con los otros dos de la línea o contra la competencia.";
    }
    return v.Art+" "+v.nombre+" está en "+v.precio+", con IVA incluido y sujeto a confirmación con la sala.\n\n"+
      "¿Quieres que un asesor te confirme el precio vigente para tu ciudad? Y si te sirve, te lo comparo con los otros dos de la línea o contra la competencia.";
  }, espera:"precioAsesor"},

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
  }, espera:function(lead){ return lead.carga ? "verDetalle" : "puedeCargar" }},

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
  }, espera:function(lead){ return lead.carga ? null : "puedeCargar" }},

 {id:"instalacion", k:["instalar cargador","instalar el cargador","cuesta instalar","instalacion","instalación","instalacion del cargador","instalación del cargador","wallbox","cargador de pared","obra","electricista","conjunto","administracion","administración","copropiedad","permiso de la"],
  r:function(v){
    if(v.tec==="hibrido") return "Con la "+v.nombre+" no aplica: no se enchufa, así que no hay cargador que instalar ni permiso que pedir en el conjunto.\n\nEse es justamente su argumento.";
    return "La instalación del cargador en casa depende de tu acometida eléctrica y, si vives en conjunto, del permiso de la copropiedad.\n\n"+
      /* Mismo criterio que el seguro: instalar el cargador no es asunto del
         distribuidor, es una necesidad del cliente que nosotros resolvemos.
         Ese contacto se captura, no se regala. */
      "El costo cambia caso por caso, así que no te doy una cifra al aire.\n\nTe lo puedo cotizar con uno de nuestros aliados, que van, lo miran y te dan el valor real. Te hago dos preguntas rápidas y listo.\n\n¿Arrancamos? Responde SÍ y seguimos.";
  }, sub:"instalacion"},

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
  }, espera:function(lead){ return VEH[lead.vehiculo] && VEH[lead.vehiculo].tec==="hibrido" ? "simulador" : null }},

 {id:"ficha", k:["potencia","caballos","hp","torque","motor","especificac","ficha","tecnica","técnica","velocidad","transmision","transmisión","bateria","batería","kwh","cuanta bateria","cuánta batería"],
  r:function(v){
    var t = v.Art+" "+v.nombre+" da "+v.motor+".";
    if(v.tec==="electrico") t += "\n\nBatería de "+v.bateria+", "+v.autonomia+" y "+v.carga+".";
    else t += "\n\nBatería de "+v.bateria+".";
    return t+"\n\n¿Quieres la ficha completa?";
  }, espera:"ficha"},

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
    if(lead.ciudad) return frasesCobertura("servicio", lead.ciudad);
    return "Hay "+COMUN.red+"\n\nSon más sitios para atenderla que para comprarla. ¿En qué ciudad estás? Con eso el asesor te dice cuál te queda más cerca.";
  }, espera:function(lead){ return lead.ciudad ? "direccionTaller" : null }},

 /* Sale del mismo hallazgo del seguro: al arreglar "cuánto cuesta el
    mantenimiento" el bot pasó a contestar cuántos talleres hay, que no es lo
    que preguntaron. No tenemos tarifas de mantenimiento; inventarlas sería
    exactamente lo que este bot no hace. */
 {id:"costoservicio", k:["cuanto cuesta el mantenimiento","cuanto vale el mantenimiento","cuanto sale el mantenimiento","precio del mantenimiento","costo del mantenimiento","costo de mantenimiento","valor del mantenimiento","cuanto cuesta la revision","mantenimiento cuanto"],
  r:"El costo de los mantenimientos lo fija cada centro de servicio y depende del kilometraje de la revisión, así que no te voy a dar una cifra que no pueda sostener.\n\nLo que sí es cierto: un eléctrico no lleva cambios de aceite ni filtros de combustible, y los mantenimientos son más espaciados y más baratos que los de un carro a gasolina.\n\nTe paso con un asesor para que te den el plan de mantenimiento con valores reales.", esc:"costoservicio"},

 {id:"seguridad", k:["seguridad","airbag","frenos","abs","asistencia","adas","camara","cámara","punto ciego","carril","choque","segura","es seguro","que tan seguro","qué tan seguro","tan segura"],
  r:function(v){ return COMUN.seguridad+"\n\nLa línea suma conducción asistida nivel 2: frenado automático de emergencia, control crucero adaptativo, mantenimiento de carril, monitoreo de punto ciego y visión 360°.\n\nLa dotación exacta cambia por versión; te la confirma la sala." }},

 {id:"colores", k:["color","colores","blanco","negro","azul","plata","gris","rojo","verde","rosa","violeta"],
  r:function(v,lead){
    if(lead.color) return "Anotado: "+lead.color+".\n\nLa disponibilidad por color cambia según el lote, así que el asesor te confirma si hay "+lead.color.toLowerCase()+" disponible hoy. ¿Quieres que lo revise?";
    if(v.colores) return v.Art+" "+v.nombre+" viene en "+v.colores+".\n\nLa disponibilidad por color cambia según el lote. ¿Cuál te interesa? Lo confirmo con la sala.";
    return "La carta de colores del "+v.nombre+" cambia por lote y por versión, así que prefiero no darte una lista que no pueda sostener.\n\n¿Qué color buscas? Se lo pregunto a la sala y te confirman qué hay disponible hoy.";
  }},

 {id:"reforma", k:["reforma","reforma tributaria","proyecto","sube el iva","subir","aumenta el precio","van a subir"],
  r:"Hoy los híbridos pagan 5% de IVA. El gobierno radicó el 22 de julio un proyecto que lo subiría a 19%.\n\nSi ese proyecto se aprueba, la MAGE pasaría de $109.000.000 a unos $123.500.000. Ojo: está radicado, no aprobado — todavía puede cambiar o no pasar.\n\nNo te lo pongo como presión de venta: es un hecho público que conviene que sepas."},

 {id:"devolucion", k:["devolucion","devolución","devuelven","recuperar","upme","dian","beneficio tributario","exencion","exención","iva","impuesto"],
  r:"La DIAN fijó un procedimiento para devolver el IVA de vehículos certificados por la UPME, dentro de los 5 años siguientes a la factura.\n\nNo te lo puedo dar por hecho: depende de tu caso particular y el criterio ha cambiado. Lo que sí puedo es ponerte con alguien que lo revise contigo con tus documentos.", esc:"tributario"},

 {id:"picoyplaca", k:["pico y placa","pico placa","restriccion","restricción","circulacion","circulación","dia sin carro","día sin carro","exento","impuesto vehicular","impuesto de rodamiento","soat","matricula","matrícula"],
  r:"Esa es de las preguntas donde no te quiero dar un dato bonito y equivocado: **el pico y placa y el impuesto vehicular los define cada ciudad y cada departamento, y las reglas para eléctricos e híbridos han cambiado varias veces.**\n\nHay beneficios reales, pero dependen de dónde vives y del año. Te paso con un asesor para que te confirme exactamente qué aplica en tu ciudad hoy.", esc:"normativo"},

 {id:"seguro", k:["el seguro","un seguro","del seguro","mi seguro","poliza","póliza","aseguradora","asegurar","asegurarlo","asegurarla","todo riesgo","soat","cuanto vale el seguro","seguro del carro","seguro del vehiculo"],
  /* Historia de esta respuesta, porque cada línea salió de una corrección:
     1. Decía "no te la voy a estimar" — regañaba. Fuera.
     2. Decía que "la sala trabaja con aliados", y eso le regalaba el contacto
        a Corautos. El seguro no es del distribuidor.
     3. Sacaba a los aliados en la primera frase: se sentía lejano, como si lo
        estuvieran pasando a otro antes de atenderlo. Ahora se habla de un
        asesor especializado, que es lo que el cliente entiende.
     4. Era larga. Cuatro párrafos para decir "depende" cansan a cualquiera.

     Y el motivo de negocio, que es el que manda: la cotización del seguro es
     el ÚNICO punto donde TORQ se entera de si el carro efectivamente se
     facturó. Nadie asegura un vehículo que no compró. Por eso se ofrece
     siempre que el cliente pregunte —no se le insiste nunca si no pregunta—
     y por eso vale la pena que la respuesta sea corta y fácil de aceptar. */
  r:function(v,lead){
    return "El valor lo pone la aseguradora: cambia con tu edad, tu historial al volante y la ciudad. Darte una cifra ahora sería inventármela.\n\n"+
      "Si quieres te la cotizo de verdad: dos preguntas rápidas y un asesor especializado te contacta con el valor de tu caso.\n\n"+
      "¿Te la cotizo? Responde SÍ y seguimos.";
  }, sub:"seguro"},

 /* Preguntar "¿hay sala allá?" es preguntar por cobertura de VENTA, no por
    prueba de ruta. Este tema va antes justamente para desambiguar: mira de
    cuál de las cuatro coberturas se trata y responde esa. */
 {id:"cobertura", k:["cobertura","cubren","hay sala","tienen sala","hay vitrina","hay concesionario",
   "venden en","venden alla","venden allá","atienden en","atienden alla","atienden allá","llegan a",
   "tienen presencia","hay taller","hay taller alla","hay taller allá","tienen sede","hay sede",
   "en mi ciudad","para mi ciudad","hasta alla","hasta allá","hay en mi ciudad"],
  r:function(v,lead){
    var tipo = tipoDeCobertura(q_actual) || "venta";
    return frasesCobertura(tipo, lead.ciudad);
  }, espera:function(lead){
    /* Ahora que tenemos las listas, cuando SÍ hay cobertura la respuesta
       cierra ofreciendo la dirección — no hace falta escalar de una. */
    var t = tipoDeCobertura(q_actual) || "venta";
    var c = COBERTURA[t];
    if(!lead.ciudad || !c.ciudades) return null;
    return c.ciudades.some(function(x){ return norm(x)===norm(lead.ciudad) }) ? "direccionTaller" : null;
  }, esc:function(lead, q){
    /* Solo se escala cuando el bot NO puede resolverlo: una prueba de ruta
       (no sabemos dónde hay unidad demo) o una ciudad sin cobertura, donde
       hay que explicarle al cliente cómo se maneja su caso. */
    if(!lead.ciudad) return null;
    var t = tipoDeCobertura(q) || "venta";
    if(t==="prueba") return "agenda";
    var c = COBERTURA[t];
    if(!c.ciudades) return "pedido";
    return c.ciudades.some(function(x){ return norm(x)===norm(lead.ciudad) }) ? null : "pedido";
  }},

 {id:"prueba", k:["prueba","probar","manejar","test drive","ruta","ver el carro","conocer","visitar","cita","agendar","donde queda","dónde queda","vitrina","sala","direccion","dirección","horario","verla","verlo","quiero verla","quiero verlo","quiero conocerla","me gustaria verla","me gustaría verla","ir a mirarla"],
  r:function(v,lead){
    /* "Se agenda con la sala de tu ciudad" daba por hecho que hay sala —y
       unidad de prueba— donde vive el cliente. Son dos coberturas distintas
       y de ninguna tenemos la lista. */
    var t = "Claro que se puede agendar.";
    if(lead.ciudad) t += "\n\nLo que no te puedo confirmar por aquí es si hay unidad de prueba en "+lead.ciudad+": eso depende de la sala y cambia. Te paso con un asesor para que te diga dónde y qué día puedes manejarla.";
    else t += "\n\nDime en qué ciudad estás y te paso con un asesor para que cuadren dónde y qué día puedes manejarla.";
    return t;
  }, esc:"agenda"},

 {id:"credito", k:["credito","crédito","con credito","con crédito","a credito","por credito","cuota","cuota mensual","financia","financiar","banco","tasa","plazo","inicial","aprobar","aprobacion","aprobación","cuotas","mensual","leasing"],
  r:"El crédito lo estudia y aprueba la sala con sus aliados financieros; yo no puedo aprobarlo ni darte una tasa.\n\nLo que sí tenemos es un simulador de costo en la página, pero es ilustrativo y no constituye una oferta. Te paso con un asesor para que te dé condiciones reales.", esc:"credito"},

 {id:"retoma", k:["retoma","parte de pago","entregar mi","entregar el","para entregar","mi carro","mi camioneta","mi moto",
   "cambio","permuta","usado","recibir mi","reciben mi","cuanto me dan","cuánto me dan","cuanto me reciben",
   "avaluo","avalúo","lo tengo","tengo un","tengo una","doy mi","dar mi",
   "mazda","renault","chevrolet","toyota","kia","nissan","hyundai","ford","volkswagen","suzuki","logan","duster","sandero","spark","picanto","corolla","onix","tucson","sportage"],
  r:function(v,lead){
    var base = "Sí se recibe vehículo en parte de pago. El avalúo lo hace la sala directamente, porque depende del estado, el kilometraje y el modelo.";
    /* Si ya dijo qué carro tiene, volver a preguntárselo es el error que más
       enfría una conversación. */
    if(lead.usado) return base+"\n\nYa anoté tu "+lead.usado+". Te paso con un asesor para que vaya adelantando el avalúo.";
    return base+"\n\n¿Qué carro tienes? Se lo paso al asesor para que vaya adelantando.";
  }, esc:"retoma"},

 {id:"renting", k:["renting","arriendo","alquiler","suscripcion","suscripción","empresa","flota","varias unidades","corporativo","facturar a nombre"],
  r:"El renting y los planes para empresa los manejamos caso por caso, porque cambian según el plazo, el kilometraje y el número de unidades.\n\nTe paso con un asesor para armarte una propuesta concreta.", esc:"renting"},

 {id:"disponible", k:["disponible","inventario","entrega","entregan","stock","unidades","llega","cuando llega","hay disponible","cuanto se demora la entrega","inmediata","la quiero","lo quiero","quiero comprar","me la llevo","me lo llevo","cuando me la entregan","hay en"],
  r:function(v,lead){
    /* Antes era pura reserva: "no te quiero dar una fecha", y de remate le
       preguntaba la ciudad al cliente que acababa de decirla. Sí hay unidades
       con entrega inmediata —está publicado en el sitio— y decirlo no es
       prometer nada: lo que se verifica es el color y la versión. */
    var t = "Sí, hay unidades "+(v.art==="la"?"de la ":"del ")+v.nombre+" con entrega inmediata.\n\n"+
      "Lo que cambia de un día a otro es el color y la versión exacta, así que eso se verifica con la sala en el momento — no te doy un color que después no esté.";
    if(lead.ciudad) return t+"\n\nAnoto que estás en "+lead.ciudad+". ¿Quieres que un asesor te confirme hoy mismo qué hay disponible para allá?";
    return t+"\n\n¿En qué ciudad estás? Con eso el asesor te confirma qué hay disponible.";
  }, espera:function(lead){ return lead.ciudad ? "precioAsesor" : null }},

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

 /* Todo bot bueno sabe decir qué sabe hacer. El nuestro contestaba "no
    entendí" a "¿en qué más me puedes ayudar?", que es la peor respuesta
    posible: el cliente está pidiendo permiso para seguir. */
 {id:"capacidades", k:["que me puedes ayudar","qué me puedes ayudar","en que me ayudas","en qué me ayudas",
   "que puedes hacer","qué puedes hacer","que sabes","qué sabes","como me ayudas","cómo me ayudas",
   "que mas","qué más","en que mas","en qué más","ayudame","ayúdame","que informacion tienes","opciones"],
  r:function(v,lead){
    return "Te ayudo con lo que necesites saber antes de decidir:\n\n"+
      "· Precio y versiones de los tres — Vigo, Box y MAGE\n"+
      "· Autonomía, consumo, ficha técnica y espacio\n"+
      "· Compararlos entre ellos o contra otras marcas\n"+
      "· Garantía, talleres y cobertura en tu ciudad\n"+
      "· Colores y disponibilidad\n"+
      "· Cotizarte el seguro con nuestro aliado\n\n"+
      "Y cuando quieras avanzar: prueba de ruta, crédito o retoma de tu carro los cuadra un asesor. "+
      "¿Por dónde empezamos?";
  }},

 /* Recapitular antes de cerrar. Un cliente que pide el resumen está a punto
    de decidir, y el asesor que reciba el lead necesita exactamente esto. */
 {id:"resumen", k:["resumen","resume","resúmeme","resumeme","recapitula","recapitulemos","en resumen",
   "que hemos hablado","qué hemos hablado","lo que hablamos","reca","dime todo","recapitulame"],
  r:function(v,lead){
    var L=[];
    L.push("· Vehículo: "+v.largo+" ("+v.precio+")");
    if(lead.ciudad) L.push("· Ciudad: "+lead.ciudad);
    if(lead.plazo)  L.push("· Compra: "+lead.plazo);
    if(lead.pago)   L.push("· Pago: "+lead.pago);
    if(lead.carga)  L.push("· ¿Puede cargar en casa?: "+lead.carga);
    if(lead.color)  L.push("· Color que le gustó: "+lead.color);
    if(lead.usado)  L.push("· Vehículo para entregar: "+lead.usado);
    if(lead.interes.length) L.push("· Temas que miramos: "+lead.interes.join(", "));
    if(L.length<=1) return "Todavía no hemos hablado mucho. Cuéntame qué te interesa saber "+(v.art==="la"?"de la ":"del ")+v.nombre+" y lo vamos armando.";
    return "Esto es lo que llevamos:\n\n"+L.join("\n")+
      "\n\n¿Sigo con algo más, o te paso con un asesor para cerrar?";
  }},

 {id:"humano", k:["asesor","persona","humano","hablar con","llamar","telefono","teléfono","alguien","atienda","un vendedor","no me sirves","eres un bot","eres un robot"],
  r:"Con gusto. Te paso con un asesor especializado.", esc:"pedido"},

 {id:"saludo", debil:true, k:["hola","buenas","buenos dias","buenos días","buenas tardes","buenas noches","que tal","qué tal","hey","saludos","alo","aló"],
  r:function(v,lead){
    /* Antes devolvía null en el primer turno y el bot se quedaba MUDO. Y
       después repetía el menú completo, que ya estaba en el saludo. */
    if(lead.interes.length) return "¡Hola! Aquí sigo. ¿Seguimos donde íbamos o quieres mirar otra cosa?";
    return "¡Hola! Cuéntame qué quieres saber "+(v.art==="la"?"de la ":"del ")+v.nombre+
           ": precio, autonomía, garantía, colores o dónde le hacen el mantenimiento.";
  }},

 /* Un "sí" suelto, sin pregunta pendiente, no es incomprensión: es un cliente
    diciendo que siga. Contestarle "no entendí" es la peor forma de recibir un
    gesto de colaboración. Es tema débil: solo gana si no hay nada mejor. */
 {id:"afirmacion", debil:true, k:["si","sí","claro","dale","obvio","sip","listo si","si señor"],
  r:function(v){ return "Listo. ¿Qué quieres saber "+(v.art==="la"?"de la ":"del ")+v.nombre+" — precio, autonomía, garantía o dónde le hacen el mantenimiento?" }},

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

/* ═══ LOS ALIADOS ═════════════════════════════════════════════════════════
   Se nombran aquí y en ningún otro lado. Cuando cambie un aliado —o cuando
   aparezca el del cargador, que todavía no existe— se edita una fila y queda
   corregido en el chat, en las respuestas rápidas y en el simulador.

   Nombrar al aliado no es un detalle de estilo: bajo la Ley 1581 el titular
   tiene que saber A QUIÉN se le entregan sus datos ANTES de darlos. Por eso
   el nombre va en la oferta, no solo en el cierre. */
var ALIADOS = {
  /* Los nombres se ponen SOLO cuando el acuerdo esté cerrado por escrito.
     Nombrar a un aliado antes de eso es prometerle al cliente algo que
     todavía no existe — el mismo error que evitamos con las cifras.
     Mientras `nombre` sea null, el bot dice "uno de nuestros aliados", que
     es cierto y no compromete a nadie. Cuando se confirme, se llena esta
     fila y queda corregido en el chat, en las respuestas rápidas y en el
     simulador al mismo tiempo. */
  seguros: { nombre:null, confirmado:false },  // en conversación, sin cerrar
  cargador:{ nombre:null, confirmado:false }   // pendiente de conseguir
};
function aliado(k){
  var a=ALIADOS[k];
  return (a && a.nombre) ? a.nombre : "uno de nuestros aliados";
}

/* ═══ COBERTURA — CUATRO COBERTURAS DISTINTAS, NO UNA ══════════════════════
   Daniel dijo que estaba en Bucaramanga y el bot contestó "allá hay red de
   servicio". No lo sabemos. Sabemos que Corautos tiene 26 centros en 19
   ciudades, pero **en ningún documento del proyecto está CUÁLES son esas 19**.
   El bot estaba afirmando ciudad por ciudad un dato que nadie le dio.

   Y encima tratándolo todo como una sola cobertura. Son cuatro y no coinciden:

     servicio · dónde le hacen mantenimiento → 26 centros / 19 ciudades
     venta    · dónde hay sala para comprarlo
     prueba   · dónde hay unidad de demostración para manejarla
     seguro   · dónde opera la corredora aliada

   Una ciudad puede tener taller y no sala. Puede tener sala y no unidad de
   prueba. Decir "sí hay" sin saberlo es el error que más caro sale: el
   cliente se desplaza, no encuentra nada, y la culpa se la lleva la marca.

   Mientras `ciudades` sea null, el bot dice lo que sabe a nivel país y deja
   que el asesor confirme la ciudad. Cuando Corautos entregue las listas se
   llenan aquí y el bot pasa a responder con certeza. */
var COBERTURA = {
  /* Listas tomadas de la pieza oficial de Corautos (fuentes/cobertura-
     corautos-2026-07-26.jpg): 22 puntos de venta, 26 talleres, 20 ciudades.
     El detalle que importa son las excepciones —Cartagena y Santa Marta
     tienen taller pero no sala; Tunja tiene sala pero no taller— porque son
     exactamente los casos donde afirmar de más manda a un cliente a un sitio
     que no existe. Todo el detalle en COBERTURA.md. */
  servicio: {
    nombre:"taller de servicio",
    pais:"26 talleres de servicio técnico en 19 ciudades del país y más de 100 puntos de repuestos",
    ciudades:["bogotá","medellín","copacabana","cali","bucaramanga","cúcuta","ibagué","neiva",
              "manizales","pereira","cartagena","barranquilla","montería","santa marta",
              "valledupar","pasto","popayán","villavicencio","duitama"],
    cercana:{"tunja":"Duitama"},
    quePasa:"cuál te queda más cerca"
  },
  venta: {
    nombre:"punto de venta",
    pais:"22 puntos de venta en 18 ciudades del país",
    ciudades:["bogotá","medellín","copacabana","cali","bucaramanga","cúcuta","ibagué","neiva",
              "manizales","pereira","barranquilla","montería","valledupar","pasto","popayán",
              "villavicencio","tunja","duitama"],
    cercana:{"cartagena":"Barranquilla","santa marta":"Barranquilla"},
    quePasa:"desde cuál sala te lo pueden entregar"
  },
  prueba: {
    nombre:"prueba de ruta",
    /* Tener sala NO garantiza unidad de demostración, y eso no lo dice
       ninguna pieza. Se deja en null a propósito. */
    pais:"la prueba de ruta se agenda con la sala que tenga unidad disponible",
    ciudades:null,        // ⚠️ PENDIENTE: en cuáles salas hay unidad demo
    quePasa:"dónde y qué día puedes manejarla"
  },
  seguro: {
    nombre:"cotización de seguro",
    pais:"la cotización se hace con nuestro aliado y no depende de dónde vivas",
    ciudades:null,
    quePasa:"las condiciones para tu ciudad"
  }
};

var TIPO_COBERTURA = [
  {id:"prueba",   k:["prueba de ruta","probar","manejar","test drive","manejarla","manejarlo","conducirla","tirarle","sacarla a"]},
  {id:"servicio", k:["taller","mantenimiento","servicio","repuesto","posventa","revision","revisión","garantia alla","garantía allá"]},
  {id:"seguro",   k:["seguro","poliza","póliza","aseguradora"]},
  {id:"venta",    k:["sala","vitrina","concesionario","comprar","comprarlo","comprarla","entrega","entregar","venden","vender","exhibicion","exhibición"]}
];

function tipoDeCobertura(q){
  var n=norm(q), mejor=null, mp=0;
  TIPO_COBERTURA.forEach(function(t){
    var p=0;
    t.k.forEach(function(w){
      var wn=norm(w);
      if(wn.indexOf(" ")>-1){ if(n.indexOf(wn)>-1) p+=6 }
      else n.split(" ").forEach(function(tk){ if(tk===wn || (wn.length>=6 && tk.indexOf(wn)===0)) p+=2 });
    });
    if(p>mp){ mp=p; mejor=t.id }
  });
  return mejor;
}

/* La frase que NUNCA afirma ni niega una ciudad concreta mientras no tengamos
   la lista. Es más larga que "sí, allá hay", y es la única honesta. */
function frasesCobertura(tipo, ciudad){
  var c = COBERTURA[tipo] || COBERTURA.servicio;
  if(c.ciudades){
    if(!ciudad) return c.pais.charAt(0).toUpperCase()+c.pais.slice(1)+". ¿En qué ciudad estás?";
    var hay = c.ciudades.some(function(x){ return norm(x)===norm(ciudad) });
    if(hay) return "Sí, en "+ciudad+" hay "+c.nombre+".\n\nEn total son "+c.pais+
                   ". ¿Quieres que un asesor te dé la dirección exacta y los horarios?";
    var cerca = c.cercana && c.cercana[norm(ciudad)];
    return "En "+ciudad+" no hay "+c.nombre+" — te lo digo de frente para que no te desplaces en vano."+
      (cerca ? "\n\nEl más cercano está en "+cerca+"." : "")+
      "\n\nEn total son "+c.pais+". Un asesor te confirma cuál te queda mejor y cómo se maneja tu caso.";
  }
  var P = c.pais.charAt(0).toUpperCase()+c.pais.slice(1);
  if(!ciudad) return P+". ¿En qué ciudad estás? Con eso te confirmo "+c.quePasa+".";
  return P+".\n\nNo tengo la lista ciudad por ciudad, así que no te voy a decir que sí hay en "+ciudad+
         " sin estar seguro. Te paso con un asesor para que te confirme "+c.quePasa+" — es cosa de minutos.";
}

/* ═══ COMPARAR ENTRE LO NUESTRO ════════════════════════════════════════════
   El hueco que encontró Daniel: el bot tenía tres vehículos y no sabía
   ponerlos uno al lado del otro. Le preguntaron "¿cuál es la autonomía de
   este y me lo comparas con el Vigo?" y contestó solo la carga del Vigo —
   además de cambiarse de carro, porque bastaba nombrar otro para que el
   enrutador moviera toda la conversación.

   Dos cosas estaban mal y las dos son de ontología, no de redacción:

   1. `comparar` solo sabía medirse contra OTRAS marcas. Comparar entre los
      tres propios —que es la pregunta más frecuente cuando hay una línea de
      tres— no existía.
   2. Nombrar otro vehículo se leía como "hablemos de ese". En una
      comparación es al revés: el otro es el término de comparación, no el
      nuevo tema.

   El valor de verdad está en la última línea de cada comparación: decir en
   qué se parecen y en qué NO son comparables. Enfrentar los 1.000 km de una
   híbrida con los 470 de un eléctrico sin explicar que unos son con gasolina
   y otros con electricidad es desinformar con cifras ciertas. */

var DIMENSIONES = [
  {id:"autonomia", k:["autonomia","autonomía","kilometros","kilómetros","km","recorre","rinde","alcanza","cuanto anda","cuánto anda","rango"],
   titulo:"Autonomía",
   dato:function(v){ return v.autonomia },
   nota:"Ojo con compararlas de frente: la MAGE hace esos kilómetros con gasolina y sin enchufarse nunca; el Vigo y el Box los hacen con una carga de electricidad. Son dos formas de gastar menos, no la misma."},

  {id:"precio", k:["precio","cuesta","vale","valor","costo","mas barato","más barato","economico","económico"],
   titulo:"Precio",
   dato:function(v){ return v.versiones ? v.versiones.map(function(x){return x.n+" "+x.precio}).join(" · ") : v.precio },
   nota:"Todos con IVA incluido y sujetos a confirmación con la sala. Falta la matrícula, que cambia por ciudad."},

  {id:"potencia", k:["potencia","caballos","hp","torque","motor","fuerza","acelera"],
   titulo:"Potencia",
   dato:function(v){ return v.motor },
   nota:"La MAGE es la más potente de la línea por bastante; los eléctricos entregan su fuerza desde cero, que en ciudad se siente distinto a la cifra."},

  {id:"espacio", k:["espacio","baul","baúl","maleta","tamaño","grande","cabe","familia","puestos"],
   titulo:"Espacio",
   dato:function(v){ return v.baul + (v.medidas ? " · "+v.medidas : "") },
   nota:"Los tres son de cinco puestos. La diferencia real está en el baúl y en el largo."},

  {id:"bateria", k:["bateria","batería","kwh","carga","cargar","enchufe","enchufar"],
   titulo:"Batería y carga",
   dato:function(v){ return v.tec==="hibrido"
      ? v.bateria+" — no se enchufa nunca"
      : v.bateria+" · carga rápida en "+v.carga },
   nota:"La MAGE no se enchufa: su batería se recarga sola andando. Los otros dos sí, y ahí lo que manda es si tienes dónde cargar en casa."}
];

function detectarDimension(q){
  var n=norm(q), mejor=null, mp=0;
  DIMENSIONES.forEach(function(d){
    var p=0;
    d.k.forEach(function(w){
      var wn=norm(w);
      if(wn.indexOf(" ")>-1){ if(n.indexOf(wn)>-1) p+=6 }
      else n.split(" ").forEach(function(tk){ if(tk===wn || (wn.length>=5 && tk.indexOf(wn)===0)) p+=2 });
    });
    if(p>mp){ mp=p; mejor=d }
  });
  return mejor;
}

var PIDE_COMPARAR = ["compara","comparar","comparalo","compáralo","comparame","compárame","comparacion","comparación",
  "versus"," vs ","contra","diferencia entre","diferencias entre","cual es mejor","cuál es mejor",
  "frente a","al lado del","cual conviene mas","cuál conviene más","entre el","entre la"];

function pideComparar(q){
  var n=" "+norm(q)+" ";
  return PIDE_COMPARAR.some(function(w){ return n.indexOf(norm(w))>-1 });
}

/* Marcas de la competencia. Si el cliente compara contra una de ellas, la
   comparación NO es entre lo nuestro: es la del tema `comparar`, que tiene
   las cifras verificadas de cada rival. */
var RIVALES = ["corolla","sportage","territory","mazda","toyota","kia","byd","geely","chery",
  "seagull","dolphin","mg","mg4","ev2","ex5","yuan","starray","icar","niro","renault","nissan",
  "suzuki","hyundai","volkswagen","ford","chevrolet","haval","jetour","omoda"];
function nombraRival(q){
  var toks=norm(q).split(" ");
  return RIVALES.some(function(r){ return toks.indexOf(r)>-1 });
}

/* Todos los vehículos que el mensaje nombra, no solo el que más puntúa. */
function vehiculosNombrados(q){
  var n=norm(q), res=[];
  ORDEN.forEach(function(id){
    var hay = VEH[id].llaves.some(function(w){
      var wn=norm(w);
      return wn.indexOf(" ")>-1 ? n.indexOf(wn)>-1 : n.split(" ").indexOf(wn)>-1;
    });
    if(hay) res.push(id);
  });
  return res;
}

/* "¿Cuál es la diferencia entre la E2 y la E2+?" no compara carros: compara
   versiones del mismo. Es de las preguntas que más deciden una venta, porque
   ahí está la plata que el cliente sube o no sube. */
var VERSIONADAS = ["e2","e2+","e3","e2 mas","version de entrada","versión de entrada","la de entrada","la full","tope de gama","la basica","la básica","versiones"];
function pideVersiones(q){
  var toks=norm(q).replace(/\+/g," mas ").split(" ");
  var n=" "+norm(q)+" ";
  return VERSIONADAS.some(function(w){
    var wn=norm(w);
    return wn.indexOf(" ")>-1 ? n.indexOf(wn)>-1 : toks.indexOf(wn)>-1;
  });
}

function compararVersiones(v){
  if(!v.versiones) return null;
  var t = v.Art+" "+v.nombre+" tiene dos versiones:\n\n";
  v.versiones.forEach(function(x){
    t += "· "+x.n+" — "+x.precio+"\n  "+x.autonomia+", batería de "+x.bateria+", carga en "+x.carga+
         (x.extra ? ".\n  Suma "+x.extra : "")+".\n\n";
  });
  var d = parseInt(v.versiones[1].precio.replace(/\D/g,""),10) - parseInt(v.versiones[0].precio.replace(/\D/g,""),10);
  t += "La diferencia son $"+d.toLocaleString("es-CO")+".\n\n¿Quieres que un asesor te diga cuál hay disponible hoy?";
  return t;
}

function compararNuestros(ids, dim){
  var lista = ids.map(function(id){ return VEH[id] });
  var d = dim || DIMENSIONES[1];   /* sin dimensión pedida: precio */
  var t = d.titulo+", uno al lado del otro:\n\n";
  lista.forEach(function(v){
    t += "· "+v.nombre+" — "+d.dato(v)+"\n";
  });
  /* No se ofrece comparar en lo que se acaba de comparar. Suena a que el bot
     no escuchó — y es exactamente lo que el cliente ya preguntó. */
  var otras = DIMENSIONES.filter(function(x){ return x.id!==d.id })
                         .map(function(x){ return x.titulo.toLowerCase() });
  t += "\n"+d.nota+"\n\n¿Los comparo en algo más? Tengo "+
       otras.slice(0,-1).join(", ")+" o "+otras[otras.length-1]+".";
  return t;
}

/* ═══ REPETIR LA MISMA PREGUNTA CON OTRO DATO ═════════════════════════════
   "¿Hay prueba de ruta en Cúcuta?" … "¿Y en Cartagena?"

   Eso último no es un dato suelto: es LA MISMA PREGUNTA con otra ciudad. El
   bot anotaba la ciudad y volvía al menú, y el cliente tenía que reescribir
   toda la frase. En una conversación de venta eso es donde se cae el lead:
   el que pregunta por dos ciudades está comparando dónde comprar.

   Lo mismo con el vehículo: si venían hablando de precio y el cliente dice
   "¿y el Box?", quiere el precio del Box, no una presentación del Box.

   Estos son los temas que cambian de respuesta según la ciudad o según el
   carro. Los demás no se repiten: preguntar la garantía otra vez porque
   cambió de ciudad no tiene sentido. */
var TEMAS_POR_CIUDAD   = ["cobertura","servicio","prueba","disponible"];
var TEMAS_POR_VEHICULO = ["precio","consumo","ficha","espacio","colores","disponible",
                          "enchufe","comparar","seguridad","instalacion"];

function buscarTema(id){
  for(var i=0;i<KB.length;i++) if(KB[i].id===id) return KB[i];
  return null;
}

/* ═══ EXPECTATIVAS — LO QUE EL BOT ACABA DE PROMETER ═══════════════════════
   El agujero que faltaba, y el que más caro salía.

   El bot hacía quince preguntas y solo sabía qué hacer con cinco. Ofrecía el
   simulador de ahorro y, cuando el cliente decía "dale, compártelo",
   contestaba un menú genérico: había prometido algo y no lo entregaba. Peor
   todavía: proponía la prueba de ruta —el momento exacto de la conversión—
   y un "sí" no hacía absolutamente nada.

   La causa no era cada respuesta suelta: era que el motor tenía memoria de
   los HECHOS (qué carro, qué ciudad, qué guardarraíles) pero no del CONTRATO
   de la conversación: qué acabo de preguntar, y qué significa un "sí" en
   este momento.

   Aquí vive eso. Cada respuesta que termina en pregunta declara qué espera y
   qué hacer con el sí y con el no. Una expectativa dura un solo turno: un
   "sí" tres mensajes después ya no es respuesta a nada. */
var SITIO = "https://clawddma.github.io/torque-preview/";

function recomendar(lead){
  if(lead.carga==="No") return VEH.mage;
  if(lead.uso==="Familia" || lead.uso==="Carretera") return VEH.vigo;
  return VEH.box;
}

var ESPERAS = {

  /* "En la página hay un simulador… ¿Te lo comparto?" — y no lo compartía. */
  simulador: {
    si:function(v){ return {texto:"Claro, aquí está:\n\n"+SITIO+v.url+"#simulador\n\nPones tu consumo de hoy y los kilómetros que haces al mes, y te dice cuánto cambiaría tu gasto.\n\n¿Te ayudo con algo más?"} },
    no:function(v){ return {texto:"Listo. ¿Qué más quieres saber "+(v.art==="la"?"de la ":"del ")+v.nombre+"?"} }
  },

  ficha: {
    si:function(v){ return {texto:"Aquí la tienes completa:\n\n"+SITIO+v.url+"#ficha\n\nSi quieres te resumo algo puntual, dime qué."} },
    no:function(v){ return {texto:"Listo. ¿Qué más te gustaría saber?"} }
  },

  precioAsesor: {
    si:function(v,lead){ return {texto:"Perfecto. Te paso con un asesor para que te confirme el precio vigente"+(lead.ciudad?" en "+lead.ciudad:"")+" y la disponibilidad real.", escala:"pedido"} },
    no:function(v){ return {texto:"Listo. ¿Qué más quieres saber?"} }
  },

  verDetalle: {
    si:function(v,lead){ return {texto:"Listo. Te paso con un asesor para que te muestre "+v.art+" "+v.nombre+" en detalle y cuadren una prueba de ruta.", escala:"agenda"} },
    no:function(v){ return {texto:"Sin problema. ¿Quieres que miremos otro de la línea, o prefieres preguntarme algo puntual?"} }
  },

  direccionTaller: {
    si:function(v,lead){ return {texto:"Listo. Te paso con un asesor para que te dé la dirección exacta"+(lead.ciudad?" en "+lead.ciudad:"")+" y los horarios.", escala:"pedido"} },
    no:function(v){ return {texto:"Listo. ¿Qué más te gustaría saber?"} }
  },

  /* "¿Tienes dónde cargar?" — un sí o un no aquí decide cuál carro se
     recomienda, y antes se perdía por completo. */
  puedeCargar: {
    si:function(v,lead){
      lead.carga="Sí"; var rec=recomendar(lead); lead.vehiculo=rec.id;
      return {texto:"Perfecto, eso te abre los eléctricos.\n\nCon parqueadero propio, "+rec.art+" "+rec.nombre+" es el que más te cuadra: "+rec.gancho.toLowerCase()+", desde "+rec.precio+".\n\n¿Quieres que te lo muestre en detalle?", espera:"verDetalle"};
    },
    no:function(v,lead){
      lead.carga="No"; lead.vehiculo="mage";
      return {texto:"Entonces te ahorro un dolor de cabeza: sin dónde cargar de noche, un eléctrico se vuelve una vuelta cada semana.\n\nLa MAGE es híbrida y nunca se enchufa: tanqueas gasolina normal y hace 4,9 litros a los 100 km. Desde "+VEH.mage.precio+".\n\n¿Te la muestro en detalle?", espera:"verDetalle"};
    }
  },

  /* El empujón: el bot propone la prueba de ruta y un "sí" no hacía nada.
     Es el momento de la conversión — perderlo ahí es perder el lead. */
  /* Después de comparar, un "y en precio?" es seguir la misma comparación,
     no una pregunta nueva sobre un solo carro. Sin esto el cliente tenía que
     repetir "compárame el precio del Vigo y la MAGE" cada vez. */
  otraDimension: {
    libre:function(v,lead,q,ctx){
      /* Solo continúa si el mensaje es un FRAGMENTO —"y en precio?"— no una
         pregunta completa. Si nombra un carro concreto ("cuánto vale la
         MAGE") ya no está comparando: está preguntando por ese. */
      if(norm(q).split(" ").length>6) return null;
      if(vehiculosNombrados(q).length) return null;
      var d = detectarDimension(q);
      if(!d || d.id===ctx.dim) return null;
      return {texto: compararNuestros(ctx.ids, d), espera:"otraDimension",
              ctx:{ids:ctx.ids, dim:d.id}};
    }
  },

  agendar: {
    si:function(v,lead){ return {texto:"Listo, eso es lo mejor: verlo en persona resuelve más que cualquier ficha.\n\nTe paso con un asesor para que cuadren día y hora"+(lead.ciudad?" en "+lead.ciudad:"")+".", escala:"agenda"} },
    no:function(v){ return {texto:"Sin afán, tranquilo. Aquí sigo para lo que necesites saber."} }
  }
};

/* ═══ SUBFLUJOS — UNA CONVERSACIÓN, DOS LEADS ══════════════════════════════
   Un cliente que pregunta por el seguro no es una conversación que se acabó:
   es un segundo negocio dentro de la misma charla. Antes el bot decía "te
   paso con un asesor" y ahí moría el tema; ahora hace las dos preguntas que
   una aseguradora necesita para cotizar de verdad, se guarda ese lead aparte,
   y devuelve la conversación al carro sin que el cliente sienta el corte.

   Reglas que hacen que esto no se vuelva un interrogatorio:
   · Máximo dos preguntas. Más que eso y el cliente se va.
   · Si en medio del subflujo pregunta otra cosa, MANDA su pregunta. El bot
     suelta el hilo y responde lo que le preguntaron; no secuestra la charla.
   · Nunca se pide cédula, fecha de nacimiento ni dato de contacto: rango de
     edad y siniestros bastan para que el aliado llame. Pedir documento por
     chat está prohibido por el guardarraíl `datos` y por la Ley 1581.
   · Un "no" se acepta a la primera y no se vuelve a insistir. */
var SUBFLUJOS = {
  seguro: {
    lead:"seguro",
    etiqueta:"Cotización de seguro",
    pasos:[
      {campo:"edad",
       pregunta:"¿En qué rango de edad estás: 18 a 25, 26 a 40, o más de 40? Es lo que más mueve la prima."},
      {campo:"siniestros",
       pregunta:"Y la última: ¿has tenido choques o siniestros en los últimos dos años?"}
    ],
    cierre:function(lead,datos){
      var v=VEH[lead.vehiculo];
      return "Listo, con eso me sirve. Un asesor especializado te contacta con la cotización de todo riesgo para "+
        (v ? v.art+" "+v.nombre : "el vehículo")+
        (lead.ciudad?" en "+lead.ciudad:"")+".\n\n"+
        "Sigamos con el carro, que es lo importante: ¿qué más quieres saber?";
    },
    /* Si dice que no, se cierra el tema de una y sin insistir. */
    rechazo:"Tranquilo, sin problema. Si más adelante lo quieres mirar, me dices y lo movemos.\n\nSigamos con el carro: ¿qué más te gustaría saber?"
  },

  instalacion: {
    lead:"cargador",
    etiqueta:"Instalación de cargador",
    pasos:[
      {campo:"vivienda",
       pregunta:"Listo. Dos preguntas y ya.\n\n¿Vives en casa o en conjunto? Lo pregunto porque en conjunto toca permiso de la administración y eso cambia el tiempo."},
      {campo:"parqueadero",
       pregunta:"Entendido. ¿El parqueadero es propio y tiene toma cerca, o habría que llevar la acometida desde el contador?"}
    ],
    cierre:function(lead,datos){
      return "Con eso el técnico ya sabe a qué va. Se lo paso a "+aliado("cargador")+" para que te armen la cotización de la instalación"+
        (lead.ciudad?" en "+lead.ciudad:"")+".\n\nSigamos con el carro: ¿en qué más te ayudo?";
    },
    rechazo:"Listo, lo dejamos ahí. Cuando lo necesites me dices y lo miramos.\n\nSigamos con el carro: ¿qué más quieres saber?"
  }
};

var AFIRMA = ["si","sí","claro","dale","listo","bueno","ok","okay","vale","por favor","hagale","hágale","de una","obvio","me interesa","porfa","sip","correcto","exacto","perfecto"];
var NIEGA  = ["no","nop","ahorita no","por ahora no","despues","después","luego","todavia no","todavía no","no gracias","asi esta bien","así está bien","no por ahora"];

function esSi(q){ var n=norm(q); return AFIRMA.some(function(w){ return n===w || n.indexOf(w+" ")===0 || n.indexOf(" "+w)>-1 }) }
function esNo(q){ var n=norm(q); return NIEGA.some(function(w){ return n===w || n.indexOf(w+" ")===0 || n.indexOf(" "+w+" ")>-1 }) }

/* ═══ SEÑALES QUE EL BOT VA APRENDIENDO DEL CLIENTE ════════════════════════ */
/* Las 32 capitales de departamento más los municipios grandes de las áreas
   metropolitanas. Antes eran 30 ciudades en un país con 1.100 municipios: un
   cliente de Barrancabermeja escribía "me encuentro en Barrancabermeja" y el
   bot le preguntaba en qué ciudad estaba. La lista cerrada nunca va a
   alcanzar, por eso además está `ciudadPorPatron` más abajo. */
var CIUDADES = ["bogotá","bogota","medellín","medellin","cali","barranquilla","cartagena",
  "cúcuta","cucuta","bucaramanga","pereira","santa marta","ibagué","ibague","pasto","manizales",
  "neiva","villavicencio","armenia","valledupar","montería","monteria","sincelejo","popayán","popayan",
  "riohacha","tunja","florencia","quibdó","quibdo","yopal","mocoa","san andrés","san andres",
  "arauca","leticia","inírida","inirida","mitú","mitu","puerto carreño","puerto carreno","san josé del guaviare","san jose del guaviare",
  "barrancabermeja","girardot","rionegro","envigado","itagüí","itagui","bello","sabaneta","copacabana","la estrella","caldas",
  "soacha","chía","chia","zipaquirá","zipaquira","facatativá","facatativa","funza","mosquera","madrid","cajicá","cajica","cota","fusagasugá","fusagasuga",
  "soledad","malambo","apartadó","apartado","turbo","yumbo","palmira","buga","tuluá","tulua","cartago","jamundí","jamundi",
  "duitama","sogamoso","piedecuesta","floridablanca","girón","giron","dosquebradas","la dorada","magangué","magangue",
  "maicao","ipiales","tumaco","buenaventura","espinal","melgar","garzón","garzon","pitalito","aguachica","ocaña","ocana"];

/* Y cuando la ciudad no está en la lista —que va a pasar—, se reconoce por la
   forma de la frase: "estoy en X", "me encuentro en X", "vivo en X". Vale más
   anotar un nombre desconocido que preguntarle otra vez al cliente algo que
   ya dijo. */
var PATRON_CIUDAD = /(?:estoy en|me encuentro en|vivo en|soy de|desde|aqui en|aquí en|resido en|ciudad de|en la ciudad de)\s+([a-záéíóúñü][a-záéíóúñü.\- ]{2,28})/i;
var NO_CIUDAD = ["la ciudad","mi ciudad","este momento","el momento","casa","el trabajo","la empresa",
  "colombia","el pais","el país","la costa","el norte","el sur","proceso","busca","realidad","este caso"];

function ciudadPorPatron(q){
  var m = String(q||"").match(PATRON_CIUDAD);
  if(!m) return null;
  var bruto = m[1].trim().replace(/[.,;].*$/,"").split(/\s+(?:y|pero|aunque|porque|para|con)\s+/)[0].trim();
  if(bruto.length<4 || bruto.split(" ").length>3) return null;
  if(NO_CIUDAD.indexOf(norm(bruto))>-1) return null;
  /* "estoy en este momento buscando" no es una ciudad. Un nombre propio no
     empieza por determinante ni por pronombre. */
  var DET = ["este","esta","ese","esa","esto","eso","mi","tu","su","el","la","los","las",
             "un","una","unos","unas","otro","otra","proceso","plan","busca","varios","muchas","muchos"];
  if(DET.indexOf(norm(bruto).split(" ")[0])>-1) return null;
  return bruto.split(" ").map(function(p){
    return p.charAt(0).toUpperCase()+p.slice(1).toLowerCase();
  }).join(" ");
}

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
  var p=0, hits=[], yaVi={};
  for(var j=0;j<tema.k.length;j++){
    var wn=norm(tema.k[j]), hit=false;
    /* "si" y "sí" normalizan al mismo token, igual que "poliza"/"póliza".
       Sin esto la misma coincidencia sumaba dos veces y un "sí" suelto
       llegaba a puntaje de tema fuerte. */
    if(yaVi[wn]) continue;
    yaVi[wn]=1;
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
      /* Sin quitar repetidos, "si" y "sí" —que normalizan al mismo token—
         contaban dos veces y hacían que "si o que" pareciera cubrir medio
         mensaje. Un mensaje confuso debe quedar confuso. */
      var unicos = s.hits.filter(function(h,ix){ return s.hits.indexOf(h)===ix });
      var cubre = unicos.reduce(function(a,h){ return a + h.split(" ").length }, 0);
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

var q_actual = "";

function detectarCiudad(q){
  var n=norm(q);
  /* primero las conocidas, de la más larga a la más corta: sin eso "cali"
     ganaría dentro de "Calima" y "Buga" dentro de "Bugalagrande" */
  var orden = CIUDADES.slice().sort(function(a,b){ return b.length-a.length });
  for(var i=0;i<orden.length;i++){
    var c=norm(orden[i]);
    if(new RegExp("(^|\\s)"+c+"($|\\s)").test(n)){
      return orden[i].split(" ").map(function(p){
        return p.charAt(0).toUpperCase()+p.slice(1);
      }).join(" ");
    }
  }
  return ciudadPorPatron(q);
}

/* ═══ LA SESIÓN ════════════════════════════════════════════════════════════
   Una conversación. `responder(texto)` devuelve todo lo que pasó en ese turno,
   sin tocar la pantalla: el simulador lo pinta, el probador lo cuenta. */
function crearSesion(vehiculoInicial){
  var s = {
    lead: {
      vehiculo: vehiculoInicial && VEH[vehiculoInicial] ? vehiculoInicial : "mage",
      ciudad:null, plazo:null, pago:null, uso:null, carga:null, color:null, usado:null,
      interes:[], escalado:null, turnos:0
    },
    fallos: 0,
    empujado: false,
    sub: null,
    espera: null,
    ultimoTema: null,
    ultimoCob: null,
    historia: []
  };

  s.vehiculo = function(){ return VEH[s.lead.vehiculo] };

  s.fijarVehiculo = function(id){
    if(VEH[id]) s.lead.vehiculo = id;
  };

  s.saludo = function(){
    var v = s.vehiculo();
    /* Cuatro párrafos para saludar espantan. Uno basta: quién soy, qué carro
       traes y una pregunta abierta. */
    return "¡Hola! Soy el asesor digital de TORQ 👋\n\n"+
      "Veo que vienes por "+v.art+" "+v.largo+" — "+v.clase+", desde "+v.precio+".\n\n"+
      "¿Qué quieres saber?";
  };

  s.responder = function(q, opciones){
    q_actual = q;          /* algunas respuestas necesitan la frase completa */
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

    /* El color que le gustó y el carro que quiere entregar son datos de venta,
       no charla. "El rojo me gusta" hacía que el bot repitiera la carta de
       colores; ahora queda anotado y el asesor lo recibe. */
    var col = (norm(q).match(/\b(blanco|negro|azul|plata|gris|rojo|verde|rosa|violeta)\b/)||[])[1];
    if(col && /gusta|quiero|prefiero|me encanta|ese|me sirve|busco|seria|sería/.test(norm(q))
       && col!==norm(s.lead.color||"")){
      s.lead.color = col.charAt(0).toUpperCase()+col.slice(1); nuevas.push("color");
    }
    var us2 = q.match(/\b(mazda|renault|chevrolet|toyota|kia|nissan|hyundai|ford|volkswagen|suzuki|logan|duster|sandero|spark|picanto|corolla|onix|tucson|sportage)\b[^,.;]{0,20}/i);
    if(us2 && !s.lead.usado){
      s.lead.usado = us2[0].replace(/\s+(para|de|que|y|lo|en)\s.*$/i,"").trim()
                       .replace(/^./, function(c){ return c.toUpperCase() });
      nuevas.push("usado");
    }
    out.senales=nuevas;

    /* 2 · ¿de cuál vehículo habla?
       Con una salvedad que costó un reporte: si el cliente está PIDIENDO una
       comparación, nombrar otro carro no significa "hablemos de ese". El
       sujeto sigue siendo el suyo y el otro es el término de comparación.
       Antes bastaba decir "compáralo con el Vigo" para que toda la
       conversación se mudara al Vigo. */
    var nombrados = vehiculosNombrados(q);
    /* Comparar sin nombrar a nadie —"compárame la potencia", "compáralos
       todos"— es comparar los tres. Y si nombra un rival, manda el tema
       `comparar`, que tiene las cifras verificadas de la competencia. */
    var comparando = pideComparar(q) && !nombraRival(q);
    var nuevo = comparando ? null : detectarVehiculo(q);
    out.vehiculoNombrado = nuevo;
    if(nuevo && nuevo!==s.lead.vehiculo){
      out.cambioVehiculo = {de:s.lead.vehiculo, a:nuevo};
      s.lead.vehiculo = nuevo;
    }
    var v = s.vehiculo();

    /* 2b · comparación entre los nuestros.
       Va antes de los temas porque "¿cuál es la autonomía y me lo comparas
       con el Vigo?" trae DOS intenciones, y la que manda es la comparación:
       responder solo la autonomía de uno deja al cliente sin lo que pidió. */
    /* versiones del mismo carro */
    if(pideVersiones(q) && v.versiones){
      out.tema="versiones:"+v.id; out.entendido=true;
      out.texto=compararVersiones(v);
      s.fallos=0; s.espera={id:"precioAsesor", turno:s.lead.turnos};
      if(s.lead.interes.indexOf("precio")<0) s.lead.interes.push("precio");
      s.historia.push(out); return out;
    }

    if(comparando){
      var ids = nombrados.slice();
      if(ids.indexOf(s.lead.vehiculo)<0) ids.unshift(s.lead.vehiculo);
      if(ids.length<=1) ids = ORDEN.slice();          /* "compáralos" a secas */
      var dim = detectarDimension(q);
      out.tema = "compara:"+ids.join("-")+(dim?":"+dim.id:"");
      out.entendido = true;
      out.texto = compararNuestros(ids, dim);
      if(s.lead.interes.indexOf("comparar")<0) s.lead.interes.push("comparar");
      s.fallos=0;
      s.espera={id:"otraDimension", turno:s.lead.turnos, ctx:{ids:ids, dim:dim?dim.id:"precio"}};
      s.historia.push(out); return out;
    }

    /* 3 · GUARDARRAÍL DURO: el veto gana siempre, sin consultar nada más. */
    var veto = vetoDe(q);
    if(veto){
      out.tema="veto:"+veto.t.id; out.puntaje=veto.p; out.entendido=true;
      out.texto=veto.t.r; out.escala=veto.t.esc;
      s.lead.escalado=veto.t.esc; s.fallos=0;
      s.historia.push(out); return out;
    }

    /* 3a · ¿el cliente está contestando lo que el bot acaba de preguntar?
       Va antes de los temas porque un "sí" no es un tema: es una respuesta.
       Solo vale para el turno inmediatamente siguiente, y solo si el mensaje
       no trae una pregunta de fondo — si cambió de tema, manda su tema. */
    if(s.espera && s.espera.turno === s.lead.turnos-1){
      var espId0 = s.espera.id;
      var esp = ESPERAS[espId0];
      var otro = puntuar(q);
      var pisaTema = otro.length && !otro[0].t.debil && otro[0].p>=6;
      /* "No, me refiero al Box" empieza por "no", pero no está contestando:
         está corrigiendo. Si el turno nombra otro vehículo o trae una
         fórmula de corrección, la expectativa se suelta y manda la
         corrección. Tratar una corrección como un "no" es la forma más
         rápida de que el cliente sienta que no lo están escuchando. */
      var corrige = /me refiero|quise decir|no era|no es eso|estoy hablando de|hablo de|es sobre|del otro/.test(norm(q))
                    || vehiculosNombrados(q).length>0;
      var ctxEsp = s.espera.ctx || {};
      if(corrige) s.espera = null;
      var si = !corrige && esSi(q), no = !corrige && esNo(q);
      if(!corrige && esp && esp.libre){
        var libre = esp.libre(v, s.lead, q, ctxEsp);
        if(libre){
          out.tema="resp:"+espId0; out.entendido=true; out.texto=libre.texto;
          s.espera = libre.espera ? {id:libre.espera, turno:s.lead.turnos, ctx:libre.ctx} : null;
          s.fallos=0; s.historia.push(out); return out;
        }
        s.espera=null;
      }
      else if(esp && !pisaTema && (si || no)){
        var res = (si ? esp.si : esp.no)(v, s.lead);
        out.tema = "resp:"+espId0; out.entendido = true;
        out.texto = res.texto;
        if(res.escala){ out.escala=res.escala; s.lead.escalado=res.escala }
        s.espera = res.espera ? {id:res.espera, turno:s.lead.turnos} : null;
        s.fallos = 0;
        s.historia.push(out); return out;
      }
      s.espera = null;   /* no contestó a eso: la promesa caduca */
    }

    /* 3b · ¿hay un subflujo abierto? (cotización de seguro o de cargador)
       Va después del veto —un descuento se atiende siempre— y antes de los
       temas. Pero con una salvaguarda: si el cliente preguntó otra cosa
       claramente, su pregunta manda y el subflujo se suelta. Un bot que no
       deja cambiar de tema es un formulario, no una conversación. */
    if(s.sub){
      var fuera = puntuar(q);
      /* Solo un tema FUERTE interrumpe la cotización. Un "sí", un "ok" o un
         "listo" son respuestas a lo que se está preguntando, no un cambio de
         conversación. */
      var cambioDeTema = fuera.length && !fuera[0].t.debil && fuera[0].p>=6;
      if(cambioDeTema){
        out.subAbandonado = s.sub.id;
        s.sub = null;
      }else{
        var fl = SUBFLUJOS[s.sub.id];
        out.tema = "sub:"+s.sub.id; out.entendido = true;

        if(s.sub.paso===0 && !s.sub.confirmado){
          if(esNo(q)){
            out.texto = fl.rechazo; s.sub=null;
            s.historia.push(out); return out;
          }
          if(!esSi(q)){
            /* ni sí ni no: se pregunta una vez más y no se insiste más */
            if(s.sub.reintento){ s.sub=null; out.tema=null; out.entendido=false }
            else{
              s.sub.reintento=true;
              out.texto="No te entendí. ¿Te hago las dos preguntas para cotizarlo? Responde SÍ o NO.";
              s.historia.push(out); return out;
            }
          }else{
            s.sub.confirmado=true;
            out.texto=fl.pasos[0].pregunta;
            s.historia.push(out); return out;
          }
        }else{
          /* guarda la respuesta del paso actual y avanza */
          s.sub.datos[fl.pasos[s.sub.paso].campo] = q.slice(0,120);
          s.sub.paso++;
          if(s.sub.paso < fl.pasos.length){
            out.texto = fl.pasos[s.sub.paso].pregunta;
            s.historia.push(out); return out;
          }
          /* cerrado: sale el SEGUNDO lead y la charla vuelve al carro */
          out.texto = fl.cierre(s.lead, s.sub.datos);
          out.leadSecundario = {tipo:fl.lead, etiqueta:fl.etiqueta, datos:s.sub.datos};
          s.lead.secundarios = (s.lead.secundarios||[]).concat([fl.lead]);
          s.sub = null;
          s.historia.push(out); return out;
        }
      }
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
    /* "¿Y el Box?" después de hablar de precio es el precio del Box. */
    if(!items.length && out.vehiculoNombrado && TEMAS_POR_VEHICULO.indexOf(s.ultimoTema)>-1){
      var tv = buscarTema(s.ultimoTema);
      if(tv){
        s.fallos=0; out.entendido=true; out.tema=s.ultimoTema; out.repetido=true;
        out.texto = (typeof tv.r==="function") ? tv.r(v, s.lead) : tv.r;
        var e3 = (typeof tv.esc==="function") ? tv.esc(s.lead, q) : tv.esc;
        if(e3){ out.escala=e3; s.lead.escalado=e3 }
        s.historia.push(out); return out;
      }
    }

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
      /* Ciudad nueva y una pregunta viva: se repite esa pregunta, no se
         vuelve al menú. */
      if(nuevas.indexOf("ciudad")>-1 && TEMAS_POR_CIUDAD.indexOf(s.ultimoTema)>-1){
        var tRep = buscarTema(s.ultimoTema);
        if(tRep){
          if(s.ultimoTema==="cobertura") q_actual = s.ultimoCob || "venta";
          out.tema = s.ultimoTema; out.repetido = true;
          out.texto = (typeof tRep.r==="function") ? tRep.r(v, s.lead) : tRep.r;
          var e2 = (typeof tRep.esc==="function") ? tRep.esc(s.lead, q_actual) : tRep.esc;
          if(e2){ out.escala=e2; s.lead.escalado=e2 }
          s.historia.push(out); return out;
        }
      }
      if((nuevas.indexOf("uso")>-1 || nuevas.indexOf("carga")>-1) && tCual){
        out.tema="cual";
        out.texto = tCual.r(v, s.lead);
      }else if(nuevas.indexOf("ciudad")>-1){
        /* Decía "allá hay red de servicio" sin tener la lista de las 19
           ciudades. Afirmar cobertura ciudad por ciudad sin saberlo es el
           error que hace que un cliente se desplace a un taller que no
           existe — y la culpa se la lleva la marca. */
        out.texto = "Anotado, "+s.lead.ciudad+".\n\n¿Qué te gustaría saber "+(v.art==="la"?"de la ":"del ")+v.nombre+" — precio, autonomía, garantía o dónde le hacen el mantenimiento?";
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

    /* Dos preguntas en un mensaje. "¿Cuánto vale y qué garantía tiene?" traía
       DOS intenciones y el bot contestaba una — la otra se perdía y el cliente
       tenía que volver a escribirla. La gente escribe así en WhatsApp: de
       corrido y sin puntuación.

       Se responden las dos, en el orden en que aparecen en la frase, y solo
       si las dos son informativas: si una escala o abre una cotización, esa
       manda sola para no encimarle dos cosas al cliente. */
    /* ── VARIAS PREGUNTAS EN UN MENSAJE ────────────────────────────────
       "Precio y autonomía y prueba de ruta en Armenia" son TRES cosas, y el
       bot contestaba una. La regla anterior tenía un error de fondo: excluía
       del multi-intento cualquier tema que escalara — justo el que suele ir
       de último y cerrar la venta.

       El orden correcto es el de la frase: se responde todo lo que se puede
       responder, y la que necesita a un humano va al final y escala. Así el
       cliente recibe sus respuestas Y queda conectado, en un solo turno.

       Hasta tres: más que eso es un mensaje ilegible en WhatsApp. */
    var nq = norm(q);
    var posDe = function(it){
      var m = 1e9;
      it.hits.forEach(function(h){ var i2=nq.indexOf(h); if(i2>-1 && i2<m) m=i2 });
      return m;
    };
    /* El conector tiene que estar ENTRE las dos, no en cualquier parte. "Y si
       sube la reforma, ¿qué pasa con el precio?" empieza por "y" y menciona
       precio, pero es UNA sola pregunta: el "y" de arranque no separa nada. */
    var hayConector = function(a,b){
      var i1=Math.min(a,b), i2=Math.max(a,b);
      if(i2-i1<5) return false;
      var tramo = nq.slice(i1, i2);
      return /(^|\s)(y|e|tambien|también|ademas|además|otra cosa|de paso)(\s|$)/.test(tramo)
             || /[,;]/.test(q.slice(i1, i2));
    };

    var multi = [items[0]];
    for(var mi=1; mi<items.length && multi.length<3; mi++){
      var c = items[mi];
      if(c.p<2 || c.t.debil) continue;
      if(multi.some(function(x){ return x.t.id===c.t.id })) continue;
      if(!multi.every(function(x){ return hayConector(posDe(x), posDe(c)) })) continue;
      multi.push(c);
    }
    multi.sort(function(a,b){ return posDe(a)-posDe(b) });

    /* la que necesita a un humano va de última: primero se resuelve todo lo
       que sí se puede resolver */
    multi.sort(function(a,b){
      var ea = (a.t.esc||a.t.sub)?1:0, eb=(b.t.esc||b.t.sub)?1:0;
      return ea-eb;
    });

    var top=multi[0];
    out.tema=top.t.id; out.puntaje=top.p; out.entendido=true;

    delete s.lead._ofrecio;
    var r = (typeof top.t.r==="function") ? top.t.r(v, s.lead) : top.t.r;
    if(r===null){ // el tema decidió no hablar (ej. saludo repetido en turno 1)
      s.historia.push(out); return out;
    }

    if(top.t.id!=="saludo" && top.t.id!=="gracias" && top.t.id!=="despedida" &&
       s.lead.interes.indexOf(top.t.id)<0) s.lead.interes.push(top.t.id);

    /* las demás intenciones se contestan a continuación, en el mismo turno */
    for(var k2=1; k2<multi.length; k2++){
      var otro = multi[k2];
      var rN = (typeof otro.t.r==="function") ? otro.t.r(v, s.lead) : otro.t.r;
      if(!rN) continue;
      r = r + "\n\n───\n\n" + rN;
      out.tema += "+" + otro.t.id;
      if(s.lead.interes.indexOf(otro.t.id)<0) s.lead.interes.push(otro.t.id);
      var eN = (typeof otro.t.esc==="function") ? otro.t.esc(s.lead, q) : otro.t.esc;
      if(eN){ out.escala=eN; s.lead.escalado=eN }
      if(otro.t.sub && SUBFLUJOS[otro.t.sub] && !(s.lead.secundarios||[]).includes(otro.t.sub)
         && s.lead._ofrecio!==false){
        s.sub = {id:otro.t.sub, paso:0, confirmado:false, datos:{}};
        out.abreSub = otro.t.sub;
      }
    }

    if(out.cambioVehiculo) r = "Perfecto, hablemos "+(v.art==="la"?"de la ":"del ")+v.nombre+".\n\n"+r;
    out.texto=r;

    var escVal = (typeof top.t.esc==="function") ? top.t.esc(s.lead, q) : top.t.esc;
    if(escVal){ out.escala=escVal; s.lead.escalado=escVal }

    /* lo que este tema deja prometido para el turno siguiente */
    s.ultimoTema = top.t.id;
    if(top.t.id==="cobertura") s.ultimoCob = tipoDeCobertura(q) || "venta";

    var espId = (typeof top.t.espera==="function") ? top.t.espera(s.lead) : top.t.espera;
    if(espId && ESPERAS[espId] && !out.escala) s.espera = {id:espId, turno:s.lead.turnos};

    /* El tema abre una cotización paralela: se arma el subflujo y el próximo
       turno lo atiende el bloque 3b. */
    if(top.t.sub && SUBFLUJOS[top.t.sub] && !(s.lead.secundarios||[]).includes(top.t.sub)
       && s.lead._ofrecio !== false){
      s.sub = {id:top.t.sub, paso:0, confirmado:false, datos:{}};
      out.abreSub = top.t.sub;
    }

    /* 5 · el empujón: el bot no se queda contestando para siempre. Después de
       tres temas resueltos sin escalar, propone el siguiente paso UNA vez. */
    if(!out.escala && !s.empujado && !s.lead.escalado && s.lead.interes.length>=3){
      s.empujado = true;
      s.espera = {id:"agendar", turno:s.lead.turnos};
      out.empujon = "Por lo que hemos hablado, creo que ya tienes lo que necesitas para decidir si te vale la pena verlo en persona."+
        (s.lead.ciudad ? " ¿Te agendo una prueba de ruta en "+s.lead.ciudad+"?" : " ¿En qué ciudad estás? Te agendo una prueba de ruta.");
    }

    s.historia.push(out);
    return out;
  };

  return s;
}

/* ═══ SALIDA ═══════════════════════════════════════════════════════════════ */
/* La versión del motor viaja en cada reporte de la sala de pruebas.
   Nació de un caso real: Daniel marcó tres respuestas malas que YA estaban
   corregidas — su teléfono tenía guardada la copia anterior de este archivo.
   Sin este número, un reporte no dice si describe el bot de hoy o el de
   ayer, y se corrige dos veces lo mismo. Se sube al cambiar la lógica o
   cualquier cifra. */
var VERSION = "2026-07-28.22";

/* ═══ LO QUE YA SE CORRIGIÓ ════════════════════════════════════════════════
   Cada vez que arreglo algo que Daniel o Camilo marcaron, la frase del
   cliente queda anotada aquí. La sala de pruebas compara sus marcas contra
   esta lista y borra sola las que ya quedaron resueltas, avisando cuáles y
   por qué.

   Existe para que la lista de "esto suena mal" sea siempre trabajo PENDIENTE
   y no un archivo de quejas viejas. Una lista que solo crece deja de leerse,
   y ahí se muere el ciclo.

   La comparación es por parecido, no exacta: nadie vuelve a escribir la
   misma frase con las mismas tildes. */
var RESUELTOS = [
  {q:"cuanto cuesta un seguro para este vehiculo",
   arreglo:"Preguntar cuánto cuesta ALGO ya no cae en el precio del carro. Y la respuesta del seguro se reescribió: menos tosca, y ahora el contacto con el aliado lo ofrecemos nosotros, no la sala.",
   ver:"2026-07-28.5"},
  {q:"cuanto cuesta aproximadamente un seguro para este vehiculo",
   arreglo:"Igual que la anterior: es el mismo defecto con otra redacción.",
   ver:"2026-07-28.5"},
  {q:"cuanto cuesta aproximadamente un seguro con sur americano para este vehiculo",
   arreglo:"La respuesta del seguro se reescribió: se explica sin regañar y ofrecemos poner al cliente con nuestro aliado para cotizar.",
   ver:"2026-07-28.5"},
  {q:"cuanto vale la mage",
   arreglo:"Al preguntar el precio ya no se listan los otros dos más baratos sin que los pidas: eso era ponerle competencia propia a una venta que ya iba avanzando. Ahora la comparación se ofrece, y si la quieres se da completa.",
   ver:"2026-07-28.22"},
  {q:"precio y autonomia y prueba de ruta en armenia",
   arreglo:"Tres preguntas en un mensaje ahora reciben tres respuestas, en el orden en que las escribiste, y la que necesita a un asesor va de última para que quedes conectado sin perder las otras.",
   ver:"2026-07-28.21"},
  {q:"cuanto vale y que garantia tiene",
   arreglo:"Dos preguntas en un mensaje ahora reciben dos respuestas. Y se sumaron: qué sabe hacer el bot, el resumen de la conversación, reconocer la marca del carro que entregas en parte de pago, y anotar el color que te gustó.",
   ver:"2026-07-28.20"},
  {q:"hay servicio para prueba de ruta en cucuta y en cartagena",
   arreglo:"«¿Y en Cartagena?» ya no pierde la pregunta: repite la misma para la ciudad nueva. Lo mismo con el carro: si venían hablando de precio y dices «¿y el Box?», te da el precio del Box, no una presentación.",
   ver:"2026-07-28.19"},
  {q:"servicios en cucuta",
   arreglo:"Ya está cargada la cobertura real de Corautos: 22 puntos de venta y 26 talleres en 20 ciudades, con las excepciones (Cartagena y Santa Marta sin sala, Tunja sin taller).",
   ver:"2026-07-28.19"},
  {q:"se puede hacer la prueba de ruta en mi ciudad bucaramanga",
   arreglo:"El bot afirmaba «allá hay red de servicio» sin tener la lista de las 19 ciudades, y trataba venta, taller, prueba de ruta y seguro como una sola cobertura. Ahora son cuatro coberturas distintas, y ninguna se afirma ciudad por ciudad mientras Corautos no entregue las listas.",
   ver:"2026-07-28.17"},
  {q:"tienes el vehiculo para entrega inmediata me encuentro en barrancabermeja",
   arreglo:"Dos cosas: el bot solo conocía 30 ciudades y no reconocía Barrancabermeja, por eso volvía a preguntarla. Ahora conoce las 32 capitales más los municipios grandes, y las que no estén las reconoce por la frase («me encuentro en X»). Y la respuesta de disponibilidad dejó de ser tibia: afirma que hay unidades con entrega inmediata y aclara que lo que se verifica es el color y la versión.",
   ver:"2026-07-28.16"},
  {q:"comparame la autonomia de este vehiculo con el vigo",
   arreglo:"Ya no ofrece comparar en lo que acaba de comparar. Y ahora la comparación continúa sola: un «y en precio?» sigue midiendo los mismos dos carros, sin que tengas que repetir cuáles.",
   ver:"2026-07-28.15"},
  {q:"cual es la autonomia de este vehiculo y me lo puedes comparar con el vigo",
   arreglo:"El bot ya compara entre los tres, en autonomía, precio, potencia, espacio o batería — y nombrar otro carro en una comparación ya no muda la conversación a ese carro.",
   ver:"2026-07-28.14"},
  {q:"dale compartelo",
   arreglo:"El bot ofrecía el simulador de ahorro y no lo compartía. Ya no: ahora cada pregunta que hace tiene respuesta prevista, incluido el «sí» cuando propone la prueba de ruta.",
   ver:"2026-07-28.13"},
  {q:"que tan seguro es el carro",
   arreglo:"Antes ofrecía póliza a quien preguntaba por SEGURIDAD. 'Seguro' suelto ya no dispara el tema: en Colombia es muletilla («seguro que sí», «de seguro»). Solo cuenta cuando es sustantivo.",
   ver:"2026-07-28.8"},
  {q:"cuanto puede costar un seguro aproximadamente para este vehiculo",
   arreglo:"Ya no se acaba ahí: el bot ofrece cotizarlo, hace dos preguntas y guarda un SEGUNDO lead de seguro, sin cortar la conversación del carro.",
   ver:"2026-07-28.6"},
  {q:"cuanto cuesta el mantenimiento",
   arreglo:"Antes contestaba cuántos talleres hay. Ahora es tema propio: explica que no tenemos tarifas, que un eléctrico se mantiene más barato, y pasa a un asesor.",
   ver:"2026-07-28.5"}
];

/* ¿Esta marca corresponde a algo que ya se corrigió? Compara por palabras
   compartidas, para que aguante tildes, signos y variaciones de redacción. */
function yaResuelto(pregunta){
  var a = norm(pregunta).split(" ").filter(function(w){ return w.length>3 });
  if(a.length<2) return null;
  for(var i=0;i<RESUELTOS.length;i++){
    var b = norm(RESUELTOS[i].q).split(" ").filter(function(w){ return w.length>3 });
    var comunes = a.filter(function(w){ return b.indexOf(w)>-1 }).length;
    /* al menos 3 palabras de fondo en común, y que cubran la mayoría de la
       frase corregida: así "seguro" suelto no dispara, pero "cuánto cuesta un
       seguro para este vehículo" sí */
    if(comunes>=3 && comunes/b.length>=.6) return RESUELTOS[i];
  }
  return null;
}

var API = {
  VERSION:VERSION, RESUELTOS:RESUELTOS, yaResuelto:yaResuelto,
  VEH:VEH, ORDEN:ORDEN, KB:KB, VETO:VETO, ESC:ESC, COMUN:COMUN,
  crearSesion:crearSesion, puntuar:puntuar, norm:norm,
  temas: function(){ return KB.map(function(t){return t.id}) },
  vetos: function(){ return VETO.map(function(t){return t.id}) }
};

if(typeof module!=="undefined" && module.exports) module.exports = API;
else global.TORQBOT = API;

})(typeof window!=="undefined" ? window : this);
