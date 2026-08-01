/* ═══════════════════════════════════════════════════════════════════
   TORQUE — la consola interna (patrón Shopify Admin)

   Camilo lo pidió así, textual: "una interfaz tipo CMS para Ecommerce,
   que tome de referente a Shopify Admin", y sobre la captura: "todo lo
   que le pones en la parte superior, que sea como un menú principal...
   que sea un menú sticky, y al lado siempre tienes toda la información,
   y va migrando al módulo que quieras".

   Lo que estaba "en la parte superior" era la barra de trabajo de
   nav.js: una franja negra horizontal con quince enlaces apretados que
   había que leer de corrido para encontrar un módulo. Este archivo la
   reemplaza por lo que usa cualquier consola de administración seria
   -Shopify, Alegra, Stripe-: una columna fija a la izquierda con los
   módulos, cada uno con su icono, el activo resaltado, y un buscador
   arriba para saltar sin levantar las manos del teclado.

   El contenido de cada página no se toca: se corre a la derecha del
   sidebar y se le pone encima una barra con el título del módulo. Si la
   página trae su propio bloque de contexto -en mercado.html los filtros,
   en inteligencia.html el selector de portafolio, en las dos el índice
   de secciones- se recoge y se pega bajo los módulos, para que quede lo
   que Camilo pidió: al lado, siempre, toda la información.

   Sustituye a nav.js en las páginas internas. Se carga con
   <script src="admin.js" defer></script>.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";

  var raiz = /\/piezas\//.test(location.pathname) ? "../" : "";

  /* Un icono por módulo, dibujado a mano en 20×20. Son trazos, no
     emojis: a este tamaño un emoji se ve borroso y cada sistema lo pinta
     distinto, y además arrastran color propio que pelea con la marca. */
  var I = {
    tienda:'<path d="M3 7l1.5-3h11L17 7M3 7h14M3 7v9a1 1 0 001 1h12a1 1 0 001-1V7M7 17v-5h6v5"/>',
    calc:  '<rect x="4" y="2.5" width="12" height="15" rx="1.5"/><path d="M7 6h6M7 9.5h.01M10 9.5h.01M13 9.5h.01M7 13h.01M10 13h.01M13 13h3"/>',
    doc:   '<path d="M5 2.5h6l4 4v11a1 1 0 01-1 1H5a1 1 0 01-1-1v-14a1 1 0 011-1z"/><path d="M11 2.5v4h4M7 11h6M7 14h4"/>',
    grafico:'<path d="M3 17h14M6 14V8M10 14V4M14 14v-6"/>',
    mapa:  '<path d="M3 5l4.5-2 5 2L17 3v12l-4.5 2-5-2L3 17z"/><path d="M7.5 3v12M12.5 5v12"/>',
    panel: '<rect x="3" y="3" width="6.5" height="6.5" rx="1"/><rect x="10.5" y="3" width="6.5" height="6.5" rx="1"/><rect x="3" y="10.5" width="6.5" height="6.5" rx="1"/><rect x="10.5" y="10.5" width="6.5" height="6.5" rx="1"/>',
    flujo: '<circle cx="5" cy="5" r="2"/><circle cx="15" cy="10" r="2"/><circle cx="5" cy="15" r="2"/><path d="M7 5h4a2 2 0 012 2v1M7 15h4a2 2 0 002-2v-1"/>',
    gente: '<circle cx="10" cy="6.5" r="3"/><path d="M4 17c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/>',
    chat:  '<path d="M3 5a1.5 1.5 0 011.5-1.5h11A1.5 1.5 0 0117 5v7a1.5 1.5 0 01-1.5 1.5H7l-4 3.5z"/>',
    robot: '<rect x="4" y="7" width="12" height="9" rx="2"/><path d="M10 7V4M7.5 11h.01M12.5 11h.01"/><circle cx="10" cy="3.5" r="1"/>',
    lista: '<path d="M4 5h12M4 10h12M4 15h7"/>',
    imagen:'<rect x="3" y="4" width="14" height="12" rx="1.5"/><circle cx="7.5" cy="8.5" r="1.5"/><path d="M3 13.5l4-3.5 4 3.5 2.5-2 3.5 3"/>',
    marca: '<circle cx="10" cy="10" r="6.5"/><circle cx="10" cy="10" r="2"/>'
  };

  /* Los módulos, agrupados como se piensan: lo que ve el cliente y lo
     que solo vemos nosotros. El orden es el de uso real, no alfabético:
     Mercado e Inteligencia son los que se abren todos los días. */
  var MODULOS = [
    { grupo:"Cliente", items:[
      ["Showroom",         "index.html",            I.tienda],
      ["Simulador",        "simulador.html",        I.calc],
      ["Política de datos","politica-datos.html", I.doc]
    ]},
    { grupo:"Datos y mercado", items:[
      ["Mercado",          "mercado.html",          I.grafico],
      ["Inteligencia",     "inteligencia.html",     I.mapa],
      ["Tablero",          "analitica.html",        I.panel]
    ]},
    { grupo:"Comercial", items:[
      ["Pipeline",         "crm.html?k=torq2026",   I.flujo],
      ["Leads",            "leads.html?k=torq2026", I.gente]
    ]},
    { grupo:"Conversación", items:[
      ["Sala de pruebas",  "chat.html",             I.chat],
      ["Bot",              "bot.html",              I.robot],
      ["Respuestas",       "respuestas.html",       I.lista]
    ]},
    { grupo:"Marca", items:[
      ["Piezas",           "piezas/index.html",     I.imagen],
      ["Identidad",        "logo-escala.html",      I.marca]
    ]}
  ];

  /* la página actual, para marcarla y no enlazarla a sí misma */
  var aqui = location.pathname.split("/").pop() || "index.html";
  if(/\/piezas\/?$/.test(location.pathname)) aqui = "piezas/index.html";

  var LADO = 236;   /* ancho del sidebar en escritorio */

  var css = document.createElement("style");
  css.textContent = [
    /* ── la columna ───────────────────────────────────────────────── */
    '#tqadm{position:fixed;top:0;left:0;bottom:0;width:'+LADO+'px;z-index:300;',
    '  background:#0b0d0f;border-right:1px solid #1c1f24;display:flex;flex-direction:column;',
    '  font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif}',
    '#tqadm .marca{display:flex;align-items:center;gap:9px;padding:15px 16px 13px;text-decoration:none;flex:none}',
    '#tqadm .marca .lg{display:flex;align-items:center;font-weight:800;font-size:19px;',
    '  letter-spacing:-.035em;color:#fafafa;line-height:1}',
    '#tqadm .marca .lg svg{width:1.04em;height:1.04em;margin:0 1px;flex:none}',
    '#tqadm .marca .tag{font-size:8px;letter-spacing:.17em;text-transform:uppercase;color:#5d636b;',
    '  font-weight:700;border-left:1px solid #2a2e35;padding-left:9px;line-height:1.3}',

    /* ── buscador ─────────────────────────────────────────────────── */
    '#tqadm .bus{position:relative;padding:0 12px 12px;flex:none}',
    '#tqadm .bus input{width:100%;background:#141719;border:1px solid #2a2e35;color:#fafafa;',
    '  border-radius:8px;padding:8px 10px 8px 30px;font-size:12.5px;font-family:inherit}',
    '#tqadm .bus input::placeholder{color:#5d636b}',
    '#tqadm .bus input:focus{outline:none;border-color:#c8f24a}',
    '#tqadm .bus svg{position:absolute;left:22px;top:9px;width:14px;height:14px;stroke:#5d636b;',
    '  fill:none;stroke-width:1.8;pointer-events:none}',
    '#tqadm .bus kbd{position:absolute;right:22px;top:8px;font-size:9.5px;color:#5d636b;',
    '  border:1px solid #2a2e35;border-radius:4px;padding:2px 5px;font-family:inherit;pointer-events:none}',
    '#tqadm .bus input:focus+svg+kbd{display:none}',

    /* ── lista de módulos ─────────────────────────────────────────── */
    '#tqadm .cuerpo{flex:1;overflow-y:auto;padding:0 8px 16px;scrollbar-width:thin;',
    '  scrollbar-color:#2a2e35 transparent}',
    '#tqadm .cuerpo::-webkit-scrollbar{width:6px}',
    '#tqadm .cuerpo::-webkit-scrollbar-thumb{background:#2a2e35;border-radius:3px}',
    '#tqadm .gl{font-size:8px;letter-spacing:.19em;text-transform:uppercase;color:#5d636b;',
    '  font-weight:700;padding:14px 10px 6px}',
    '#tqadm a.mod{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:7px;',
    '  color:#8b9199;text-decoration:none;font-size:12.5px;line-height:1.3}',
    '#tqadm a.mod svg{width:17px;height:17px;stroke:currentColor;fill:none;stroke-width:1.6;',
    '  stroke-linecap:round;stroke-linejoin:round;flex:none}',
    '#tqadm a.mod:hover{background:#16191c;color:#fafafa}',
    '#tqadm a.mod.on{background:#c8f24a;color:#0a0c07;font-weight:700}',
    '#tqadm a.mod.oculto{display:none}',
    '#tqadm .gl.oculto{display:none}',
    '#tqadm .vacio{color:#5d636b;font-size:12px;padding:12px 10px;display:none}',
    '#tqadm .vacio.on{display:block}',

    /* ── el contexto de la página, recogido de .panel-side ────────── */
    '#tqadm .ctx{border-top:1px solid #1c1f24;margin-top:14px;padding-top:14px}',
    '#tqadm .ctx .side-tit{padding-left:10px}',
    '#tqadm .ctx .panel-side{position:static!important;max-height:none!important;overflow:visible!important;',
    '  padding:0 2px;gap:18px}',

    /* ── el contenido se corre a la derecha ───────────────────────── */
    'body.tqadm-on{padding-left:'+LADO+'px}',
    'body.tqadm-on .bar{left:'+LADO+'px}',
    '#tqadm-btn{display:none}',

    /* ── móvil: la columna sale de pantalla y se abre con el botón ──
       El botón es fijo y flota sobre la página, así que el contenido
       tiene que dejarle su lugar: sin esa reserva se monta encima del
       título y del texto de arriba, que es justo lo que pasaba. En vez
       de empujar TODO el body -que descuadraría los elementos pegados
       al tope- se reserva solo en la primera franja de la página. */
    '@media(max-width:1050px){',
    '  body.tqadm-on{padding-left:0;padding-top:56px}',
    '  #tqadm{transform:translateX(-100%);transition:transform .22s cubic-bezier(.4,0,.2,1);',
    '    box-shadow:0 0 40px rgba(0,0,0,.6)}',
    '  #tqadm.abierto{transform:none}',
    '  #tqadm-btn{display:flex;position:fixed;top:9px;left:10px;z-index:301;width:38px;height:38px;',
    '    align-items:center;justify-content:center;gap:4px;flex-direction:column;',
    '    background:rgba(11,13,15,.94);backdrop-filter:blur(10px);border:1px solid #2a2e35;',
    '    border-radius:9px;cursor:pointer;padding:0}',
    '  #tqadm-btn i{display:block;width:15px;height:1.7px;background:#fafafa;border-radius:2px}',
    '  #tqadm-velo{position:fixed;inset:0;background:rgba(4,5,6,.6);z-index:299;display:none}',
    '  #tqadm-velo.on{display:block}',
    /* con el panel abierto el botón queda ENCIMA de su propio logotipo y
       le come las dos primeras letras: la marca se corre para dejarle su
       lugar, igual que hace el contenido de la página */
    '  #tqadm .marca{padding-left:58px}',
    /* la barra de filtros sticky de mercado.html se pega bajo el botón,
       no bajo el borde de la pantalla */
    '  body.tqadm-on .bar{left:0;top:56px}',
    /* y lo que la página ya pegaba al tope tiene que bajar lo mismo */
    '  body.tqadm-on .panel-side{top:56px}',
    '}'
  ].join("");
  document.head.appendChild(css);

  var lg = 'T<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" stroke-width="13" stroke-dasharray="4.9 8.45" stroke-dashoffset="2.45"/><circle cx="50" cy="50" r="10.5" fill="#c8f24a"/></svg>RQUE';

  var barra = document.createElement("nav");
  barra.id = "tqadm";
  barra.setAttribute("aria-label", "Módulos de TORQUE");

  var html = '<a class="marca" href="'+raiz+'index.html"><span class="lg">'+lg+'</span>'+
             '<span class="tag">Consola<br>interna</span></a>'+
             '<div class="bus"><input type="search" id="tqadm-q" placeholder="Buscar módulo…" '+
             'autocomplete="off" aria-label="Buscar módulo">'+
             '<svg viewBox="0 0 20 20"><circle cx="9" cy="9" r="6"/><path d="M13.5 13.5L17 17"/></svg>'+
             '<kbd>/</kbd></div><div class="cuerpo">';

  MODULOS.forEach(function(g){
    html += '<div class="gl">'+g.grupo+'</div>';
    g.items.forEach(function(it){
      var destino = it[1], archivo = destino.split("?")[0];
      var activa = archivo === aqui;
      html += '<a class="mod'+(activa?" on":"")+'" href="'+raiz+destino+'"'+
              (activa?' aria-current="page"':'')+'>'+
              '<svg viewBox="0 0 20 20">'+it[2]+'</svg><span>'+it[0]+'</span></a>';
    });
  });
  html += '<div class="vacio" id="tqadm-vacio">Ning&uacute;n m&oacute;dulo con ese nombre.</div></div>';
  barra.innerHTML = html;

  var btn = document.createElement("button");
  btn.id = "tqadm-btn";
  btn.setAttribute("aria-label", "Abrir el menú de módulos");
  btn.innerHTML = "<i></i><i></i><i></i>";
  var velo = document.createElement("div");
  velo.id = "tqadm-velo";

  function montar(){
    document.body.classList.add("tqadm-on");
    document.body.insertBefore(barra, document.body.firstChild);
    document.body.appendChild(velo);
    document.body.appendChild(btn);

    /* Si la página trae su bloque de contexto -filtros, selector de
       portafolio, índice de secciones-, se recoge dentro del sidebar.
       Es lo que pidió Camilo: al lado, siempre, toda la información. */
    var lado = document.querySelector(".panel-side");
    if(lado){
      var ctx = document.createElement("div");
      ctx.className = "ctx";
      ctx.appendChild(lado);
      barra.querySelector(".cuerpo").appendChild(ctx);
      /* el shell queda de una sola columna: el hueco de 248px que
         reservaba el grid ya no tiene quién lo ocupe */
      var shell = document.querySelector(".panel-shell");
      if(shell) shell.style.gridTemplateColumns = "1fr";
    }

    /* ── abrir y cerrar en móvil ──────────────────────────────────── */
    function abrir(v){
      barra.classList.toggle("abierto", v);
      velo.classList.toggle("on", v);
    }
    btn.addEventListener("click", function(){ abrir(!barra.classList.contains("abierto")) });
    velo.addEventListener("click", function(){ abrir(false) });
    barra.addEventListener("click", function(e){
      /* al elegir un módulo en móvil, el panel se cierra solo */
      if(e.target.closest("a.mod")) abrir(false);
    });
    document.addEventListener("keydown", function(e){
      if(e.key === "Escape") abrir(false);
    });

    /* ── el buscador ──────────────────────────────────────────────── */
    var q = document.getElementById("tqadm-q");
    var vacio = document.getElementById("tqadm-vacio");
    function normalizar(t){
      return t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
    }
    q.addEventListener("input", function(){
      var t = normalizar(q.value.trim());
      var hallados = 0;
      MODULOS.forEach(function(g, gi){
        var titulo = barra.querySelectorAll(".gl")[gi];
        var visiblesEnGrupo = 0;
        g.items.forEach(function(it){
          var a = barra.querySelector('a.mod[href$="'+it[1]+'"]');
          if(!a) return;
          var ok = !t || normalizar(it[0]).indexOf(t) >= 0 || normalizar(g.grupo).indexOf(t) >= 0;
          a.classList.toggle("oculto", !ok);
          if(ok){ visiblesEnGrupo++; hallados++ }
        });
        if(titulo) titulo.classList.toggle("oculto", visiblesEnGrupo === 0);
      });
      vacio.classList.toggle("on", hallados === 0);
    });
    q.addEventListener("keydown", function(e){
      if(e.key === "Enter"){
        var primero = barra.querySelector("a.mod:not(.oculto)");
        if(primero) location.href = primero.href;
      }
      if(e.key === "Escape"){ q.value = ""; q.dispatchEvent(new Event("input")); q.blur() }
    });
    /* "/" enfoca el buscador, como en Shopify y GitHub */
    document.addEventListener("keydown", function(e){
      var dentroDeCampo = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
      if(e.key === "/" && !dentroDeCampo){ e.preventDefault(); abrir(true); q.focus() }
    });
  }

  if(document.body) montar();
  else document.addEventListener("DOMContentLoaded", montar);
})();
