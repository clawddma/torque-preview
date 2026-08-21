/* CATÁLOGO TORQ — la única fuente de precios y fichas del sitio.
 *
 * Antes cada precio vivía repetido cuatro o cinco veces por página. Con siete
 * referencias eso se vuelve inmanejable: basta que una quede sin actualizar
 * para publicar dos precios distintos del mismo carro. De aquí se alimentan el
 * índice, el comparador y el calificador.
 *
 * PRECIOS: lista de Corautos Andino de agosto de 2026.
 * FICHAS:  Mage y Huge de julio de 2026 · Box de marzo · Vigo del 21 de mayo.
 *          El E70 todavía no tiene ficha; lo que no sabemos va en null y la
 *          página lo dice, no lo inventa.
 */

var CATALOGO = {

  "box-e2": {
    familia: "box", pagina: "box.html", cod: "BOXE2",
    nombre: "Box E2", marca: "Dongfeng", carroceria: "Hatchback",
    linea: "El eléctrico urbano",
    precio: 69990000, lista: 84990000, beneficio: "Bono especial de agosto",
    energia: "electrico",
    // Las tres cifras de la tarjeta: [cifra, etiqueta].
    tarjeta: [["430","km CLTC"],["43,9","kWh"],["4,04","m de largo"]],
    autonomia: 430, autonomiaReal: 310, potencia: 94, torque: 160,
    bateria: 43.89, largo: 4045, plazas: 5,
    pos: "center 52%",
    foto: "box/azul-tresq",
    colores: [
      { id: "azul",   nombre: "Azul",   hex: "#8fb4c9", foto: "box/azul-tresq" },
      { id: "blanco", nombre: "Blanco", hex: "#eceae6", foto: "box/blanco-tresq" },
      { id: "gris",   nombre: "Plata",  hex: "#c3c6c8", foto: "box/gris-tresq" }
    ],
    galeria: ["box/azul-tresq", "box/azul-tresq-izq", "box/azul-lateral", "box/azul-trasera"]
  },

  "box-e3": {
    familia: "box", pagina: "box.html", cod: "BOXE3",
    nombre: "Box E3", marca: "Dongfeng", carroceria: "Hatchback",
    linea: "El eléctrico urbano, equipado",
    precio: 74990000, lista: 89990000, beneficio: "Bono especial de agosto",
    energia: "electrico",
    tarjeta: [["430","km CLTC"],["360°","de cámara"],["6","parlantes"]],
    autonomia: 430, autonomiaReal: 310, potencia: 94, torque: 160,
    bateria: 43.89, largo: 4045, plazas: 5,
    pos: "center 52%",
    foto: "box/blanco-tresq",
    colores: [
      { id: "azul",   nombre: "Azul",   hex: "#8fb4c9", foto: "box/azul-tresq" },
      { id: "blanco", nombre: "Blanco", hex: "#eceae6", foto: "box/blanco-tresq" },
      { id: "gris",   nombre: "Plata",  hex: "#c3c6c8", foto: "box/gris-tresq" }
    ],
    galeria: ["box/blanco-tresq", "box/blanco-tresq-izq", "box/blanco-lateral", "box/blanco-trasera"]
  },

  "vigo-e2": {
    familia: "vigo", pagina: "vigo.html", cod: "VIGOE2",
    nombre: "Vigo E2", marca: "Dongfeng", carroceria: "SUV",
    linea: "La SUV eléctrica",
    precio: 84990000, lista: 89990000, beneficio: "Precio de lanzamiento",
    energia: "electrico",
    tarjeta: [["401","km CLTC"],["161","HP"],["30","min al 80%"]],
    autonomia: 401, autonomiaReal: 296, potencia: 161, torque: 230,
    bateria: 44.94, largo: 4292, plazas: 5,
    pos: "center 50%",
    foto: "vigo/e2-tresq",
    colores: [{ id: "naranja", nombre: "Naranja", hex: "#e2652a", foto: "vigo/e2-tresq" }],
    galeria: ["vigo/e2-tresq", "vigo/e2-frontal", "vigo/e2-lateral", "vigo/e2-trasera", "vigo/e2-interior"],
    video: "video/vigo-teaser.mp4"
  },

  "vigo-e2mas": {
    familia: "vigo", pagina: "vigo.html", cod: "VIGOE2M",
    nombre: "Vigo E2+", marca: "Dongfeng", carroceria: "SUV",
    linea: "La SUV eléctrica de mayor alcance",
    precio: 89990000, lista: 96990000, beneficio: "Precio de lanzamiento",
    energia: "electrico",
    tarjeta: [["470","km CLTC"],["18","min al 80%"],["51,9","kWh"]],
    autonomia: 470, autonomiaReal: 340, potencia: 161, torque: 230,
    bateria: 51.87, largo: 4292, plazas: 5,
    pos: "center 50%",
    foto: "vigo/e2mas-tresq",
    colores: [{ id: "blanco", nombre: "Blanco", hex: "#e9e9e7", foto: "vigo/e2mas-tresq" }],
    galeria: ["vigo/e2mas-tresq", "vigo/e2mas-frontal", "vigo/e2mas-lateral", "vigo/e2mas-trasera"],
    video: "video/vigo-teaser.mp4"
  },

  "e70": {
    familia: "e70", pagina: "e70.html", cod: "E70",
    nombre: "E70", marca: "Dongfeng", carroceria: "Sedán",
    linea: "El sedán eléctrico",
    precio: 79990000, lista: 95990000, beneficio: "Precio de lanzamiento",
    energia: "electrico",
    tarjeta: [["100%","eléctrico"],["4","puertas"],["5","puestos"]],
    autonomia: null, autonomiaReal: null, potencia: null, torque: null,
    bateria: null, largo: null, plazas: 5,
    fichaPendiente: true,
    pos: "center 55%",
    foto: "e70/tresq-tras",
    colores: [{ id: "blanco", nombre: "Blanco", hex: "#f0f0ee", foto: "e70/tresq-tras" }],
    galeria: ["e70/tresq-tras", "e70/tresq", "e70/frontal", "e70/trasera"]
  },

  "mage": {
    familia: "mage", pagina: "mage.html", cod: "MAGE",
    nombre: "Mage HEV", marca: "Dongfeng", carroceria: "SUV",
    linea: "La híbrida que no se enchufa",
    precio: 109990000, lista: 129990000, beneficio: "Precio de lanzamiento",
    energia: "hibrido",
    tarjeta: [["288","HP"],["4,9","L/100 km"],["1.000","km sin parar"]],
    autonomia: 1000, autonomiaReal: null, potencia: 288, torque: 565,
    consumo: 4.9, largo: 4650, plazas: 5,
    pos: "center 50%",
    foto: "mage/tresq",
    colores: [
      { id: "blanco", nombre: "Blanco", hex: "#efefed", foto: "mage/tresq" },
      { id: "plata",  nombre: "Plata",  hex: "#c8cacb", foto: "mage/tresq" },
      { id: "azul",   nombre: "Azul",   hex: "#2f5675", foto: "mage/tresq" },
      { id: "negro",  nombre: "Negro",  hex: "#1b1d20", foto: "mage/tresq" }
    ],
    galeria: ["mage/tresq", "mage/frontal", "mage/trasera", "mage/baul", "mage/interior"]
  },

  "huge": {
    familia: "huge", pagina: "huge.html", cod: "HUGE",
    nombre: "Huge", marca: "Dongfeng", carroceria: "SUV",
    linea: "La SUV grande, híbrida",
    precio: 124990000, lista: 140990000, beneficio: "Precio de lanzamiento",
    energia: "hibrido",
    tarjeta: [["241","HP"],["5,8","L/100 km"],["4,72","m de largo"]],
    autonomia: null, autonomiaReal: null, potencia: 241, torque: 540,
    consumo: 5.8, largo: 4720, plazas: 5,
    pos: "center 50%",
    foto: "huge/lateral",
    colores: [
      { id: "blanco", nombre: "Blanco", hex: "#efefed", foto: "huge/lateral" },
      { id: "azul",   nombre: "Azul",   hex: "#2c4a6b", foto: "huge/lateral" },
      { id: "negro",  nombre: "Negro",  hex: "#1b1d20", foto: "huge/lateral" }
    ],
    galeria: ["huge/lateral", "huge/tresq", "huge/frontal", "huge/baul"]
  }
};

/* El orden en que se muestran: de menor a mayor precio. Es el orden en que la
 * gente compara y evita que el catálogo parezca desordenado cuando entren más. */
var ORDEN = ["box-e2", "box-e3", "e70", "vigo-e2", "vigo-e2mas", "mage", "huge"];

/* ── Utilidades compartidas ─────────────────────────────────────────────── */

/* $109.990.000 — punto de miles, como se escribe en Colombia. */
function precioCOP(n) {
  return "$" + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/* "$20.000.000" de rebaja. Devuelve 0 si no hay precio de lista. */
function descuento(sku) {
  var v = CATALOGO[sku];
  return v && v.lista ? v.lista - v.precio : 0;
}

/* Etiqueta corta de energía, para filtros y tarjetas. */
function etiquetaEnergia(v) {
  return v.energia === "hibrido" ? "Híbrido" : "100% eléctrico";
}

/* Marca <picture> completo: webp por srcset, jpeg de respaldo, tamaño fijo
 * para que la página no salte, y el desenfoque de arranque si viene dado.
 *   anchos  — los que existen en disco para esa foto
 *   sizes   — cuánto ocupa la foto en pantalla, para que el navegador elija */
function marcarFoto(ruta, alt, opciones) {
  var o = opciones || {};
  var anchos = o.anchos || [640, 1280, 1920];
  var srcset = anchos.map(function (w) {
    return "img/" + ruta + "-" + w + ".webp " + w + "w";
  }).join(", ");

  var attrs = 'alt="' + alt + '" width="' + (o.w || 1600) + '" height="' + (o.h || 1067) + '"';
  attrs += o.prioritaria
    ? ' fetchpriority="high" decoding="async"'
    : ' loading="lazy" decoding="async"';
  if (o.clase) attrs += ' class="' + o.clase + '"';
  if (o.lqip) attrs += ' style="background-image:url(' + o.lqip + ');background-size:cover"';

  return '<picture>' +
    '<source type="image/webp" srcset="' + srcset + '" sizes="' + (o.sizes || "100vw") + '">' +
    '<img src="img/' + ruta + '.jpg" ' + attrs + '></picture>';
}


/* Desenfoque de arranque de cada portada, en 24px de ancho y unos 240 bytes.
 * Va incrustado y no en un archivo aparte: pedirlo por red llegaria despues
 * de la foto real y no serviria de nada. Lo escribe build-img.sh. */
var LQIP = {
  "box/azul-tresq": {w:4240, h:2832, d:"data:image/webp;base64,UklGRqAAAABXRUJQVlA4IJQAAACwBACdASoYABEAPt1cqU6opKOiMBgIARAbiWUAA+SZBvsjNEvkUn637U/dej/oAP7evRo27uBVXI5l4inr5c403TgsY++h0/uQpPPa+0v2ANL7o0cTiEyInFdbxZo2ki/xV2UdZ2qNneW4oCnNru8/SgVWhNriTExjCQhedUQeh+Mz8QSZuh5pi6VSizhmtFJRgAAA"},
  "box/blanco-tresq": {w:4240, h:2750, d:"data:image/webp;base64,UklGRogAAABXRUJQVlA4IHwAAADwAwCdASoYABAAPt1apkyopSOiMAgBEBuJZQC06B5vsjGqxv0vjz4AAP5Uc8r9gMQW6Jz7EDOXMFiiIGrhuWhwuDMJUVf61zGBH9igE/rVcN0wkftdJXWfg4v5pQVQHzV6IdPhHw+ImUveHuXQNz5usDkt2YTPqVnPAAAA"},
  "box/gris-tresq": {w:4117, h:2832, d:"data:image/webp;base64,UklGRpoAAABXRUJQVlA4II4AAABQBACdASoYABEAPt1orFEopaQnKAgBEBuJZwDGfYvqcLtF5QoJ4bNZ6PjAAP7etSKKgAcvjVPAkjSkqqo95M2gkYZGMuEPibTCgbovTuf27hmvJRka5jz6icrPzAiwm8NMBebekgg9fKxFusCL98oIpPXwXHhgxqiaoiJ35/T5s7tugkFuEdQ32G6AAAAA"},
  "e70/tresq": {w:6192, h:4128, d:"data:image/webp;base64,UklGRr4AAABXRUJQVlA4ILIAAABwBACdASoYABAAPt1apkyopSOiMAgBEBuJZwDCgYyy3zMA5sh87kYnCn9g4AD+z1+uY8nmvpspCUoskJjB3KMeINocyKCcgD+tzdYLfBc8/GwbrzVud1TDWp6RcAU9Q6GdciRecTkXb7dwOFuB6q7N0NUUTuNR5gwX6d5E/pj8AJFKVVnaK7+YfdlpMw5oncG7/z5ceTMu3oun6UuNkDXrU1mAfY6qHq33sJkQA8XQEAgA"},
  "huge/tresq": {w:6155, h:4103, d:"data:image/webp;base64,UklGRtYAAABXRUJQVlA4IMoAAABwBACdASoYABAAPt1apkyopSOiMAgBEBuJZQAD4/Ia4Oi+PhucuHHgV7/+AAD+1r9w4eDN8P491HDh684sd8bQDR4QxYUVnL44rDULZfc067IqFeSJC+kiq4VRaX7W7VuBLtz0mKhILLxd4HA1uyQMjeNSC/WiSyHrmI/0ssRbcf3bOeXcAflrm5jUYoejpeZNUdUCVKuXRqDITPOHSo0f3+zhL/FreAB+VVj1myWBrefS2JGe8WYj/sk4zsThHIaOHUmVgDCqAAAA"},
  "mage/tresq": {w:5847, h:4030, d:"data:image/webp;base64,UklGRrAAAABXRUJQVlA4IKQAAACwBACdASoYABEAPt1kqE+opSOiKAqpEBuJZwDO7Yw6bxxRfupNz+kzC8UKWgkAAP5H5vunbP4ku/YVTG9FK+0PHLuThzb4UQWceZZmTIpD/uQfdZaS87m40k/mYjDu5qFm1/toHEdjeve1Y0pg6bfeI3u15eX/P+qLX/6vsUOP816WIDGrBk2WBErvkjrC/b9zm+AYoY/hj42AUr5DqbkAh7HgAA=="},
  "vigo/e2-tresq": {w:4240, h:2384, d:"data:image/webp;base64,UklGRnwAAABXRUJQVlA4IHAAAABwBACdASoYAA4APt1cqE0opSQiMAgBEBuJYgAD4kIR/Gp0iyV5xKwlAFnQAAD+38Ef9vy7NrTsgGakWHTelWYTEg/UroAMVqhP80sg3bKh6Qri5CIJsazVRlxOe9XsgeZ6IcdGQ7259wQroRWNAAAA"},
  "vigo/e2mas-tresq": {w:4240, h:2384, d:"data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAADwAwCdASoYAA4APt1cpkyopSOiMAgBEBuJaQAAXKPZRxlygorYtIfQAP7nkYnnRHAwoQw2SRRkXfhq42vSjjP0GnzfwuWgwVOWALcyXPYb/UNskFSH95BAerXaXTgvGIB9oAAA"}
};

if (typeof module !== "undefined") module.exports = { CATALOGO: CATALOGO, ORDEN: ORDEN };
