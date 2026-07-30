/* ═══════════════════════════════════════════════════════════════════
   TORQUE — el menú de móvil

   El CSS esconde `.navl` bajo 960 px y deja el sitio SIN navegación:
   ni Vigo, ni Box, ni Mage, ni Simulador. Esperaba un botón `.burger`
   que nunca se puso en el HTML. Esto lo pone, y lo pone solo:

   los enlaces del panel se leen de la propia barra de cada página, así
   que una página con anclas propias (Ficha, Comparar) las lleva al
   panel sin tocar nada aquí. Un menú escrito a mano se desincroniza el
   día que alguien agrega una pestaña; este no puede.

   Se carga con <script src="menu.js" defer></script>.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";

  function montar(){
    var barra = document.querySelector(".nav .wrap");
    var lista = barra && barra.querySelector(".navl");
    if(!barra || !lista) return;

    /* ── el botón ──────────────────────────────────────────────── */
    var boton = document.createElement("button");
    boton.className = "burger";
    boton.type = "button";
    boton.setAttribute("aria-label", "Abrir el menú");
    boton.setAttribute("aria-expanded", "false");
    boton.innerHTML = '<span class="bl"></span><span class="bl"></span>';

    /* ── el panel, copiado de la barra ─────────────────────────── */
    var panel = document.createElement("div");
    panel.className = "menu-movil";
    panel.id = "menu-movil";
    panel.hidden = true;
    var ul = document.createElement("ul");
    Array.prototype.forEach.call(lista.querySelectorAll("a"), function(a){
      var li = document.createElement("li");
      var b = document.createElement("a");
      b.href = a.getAttribute("href");
      b.textContent = a.textContent;
      if(a.hasAttribute("aria-current")) b.setAttribute("aria-current","page");
      li.appendChild(b); ul.appendChild(li);
    });
    /* el CTA se repite dentro del panel: con el menú abierto tapando la
       barra, el botón de cotizar queda fuera de alcance */
    var cta = barra.querySelector(":scope > .cta");
    if(cta){
      var li = document.createElement("li");
      li.className = "cta-li";
      var c = document.createElement("a");
      c.className = "cta"; c.href = cta.getAttribute("href");
      c.textContent = cta.textContent;
      li.appendChild(c); ul.appendChild(li);
    }
    /* El interruptor de tema no cabe en la barra de un teléfono: se
       esconde por CSS y se acciona desde aquí. Se habla con tema.js por
       su función, no buscando su botón: este archivo corre antes de que
       ese botón exista. */
    var temaA = null;
    if(window.TORQUETema){
      var temaLi = document.createElement("li");
      temaA = document.createElement("button");
      temaA.type = "button"; temaA.className = "fila-tema";
      temaLi.appendChild(temaA);
      ul.insertBefore(temaLi, cta ? ul.lastChild : null);
      temaA.addEventListener("click", function(e){
        e.stopPropagation();          /* no cerrar: el cambio se ve en sitio */
        window.TORQUETema.alternar(); rotularTema();
      });
    }
    function rotularTema(){
      if(!temaA) return;
      temaA.textContent = window.TORQUETema.actual() === "light"
        ? "Cambiar a tema oscuro" : "Cambiar a tema claro";
    }
    rotularTema();

    panel.appendChild(ul);
    boton.setAttribute("aria-controls", panel.id);

    var css = document.createElement("style");
    css.textContent =
      /* dos rayas, no tres: el icono de tres rayas es un cliché y con dos
         se lee igual de rápido a este tamaño */
      '.burger{display:none;flex-direction:column;gap:5px;justify-content:center;align-items:center;'+
        'width:40px;height:40px;border:1px solid var(--line2);border-radius:50%;'+
        'background:none;cursor:pointer;padding:0;flex:none}'+
      '.burger .bl{display:block;width:17px;height:1.8px;border-radius:2px;background:var(--paper);'+
        'transition:transform .28s cubic-bezier(.4,0,.2,1),opacity .2s}'+
      '.burger[aria-expanded="true"] .bl:first-child{transform:translateY(3.4px) rotate(45deg)}'+
      '.burger[aria-expanded="true"] .bl:last-child{transform:translateY(-3.4px) rotate(-45deg)}'+
      '.menu-movil{position:fixed;left:0;right:0;top:var(--nav);z-index:99;'+
        'background:var(--navbg);backdrop-filter:blur(20px);'+
        'border-bottom:1px solid var(--line);max-height:calc(100vh - var(--nav));overflow-y:auto}'+
      '.menu-movil ul{list-style:none;margin:0;padding:8px 0 18px}'+
      '.menu-movil li{border-bottom:1px solid var(--line)}'+
      '.menu-movil li:last-child{border-bottom:none}'+
      '.menu-movil a{display:block;padding:17px calc(var(--pad) + var(--safe-l));'+
        'text-decoration:none;color:var(--paper);font-size:18px;font-weight:600;letter-spacing:-.015em}'+
      '.menu-movil a[aria-current]{color:var(--acc)}'+
      '.menu-movil .fila-tema{display:block;width:100%;text-align:left;background:none;border:none;'+
        'font:inherit;cursor:pointer;color:var(--mut);'+
        'padding:17px calc(var(--pad) + var(--safe-l));font-size:16px;font-weight:600}'+
      '@media(min-width:561px){.menu-movil .fila-tema{display:none}}'+
      '.menu-movil .cta-li{margin:16px calc(var(--pad) + var(--safe-l)) 0}'+
      /* el color va explícito: la regla de los enlaces del panel es más
         específica que la del botón y le ganaba la tinta */
      '.menu-movil .cta-li .cta{color:var(--onacc);text-align:center;padding:15px 26px;font-size:16px}'+
      '@media(prefers-reduced-motion:reduce){.burger .bl{transition:none}}'+
      '@media(max-width:960px){.burger{display:flex}}'+
      '@media(min-width:961px){.menu-movil{display:none}}';
    document.head.appendChild(css);

    /* el panel va como hermano de la barra, no dentro: dentro heredaría
       el alto fijo del nav y quedaría recortado */
    var nav = document.querySelector(".nav");
    nav.parentNode.insertBefore(panel, nav.nextSibling);
    if(cta) barra.insertBefore(boton, cta); else barra.appendChild(boton);

    /* ── abrir y cerrar ────────────────────────────────────────── */
    function abierto(){ return boton.getAttribute("aria-expanded") === "true" }
    function poner(v){
      boton.setAttribute("aria-expanded", v ? "true" : "false");
      boton.setAttribute("aria-label", v ? "Cerrar el menú" : "Abrir el menú");
      panel.hidden = !v;
    }
    boton.addEventListener("click", function(){ rotularTema(); poner(!abierto()) });
    panel.addEventListener("click", function(e){
      /* un ancla de la misma página no recarga: hay que cerrar a mano */
      if(e.target.tagName === "A") poner(false);
    });
    document.addEventListener("keydown", function(e){
      if(e.key === "Escape" && abierto()){ poner(false); boton.focus() }
    });
    document.addEventListener("click", function(e){
      if(abierto() && !panel.contains(e.target) && !boton.contains(e.target)) poner(false);
    });
    /* al girar el teléfono a horizontal puede pasar a escritorio: el
       panel se esconde por CSS pero el estado quedaría mintiendo */
    window.addEventListener("resize", function(){
      if(abierto() && window.innerWidth > 960) poner(false);
    });
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", montar);
  else montar();
})();
