# TORQ — Portafolio Corautos Andino

> **Precios vigentes: lista de agosto de 2026** (foto de la tabla que envió
> Daniel el 21 de agosto). Esta es la fuente de la que salen `catalogo.js` y
> todas las páginas. Si cambia el precio, se cambia aquí y en `catalogo.js`.

## Precios de agosto de 2026

| Referencia | Precio de lista | Descuento | **Precio vigente** | Beneficio |
|---|---|---|---|---|
| Box E2 | $84.990.000 | $15.000.000 | **$69.990.000** | Bono especial de agosto |
| Box E3 | $89.990.000 | $15.000.000 | **$74.990.000** | Bono especial de agosto |
| E70 | $95.990.000 | $16.000.000 | **$79.990.000** | Lanzamiento |
| Vigo E2 | $89.990.000 | $5.000.000 | **$84.990.000** | Lanzamiento |
| Vigo E2+ | $96.990.000 | $7.000.000 | **$89.990.000** | Lanzamiento |
| Mage HEV | $129.990.000 | $20.000.000 | **$109.990.000** | Lanzamiento |
| Huge G59 | $140.990.000 | $16.000.000 | **$124.990.000** | Lanzamiento |

**Ojo con el precio de la MAGE.** Hasta el 21 de agosto el sitio decía
$109.000.000 en cinco lugares. La lista de agosto dice **$109.990.000** y esa es
la que manda. La comisión al 1,2% se recalcula: base sin IVA $104.752.381 →
**$1.257.029**.

**Pendiente ante la SIC.** Publicar un precio tachado exige que el precio
anterior se haya cobrado de verdad. Hay que pedirle a Corautos la lista de
agosto **por escrito**. Va en el mismo paquete de la autorización de marca que
ya estaba pendiente en `CONTEXTO.md`.

## Fichas técnicas: qué hay y qué falta

| Referencia | Ficha | Versión |
|---|---|---|
| Box E2 / E3 | ✅ en el sitio | marzo de 2026 |
| Vigo E2 / E2+ | ✅ en el sitio | 21 de mayo de 2026 |
| Mage HEV | ✅ en el sitio | julio de 2026 |
| Huge G59 | ✅ en el sitio | julio de 2026 (estaba en Google Drive, no en Descargas) |
| **E70** | ❌ **no existe** | — |

El E70 salió publicado con fotos y precio, y su sección de ficha dice
explícitamente que falta. **No se le inventó ni una cifra.** Cuando llegue la
ficha se llena la tabla de `e70.html` y se completan los campos en `null` de
`catalogo.js`.

## Fotos y video

34 fotos nuevas de Corautos (4.119 a 6.192 px) procesadas con `build-img.sh`.
Dos calidades distintas: **Box y Vigo vienen de estudio** sobre ciclorama
blanco, **Mage, Huge y E70 son de sala**. El Box tiene los tres colores
fotografiados en el mismo encuadre, que es lo que permite el selector de color
de `box.html`.

Dos fotos quedaron descartadas como portada por tener el carro cortado —regla
de oficio de `CLAUDE.md`—: `HUGE 2` y `E70 2`. Se usan `HUGE 3` (lateral) y
`E70 4` (tres cuartos trasero).

El video de presentación de la Vigo que vino en el zip pesa **112,8 MB y no
cabe en GitHub** (tope de 100 MB por archivo). Se publicó el teaser de 15
segundos, recomprimido a 1,3 MB en `video/vigo-teaser.mp4`.

## El carrusel de la portada estaba inflado

Las tres bandas de apertura salían de fotos de **1.280 px ampliadas a 3.840**.
Esas fotos llegaron por WhatsApp: las 50 "originales" guardadas sueltas en
`Mobility now/` miden 1.280 px, no más. Ampliar no agrega detalle, y a pantalla
completa se veía pastoso.

Ahora las tres se generan desde los originales de Corautos (4.240 a 6.192 px)
dentro de `build-img.sh`. La portada **pesa menos que antes** —de 841 a 217 KB—
porque el compresor ya no gasta bytes en detalle inventado.

La foto de la Vigo en la playa (la de los cinco colores) es de marketing del
fabricante y también estaba inflada: servida a 3.600 px se le veían los
artefactos en los adoquines. Se movió a la galería, donde se muestra a ~1.230 px
—su resolución real— y ahí sí se ve bien. El hero de `vigo.html` pasó a la foto
de estudio de la E2+, que sí tiene 4.240 px de verdad.

---

# Lo que sigue abajo es el levantamiento de julio de 2026

> Se conserva por el análisis competitivo, que sigue siendo válido. **Los
> precios de esta sección están desactualizados**: los vigentes son los de la
> tabla de arriba.

### 1 · Dongfeng Box E2 — $69.990.000 · eléctrico urbano

| | Box E2 | Geely EX2 Pro | BYD Seagull 310 | MG4 EV Urban | GAC Aion UT |
|---|---|---|---|---|---|
| Precio | **$69.990.000** | $69.990.000 | $76.990.000 | $74.990.000 | $80.990.000 |
| Potencia | 94 hp | 114 hp | 74 hp | **161 hp** | 134 hp |
| Torque | 160 Nm | 150 Nm | 135 Nm | **250 Nm** | 145 Nm |
| Batería | **43,89 kWh** | 39,4 kWh | 30,08 kWh | 42,8 kWh | **44,12 kWh** |
| Autonomía | 430 km | 395 km | 310 km | 382 km | 405 km |
| Baúl | 326 L | 375 L | 230 L | 382 L | **440 L** |
| Airbags | **6** | 6 | 4 | **6** | 4 |

**Dónde gana:** empatado en el precio más bajo, y con **la segunda mejor batería
y autonomía del grupo**. Contra el Seagull —su rival más directo por precio—
tiene 46% más batería, 120 km más de autonomía y 6 airbags contra 4, por
$7.000.000 menos.

**Dónde pierde:** potencia (94 hp contra 161 del MG4) y baúl.

### 2 · Dongfeng Vigo E2+ — $89.990.000 · eléctrico

| | Vigo E2+ | Kia EV2 Air | Geely EX5 SE |
|---|---|---|---|
| Precio | **$89.990.000** (con bono) | $89.990.000 | $92.990.000 |
| Origen | China | Eslovaquia (UE) | China |
| Potencia | 161 hp | 142 hp | **215 hp** |
| Torque | 230 Nm | 250 Nm | **320 Nm** |
| Batería | **51,87 kWh** | 42,2 kWh | 49,52 kWh |
| Autonomía WLTP | 340 km | 312 km | **345 km** |
| Autonomía CLTC | **470 km** | ~370 km | 410 km |
| Baúl | **500 L** | 362 L | 461 L |
| Airbags | 6 | **7** | 6 |

**Dónde gana:** **la batería más grande y el baúl más grande** del trío, al
precio más bajo. Contra el Kia EV2, mismo precio con 23% más batería, 130 km
más de autonomía CLTC y 138 litros más de baúl.

**Dónde pierde:** el Kia es de fabricación europea —argumento de percepción de
calidad que pesa— y trae un airbag más. El Geely tiene 54 hp más.

**Ojo con el precio:** los $89.990.000 son «precio con bono». Un bono tiene
fecha de vencimiento. Hay que saber cuál es y qué pasa después, porque publicar
un precio con bono como si fuera precio de lista es exactamente el tipo de dato
que expone (ver reglas de `COMPETENCIA.md`).

### 3 · Dongfeng Mage HEV — $116.990.000 (¿o $109.000.000?) · híbrido

Este cuadro compara contra el set **de nueva energía**, distinto al de nuestro
comparador:

| | Mage HEV | Geely Starray EM-i | BYD Yuan Up DM-i | Chery iCAR 03T | Kia Niro HEV |
|---|---|---|---|---|---|
| Precio | **$116.990.000** | $135.990.000 | $125.000.000 | $129.990.000 | $115.990.000 |
| Tecnología | Híbrido puro | Enchufable | Enchufable | Rango extendido | Híbrido puro |
| Potencia | **288 hp** | 249 hp | 194 hp | **422 hp** | 139 hp |
| Torque | **565 Nm** | 355 Nm | 300 Nm | 550 Nm | 265 Nm |
| Autonomía total | 1.000 km | 1.000 km | **1.100 km** | 800 km | 900 km |
| Largo | 4,65 m | **4,74 m** | 4,31 m | 4,43 m | 4,43 m |
| Baúl | 360 L | **528 L** | 265 L | 264 L | 425 L |

**Los dos cuadros son válidos y sirven para cosas distintas:**

- El **nuestro** (`COMPETENCIA.md`: Corolla Cross, Sportage, Territory, CX-30)
  es el set **mainstream**, el 31,5% del segmento según el RUNT. Es contra
  quien compite por volumen, y ahí la MAGE es la más potente **y** la más barata.
- **Este** es el set de **nueva energía china**. Aquí la MAGE ya no es la más
  barata (el Niro está $1.000.000 abajo) ni la más potente (el iCAR tiene 422 hp),
  pero es **la única híbrida pura del grupo que no necesita enchufarse** y de
  lejos la de mejor relación potencia/precio entre las que no se enchufan.

Contra el set de nueva energía, el argumento cambia: no es precio ni potencia,
es **«no tienes que enchufarla»**. Contra el set mainstream, sí es precio y
potencia. Son dos campañas distintas, no una.

**Dato débil:** «Autonomía eléctrica: recorridos muy cortos» con 1,9 kWh de
batería. Es honesto, pero al lado de rivales que declaran 100–160 km eléctricos
se lee como carencia. Hay que enmarcarlo como lo que es —**no se enchufa,
ese es el punto**— o no mencionarlo.

## Lo que esto obliga a decidir

1. **Confirmar el precio de la MAGE.** Bloquea todo lo demás.
2. **¿Entran el Box E2 y el Vigo E2+ al sitio?** Son tres franjas
   ($70M / $90M / $117M) y tres compradores distintos. El sitio hoy es
   monoproducto; meter tres a mano es el error que `CONTEXTO.md` ya advirtió.
   Si entran, toca la estructura de catálogo.
3. **La comisión de los eléctricos.** El 1,2–1,5% se acordó sobre la MAGE. Sobre
   un carro de $69.990.000 la comisión cae a **~$700.000** (base $58.815.126
   con IVA del 19% para eléctricos... **o 5%**, hay que verificar el tratamiento
   tributario de eléctricos, que no es igual al de híbridos). Con esa comisión
   el punto de equilibrio de la pauta se duplica.
4. **Los eléctricos abren un mercado que ya medimos:** 23.845 matrículas
   eléctricas en 5 meses según el RUNT, +235% de crecimiento. Es el segmento
   que más crece del país.
