/* ═══════════════════════════════════════════════════════════════════
   TORQUE — menú lateral de secciones (patrón Shopify Admin)

   Camilo lo pidió viendo el Admin de Shopify: un menú fijo al lado que
   lista las secciones, y al hacer clic en una, el panel principal
   muestra toda su información sin perder el menú de vista. Antes estas
   páginas eran un solo scroll largo sin más navegación que el mouse.

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

    var botones = [];
    titulos.forEach(function(h2){
      var panel = h2.closest(".panel");
      if(!panel.id) panel.id = "sec-" + slug(h2.textContent);
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = h2.textContent;
      b.dataset.target = panel.id;
      nav.appendChild(b);
      botones.push({btn:b, panel:panel});
    });

    function irA(panel){
      var y = panel.getBoundingClientRect().top + window.scrollY - techo() - 14;
      window.scrollTo({top:y, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"});
    }
    botones.forEach(function(o){
      o.btn.addEventListener("click", function(){ irA(o.panel) });
    });

    /* el techo cambia con el ancho -el menú lateral se vuelve una fila
       horizontal en móvil, y nav.js recalcula su propia altura-, así
       que se vuelve a fijar el "top" del menú en cada resize */
    function fijarTope(){
      if(matchMedia("(max-width:900px)").matches){ nav.style.top = ""; return }
      nav.style.top = (techo() + 14) + "px";
    }
    fijarTope();
    window.addEventListener("resize", fijarTope);
    /* nav.js todavía puede estar acomodando su propia barra un instante
       después del primer pintado (fuentes, imágenes); un reintento
       corto cubre eso sin quedar recalculando para siempre */
    setTimeout(fijarTope, 300);

    /* resalta la sección visible mientras se hace scroll, igual que
       Shopify marca la página activa del panel */
    var activo = null;
    function marcar(panel){
      if(panel === activo) return;
      activo = panel;
      botones.forEach(function(o){ o.btn.classList.toggle("on", o.panel === panel) });
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
    marcar(botones[0].panel);
  }

  function iniciar(){
    document.querySelectorAll(".panel-shell").forEach(montar);
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
