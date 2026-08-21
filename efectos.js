/* EFECTOS — el movimiento del sitio.
 *
 * Nada de esto es adorno. Cada pieza responde a un problema concreto:
 * la foto que aparece de golpe se siente barata, el catálogo que no reacciona
 * se siente muerto, y un carro que no se puede mirar por todos lados no se
 * compara. Vanilla puro: el repo no admite CDN ni librerías.
 *
 * Si el sistema pide menos movimiento, todo se apaga y el sitio queda igual
 * de usable — solo quieto.
 */
(function () {
  "use strict";

  var quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 1 · La foto que termina de cargar ──────────────────────────────────
     Con el desenfoque de fondo puesto por catalogo.js, la foto real entra
     encima. Sin esto el cambio de borroso a nítido es un corte seco. */
  function fundir(img) {
    if (img.dataset.fundido) return;
    img.dataset.fundido = "1";
    if (quieto || img.complete) { img.style.backgroundImage = ""; return; }
    img.classList.add("fundir");
    requestAnimationFrame(function () { img.classList.add("lista"); });
    img.addEventListener("transitionend", function () {
      img.style.backgroundImage = "";   // el desenfoque ya no aporta y ocupa memoria
    }, { once: true });
  }

  document.querySelectorAll('img[style*="background-image"]').forEach(function (img) {
    if (img.complete) fundir(img);
    else img.addEventListener("load", function () { fundir(img); }, { once: true });
  });

  /* ── 2 · Revelado al scroll ─────────────────────────────────────────────
     Escalonado por posición dentro de su fila: una fila que aparece de golpe
     se lee como un salto; armada de izquierda a derecha se lee como llegada. */
  if (!quieto && "IntersectionObserver" in window) {
    var ojo = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = Number(e.target.dataset.rev || 0);
        e.target.style.transitionDelay = (i * 70) + "ms";
        e.target.classList.add("visible");
        ojo.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    document.querySelectorAll(".rev").forEach(function (el, i) {
      if (!el.dataset.rev) el.dataset.rev = String(i % 4);
      ojo.observe(el);
    });
  } else {
    document.querySelectorAll(".rev").forEach(function (el) { el.classList.add("visible"); });
  }

  /* ── 3 · Selector de color ──────────────────────────────────────────────
     Las fotos del Box son el mismo encuadre en tres carrocerías. Apilarlas y
     cruzar la opacidad hace que el carro se PINTE en vez de cambiar de foto.
     Es el gesto que retiene: quien juega con los colores se queda, y el
     tiempo en página es lo que mejor predice que deje el dato.

     El HTML lo arma la página del vehículo; aquí solo se le da vida. */
  document.querySelectorAll("[data-colores]").forEach(function (host) {
    var marco = host.querySelector(".carro");
    var botones = host.querySelectorAll(".pinta");
    var etiqueta = host.querySelector(".pinta-n");
    if (!marco || !botones.length) return;

    var capas = marco.querySelectorAll("img.capa");

    botones.forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.dataset.color;

        botones.forEach(function (o) {
          o.setAttribute("aria-pressed", String(o === b));
        });
        capas.forEach(function (c) {
          c.classList.toggle("on", c.dataset.color === id);
        });
        if (etiqueta) etiqueta.textContent = b.dataset.nombre || "";
      });
    });
  });

  /* ── 4 · Galería por ángulos ────────────────────────────────────────────
     Cuatro o cinco fotos del mismo carro. Se puede tocar la miniatura o
     arrastrar sobre la foto, que es el gesto que la gente ya trae aprendido
     de los configuradores de marca. */
  document.querySelectorAll("[data-galeria]").forEach(function (host) {
    var marco = host.querySelector(".carro");
    var minis = host.querySelectorAll(".mini");
    if (!marco || !minis.length) return;

    var capas = marco.querySelectorAll("img.capa");
    var actual = 0;

    function ir(i) {
      actual = (i + capas.length) % capas.length;
      capas.forEach(function (c, n) { c.classList.toggle("on", n === actual); });
      minis.forEach(function (m, n) { m.setAttribute("aria-pressed", String(n === actual)); });
      // La siguiente se pide antes de que la pidan: el arrastre tiene que
      // responder ya, no esperar una descarga.
      var sig = capas[(actual + 1) % capas.length];
      if (sig && sig.loading === "lazy") sig.loading = "eager";
    }

    minis.forEach(function (m, n) {
      m.addEventListener("click", function () { ir(n); });
    });

    var x0 = null;
    marco.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
    marco.addEventListener("pointerup", function (e) {
      if (x0 === null) return;
      var d = e.clientX - x0;
      x0 = null;
      if (Math.abs(d) > 40) ir(actual + (d < 0 ? 1 : -1));
    });
    marco.addEventListener("pointercancel", function () { x0 = null; });

    host.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { ir(actual + 1); e.preventDefault(); }
      if (e.key === "ArrowLeft")  { ir(actual - 1); e.preventDefault(); }
    });
  });

  /* ── 5 · El video solo carga si se va a ver ─────────────────────────────
     Un video que arranca a descargar con la página se lleva por delante el
     tiempo de carga de todo lo demás, y en móvil se lleva también los datos
     de alguien que quizá nunca baje hasta ahí. */
  var videos = document.querySelectorAll("video[data-src]");
  if (videos.length && "IntersectionObserver" in window) {
    var ojoV = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (!v.src) { v.src = v.dataset.src; }
          if (!quieto) { var p = v.play(); if (p) p.catch(function () {}); }
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { threshold: 0.25 });
    videos.forEach(function (v) { ojoV.observe(v); });
  }

  /* ── 6 · Paralaje del hero ──────────────────────────────────────────────
     Muy sutil y a propósito: el carro se hunde un poco más lento que el
     texto al bajar. Da profundidad de sala de exhibición. Todo dentro de un
     rAF para no leer el scroll en cada evento y trabar el desplazamiento. */
  var heroes = document.querySelectorAll("[data-paralaje]");
  if (heroes.length && !quieto && window.innerWidth > 860) {
    var pendiente = false;
    window.addEventListener("scroll", function () {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        heroes.forEach(function (h) {
          if (y < window.innerHeight * 1.2) {
            h.style.transform = "translate3d(0," + (y * 0.14).toFixed(1) + "px,0)";
          }
        });
        pendiente = false;
      });
    }, { passive: true });
  }
})();
