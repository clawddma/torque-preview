/* EL CATÁLOGO — la vitrina de las siete referencias, con filtros.
 *
 * Es la pieza que convierte un showroom en concesionario: quien compara es
 * quien compra. Todo sale de CATALOGO (catalogo.js); aquí no vive ni un precio.
 *
 * Se monta sobre <div id="catalogo"></div> y necesita catalogo.js cargado antes.
 */
(function () {
  "use strict";

  var host = document.getElementById("catalogo");
  if (!host || typeof CATALOGO === "undefined") return;

  var rejilla, cuenta;
  var filtro = { energia: "todo", precio: "todo", orden: "precio" };

  var RANGOS = {
    todo: function () { return true; },
    bajo: function (v) { return v.precio < 85000000; },
    medio: function (v) { return v.precio >= 85000000 && v.precio < 110000000; },
    alto: function (v) { return v.precio >= 110000000; }
  };

  var ORDENES = {
    precio:    function (a, b) { return a.precio - b.precio; },
    autonomia: function (a, b) { return (b.autonomia || 0) - (a.autonomia || 0); },
    potencia:  function (a, b) { return (b.potencia || 0) - (a.potencia || 0); }
  };

  /* ── La barra de filtros ────────────────────────────────────────────── */

  function grupo(titulo, clave, opciones) {
    var h = '<div class="fgrupo"><span>' + titulo + "</span>";
    opciones.forEach(function (o) {
      h += '<button class="chip" type="button" data-f="' + clave + '" data-v="' + o[0] +
           '" aria-pressed="' + (filtro[clave] === o[0]) + '">' + o[1] + "</button>";
    });
    return h + "</div>";
  }

  function barra() {
    return '<div class="filtros">' +
      grupo("Energía", "energia", [
        ["todo", "Todos"], ["electrico", "Eléctricos"], ["hibrido", "Híbridos"]
      ]) +
      grupo("Precio", "precio", [
        ["todo", "Todos"],
        ["bajo", "Hasta $85M"],
        ["medio", "$85M a $110M"],
        ["alto", "Más de $110M"]
      ]) +
      grupo("Ordenar por", "orden", [
        ["precio", "Precio"], ["autonomia", "Autonomía"], ["potencia", "Potencia"]
      ]) +
      '<span class="fcuenta" id="fcuenta"></span></div>';
  }

  /* ── La tarjeta ─────────────────────────────────────────────────────── */

  function tarjeta(sku, i) {
    var v = CATALOGO[sku];
    var lq = (typeof LQIP !== "undefined" && LQIP[v.foto]) || null;
    var rebaja = v.lista ? v.lista - v.precio : 0;

    // El código de campaña viaja a la página del carro para saber de dónde
    // salió el lead. Si no hay campaña, el enlace queda limpio.
    var ref = "";
    try { ref = sessionStorage.getItem("tq_c") || ""; } catch (e) {}
    var href = v.pagina + (ref ? "?c=" + encodeURIComponent(ref) : "");

    var srcset = [640, 1280].map(function (w) {
      return "img/" + v.foto + "-" + w + ".webp " + w + "w";
    }).join(", ");

    var h = '<a class="veh entra" href="' + href + '" style="animation-delay:' +
            (i * 45) + 'ms" data-sku="' + sku + '">';

    // Un solo atributo style: el encuadre de este carro y el desenfoque de
    // arranque van juntos. Emitirlos por separado deja dos `style` en el mismo
    // <img> y el navegador se queda con el primero, así que el segundo se pierde.
    var estilo = "object-position:" + (v.pos || "center");
    if (lq) estilo += ";background-image:url(" + lq.d + ");background-size:cover";

    h += '<div class="ph"><span class="tag">' + v.beneficio + "</span>" +
         '<picture><source type="image/webp" srcset="' + srcset +
         '" sizes="(max-width:640px) 100vw, 400px">' +
         '<img src="img/' + v.foto + '.jpg" alt="' + v.marca + " " + v.nombre +
         '" loading="lazy" decoding="async" width="' + (lq ? lq.w : 1600) +
         '" height="' + (lq ? lq.h : 1067) +
         '" style="' + estilo + '"></picture></div>';

    h += '<div class="body">' +
         '<span class="k">' + etiquetaEnergia(v) + " · " + v.carroceria + "</span>" +
         "<h3>" + v.nombre + "</h3>" +
         '<span class="gancho">' + v.linea + "</span>";

    h += '<div class="specs">';
    v.tarjeta.forEach(function (t) {
      h += "<div><b>" + t[0] + "</b>" + t[1] + "</div>";
    });
    h += "</div>";

    h += '<div class="pie"><span class="precio"><small>Desde</small>' +
         (v.lista ? '<span class="antes"><em>Antes</em> ' + precioCOP(v.lista) + "</span>" : "") +
         precioCOP(v.precio) + "</span>";
    h += rebaja
      ? '<span class="ahorro">' + precioCOP(rebaja) + " menos</span>"
      : '<span class="ver">Ver ficha &rsaquo;</span>';
    h += "</div></div></a>";

    return h;
  }

  /* ── Pintar ─────────────────────────────────────────────────────────── */

  function pintar() {
    var lista = ORDEN.filter(function (sku) {
      var v = CATALOGO[sku];
      if (filtro.energia !== "todo" && v.energia !== filtro.energia) return false;
      return RANGOS[filtro.precio](v);
    });

    lista.sort(function (a, b) { return ORDENES[filtro.orden](CATALOGO[a], CATALOGO[b]); });

    rejilla.innerHTML = lista.length
      ? lista.map(tarjeta).join("")
      : '<p class="vacio">Ninguna referencia cumple con eso. Prueba con otro rango de precio.</p>';

    cuenta.textContent = lista.length === 1
      ? "1 referencia"
      : lista.length + " referencias";
  }

  /* ── Montaje ────────────────────────────────────────────────────────── */

  host.innerHTML = barra() + '<div class="flota" id="crejilla"></div>';
  rejilla = document.getElementById("crejilla");
  cuenta = document.getElementById("fcuenta");

  host.addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b) return;
    filtro[b.dataset.f] = b.dataset.v;
    // Solo se repintan los botones del grupo que cambió.
    host.querySelectorAll('.chip[data-f="' + b.dataset.f + '"]').forEach(function (o) {
      o.setAttribute("aria-pressed", String(o.dataset.v === b.dataset.v));
    });
    pintar();
  });

  pintar();
})();
