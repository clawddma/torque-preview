/* ═══════════════════════════════════════════════════════════════════
   TORQUE — submenú pegajoso de secciones en páginas de producto

   Referencia: la ficha de la Vigo en dongfeng.co.nz tiene un submenú
   pegajoso (Overview / Features / Performance / Technology / Safety)
   que aparece al bajar y salta directo a la sección. Aquí no hay
   markup que escribir por página: se arma solo mirando qué
   <section id> existen de verdad, así una página sin ficha técnica
   -el E70, que todavía no la tiene publicada- no muestra un enlace
   roto. Mismo espíritu que menu.js con el menú móvil: un menú escrito
   a mano se desincroniza el día que una página gana o pierde una
   sección; este no puede.

   Se carga con <script src="subnav.js" defer></script>, después de
   que el <main> con las secciones ya está en el documento.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var ETIQUETAS = {
    versiones: "Versiones",
    ficha: "Ficha técnica",
    galeria: "Galería",
    video: "Video",
    contacto: "Contacto"
  };

  var main = document.querySelector("main");
  if (!main) return;

  var encontradas = [];
  Object.keys(ETIQUETAS).forEach(function (id) {
    var sec = document.getElementById(id);
    if (sec) encontradas.push({ id: id, etiqueta: ETIQUETAS[id], el: sec });
  });
  // con un solo salto no vale la pena el submenu
  if (encontradas.length < 2) return;

  var nav = document.createElement("nav");
  nav.className = "subnav";
  nav.setAttribute("aria-label", "Secciones de la página");
  var wrap = document.createElement("div");
  wrap.className = "wrap";
  encontradas.forEach(function (e) {
    var a = document.createElement("a");
    a.href = "#" + e.id;
    a.textContent = e.etiqueta;
    wrap.appendChild(a);
  });
  nav.appendChild(wrap);
  main.parentNode.insertBefore(nav, main);

  // resalta el enlace de la seccion visible mientras se hace scroll
  if (!("IntersectionObserver" in window)) return;
  var links = [].slice.call(wrap.querySelectorAll("a"));
  var ov = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (en) {
      if (!en.isIntersecting) return;
      var idx = encontradas.findIndex(function (e) { return e.el === en.target });
      links.forEach(function (a, k) { a.classList.toggle("on", k === idx) });
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  encontradas.forEach(function (e) { ov.observe(e.el) });
})();
