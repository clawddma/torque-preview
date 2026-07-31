/* ═══════════════════════════════════════════════════════════════════
   TORQUE — menú lateral de secciones (patrón Shopify Admin)

   Camilo lo pidió viendo el Admin de Shopify: un menú fijo al lado que
   lista las secciones, y al hacer clic en una, el panel principal
   muestra toda su información sin perder el menú de vista. Antes estas
   páginas eran un solo scroll largo sin más navegación que el mouse.

   La primera versión usaba <button> con scroll calculado a mano en
   JavaScript. Daniel preguntó algo muy simple y muy correcto: "¿por qué
   en vez de eso, si ya estaba en URL?" — y tenía razón. Cada sección ya
   tiene un id; lo que faltaba era usar un <a href="#id"> de verdad, no
   reinventarlo con botones. Con enlaces reales cada sección queda con
   su propia URL -mercado.html#sec-financiacion se puede copiar, mandar
   por WhatsApp o guardar en marcadores-, funciona con el bot&oacute;n
   atr&aacute;s del navegador, y hasta sin JavaScript el salto ocurre
   igual. Lo único que JavaScript sigue aportando es el offset -para que
   la secci&oacute;n no quede tapada bajo las barras fijas- y resaltar
   cuál está a la vista.

   Se monta dentro de cualquier `<div class="panel-shell">`: lee los
   `<h2>` de su `.panel-content`, arma el menú solo, y no toca ningún
   id ni listener que ya exista -mueve nodos, nunca los reconstruye-.
   Se carga con <script src="panel-nav.js" defer></script>, DESPUÉS de
   nav.js en el documento.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";

  function slug(t){
    return t.toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g,"")   /* quita tildes */
      .replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
  }

  /* El techo del menú no es fijo: hay que sumar TODO lo que ya está
     pegado arriba -la barra que inyecta nav.js, el <nav> propio de cada
     página, y en mercado.html además la barra de filtros-. En vez de
     adivinar esas alturas, se miden: cualquier elemento fixed/sticky
     que a scroll 0 quede pegado al tope del viewport. */
  function techo(){
    var total = 0;
    document.querySelectorAll("body *").forEach(function(el){
      var st = getComputedStyle(el);
      if(st.position !== "fixed" && st.position !== "sticky") return;
      var top = parseFloat(st.top);
      if(!isFinite(top) || top > 4) return;      /* no está pegado arriba */
      var r = el.getBoundingClientRect();
      if(r.top > 4) return;                       /* ya no está en pantalla */
      total = Math.max(total, top + r.height);
    });
    return total;
  }

  function montar(shell){
    var nav = shell.querySelector(".panel-nav");
    var contenido = shell.querySelector(".panel-content");
    if(!nav || !contenido) return;

    /* cada h2 de primer nivel dentro del contenido es una sección del
       menú -no los que puedan aparecer dentro de un modal o de una
       tarjeta de detalle anidada, por eso se filtra por .panel > h2 */
    var titulos = [].slice.call(contenido.querySelectorAll(".panel > h2, .panel h2:first-child"));
    /* quita duplicados si un panel matchea las dos reglas */
    titulos = titulos.filter(function(h,i){ return titulos.indexOf(h) === i });
    if(!titulos.length) return;

    var items = [];
    titulos.forEach(function(h2){
      var panel = h2.closest(".panel");
      if(!panel.id) panel.id = "sec-" + slug(h2.textContent);
      var a = document.createElement("a");
      a.href = "#" + panel.id;
      a.textContent = h2.textContent;
      nav.appendChild(a);
      items.push({a:a, panel:panel});
    });

    /* el offset va en scroll-margin-top de cada panel, NO en JavaScript
       calculando adónde saltar: así el salto lo resuelve el navegador
       mismo -clic, bot&oacute;n atr&aacute;s, escribir la URL a mano,
       hasta sin que este script haya cargado- y siempre queda igual de
       bien alineado, sin duplicar la cuenta en dos sitios. */
    var lado = shell.querySelector(".panel-side") || nav;
    function fijarMargen(){
      var angosto = matchMedia("(max-width:1050px)").matches;
      var t = angosto ? techo() : techo() + 14;
      items.forEach(function(o){ o.panel.style.scrollMarginTop = t + "px" });
      /* lo pegajoso es la columna entera -filtros incluidos-, no solo el
         índice de secciones que va dentro de ella */
      if(!angosto){
        lado.style.top = (techo() + 14) + "px";
        lado.style.maxHeight = "calc(100vh - " + (techo() + 28) + "px)";
      }else{
        lado.style.top = "";
        lado.style.maxHeight = "";
      }
    }
    fijarMargen();
    window.addEventListener("resize", fijarMargen);
    /* nav.js todavía puede estar acomodando su propia barra un instante
       después del primer pintado (fuentes, imágenes); un reintento
       corto cubre eso sin quedar recalculando para siempre */
    setTimeout(fijarMargen, 300);

    /* si la página se abrió con un hash -alguien pegó o compartió el
       enlace directo a una sección-, el navegador ya intentó saltar
       ahí ANTES de que existiera el scroll-margin-top de arriba, así
       que puede haber quedado tapado bajo las barras. Se corrige una
       sola vez, sin animación, para que no se sienta como un rebote. */
    if(location.hash){
      var destino = document.querySelector(location.hash);
      if(destino && contenido.contains(destino)){
        requestAnimationFrame(function(){ destino.scrollIntoView({block:"start"}) });
      }
    }

    /* resalta la sección visible mientras se hace scroll, igual que
       Shopify marca la página activa del panel */
    var activo = null;
    function marcar(panel){
      if(panel === activo) return;
      activo = panel;
      items.forEach(function(o){ o.a.classList.toggle("on", o.panel === panel) });
    }
    if("IntersectionObserver" in window){
      var io = new IntersectionObserver(function(entries){
        var visibles = entries.filter(function(e){ return e.isIntersecting });
        if(!visibles.length) return;
        /* el que esté más arriba de los visibles es "el que se está leyendo" */
        visibles.sort(function(a,b){ return a.boundingClientRect.top - b.boundingClientRect.top });
        marcar(visibles[0].target);
      }, { rootMargin: "-15% 0px -70% 0px" });
      titulos.forEach(function(h2){ io.observe(h2.closest(".panel")) });
    }
    marcar(items[0].panel);
  }

  function iniciar(){
    document.querySelectorAll(".panel-shell").forEach(montar);
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
