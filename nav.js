/* ═══════════════════════════════════════════════════════════════════
   TORQ — barra de navegación común

   Existe para que Daniel pueda recorrer todo el proyecto y dar feedback
   sin escribir URLs a mano. Se inyecta con una línea:

       <script src="nav.js" defer></script>

   (desde piezas/ va con "../nav.js" — la ruta se ajusta sola abajo).

   ⚠️ PENDIENTE ANTES DE PAUTAR: esta barra muestra enlaces internos
   (Pipeline, Leads, Inteligencia) y NO puede quedar en las páginas que
   ve el cliente — index.html y politica-datos.html. Cuando arranque la
   pauta, se le quita el <script> a esas dos. Está anotado en CONTEXTO.md.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  var raiz = /\/piezas\//.test(location.pathname) ? "../" : "";

  var CLIENTE = [
    ["Showroom",        "index.html"],
    ["Política de datos","politica-datos.html"]
  ];
  var INTERNO = [
    ["Inteligencia", "inteligencia.html"],
    ["Tablero",      "analitica.html"],
    ["Pipeline",     "crm.html?k=torq2026"],
    ["Leads",        "leads.html?k=torq2026"],
    ["Bot",          "bot.html"],
    ["Piezas",       "piezas/index.html"],
    ["Marca",        "logo-escala.html"]
  ];

  /* la página actual, para marcarla y no enlazarla a sí misma */
  var aqui = location.pathname.split("/").pop() || "index.html";
  if(/\/piezas\/?$/.test(location.pathname)) aqui = "piezas/index.html";

  var css = document.createElement("style");
  css.textContent =
  '#tqnav{background:#000;border-bottom:1px solid #1c1f24;font-family:ui-sans-serif,system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif;position:relative;z-index:300}'+
  '#tqnav .in{max-width:1400px;margin:0 auto;padding:0 18px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-height:38px}'+
  '#tqnav .gl{font-size:8.5px;letter-spacing:.18em;text-transform:uppercase;color:#5d636b;font-weight:700;white-space:nowrap;padding-right:2px}'+
  '#tqnav a{color:#8b9199;text-decoration:none;font-size:11.5px;padding:5px 9px;border-radius:5px;white-space:nowrap;line-height:1}'+
  '#tqnav a:hover{color:#fafafa;background:#141719}'+
  '#tqnav a.on{color:#c8f24a;background:rgba(200,242,74,.09);font-weight:700}'+
  '#tqnav .sep{width:1px;height:15px;background:#2a2e35;margin:0 5px}'+
  '#tqnav .tag{margin-left:auto;font-size:8.5px;letter-spacing:.16em;text-transform:uppercase;color:#5d636b;font-weight:700;white-space:nowrap}'+
  '@media(max-width:760px){#tqnav .in{padding:6px 12px;gap:4px}#tqnav .tag{display:none}#tqnav a{font-size:11px;padding:4px 7px}}';
  document.head.appendChild(css);

  function grupo(titulo, items){
    return '<span class="gl">'+titulo+'</span>'+items.map(function(it){
      var destino = it[1], archivo = destino.split("?")[0];
      var activa = archivo===aqui;
      return '<a href="'+raiz+destino+'"'+(activa?' class="on" aria-current="page"':'')+'>'+it[0]+'</a>';
    }).join("");
  }

  var bar = document.createElement("nav");
  bar.id = "tqnav";
  bar.setAttribute("aria-label","Navegación del proyecto");
  bar.innerHTML = '<div class="in">'
    + grupo("Cliente", CLIENTE)
    + '<span class="sep"></span>'
    + grupo("Interno", INTERNO)
    + '<span class="tag">TORQ &middot; vista de trabajo</span>'
    + '</div>';

  function montar(){ document.body.insertBefore(bar, document.body.firstChild) }
  if(document.body) montar();
  else document.addEventListener("DOMContentLoaded", montar);
})();
