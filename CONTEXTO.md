# TORQ — Contexto del proyecto

> Documento de traspaso. Si estás retomando este proyecto en una sesión nueva
> (celular, web, o terminal), lee esto primero. Actualizado: 26 de julio de 2026.

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

## Estado de la marca

El nombre **NO está cerrado**. TORQ es provisional, por decisión de Daniel.

Historia de descartes (no repetir estos caminos):
- **Criterio** — descartado: nombra lo que hacemos nosotros, no lo que siente el cliente.
- **Rumbo** — descartado: a Daniel no le gustó el nombre en sí.
- **CERO** — descartado por Camilo: implica cero emisiones, y contradice híbridos,
  combustión, maquinaria amarilla y pesados. Además la MAGE consume 4,9 L/100 km,
  así que sería una afirmación ambiental falsa sobre nuestro propio producto de
  lanzamiento (riesgo de publicidad engañosa, Ley 1480).
- **NAVE** — descartado: suena infantil para vender maquinaria amarilla y
  tractocamiones a empresas.

**Criterios vigentes para el nombre:** corto; neutro en tecnología (debe servir para
una híbrida, un diésel y una retroexcavadora); que denote respaldo y seguridad; que
suene a empresa generadora de contenido relevante, no a producto o repuesto.

**Línea gráfica aprobada:** fondo negro de alto contraste, fotografía a sangre,
tipografía pesada. Referencias: Polestar, Zeekr, configurador de Porsche.
Acento lima `#c8f24a` — solo en interfaz, nunca codificando datos.

## Qué hay construido

| Archivo | Qué es |
|---|---|
| `index.html` | Showroom de la MAGE: hero, specs, carrusel de 9 fotos, comparador, bloque de IVA/reforma, 20 ciudades |
| `analitica.html` | Inteligencia de mercado: mapa de Colombia, matriz de oportunidad, evolución mensual, segmentos, marcas |
| `img/` | 9 fotos optimizadas a 1400px |

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
- Dongfeng: puesto 16, 2.189 unidades, **+217,2%** — marca en crecimiento pero
  desconocida. El trabajo es de confianza, no de precio.
- **47,4%** del mercado nuevo se compra a crédito
- Diciembre es el pico del año; enero cae ~34%

**Hallazgos del tablero:**
- Cundinamarca: 22.304 unidades sin sede Corautos, pero solo +2,3% — es matrícula
  de flotas y leasing, no comprador de mostrador.
- 16,7% del mercado (26.250 unidades) está en plazas sin sala de ventas.
- Sucre (+61,9%) y Caquetá (+83,4%) crecen fuerte y no tienen sede: candidatos al
  experimento de venta 100% digital.
- Cartagena tiene taller pero no sala — laboratorio ideal: la objeción de servicio
  ya está resuelta.
- Manizales es el único mercado en rojo (−2,9%) y sí tiene sede. No pautar ahí.

## Pendientes — bloqueantes antes de publicar

1. **Verificar ficha por ficha los datos de competencia del comparador**
   (Corolla Cross, Sportage, Territory, CX-30). Hoy son estimados de mercado.
   Publicar un dato errado de otra marca nos expone.
2. **Autorización escrita de Corautos** para usar marcas Dongfeng y las fotografías.
3. **Política de Tratamiento de Datos** (Ley 1581) enlazada de verdad, con el texto
   de consentimiento que menciona expresamente la transferencia al concesionario.
4. **Contrato con Corautos**: definición de lead válido, ventana de atribución
   (90 días), regla de deduplicación, SLA de reporte, disparador de pago, umbrales
   exactos de la escala 1,2% → 1,5%.
5. **Confirmar vigencia** del precio de lanzamiento de $109.000.000.

## Pendientes — construcción

- Calculadora de cuota (falta que Corautos defina tasa y plazo).
- Línea de WhatsApp: Daniel ya la tiene, falta cablearla. Los botones existen sin destino.
- Bot calificador de WhatsApp y su malla de calificación.
- CRM de leads y reporte de estado hacia Corautos.
- Motor de ingesta mensual de informes de mercado.

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
