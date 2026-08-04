/* ═══════════════════════════════════════════════════════════════════
   TORQUE — la consola interna (patrón Shopify Admin)

   Camilo lo pidió textual: "una interfaz tipo CMS para Ecommerce, que
   tome de referente a Shopify Admin". Este archivo es ese marco.

   Tres reglas sacadas de mirar la captura del Admin, y que las dos
   versiones anteriores rompían:

   1. LA COLUMNA NO DESAPARECE NUNCA. En Shopify pasas de Orders a
      Products y el menú sigue ahí. Antes esta consola solo vivía en las
      páginas internas, así que al abrir el Showroom se esfumaba y había
      que usar el botón atrás para volver: "eso hace que la experiencia
      no sea buena", y era cierto. Ahora va en todas.

   2. LOS FILTROS VIVEN CON LO QUE FILTRAN. En el Admin la fila de
      filtros está pegada sobre la tabla, no escondida en el menú. Antes
      los había metido en la columna, debajo de trece módulos, y quedaban
      "más abajo y no intuitivos". Vuelven arriba del contenido, fijos,
      donde se ven mientras se lee el tablero.

   3. EL MÓDULO ACTIVO DESPLIEGA SUS SECCIONES. Igual que Orders abre
      Drafts y Abandoned checkouts debajo, indentados. Ahí es donde
      panel-nav.js cuelga las secciones de la página.

   Sustituye por completo a nav.js. Se carga con
   <script src="admin.js" defer></script>.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";

  var raiz = /\/piezas\//.test(location.pathname) ? "../" : "";

  /* Un icono por módulo, dibujado a mano en 20×20. Son trazos, no
     emojis: a este tamaño un emoji se ve borroso, cada sistema lo pinta
     distinto y arrastra color propio que pelea con la marca. */
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
    marca: '<circle cx="10" cy="10" r="6.5"/><circle cx="10" cy="10" r="2"/>',
    diana: '<circle cx="9" cy="11" r="6"/><circle cx="9" cy="11" r="2.4"/><path d="M9 11l7-7M13.4 4.1h2.8v2.8"/>'
  };

  /* Los módulos, en el orden en que se usan. Las fichas de vehículo
     cuelgan del Showroom como sub-items fijos, igual que Drafts cuelga
     de Orders en el Admin. */
  var MODULOS = [
    { grupo:"Sitio público", items:[
      ["Showroom",         "index.html",          I.tienda,
        [["Vigo","vigo.html"],["Box","box.html"],["Mage","mage.html"]]],
      ["Simulador",        "simulador.html",      I.calc],
      ["Política de datos","politica-datos.html", I.doc]
    ]},
    { grupo:"Datos y mercado", items:[
      ["Jugadas",          "jugadas.html",        I.diana],
      ["Mercado",          "mercado.html",        I.grafico],
      ["Inteligencia",     "inteligencia.html",   I.mapa],
      ["Tablero",          "analitica.html",      I.panel]
    ]},
    { grupo:"Comercial", items:[
      ["Pipeline",         "crm.html?k=torq2026", I.flujo],
      ["Leads",            "leads.html?k=torq2026", I.gente]
    ]},
    { grupo:"Conversación", items:[
      ["Sala de pruebas",  "chat.html",           I.chat],
      ["Bot",              "bot.html",            I.robot],
      ["Respuestas",       "respuestas.html",     I.lista]
    ]},
    { grupo:"Marca", items:[
      ["Piezas",           "piezas/index.html",   I.imagen],
      ["Identidad",        "logo-escala.html",    I.marca]
    ]}
  ];

  var aqui = location.pathname.split("/").pop() || "index.html";
  if(/\/piezas\/?$/.test(location.pathname)) aqui = "piezas/index.html";

  /* Las páginas del sitio público traen su propia barra superior con el
     logotipo y el menú del visitante. Ahí la consola aporta la columna
     -para poder volver a un módulo- pero no su barra: serían dos. */
  var esPublica = !!document.querySelector("nav.nav");

  var LADO = 232;

  var css = document.createElement("style");
  css.textContent = [
    /* ── la columna ───────────────────────────────────────────────── */
    '#tqadm{position:fixed;top:0;left:0;bottom:0;width:'+LADO+'px;z-index:400;',
    '  background:#0b0d0f;border-right:1px solid #1c1f24;display:flex;flex-direction:column;',
    '  font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif}',
    '#tqadm .marca{display:flex;align-items:center;gap:9px;padding:14px 15px 12px;',
    '  text-decoration:none;flex:none;border-bottom:1px solid #16191c}',
    '#tqadm .marca .lg{display:flex;align-items:center;font-weight:800;font-size:18px;',
    '  letter-spacing:-.035em;color:#fafafa;line-height:1}',
    '#tqadm .marca .lg svg{width:1.04em;height:1.04em;margin:0 1px;flex:none}',
    '#tqadm .marca .tag{font-size:7.5px;letter-spacing:.16em;text-transform:uppercase;color:#5d636b;',
    '  font-weight:700;border-left:1px solid #2a2e35;padding-left:8px;line-height:1.3}',

    '#tqadm .cuerpo{flex:1;overflow-y:auto;padding:8px 8px 16px;scrollbar-width:thin;',
    '  scrollbar-color:#2a2e35 transparent}',
    '#tqadm .cuerpo::-webkit-scrollbar{width:6px}',
    '#tqadm .cuerpo::-webkit-scrollbar-thumb{background:#2a2e35;border-radius:3px}',
    '#tqadm .gl{font-size:8px;letter-spacing:.19em;text-transform:uppercase;color:#5d636b;',
    '  font-weight:700;padding:13px 10px 5px}',
    '#tqadm a.mod{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:7px;',
    '  color:#8b9199;text-decoration:none;font-size:12.5px;line-height:1.3}',
    '#tqadm a.mod svg{width:17px;height:17px;stroke:currentColor;fill:none;stroke-width:1.6;',
    '  stroke-linecap:round;stroke-linejoin:round;flex:none}',
    '#tqadm a.mod:hover{background:#16191c;color:#fafafa}',
    '#tqadm a.mod.on{background:#c8f24a;color:#0a0c07;font-weight:700}',

    /* ── sub-items del módulo abierto (patrón Drafts / Abandoned) ─── */
    '#tqadm .sub{display:none;flex-direction:column;gap:1px;margin:2px 0 4px}',
    '#tqadm .sub.on{display:flex}',
    '#tqadm .sub a{display:block;padding:6px 10px 6px 37px;border-radius:6px;color:#8b9199;',
    '  text-decoration:none;font-size:12px;line-height:1.35}',
    '#tqadm .sub a:hover{background:#16191c;color:#fafafa}',
    '#tqadm .sub a.on{color:#c8f24a;font-weight:600}',
    '#tqadm .vacio{color:#5d636b;font-size:12px;padding:12px 10px;display:none}',
    '#tqadm .vacio.on{display:block}',

    /* ── la barra superior: buscador, como en el Admin ────────────── */
    '#tqtop{position:sticky;top:0;z-index:180;background:rgba(11,13,15,.94);',
    '  backdrop-filter:blur(14px);border-bottom:1px solid #1c1f24;',
    '  display:flex;align-items:center;gap:12px;padding:9px 20px;',
    '  font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif}',
    '#tqtop .buscar{position:relative;flex:1;max-width:460px;margin:0 auto}',
    '#tqtop input{width:100%;background:#141719;border:1px solid #2a2e35;color:#fafafa;',
    '  border-radius:8px;padding:7px 10px 7px 31px;font-size:12.5px;font-family:inherit}',
    '#tqtop input::placeholder{color:#5d636b}',
    '#tqtop input:focus{outline:none;border-color:#c8f24a}',
    '#tqtop .buscar>svg{position:absolute;left:10px;top:8px;width:14px;height:14px;',
    '  stroke:#5d636b;fill:none;stroke-width:1.8;pointer-events:none}',
    '#tqtop kbd{position:absolute;right:9px;top:7px;font-size:9.5px;color:#5d636b;',
    '  border:1px solid #2a2e35;border-radius:4px;padding:2px 5px;pointer-events:none}',
    '#tqtop .aqui{font-size:12.5px;color:#8b9199;font-weight:600;white-space:nowrap}',

    /* ── resultados del buscador ──────────────────────────────────── */
    '#tqres{position:absolute;top:calc(100% + 6px);left:0;right:0;background:#141719;',
    '  border:1px solid #2a2e35;border-radius:9px;padding:6px;display:none;',
    '  box-shadow:0 18px 44px rgba(0,0,0,.65);max-height:320px;overflow:auto;z-index:5}',
    '#tqres.on{display:block}',
    '#tqres a{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:6px;',
    '  color:#8b9199;text-decoration:none;font-size:12.5px}',
    '#tqres a:hover,#tqres a.sel{background:#1c2024;color:#fafafa}',
    '#tqres a .d{margin-left:auto;font-size:10px;color:#5d636b}',
    '#tqres .nada{padding:10px;color:#5d636b;font-size:12px}',

    /* ── el contenido se corre a la derecha de la columna ─────────── */
    'body.tqadm-on{padding-left:'+LADO+'px}',
    /* lo que la página ya pegaba al tope: se corre, no se tapa */
    'body.tqadm-on .bar,body.tqadm-on nav.nav{left:'+LADO+'px;right:0;width:auto}',
    '#tqadm-btn,#tqadm-velo{display:none}',

    /* Las barras de filtros de las páginas de datos se pegan con top:0,
       que era correcto ANTES de que existiera esta consola: ahora hay una
       barra superior propia ocupando esa franja, y los filtros se deslizan
       por debajo hasta desaparecer. Justo la queja de Daniel -"los filtros
       no son intuitivos"- pero por una causa distinta a la de entonces.
       El alto de #tqtop no es constante (cambia de padding en móvil), así
       que no se escribe a mano: se mide y se publica en --tqtop-h. */
    'body.tqadm-on .vista-barra{top:var(--tqtop-h,0px)}',

    /* ── móvil ────────────────────────────────────────────────────── */
    '@media(max-width:1050px){',
    '  body.tqadm-on{padding-left:0}',
    '  body.tqadm-on .bar,body.tqadm-on nav.nav{left:0}',
    '  #tqadm{transform:translateX(-100%);transition:transform .22s cubic-bezier(.4,0,.2,1);',
    '    box-shadow:0 0 40px rgba(0,0,0,.6);width:268px}',
    '  #tqadm.abierto{transform:none}',
    '  #tqadm .marca{padding-left:54px}',
    '  #tqadm-btn{display:flex;align-items:center;justify-content:center;gap:4px;',
    '    flex-direction:column;width:36px;height:36px;background:#141719;border:1px solid #2a2e35;',
    '    border-radius:9px;cursor:pointer;padding:0;flex:none}',
    '  #tqadm-btn i{display:block;width:15px;height:1.7px;background:#fafafa;border-radius:2px}',
    '  #tqadm-velo{position:fixed;inset:0;background:rgba(4,5,6,.6);z-index:399;display:none}',
    '  #tqadm-velo.on{display:block}',
    '  #tqtop{padding:8px 12px}',
    '  #tqtop .aqui{display:none}',
    '}'
  ].join("");
  document.head.appendChild(css);

  var lg = 'T<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" stroke-width="13" stroke-dasharray="4.9 8.45" stroke-dashoffset="2.45"/><circle cx="50" cy="50" r="10.5" fill="#c8f24a"/></svg>RQUE';

  /* ── la columna ──────────────────────────────────────────────────── */
  var barra = document.createElement("nav");
  barra.id = "tqadm";
  barra.setAttribute("aria-label", "Módulos de TORQUE");

  var titulo = "";
  var html = '<a class="marca" href="'+raiz+'index.html"><span class="lg">'+lg+'</span>'+
             '<span class="tag">Consola<br>interna</span></a><div class="cuerpo">';

  MODULOS.forEach(function(g){
    html += '<div class="gl">'+g.grupo+'</div>';
    g.items.forEach(function(it){
      var nombre = it[0], destino = it[1], icono = it[2], hijos = it[3] || [];
      var archivo = destino.split("?")[0];
      var hijoActivo = hijos.some(function(h){ return h[1] === aqui });
      var activa = archivo === aqui;
      if(activa || hijoActivo) titulo = activa ? nombre : (hijos.filter(function(h){return h[1]===aqui})[0]||[nombre])[0];
      html += '<a class="mod'+(activa?" on":"")+'" href="'+raiz+destino+'"'+
              (activa?' aria-current="page"':'')+'>'+
              '<svg viewBox="0 0 20 20">'+icono+'</svg><span>'+nombre+'</span></a>';
      /* el contenedor de sub-items: los fijos van escritos, y panel-nav.js
         cuelga aquí las secciones de la página cuando el módulo es el
         abierto -igual que Orders despliega Drafts */
      html += '<div class="sub'+((activa||hijoActivo)?" on":"")+'" data-sub="'+archivo+'">';
      hijos.forEach(function(h){
        html += '<a href="'+raiz+h[1]+'"'+(h[1]===aqui?' class="on"':'')+'>'+h[0]+'</a>';
      });
      html += '</div>';
    });
  });
  html += '<div class="vacio" id="tqadm-vacio">Ningún módulo con ese nombre.</div></div>';
  barra.innerHTML = html;

  /* ── la barra superior ───────────────────────────────────────────── */
  var top = null;
  if(!esPublica){
    top = document.createElement("div");
    top.id = "tqtop";
    top.innerHTML =
      '<button id="tqadm-btn" aria-label="Abrir el menú de módulos"><i></i><i></i><i></i></button>'+
      '<span class="aqui">'+(titulo||"TORQUE")+'</span>'+
      '<div class="buscar">'+
        '<input type="search" id="tqadm-q" placeholder="Buscar módulo o sección…" '+
        'autocomplete="off" aria-label="Buscar">'+
        '<svg viewBox="0 0 20 20"><circle cx="9" cy="9" r="6"/><path d="M13.5 13.5L17 17"/></svg>'+
        '<kbd>/</kbd><div id="tqres" role="listbox"></div>'+
      '</div>';
  }

  var velo = document.createElement("div");
  velo.id = "tqadm-velo";
  var cerrarRes = function(){};

  function montar(){
    document.body.classList.add("tqadm-on");
    document.body.insertBefore(barra, document.body.firstChild);
    if(top) document.body.insertBefore(top, barra.nextSibling);
    document.body.appendChild(velo);

    /* en el sitio público la consola no pone barra propia -la página ya
       tiene la suya-, así que el botón de móvil va suelto y flotante */
    if(esPublica){
      var b = document.createElement("button");
      b.id = "tqadm-btn";
      b.setAttribute("aria-label","Abrir el menú de módulos");
      b.innerHTML = "<i></i><i></i><i></i>";
      b.style.cssText = "position:fixed;top:9px;left:9px;z-index:401";
      document.body.appendChild(b);
    }

    /* El alto real de la barra superior, para que lo que la página pegue
       al tope quede DEBAJO y no detrás. Se remide en cada resize porque el
       padding de #tqtop cambia en móvil, y una vez más tarde por si las
       fuentes acaban de cargar y la barra creció un pixel. */
    function medirTecho(){
      var h = top ? Math.round(top.getBoundingClientRect().height) : 0;
      document.documentElement.style.setProperty("--tqtop-h", h + "px");
    }
    medirTecho();
    window.addEventListener("resize", medirTecho);
    setTimeout(medirTecho, 300);

    function abrir(v){
      barra.classList.toggle("abierto", v);
      velo.classList.toggle("on", v);
    }
    document.addEventListener("click", function(e){
      if(e.target.closest("#tqadm-btn")) return abrir(!barra.classList.contains("abierto"));
      if(e.target.closest("#tqadm-velo")) return abrir(false);
      if(e.target.closest("#tqadm a")) return abrir(false);
      if(!e.target.closest("#tqtop .buscar")) cerrarRes();
    });
    document.addEventListener("keydown", function(e){
      if(e.key === "Escape"){ abrir(false); cerrarRes() }
    });

    if(!top) return;

    /* ── el buscador: módulos y secciones de la página ─────────────── */
    var q = document.getElementById("tqadm-q"), res = document.getElementById("tqres");
    function norm(t){ return t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"") }
    cerrarRes = function(){ res.classList.remove("on"); res.innerHTML = "" };

    function catalogo(){
      var lista = [];
      MODULOS.forEach(function(g){
        g.items.forEach(function(it){
          lista.push({t:it[0], h:raiz+it[1], d:g.grupo});
          (it[3]||[]).forEach(function(h){ lista.push({t:h[0], h:raiz+h[1], d:it[0]}) });
        });
      });
      /* las secciones de ESTA página, que panel-nav.js ya colgó */
      document.querySelectorAll("#tqadm .sub a[href^='#']").forEach(function(a){
        lista.push({t:a.textContent, h:a.getAttribute("href"), d:"En esta página"});
      });
      return lista;
    }

    function pintar(){
      var t = norm(q.value.trim());
      if(!t) return cerrarRes();
      var hits = catalogo().filter(function(x){ return norm(x.t).indexOf(t) >= 0 }).slice(0, 8);
      res.innerHTML = hits.length
        ? hits.map(function(x,i){
            return '<a href="'+x.h+'"'+(i===0?' class="sel"':'')+'>'+x.t+
                   '<span class="d">'+x.d+'</span></a>';
          }).join("")
        : '<div class="nada">Sin resultados.</div>';
      res.classList.add("on");
    }
    q.addEventListener("input", pintar);
    q.addEventListener("focus", pintar);
    q.addEventListener("keydown", function(e){
      var sel = res.querySelector("a.sel");
      if(e.key === "Enter" && sel){ e.preventDefault(); location.href = sel.getAttribute("href"); cerrarRes() }
      if(e.key === "ArrowDown" || e.key === "ArrowUp"){
        e.preventDefault();
        var todos = [].slice.call(res.querySelectorAll("a"));
        if(!todos.length) return;
        var i = todos.indexOf(sel);
        i = e.key === "ArrowDown" ? Math.min(i+1, todos.length-1) : Math.max(i-1, 0);
        todos.forEach(function(a){ a.classList.remove("sel") });
        todos[i].classList.add("sel");
        todos[i].scrollIntoView({block:"nearest"});
      }
      if(e.key === "Escape"){ q.value = ""; cerrarRes(); q.blur() }
    });
    document.addEventListener("keydown", function(e){
      var enCampo = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
      if(e.key === "/" && !enCampo){ e.preventDefault(); q.focus() }
    });
  }

  if(document.body) montar();
  else document.addEventListener("DOMContentLoaded", montar);
})();
