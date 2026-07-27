# TORQ — Inteligencia de mercado desde el RUNT

> Análisis de `Analisis AI Runt 2 feb hasta julio 2026.xlsx`: **142.854 matrículas
> individuales** de vehículo nuevo, del 2 de febrero al 8 de julio de 2026.
> No es un informe agregado: es el registro uno por uno, con municipio, ciudad
> del propietario, entidad que financió, color y ficha técnica.
> Procesado el 27 de julio de 2026. **Este documento manda sobre `analitica.html`**,
> que se construyó con los PDF agregados y tiene menos resolución.

## Lo primero, porque cambia la estrategia

**La MAGE tiene cero matrículas en Colombia en estos cinco meses.** Cero.
Busqué la línea completa: no existe en el archivo.

**Eso es exactamente la oportunidad, y por eso vale la pena pautar ya.** El
vehículo apenas se está lanzando: no hay un solo competidor peleando por su
nombre de modelo, no hay pujas encarecidas por «Dongfeng MAGE», y quien capture
esa demanda desde el primer día se queda con ella. La otra cara de la moneda
—que hay que trabajar en paralelo, no en vez de— es la siguiente.

Y Dongfeng sí está — 1.952 unidades — pero mira **qué** vende:

| Línea | Combustible | Unidades |
|---|---|---|
| EQ1045D6CDB | Diésel | 254 |
| DFM7000A2F4BEV | Eléctrico (van) | 212 |
| EQ1100G8CD5 | Diésel | 171 |
| DFA1040T | GNV | 150 |
| … | | |

Camiones, furgones, vans de reparto. **Ni una sola SUV híbrida de pasajeros.**

Esto obliga a corregir algo que teníamos escrito en `CONTEXTO.md`: «Dongfeng,
marca en crecimiento (+217%)». Es cierto, pero **crece en carga, no en familia**.
Para el comprador de una camioneta de $109.000.000, la poca memoria de marca que
Dongfeng tenga en Colombia juega en contra: lo asocia con un camión.

No estamos peleando participación en un modelo conocido. **Estamos lanzando un
producto invisible, de una marca que el mercado ubica en otra categoría.** Toda
la pauta tiene que resolver eso antes que el precio.

## El sesgo que casi nos hace pautar en el lugar equivocado

El archivo trae dos geografías y **no significan lo mismo**:

- `MUNICIPIO` — dónde se matriculó la placa
- `CIUDAD_PROPIETARIO` — dónde vive quien la compró

Concesionarios matriculan donde el impuesto es más barato. La diferencia no es
un detalle:

| Se matriculó en | Unidades | Dónde vive el dueño realmente |
|---|---|---|
| Envigado | 2.329 | **Medellín 53%**, Envigado 19% |
| Funza | 853 | **Medellín 59%**, Bogotá 22% |
| Villa del Rosario | 1.118 | Bucaramanga 18%, Cúcuta 15%, Medellín 11% |
| Girón | 512 | **Bucaramanga 46%**, Floridablanca 17% |
| Cartago | 504 | **Pereira 38%**, Dosquebradas 11% |
| Belén de los Andaquíes | 230 | **Neiva 42%**, Florencia 14% |

Envigado pasa de 2.329 a **719** compradores reales. Villa del Rosario —un
municipio de 90.000 habitantes— aparecía como el quinto mercado del país.

> **Regla para todo lo que venga: se pauta sobre `CIUDAD_PROPIETARIO`.**
> Segmentar Meta por municipio de matrícula es pagarle avisos a una notaría.

Esto además **corrige nuestra propia conclusión anterior**. En `CONTEXTO.md`
decía que Cundinamarca (22.304 unidades) era «matrícula de flotas y leasing».
La intuición de descartarla era correcta; el motivo no. No son flotas: son Funza,
Mosquera y Chía matriculando carros de bogotanos y **medellinenses**. De hecho el
mercado es 99,5% **Particular** — de flota no hay casi nada.

## El mercado que nos importa

Filtro: `GASO ELEC` + `CAMIONETA`/`CAMPERO` — la SUV híbrida, que es donde
compite la MAGE.

- **34.441 unidades** en 5,2 meses → **≈ 6.600 al mes**
- **24,1%** de todo el mercado de vehículo nuevo
- Crece de 5.819 (feb) a 7.315 (jun): **+26% en cuatro meses**

Los rivales reales, ordenados por volumen:

| Modelo | Unidades | | Modelo | Unidades |
|---|---|---|---|---|
| Toyota Corolla Cross | 3.338 | | Suzuki Fronx | 1.481 |
| Mazda CX-30 | 3.255 | | Hyundai Kona | 1.475 |
| Kia Sportage | 2.401 | | Renault Arkana | 1.216 |
| Kia Stonic | 2.153 | | Nissan X-Trail | 1.175 |
| Ford Territory | 1.866 | | **Deepal S05** | **931** |

Los cuatro del comparador suman **10.860 unidades — el 31,5% del segmento.**
Comparar contra ellos no es arbitrario: es un tercio del mercado.

**Dónde encaja la MAGE técnicamente:** el 47,7% del segmento está entre 1,4 y
1,6 litros. La MAGE es 1.5T — está en el corazón del segmento por cilindraje,
pero con **288 hp combinados** contra los 120–150 típicos. Ese es el argumento
que ningún rival puede responder: mismo tamaño de motor, el doble de potencia.

## Tesla llegó en marzo, y hay que leerlo bien

**Tesla entró a Colombia en marzo de 2026** y en cinco meses se llevó **10.619
unidades — el 44,5% de todo el mercado eléctrico del país.** Pasó de 296
matrículas en febrero a 2.462 en marzo, y ahí se estabilizó.

Esto obliga a corregir algo que yo mismo escribí más arriba en una versión
anterior de este documento («los eléctricos son el segmento que más crece»):

| Mes | SUV híbrida | Eléctricos **sin** Tesla | Tesla |
|---|---|---|---|
| Febrero | 5.819 | 2.240 | 296 |
| Marzo | 6.355 | 2.648 | 2.462 |
| Abril | 6.336 | 2.581 | 2.644 |
| Mayo | **7.445** | 2.697 | 2.335 |
| Junio | 7.315 | 2.538 | 2.428 |
| **Variación** | **+25,7%** | **+13,3%** | — |

**Descontando a Tesla, el mercado eléctrico está prácticamente plano.** Todo el
«boom» es una sola marca. La SUV híbrida, en cambio, crece +25,7% por mérito
propio y es un mercado más grande (34.441 contra 23.845).

**Qué significa para el timing de la MAGE — y es bueno:**

1. **Tesla no le quitó demanda al híbrido.** La SUV híbrida siguió subiendo
   durante todo el aterrizaje de Tesla: 6.355 en marzo → 7.445 en mayo. Los dos
   mercados crecieron a la vez.
2. **Tesla juega en otra liga de precio** y con otro comprador: solo el **33,9%**
   compra a crédito (contra 51% en híbrida) y se concentra en Bogotá (42%) y
   Medellín (22%). No es nuestro cliente.
3. **Elevó la conversación.** Medio país está hablando de movilidad eléctrica
   por una marca que casi nadie puede pagar. Ese interés desplazado —gente que
   quiere «lo nuevo» pero no tiene $200 millones ni dónde enchufar— es
   exactamente el lead de la MAGE.

> **El timing es el argumento:** hay atención máxima en la categoría, el rival
> que la generó no compite por precio, y la MAGE llega sin un solo competidor
> directo en su nombre de modelo. No hay que crear la conversación: hay que
> capturarla.

**Para los eléctricos de Corautos (Box E2 y Vigo E2+) el mismo dato es una
advertencia:** entrarían a un segmento donde uno solo se lleva la mitad y el
resto se mueve al +13,3%. Sus rivales reales no son Tesla sino **BYD Yuan Up
(2.494), Chery iCAR 03 (1.185) y BYD Seagull (1.065)**.

## La tabla que define dónde pautar

Cinco meses, comprador real. `chinaΔ` = qué tan por encima o debajo de la media
nacional (8,7%) está esa ciudad comprando marcas chinas — **es el termómetro de
qué tan dura será la objeción «no conozco Dongfeng»**.

| Ciudad | /mes | Crec. | chinaΔ | Crédito | Corautos |
|---|---|---|---|---|---|
| Bogotá | 2.675 | +8% | +1,3 | 51% | sala |
| Medellín | 967 | +21% | −1,7 | 40% | sala |
| Cali | 457 | +15% | +0,6 | 55% | sala |
| Barranquilla | 200 | +36% | **+4,0** | 54% | sala |
| Bucaramanga | 160 | +38% | −2,5 | 46% | sala |
| **Manizales** | 125 | **+48%** | **+10,3** | 47% | sala |
| Ibagué | 116 | **+64%** | +2,1 | 57% | sala |
| Pereira | 112 | +31% | **+4,3** | 47% | sala |
| Villavicencio | 110 | +43% | −2,0 | 58% | sala |
| Cartagena | 108 | +34% | +3,0 | **59%** | solo taller |
| Cúcuta | 100 | +33% | **−5,2** | 58% | sala |
| Pasto | 93 | **+72%** | −4,2 | **30%** | sala |
| Armenia | 68 | +46% | +1,2 | 45% | **ninguna** |
| Neiva | 66 | +21% | −3,9 | 59% | sala |
| Montería | 54 | **+69%** | −2,5 | 54% | sala |
| Valledupar | 42 | +54% | −4,2 | 60% | sala |

Cobertura sobre comprador real: **74,7% vive donde hay sala**, 2,1% donde solo
hay taller, **23,2% donde no hay nada** — y ese 23,2% es casi todo área
metropolitana (Envigado, Bello, Itagüí, Sabaneta, Floridablanca, Chía, Soacha,
Palmira), o sea, a media hora de una sala. Los huecos de verdad son **Armenia
(68/mes), Barrancabermeja y Yopal**.

## La primera ruta de pauta

El presupuesto es $1.000.000/mes y el punto de equilibrio **0,8 unidades**
(comisión $1.245.714). No hay margen para aprender en Bogotá, donde el CPM es
el más caro del país y el crecimiento el más flojo (+8%).

### Ola 1 · Semanas 1 a 4 — el laboratorio

**Manizales, Ibagué y Pereira.** ~353 unidades/mes de segmento.

Por qué exactamente estas tres:

- **Manizales** tiene la mayor apertura a marca china del país: **19% contra
  8,7% nacional**. La objeción más cara de resolver —«¿Dongfeng qué?»— es la
  más barata ahí. Además crece +48% y tiene sala.
- **Ibagué** crece **+64%** y el 57% compra a crédito: el mensaje de cuota
  funciona, y hay sala.
- **Pereira** es el segundo en apertura a marca china (+4,3) y crece +31%.

Las tres tienen sala y taller. Ninguna es cara. Si el mensaje no funciona aquí,
no va a funcionar en ningún lado — y descubrirlo cuesta una fracción.

**Presupuesto:** $600.000 de los $1.000.000. El resto se reserva para escalar
lo que gane.

### Ola 2 · Semanas 5 a 8 — la costa y el crédito

**Barranquilla, Cartagena, Villavicencio, Montería, Valledupar.** Todas crecen
entre +34% y +69%, y el crédito pesa 54–60% — el simulador de cuota es el
gancho natural. Barranquilla y Cartagena además están sobre la media en apertura
a marca china.

Cartagena merece atención aparte: **59% a crédito, +34%, y hay taller pero no
sala.** Es el laboratorio perfecto de venta 100% digital, porque la objeción de
«¿y quién me lo repara?» ya está resuelta.

### Ola 3 · Semana 9 en adelante — el volumen

**Bogotá, Medellín, Cali** — el 58% del mercado. Se entra solo con el ángulo
que ya ganó en las olas 1 y 2, y con audiencias estrechas (no ciudad completa).
Entrar aquí primero es quemar el presupuesto aprendiendo a precio de Bogotá.

### Dónde NO pautar todavía

- **Cúcuta.** Crece +33% y 58% a crédito, pero tiene la **peor apertura a marca
  china del país (−5,2)**. Es el mercado donde la barrera de marca es más cara.
- **Pasto.** Crece +72%, el mejor del país — y aun así no. Solo **30% compra a
  crédito** (el más bajo de la tabla; es un mercado de contado) y está en −4,2
  de apertura a marca china. Dos vientos en contra a la vez.
- **Rionegro** (−2%) y **Itagüí** (+4%): estancados.

## Palabras clave

**Advertencia honesta:** estas salen del análisis competitivo del RUNT, no de
una herramienta de volumen de búsqueda. Dicen **contra quién** y **sobre qué**
hay que pujar; no cuánta gente lo busca. Antes de pautar en Google, validarlas
en el Planificador de Palabras Clave.

### Conquista — la más rentable ahora

Son 10.860 personas en cinco meses que ya buscaron uno de estos. Buscan un
rival concreto; no saben que existe una opción con más potencia y $27–68
millones menos.

```
corolla cross híbrida precio colombia
toyota corolla cross 2026 precio
kia sportage híbrida precio
sportage zenith híbrida
ford territory híbrida precio
ford territory trend 2026
mazda cx-30 híbrida precio
suv híbrida 288 hp
camioneta híbrida más potente colombia
```

Kia Sportage es el mejor blanco individual: **$176.990.000 contra $109.000.000
nuestros — 68 millones de diferencia**, y nosotros con más potencia (288 vs 231
hp). Ese contraste no necesita adjetivos.

### Categoría — para quien todavía no eligió

```
camioneta híbrida colombia precio
suv híbrida 2026 colombia
mejor camioneta híbrida calidad precio
camioneta híbrida 7 puestos
camioneta híbrida barata colombia
```

### Objeción — el volumen que nadie está atendiendo

Esta es la mina. Son búsquedas de gente confundida sobre la tecnología, y quien
resuelva la duda se queda con el lead:

```
camioneta híbrida se enchufa o no
diferencia híbrido y eléctrico cuál conviene
cuánto consume una camioneta híbrida
la batería de un híbrido cuánto dura
garantía batería vehículo híbrido colombia
mantenimiento carro híbrido es caro
```

Ya tenemos las respuestas escritas en `bot.html` y en las respuestas rápidas de
`WHATSAPP.md`. **Cada una de esas respuestas es una página de aterrizaje.**

### Coyuntura — con fecha de vencimiento

```
iva vehículos híbridos 2026
reforma tributaria carros híbridos
sube el iva de los híbridos colombia
devolución iva vehículo híbrido dian
```

El proyecto se radicó el 22 de julio y debe debatirse antes del 16 de diciembre.
**Esta ventana se cierra sola.** Es el único ángulo con urgencia real y verificable
(+$14.533.333 si se aprueba), y no hay que inventarle escasez.

### Marca — casi cero volumen, pero obligatorio

```
dongfeng mage hev
dongfeng mage precio colombia
dongfeng colombia camionetas
```

Vale centavos y protege contra que un competidor puje por el nombre. Ojo: quien
busque «dongfeng colombia» hoy probablemente busca **camiones** — hay que
separar esa campaña para no pagar clics de compradores de carga.

## Financiación: el hallazgo comercial

**50,9% de las SUV híbridas se compran a crédito** (por encima del 47,4% del
mercado general). Y quién las financia:

| Entidad | Participación |
|---|---|
| Banco Santander Colombia | 14,7% |
| Bancolombia | 12,8% |
| Banco Finandina | 9,7% |
| **Toyota Financial Services** | **9,6%** |
| **RCI Colombia (Renault)** | **9,2%** |
| Banco de Occidente | 8,1% |

**El 18,8% del crédito del segmento es financiación cautiva de marca** (Toyota
y RCI/Renault financiando sus propios carros). Es una ventaja estructural que
Dongfeng no tiene — y explica parte de por qué Corolla Cross lidera.

Dos consecuencias prácticas:

1. Preguntarle a Corautos **quién es su aliado financiero y con qué tasa**. Sin
   una respuesta competitiva, perdemos la mitad del mercado antes de empezar.
2. Ciudades donde el crédito manda: **Bello 68%, Itagüí 60%, Tunja 60%,
   Valledupar 60%, Cartagena 59%, Neiva 59%, Villavicencio 58%, Cúcuta 58%.**
   Ahí el simulador de cuota vale más que el de gasolina. En **Medellín (40%) y
   Pasto (30%)** es al revés: mercados de contado, el mensaje es precio total.

## Creatividad e inventario

**Color** — el 80,7% del segmento se vende en cuatro colores neutros:

| Gris | Blanco | Plata | Negro |
|---|---|---|---|
| 29,3% | 25,3% | 14,5% | 11,6% |

Rojo 3,2% y verde 3,1%. Las piezas de Meta deben mostrar la MAGE en **gris o
blanco**: es lo que el 55% del mercado está comprando, y ver «su» color reduce
la fricción. Un carro rojo en la pieza le habla al 3%.

## Qué medir desde el primer peso

De `PAUTA.md` viene la aritmética; esto le pone los números reales:

| Métrica | Umbral |
|---|---|
| Costo por conversación de WhatsApp | < $20.000 |
| % de conversaciones que califican | > 40% |
| Costo por lead calificado | < $62.286 (el de quiebre) |
| Distancia Entregado → Contactado | < 24 h (se mide solo en `crm.html`) |

El CRM ya sella `Entregado` y `Contactado`: al mes tienes el SLA real de la sala,
medido, para la cláusula del contrato.

## Lo que este archivo NO puede decir

- **No trae precio de transacción.** El posicionamiento de precio sale de
  `COMPETENCIA.md`, verificado ficha por ficha.
- **No trae volumen de búsqueda.** Las palabras clave son hipótesis derivadas de
  la competencia; hay que validarlas en Google.
- **Julio está incompleto** (hasta el día 8). Todos los crecimientos de este
  documento comparan **feb–mar contra may–jun**, meses completos.
- **`CLARABOYA_SUNROOF` viene vacía** en todo el archivo: no se puede medir qué
  tan diferencial es el techo panorámico de la MAGE.
- **Matrícula ≠ venta.** Hay días de desfase entre que alguien compra y que la
  placa se registra. Para tendencia mensual no importa; para una semana puntual sí.

## Cómo se mantiene esto vivo

El RUNT publica mensual. Cada mes que llegue el archivo nuevo:

1. Recalcular la tabla maestra sobre `CIUDAD_PROPIETARIO` (nunca sobre municipio).
2. Comparar el mes contra el mismo mes del bimestre anterior.
3. Revisar si `chinaΔ` se movió: si una ciudad sube en apertura a marca china,
   es candidata a entrar antes de lo planeado.
4. Cruzar contra los leads reales del CRM: **si una ciudad genera muchos leads
   pero pocos facturados, el problema no es la pauta — es la sala.** Ese cruce
   es el que ninguna agencia le puede dar a Corautos, y es la razón de existir
   de este negocio.
