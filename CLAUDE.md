# TORQ

Motor de generación de leads calificados para el sector automotriz colombiano.
Socios: Daniel Mesa (tecnología, datos, growth) y Camilo (industria automotriz).
Primer aliado: Corautos Andino (Dongfeng). Piloto: MAGE HEV.

**Lee `CONTEXTO.md` antes de tocar nada.** Ahí está el modelo de negocio, la
matemática de la comisión, los nombres ya descartados y por qué, los datos de
mercado, los hallazgos del tablero y los pendientes legales.

## Estructura

| Archivo | Qué es |
|---|---|
| `index.html` | Showroom: carrusel + catálogo de las 7 referencias |
| `catalogo.js` | **La única fuente de precios y fichas.** Todo sale de aquí |
| `catalogo-vista.js` | El comparador con filtros del índice |
| `efectos.js` | Movimiento: revelados, selector de color, galería, video |
| `build-img.sh` | Procesa las fotos originales a webp multi-ancho |
| `box.html` · `e70.html` · `vigo.html` · `mage.html` · `huge.html` | Una por modelo |
| `analitica.html` | Inteligencia de mercado (mapa, matriz de oportunidad, series) |
| `img/` | Fotos en webp de 640 a 2560 px + respaldo jpeg + miniaturas |
| `video/` | Teaser de la Vigo, 15 s |
| `CONTEXTO.md` | Traspaso completo del proyecto |
| `PAUTA.md` | Motor de captación: códigos de campaña, malla de calificación, ruta de pauta |
| `politica-datos.html` | Política Ley 1581 — **borrador**, con campos pendientes marcados en lima |
| `logo.html` · `logo-escala.html` | Las propuestas de marca y por qué ganó la punteada |

Se publica en GitHub Pages: https://clawddma.github.io/torque-preview/

## Reglas de este repo

- **Cero dependencias externas.** Nada de CDN, nada de frameworks. Todo el SVG
  está escrito a mano. Si necesitas un gráfico, lo dibujas; no importas librerías.
- **HTML monolítico**, un archivo por página, estilos en un `<style>` al inicio.
- **Español de Colombia.** Miles con punto, decimales con coma ($109.990.000, 4,9 L).
- **La marca es TORQ**, con la Q punteada: el anillo es la escala del instrumento
  (`stroke-dasharray`) y la cola lima sale del centro. Vive aislada en el
  `<div class="logo">` del nav y en el footer — cambiarla sigue siendo editar esos dos
  puntos. Las propuestas: `logo.html` y `logo-escala.html` (ganó la variante 1).
  La Q va **unos píxeles más grande que las letras** (24 vs 21 en el nav): un círculo
  punteado lee más pequeño que una versal maciza y cada punto necesita píxeles.
  Es textura fina: se ve nítida en pantallas retina y se empasta a 1×.
- **Los precios viven en `catalogo.js`, no en el HTML.** Con siete referencias,
  un precio escrito a mano en cuatro sitios por página garantiza que algún día
  se publiquen dos precios distintos del mismo carro. Las páginas de producto
  todavía llevan el suyo en el HTML —son de antes— pero todo lo nuevo lo lee de
  `catalogo.js`, y ahí es donde se cambia.
- **Ninguna cifra sin fuente.** El E70 salió publicado sin ficha técnica porque
  Corautos no la ha entregado, y su página lo dice en vez de rellenarla con
  datos de internet. Si un dato no existe, se dice que no existe.
- **Material de marca sí, foto de otro concesionario no.** Dongfeng y Corautos
  publican fotografía y CGI de prensa que Daniel, como contratista de la marca,
  puede usar (paisajismo, gama completa, uso en la calle). Lo que NUNCA se
  publica es una imagen que muestre el logo, el teléfono o la sala de OTRO
  concesionario — la del showroom bielorruso `dongfeng.by` es el ejemplo real
  que se descartó. Tampoco fotos con placa de otro mercado (china, con nombre
  de modelo distinto) por la confusión de identidad que generan. Antes de
  publicar cualquier imagen que no salió de `build-img.sh`, mirarla completa:
  si aparece un rótulo, un vendedor o un interior de sala que no es de
  Corautos, se descarta.
- **Las fotos se procesan con `build-img.sh`, nunca a mano.** Los originales
  vienen entre 4.000 y 6.200 px y no se sirven crudos. El script saca los
  anchos del `srcset`, el respaldo jpeg, la miniatura y el desenfoque de
  arranque. El manifiesto de adentro dice qué foto es cuál: el nombre del
  archivo original no dice nada del ángulo.
- **Reducir con lanczos, nunca con `sips --resampleWidth`.** Medido sobre la
  misma foto bajada de 5.847 a 2.560 px: sips deja PSNR 39,0 y lanczos 35,2
  —más bajo es más detalle—. A tamaño completo esa diferencia se ve como
  pixelado. Después de reducir va `unsharp=3:3:0.5` para devolver la acutancia;
  en 1,0 aparecen halos en el borde de los rines y se ve peor que la foto
  blanda. Está todo en la función `reducir()` del script.
- **Nunca servir una foto más grande de lo que mide.** El carrusel estaba
  inflado de 1.280 a 3.840 px, y ampliar no agrega detalle: agrega peso y se
  ve pastoso. Curiosamente pesa MÁS —la portada bajó de 841 a 217 KB al
  rehacerla desde el original—, porque el compresor gasta bytes codificando
  detalle inventado. Si una foto no da el tamaño, se cambia la foto o se
  achica el marco; no se estira.
- **Reemplazar el archivo, no solo la referencia.** Las rutas viejas
  (`img/g1.jpg`, `img/box/hero.jpg`, `img/vigo/frontal.jpg`) siguen vivas: las
  pide la portada anterior que la gente tiene en caché, y algunas páginas
  internas todavía enlazan a ellas. Sobrescribir el archivo conservando el
  nombre arregla las dos cosas de una vez — incluido el navegador de alguien
  que no va a volver a pedir el HTML pero sí vuelve a pedir la imagen.
  `img/g1.jpg` estaba en 933 px y se mostraba en una tarjeta de ~800 px reales
  en retina: por eso se veía pixelada aunque el original tuviera 5.847.
- **Antes de decir que algo está arreglado, verificarlo en la URL que mira el
  cliente, no en `127.0.0.1`.** Un `curl` a la página publicada es un segundo y
  es la única prueba que cuenta. Verificar en local y reportar "listo" es
  reportar contra la verdad propia, no contra la del otro.
- **Los originales de verdad viven fuera del repo.** Los de Corautos de agosto
  están en el zip de Drive; los de julio, en `../torque/img/` — y ahí son más
  grandes que las copias que estaban publicadas. Antes de dar una foto por
  buena, verificar que no exista una mayor afuera.
- **`noindex` en todas las páginas.** Esto es material de revisión interna, no
  producción. No quitar el meta hasta resolver los pendientes legales de `CONTEXTO.md`.

## Línea gráfica

Fondo `#08090a`, superficie `#0e1013`, texto `#fafafa`, acento lima `#c8f24a`.
Tipografía de sistema, pesos altos, tracking negativo en titulares.
Referencias: Polestar, Zeekr, configurador de Porsche. Nunca estética de concesionario.

**El lima es solo interfaz** — botones, filtros activos, eyebrows. Nunca codifica datos.
Los colores de datos son la paleta validada para fondo oscuro:
`#3987e5` (azul), `#d95926` (naranja), `#199e70` (aqua), y la rampa secuencial azul
`#cde2fb → #184f95`. Si agregas un gráfico, usa esos y no inventes colores.

## La marca

| Pieza | Texto | Dónde |
|---|---|---|
| Nombre | **TORQ** | nav y footer |
| Eslogan | **Tu carro, tu mejor decisión.** | bajo el logo en el footer, firma de las piezas de pauta |
| Descriptor | **Compra y renting de carros.** | siempre acompañando al eslogan |

El descriptor **no es opcional**: TORQ es una marca desconocida y sin él nadie sabe a
qué se dedica. Decisión de Daniel, 26 de julio de 2026: la claridad sobre a qué nos
dedicamos pesa más que dejar la puerta abierta a otras categorías. Si algún día entran
motos, maquinaria amarilla o pesados, se cambia el par eslogan+descriptor — no el logo.

## Lenguaje

Regla madre: **nunca nombres el miedo, ni siquiera para negarlo.** "No te quedes sin
respaldo" instala la duda que no estaba. El miedo se responde con un hecho verificable
que lo vuelve irrelevante, no con adjetivos ni con promesas.

El comprador de una marca china no teme el taller: teme quedarse solo. Toda palabra que
presuponga una falla trabaja en su contra.

| No uses | Por qué | Usa |
|---|---|---|
| reparar, arreglar | presupone que se dañó | atender, cuidar, mantener |
| taller | lugar al que se va cuando algo salió mal | centro de servicio, servicio |
| falla, avería, problema, daño | escribe la escena que él teme | (no se menciona) |
| posventa | jerga interna del gremio | acompañamiento, respaldo |
| "no te preocupes", "tranquilo" | la negación activa la preocupación | un número concreto |
| "unidades limitadas", "última oportunidad" | presión sin prueba; riesgo Ley 1480 | "sujeto a disponibilidad" |

Cifras antes que adjetivos. "26 centros de servicio" convence; "amplia red de respaldo"
no dice nada y no se puede verificar.

Nada que insinúe que ir a la sala del aliado es un fastidio: Corautos es el socio, no
el obstáculo. TORQ resuelve antes de la visita, no en lugar de la visita.

Toda afirmación en condicional cuando el hecho lo es (`pasaría`, `podrías`), en
indicativo cuando está probado. Un condicional mal puesto es una promesa.

## Encuadre del vehículo — regla de oficio

**El carro va siempre completo.** Ni tan lejos que no se lea, ni tan cerca que quede
cortado. Una llanta o un techo fuera de cuadro en una pieza de automotriz destruye la
credibilidad antes de que alguien lea el titular.

No se resuelve con CSS: se resuelve asignando a cada formato la foto cuya proporción
aguanta ese marco. En `piezas.html` cada pieza declara `img` (respaldo) y opcionalmente
`img45` / `img11` / `img916`, más `pos` para el ajuste fino de `object-position`.

| Formato | Marco de foto | Fuentes que sirven |
|---|---|---|
| 4:5 | 1080×700 (1,54:1) | g2, g3 (1,50:1) · g1 vertical también entra |
| 1:1 | 1080×560 (1,93:1) | hero (2,07:1) — es la única banda ancha |
| 9:16 | 1080×1010 (1,07:1) | g1, hero-movil, g4, g8 (verticales) |

Antes de dar una pieza por buena, mírala. Un contacto con los tres formatos lado a lado
delata el recorte en dos segundos; el HTML solo, no.

## Datos

Todas las cifras salen de fuentes citadas al pie de cada página (Fenalco-ANDI y Sufi,
junio 2026, sobre datos RUNT). **No estimar ni interpolar.** Si un dato no existe en
la fuente, se dice que no existe — por ejemplo, no hay desglose de híbridos y
eléctricos por departamento, y el tablero lo declara explícitamente.

## Captación

El número de WhatsApp vive en **un solo lugar**: `var WA` al inicio del script de
`index.html`. Vacío = el calificador funciona pero no envía. Todo lo demás
(códigos de campaña, malla, enlace directo) cuelga de ahí — ver `PAUTA.md`.

El código de campaña entra por `?c=CODIGO`, sobrevive el salto entre páginas y
llega escrito en el mensaje de WhatsApp. **Ningún anuncio sale sin código.**

## Publicar

```bash
git add -A && git commit -m "mensaje" && git push
```

GitHub Pages tarda 1–2 minutos en reconstruir. Verifica con `curl -o /dev/null -w "%{http_code}"`
antes de pasarle un enlace a alguien.

Los archivos fuente pesados (3 PDFs de mercado, 50 fotos originales, script de
empaquetado `build_artifact.py`) viven fuera de este repo, en
`~/braindma/proyectos/Mobility now/torque/`. Una sesión en la nube no los tiene.

---

<!-- VIVO:BEGIN -->
## Estado real — 2026-09-03 00:30

> Regenerado cada noche por `recursos/sistema-vivo/sistema_vivo.py` leyendo el
> disco. **No editar a mano**: lo de afuera de las marcas sí es tuyo y se respeta.

- **Git** · rama `main` · **33 archivos sin commitear**
  - último commit: `db9762a 2026-08-23 Estado vivo regenerado por sistema_vivo.py`
- **Publicado en:** [torq.bellapop.co](https://torq.bellapop.co) (:8790) · [torque.bellapop.co](https://torque.bellapop.co) (:8790) · [torque.themesa.co](https://torque.themesa.co) (:8795) · [showroom.bellapop.co](https://showroom.bellapop.co) (:8795)
- **Automatización** · ninguna: nada corre solo en este proyecto
- **Código** · 456 archivos · último cambio 2026-08-31 en `huge.html`
<!-- VIVO:END -->
