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
    ["Mercado",      "mercado.html"],
    ["Tablero",      "analitica.html"],
    ["Pipeline",     "crm.html?k=torq2026"],
    ["Leads",        "leads.html?k=torq2026"],
    ["Bot",          "bot.html"],
    ["Respuestas",   "respuestas.html"],
    ["Piezas",       "piezas/index.html"],
    ["Marca",        "logo-escala.html"]
  ];

  /* la página actual, para marcarla y no enlazarla a sí misma */
  var aqui = location.pathname.split("/").pop() || "index.html";
  if(/\/piezas\/?$/.test(location.pathname)) aqui = "piezas/index.html";

  var css = document.createElement("style");
  css.textContent =
  '#tqnav{background:#000;border-bottom:1px solid #1c1f24;font-family:ui-sans-serif,system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif;position:fixed;top:0;left:0;right:0;z-index:300}'+
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

  /* La barra va FIJA: en el showroom, que es largo, una barra estática
     desaparece al primer scroll y no hay forma de volver a los tableros
     sin subir hasta arriba del todo. Al fijarla hay que correr hacia
     abajo todo lo que ya estaba pegado al tope (los nav de cada página
     y las filas de filtros), o quedarían debajo de ella. */
  function acomodar(){
    var h = bar.offsetHeight;

    /* el padding original del body puede no ser cero (el showroom ya reserva
       espacio para su propio nav fijo): se suma, no se reemplaza */
    if(bar.dataset.padBase === undefined){
      bar.dataset.padBase = parseFloat(getComputedStyle(document.body).paddingTop) || 0;
    }
    document.body.style.paddingTop = (parseFloat(bar.dataset.padBase) + h) + "px";

    Array.prototype.forEach.call(document.body.querySelectorAll("*"), function(el){
      if(el === bar || bar.contains(el)) return;
      var st = getComputedStyle(el);
      var fijoArriba = false;

      if(st.position === "sticky"){
        fijoArriba = true;
      }else if(st.position === "fixed"){
        /* Solo las barras superiores. Un velo a pantalla completa (la
           compuerta de clave, el fondo del cajón) también es fixed y NO
           se debe mover: se reconoce porque ocupa casi toda la altura. */
        var t = parseFloat(st.top);
        fijoArriba = isFinite(t) && t <= 8 && el.offsetHeight < window.innerHeight * 0.5;
      }
      if(!fijoArriba) return;

      if(el.dataset.tqTop === undefined) el.dataset.tqTop = parseFloat(st.top) || 0;
      el.style.top = (parseFloat(el.dataset.tqTop) + h) + "px";
    });
  }

  function montar(){
    document.body.insertBefore(bar, document.body.firstChild);
    acomodar();
    /* la barra se parte en dos líneas en pantallas angostas: al girar el
       teléfono cambia de alto y hay que recalcular */
    var t;
    window.addEventListener("resize", function(){
      clearTimeout(t); t = setTimeout(acomodar, 120);
    });
  }
  if(document.body) montar();
  else document.addEventListener("DOMContentLoaded", montar);
})();
