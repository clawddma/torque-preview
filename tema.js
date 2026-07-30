/* ═══════════════════════════════════════════════════════════════════
   TORQ — tema claro / oscuro

   Se carga SIN defer, en el <head>, para estampar el tema antes del
   primer pintado: con defer habría un destello del tema contrario.

   El orden de decisión: lo que el visitante eligió aquí (localStorage),
   y si nunca ha elegido, lo que prefiere su sistema. Solo las páginas
   que cargan este archivo tienen tema claro; las vistas internas de
   trabajo siguen oscuras siempre.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  var CLAVE = "torq-tema";
  var raiz = document.documentElement;

  function preferido(){
    try{ var g = localStorage.getItem(CLAVE); if(g==="light"||g==="dark") return g }catch(e){}
    return (window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches) ? "light" : "dark";
  }
  function aplicar(t){
    raiz.dataset.theme = t;
    var m = document.querySelector('meta[name="theme-color"]');
    if(m) m.setAttribute("content", t==="light" ? "#f7f6f3" : "#08090a");
  }
  function alternar(){
    var t = raiz.dataset.theme === "light" ? "dark" : "light";
    try{ localStorage.setItem(CLAVE, t) }catch(e){}
    aplicar(t);
    return t;
  }
  aplicar(preferido());

  /* El menú de móvil también cambia el tema, y no puede depender de que
     el botón ya exista: este archivo va en el <head> y monta su botón en
     DOMContentLoaded, mientras que menu.js -con defer- corre antes. La
     puerta es esta función, no el DOM. */
  window.TORQUETema = { alternar:alternar, actual:function(){ return raiz.dataset.theme } };

  /* el interruptor: un punto medio lleno, sobrio, al final del nav */
  function montar(){
    var sitio = document.querySelector(".nav .wrap");
    if(!sitio) return;
    var b = document.createElement("button");
    b.className = "tema-btn";
    b.setAttribute("aria-label","Cambiar entre tema claro y oscuro");
    b.innerHTML = '<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">'+
      '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/>'+
      '<path d="M12 3 A9 9 0 0 1 12 21 Z" fill="currentColor"/></svg>';
    var css = document.createElement("style");
    css.textContent = ".tema-btn{background:none;border:1px solid var(--line2);color:var(--mut);"+
      "width:40px;height:40px;border-radius:50%;cursor:pointer;flex:none;display:flex;"+
      "align-items:center;justify-content:center;transition:color .2s,border-color .2s}"+
      ".tema-btn:hover{color:var(--paper);border-color:var(--mut2)}"+
      /* En un teléfono la barra ya lleva logotipo con eslogan, menú y
         Cotizar: el interruptor no cabe sin comerse el margen. Se
         esconde y pasa al panel del menú, que lo acciona por delegación
         -el botón sigue aquí, solo deja de verse. */
      "@media(max-width:560px){.tema-btn{display:none}}";
    document.head.appendChild(css);
    b.onclick = alternar;
    /* antes del CTA, para que el CTA siga siendo lo último que se ve */
    var cta = sitio.querySelector(":scope > .cta");
    if(cta) sitio.insertBefore(b, cta); else sitio.appendChild(b);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", montar);
  else montar();
})();
