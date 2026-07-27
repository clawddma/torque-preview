# TORQ — Contexto del proyecto

> Documento de traspaso. Si estás retomando este proyecto en una sesión nueva
> (celular, web, o terminal), lee esto primero. Actualizado: 26 de julio de 2026 (tarde).

## Qué es esto

No es la página de un concesionario. Es una **máquina de generación de leads calificados**
que se los vende a las casas matrices automotrices. La página es la cara visible de un
centro de inteligencia que aprende cada mes qué audiencia, en qué ciudad y con qué
mensaje convierte más barato.

**Socios:** Daniel Mesa (tecnología, datos, growth) y Camilo (experto en industria
automotriz: motos, combustión, híbridos, eléctricos, maquinaria amarilla, pesados).

**Primer aliado:** Corautos Andino (distribuidor Dongfeng en Colombia).
**Piloto:** Dongfeng MAGE HEV.

## El acuerdo comercial

- Comisión **1,2% a 1,5%** sobre el valor **antes de IVA**, según escala de unidades.
- **Acuerdo verbal — sin contrato firmado.** Es el mayor riesgo abierto del negocio.
- MAGE a $109.000.000 con IVA del 5% → base $103.809.524 → **$1.245.714 (1,2%)** a
  **$1.557.143 (1,5%)** por unidad vendida.
- Con $1.000.000 de pauta mensual, el punto de equilibrio es **0,8 unidades**.

## La marca — CERRADA

**Nombre: TORQ.** Se cerró el 26 de julio de 2026. La Q es un instrumento: el anillo es
la escala de un dial (`stroke-dasharray`) y la cola lima sale del centro. Vive en el
`<div class="logo">` del nav y del pie — cambiarla es editar esos dos puntos.

- **Eslogan:** «Tu carro, tu mejor decisión.»
- **Descriptor:** «Compra y renting de carros.» — **no es opcional**: sin él nadie sabe
  a qué se dedica una marca que nadie conoce.
- Van juntos bajo el logo en el nav (todos los anchos) y en la firma antes del cierre.

Las propuestas y por qué ganó ésta: `logo.html` (primera vuelta) y `logo-escala.html`
(segunda vuelta, ganó la variante 1). La Q va unos píxeles más grande que las letras:
un círculo punteado lee más pequeño que una versal maciza.

Historia de descartes del **nombre** (no repetir): **Criterio** (nombra lo que hacemos
nosotros, no lo que siente el cliente) · **Rumbo** (no le gustó) · **CERO** (Camilo:
contradice híbridos, combustión y maquinaria; además la MAGE consume 4,9 L/100 km) ·
**NAVE** (infantil para vender maquinaria a empresas).

**Línea gráfica aprobada:** fondo negro de alto contraste, fotografía a sangre,
tipografía pesada. Referencias: Polestar, Zeekr, configurador de Porsche.
Acento lima `#c8f24a` — solo interfaz, nunca codificando datos.

## Qué hay construido

| Archivo | Qué es |
|---|---|
| `index.html` | Showroom: hero con dirección de arte, specs, galería con gesto, comparador, IVA/reforma, **simulador de costo**, respaldo, calificador |
| `analitica.html` | Inteligencia de mercado: mapa, matriz, series, segmentos, marcas — todo táctil |
| `politica-datos.html` | Política Ley 1581 — **borrador**, campos pendientes marcados en lima |
| `logo.html` · `logo-escala.html` | Las propuestas de marca y la decisión |
| `PAUTA.md` | Motor de captación: aritmética, códigos de campaña, malla, ruta de pauta |
| `img/` | 9 fotos a 1400px + 8 miniaturas + hero doble (vertical y horizontal) |

Sin dependencias externas. Todo el SVG está escrito a mano. Se publica en GitHub Pages.
**URL:** https://clawddma.github.io/torque-preview/

Los archivos fuente pesados (3 PDFs de mercado, 50 fotos originales, script de
empaquetado) viven **solo en el Mac de Daniel**, en
`~/braindma/proyectos/Mobility now/`. Una sesión en la nube no los tiene.

## Los dos ganchos comerciales (verificados)

1. **Reforma tributaria radicada el 22 de julio de 2026**: subiría el IVA de híbridos
   del 5% al 19%. La MAGE pasaría de $109.000.000 a **$123.533.333** (+$14.533.333).
2. **Devolución de IVA**: el Concepto DIAN 000673 de 2026 fija el procedimiento para
   devolver el IVA de vehículos certificados por la **UPME**, dentro de los 5 años
   siguientes a la factura. En la MAGE son **~$5.190.476**. La MAGE sí tiene
   certificación UPME (confirmado por Daniel).
   *Terreno en evolución: el Concepto 012101 de 2025 decía lo contrario para uso
   personal. No publicar como promesa; usar como verificación que capta el lead.*

## Datos clave del mercado (ene–jun 2026, RUNT vía Fenalco-ANDI y Sufi)

- 157.620 vehículos nuevos, **+50,1%**
- Híbridos 44.605 (+74,6%, 28,3% del mercado) · Eléctricos 24.477 (+235,5%, 15,5%)
- Sostenibles = **43,8%** del mercado
- Dongfeng: puesto 16, 2.189 unidades, **+217,2%** — pero ese crecimiento es en
  **camiones diésel y GNV**, no en SUV de pasajeros. Ver abajo.
- **47,4%** del mercado nuevo se compra a crédito (**50,9%** en SUV híbrida)
- Diciembre es el pico del año; enero cae ~34%

## Inteligencia desde la microdata del RUNT — 27 de julio de 2026

Llegaron las **142.854 matrículas individuales** de feb 2 a jul 8 de 2026
(`Analisis AI Runt 2 feb hasta julio 2026.xlsx`, en el Mac de Daniel). El
análisis completo está en **`INTELIGENCIA.md`** y **manda sobre `analitica.html`**,
que se hizo con los PDF agregados. Lo esencial:

- **La MAGE tiene CERO matrículas en Colombia.** Es un lanzamiento real, no una
  pelea por participación. Y las 1.952 unidades de Dongfeng son camiones y vans:
  la marca está posicionada en **carga**, no en familia. Eso juega en contra de
  una camioneta de $109.000.000 y es lo primero que la pauta debe resolver.
- **Mercado direccionable:** SUV híbrida = 34.441 unidades en 5,2 meses
  (≈6.600/mes), 24,1% del mercado nuevo, creciendo +26% de febrero a junio.
- Los 4 rivales del comparador son el **31,5%** del segmento: la comparación no
  es arbitraria, es un tercio del mercado.
- **Se pauta sobre `CIUDAD_PROPIETARIO`, nunca sobre municipio de matrícula.**

**Corrección a un hallazgo anterior:** lo de «Cundinamarca es matrícula de flotas
y leasing» era la conclusión correcta por el motivo equivocado. No son flotas —el
mercado es 99,5% Particular—: son Funza, Mosquera y Chía matriculando carros de
compradores de Bogotá y **Medellín** por impuesto más barato. El 59% de lo
matriculado en Funza lo compró alguien de Medellín; el 53% de Envigado, alguien
de Medellín.

**Corrección a otro:** Manizales NO está en rojo. Con comprador real crece **+48%**
y es la ciudad con **mayor apertura a marca china del país** (19% contra 8,7%
nacional) — o sea, donde la objeción «no conozco Dongfeng» sale más barata.
Pasó de «no pautar ahí» a **primera plaza de la Ola 1**.

**Primera ruta de pauta:** Ola 1 Manizales + Ibagué + Pereira ($600.000); Ola 2 la
costa y las plazas de crédito alto; Ola 3 Bogotá/Medellín/Cali solo con el ángulo
ya validado. **No pautar todavía en Cúcuta ni Pasto**: peor apertura a marca china
del país, y Pasto además es mercado de contado (30%). Detalle y palabras clave en
`INTELIGENCIA.md`.

**Otros hallazgos del tablero (PDF agregados, menor resolución):**
- Cartagena tiene taller pero no sala — laboratorio ideal de venta 100% digital:
  la objeción de servicio ya está resuelta. **Confirmado con microdata**: 108
  unidades/mes, +34%, y 59% a crédito.

## Alcance de esta fase — decidido el 27 de julio de 2026

**Los primeros meses son solo con Corautos**, para validar si la propuesta de valor
funciona antes de seguir desarrollando la compañía. Todo lo que se construya debe
servir a esa validación; lo demás espera.

**No construir todavía** (son deuda futura, no pendientes):

- **Comparador interactivo multimarca.** El visitante elegiría contra cuál rival medir.
  Hoy la tabla de `#comparar` es fija y escrita a mano, y para un solo vehículo alcanza.
  Cuando entre la segunda marca, esto pasa a ser lo primero: la tabla a mano no escala
  y la estructura de datos del comparador es la misma que necesita un catálogo.
- **Catálogo de vehículos.** El sitio es hoy «una página con un carro». Con más de un
  modelo hay que pasar a fichas sobre una estructura común. No replicar el `index.html`
  a mano por cada vehículo: ese es el error que haría inmanejable el proyecto.
- **Fila de consumo en el comparador.** Se retiró porque cada marca publica bajo ciclo
  distinto. Si se devuelve, cada cifra va con su ciclo declarado al lado.

## Pendientes — bloqueantes antes de pautar

1. **Número de WhatsApp** — va en `var WA` de `index.html`, un solo lugar. Sin él el
   calificador funciona pero no envía. Es una línea.
2. **Política de datos**: existe y está enlazada, pero faltan nueve campos (documento,
   domicilio, correo dedicado, razón social y NIT de Corautos, vigencia, fecha) y la
   revisión de un abogado.
3. **Autorización escrita de Corautos** para marcas Dongfeng y fotografías. Meta rechaza
   anuncios de marcas de terceros sin respaldo.
4. **Contrato con Corautos**: lead válido, atribución 90 días, dedup, SLA de respuesta,
   disparador de pago, escala 1,2% → 1,5%. Hoy el acuerdo es verbal: es el mayor riesgo
   abierto del negocio.
5. **Verificar ficha por ficha la competencia del comparador** (Corolla Cross, Sportage,
   Territory, CX-30). Hoy son estimados de mercado y publicar un dato errado expone.
6. **Confirmar vigencia** del precio de $109.000.000.
7. **El renting no está modelado.** El descriptor lo anuncia pero el sitio entero está
   construido sobre la compra. Falta saber quién es la contraparte (arrendadora, banco,
   Corautos) — de eso depende también el párrafo legal del pie.

## Pendientes — construcción

- Bloque de renting en el showroom (falta cuota, plazo y contraparte).
- Calculadora de cuota de crédito (falta que Corautos defina tasa y plazo).
- Seguro e impuesto de la MAGE en el simulador (hoy los confirma el asesor).
- CRM de leads y reporte de estado hacia Corautos.
- Motor de ingesta mensual de informes de mercado.
- Piezas creativas para Meta a partir de los dos ángulos de `PAUTA.md`.

**Ya resuelto** (no rehacer): la malla de calificación vive en la página, no en un bot;
el código de campaña viaja por `?c=` hasta el mensaje de WhatsApp; el simulador calcula
solo con datos del usuario más el 4,9 L/100 km de la ficha.

## Notas legales resueltas

- Daniel factura **a título personal** por ahora; no hay SAS constituida.
- Como persona natural **no está obligado al registro RNBD ante la SIC** (ese deber
  aplica a sociedades con activos > 100.000 UVT; UVT 2026 = $52.374).
- Sí aplican íntegramente: consentimiento previo expreso e informado, política de
  tratamiento, aviso de privacidad y canal de derechos del titular.
- La entrega del lead a Corautos es una **transferencia** a un tercero: la
  autorización debe mencionarla explícitamente.
- Daniel debe ser el **Responsable del Tratamiento** — no por conveniencia sino
  porque legalmente lo es (define finalidad y medios). Es además su única palanca
  para renegociar la comisión.

## Cobertura Corautos (22 puntos de venta, 26 talleres)

Sala y taller: Bogotá, Medellín, Copacabana, Cali, Barranquilla, Bucaramanga, Cúcuta,
Villavicencio, Montería, Valledupar, Pasto, Pereira, Manizales, Ibagué, Neiva,
Popayán, Duitama.
Solo sala: Tunja. Solo taller: Cartagena, Santa Marta.
