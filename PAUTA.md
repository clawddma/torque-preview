# TORQUE — Motor de captación y ruta de pauta

> Documento operativo. Presupuesto de referencia: **$1.200.000/mes**.
> Actualizado: 26 de julio de 2026.

## 1. La aritmética que manda

La comisión es conocida: **$1.245.714** por unidad (1,2% sobre la base sin IVA de
$103.809.524). De ahí sale el único número que decide si el negocio existe:

> **CPL de quiebre = comisión × tasa de cierre del concesionario**

| Si Corautos cierra | Una conversación calificada no puede costar más de |
|---|---|
| 2% | $24.914 |
| 3% | $37.371 |
| 5% | $62.286 |
| 8% | $99.657 |

Por encima de eso se trabaja gratis. Para operar con margen (pauta ≤30% de la
comisión): **CPL objetivo = $373.714 × tasa de cierre** → con cierre del 5%,
**$18.700 por conversación calificada**.

**La variable que decide el margen no la controla TORQUE, la controla el
concesionario.** Por eso el SLA de respuesta es una cláusula de contrato, no una
cortesía: es literalmente el margen.

## 2. Bloqueantes antes del primer peso

1. **Número de WhatsApp** en `var WA` de `index.html`. Sin él el calificador
   funciona pero no envía (a propósito: permite revisar sin generar leads reales).
2. **`politica-datos.html`** — el calificador ya enlaza ahí y exige la casilla.
   La página todavía no existe. Sin ella no se puede capturar un solo dato.
3. **Autorización escrita de Corautos** (marcas Dongfeng + fotografías). Meta
   rechaza anuncios de marcas de terceros sin respaldo.
4. **Contrato**: lead válido, atribución 90 días, dedup, SLA de respuesta,
   disparador de pago, escala 1,2% → 1,5%.

## 3. Códigos de campaña

Todo anuncio apunta a `index.html?c=CODIGO`. El código viaja en la URL, sobrevive
el salto entre páginas (sessionStorage) y llega escrito en el mensaje de WhatsApp.
Sin esto no hay forma de saber qué anuncio pagó cada conversación.

Formato: **`ANGULO-PLAZA-FASE`**

| Parte | Valores |
|---|---|
| Ángulo | `A` reloj fiscal · `B` respaldo · `C` producto · `D` devolución IVA |
| Plaza | `BOG` `ANT` `VAL` `CTG` `SUC` `MET` `CES` `SAN` `ATL` |
| Fase | `F1` `F2` `F3` |

Ejemplos: `A-BOG-F1` · `B-BOG-F1` · `B-CTG-F2`

Si Meta pasa `utm_content`, también se lee. Sin código, el lead se marca `directo`.

## 4. La malla de calificación

Cinco preguntas, resueltas en la página **antes** de abrir WhatsApp. El lead llega
calificado y trazado, sin backend y sin costo.

| Campo | Opciones |
|---|---|
| Ciudad | las 20 con presencia Corautos + "Otra ciudad" |
| Compra | Este mes · En 1 a 3 meses · Más adelante · Todavía estoy mirando |
| Pago | Con crédito · De contado · Aún no lo sé |
| Retoma | Sí · No |
| Nombre | texto libre |

**Definición de lead válido — esto va al contrato:**

- Completó las 5 preguntas y autorizó el tratamiento de datos.
- Ventana de compra ≤ 90 días (`Este mes` o `En 1 a 3 meses`).
- Teléfono real: escribió por WhatsApp.
- No duplicado en 90 días.
- No estaba ya en gestión del concesionario (dedup contra su base).

`Todavía estoy mirando` **no es lead válido para cobro**. Se registra, no se cobra.
Decirlo primero evita la discusión después.

## 5. Ruta de pauta

### Fase 1 · ¿Qué mensaje capta? (semanas 1–2, ~$600.000)

- **Una sola plaza: Bogotá.** 44.735 unidades, 28,4% del país. Con presupuesto
  mínimo, concentrar geografía sube la frecuencia y acelera la lectura.
- **Dos ángulos, no tres.** ~$21.500/día cada uno; con tres, ninguno saldría de
  la fase de aprendizaje de Meta.
- Usar la **herramienta de Prueba A/B de Meta**, no ad sets manuales: reparte la
  audiencia al azar y entrega significancia. Ad sets manuales se canibalizan.
- Objetivo: mensajes / tráfico al calificador.
- **Métrica de decisión: costo por conversación iniciada.** Todavía no CPA.
- **Regla de corte:** no se declara ganador con menos de 25 conversaciones por
  ángulo, salvo que la diferencia de costo sea mayor a 2×. Matar un creativo con
  3 leads es optimizar sobre ruido.

### Fase 2 · ¿Dónde rinde? (semanas 3–4, ~$600.000)

El mensaje ganador en cuatro plazas:

| Plaza | Por qué | Qué prueba |
|---|---|---|
| Meta (+60,9%) o Cesar (+69,2%) | sala + alto crecimiento | techo con cobertura |
| Una plaza con sala y crecimiento plano | control | el efecto del crecimiento |
| **Cartagena** | taller sin sala | la objeción de servicio ya está resuelta |
| **Sucre** (+61,9%) | sin nada | ¿existe el mercado sin cobertura? |

Responde la pregunta más grande del proyecto: si el **16,7% del mercado
(26.250 unidades)** sin sala es real o espejismo.

### Fase 3 · Escalar con el reloj puesto (semana 5+)

Diciembre es el pico del año y enero cae ~34%. La reforma se radicó el 22 de julio.
Hay ~4 meses para calibrar antes del mes más grande, con un gancho que tiene fecha.

## 6. Los ángulos

Escritos con las reglas de `CLAUDE.md`: cifras antes que adjetivos, nunca nombrar
el miedo, condicional cuando el hecho es condicional.

**A · Reloj fiscal**
> El IVA de los híbridos *podría* pasar de 5% a 19%. En esta camioneta son
> $14.533.333. → *Verifica el precio de hoy*

Condicional obligatorio: la reforma está **radicada, no aprobada**.

**B · Respaldo**
> 26 centros de servicio en 19 ciudades. Más sitios para atenderla que para
> comprarla. → *Mira dónde queda el tuyo*

Ataca la objeción de marca china sin pronunciarla. Es lo único que ningún
competidor puede copiar.

**C · Producto** — reserva. 288 hp y 4,9 L a precio de gama media. Es lo que dice
todo concesionario: el ángulo donde menos se diferencia.

**D · Devolución de IVA** — Fase 3 y **siempre como verificación, nunca como
promesa**. El Concepto DIAN 000673 de 2026 fija el procedimiento, pero el
Concepto 012101 de 2025 decía lo contrario para uso personal.

## 7. Dónde NO pautar

- **Manizales** — único mercado en rojo (−2,9%) y tiene sede.
- **Cundinamarca a mostrador** — 22.304 unidades, pero crece 2,3%: es matrícula de
  flotas y leasing. Cualquier agencia pautaría ahí mirando el volumen. Este
  hallazgo, solo, paga el tablero.

## 8. Registro semanal

Una fila por ángulo y plaza. Sin esto no hay aprendizaje, solo gasto.

| Semana | Código | Gasto | Clics | Conversaciones | Calificadas | Costo/conv. calificada | Ventas | Comisión |
|---|---|---|---|---|---|---|---|---|

**Regla de oro: no gastar un peso que no se pueda leer.**

El *engagement* (likes, CTR) sirve para descartar rápido, no para decidir. La
primera métrica real es la conversación iniciada; la única que paga es la venta
atribuida.
