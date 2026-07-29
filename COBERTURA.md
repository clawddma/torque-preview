# TORQ — Cobertura e inventario de Corautos

> **Fuente:** piezas oficiales que compartió Daniel. Los originales están en `fuentes/`.
> Cobertura: `fuentes/cobertura-corautos-2026-07-26.jpg` (26 de julio de 2026).
> Inventario: `fuentes/inventario-*.jpg` — tablero **Inventario Gerencia**, corte del
> **28 de julio de 2026**.
>
> Este documento existe porque el bot estaba **inventando cobertura ciudad por ciudad**:
> le decía a un cliente de Bucaramanga "allá hay red de servicio" sin que nadie nos
> hubiera dado esa lista. Ahora la hay, y sale de una pieza oficial de la marca.

## 1. Presencia en Colombia

**22 puntos de venta · 26 talleres de servicio técnico · más de 100 puntos de venta de repuestos.**

Veinte ciudades. Y no todas tienen lo mismo — esa es la parte que importa:

| Ciudad | Venta | Taller |
|---|:--:|:--:|
| Bogotá | ✅ | ✅ |
| Medellín | ✅ | ✅ |
| Copacabana | ✅ | ✅ |
| Cali | ✅ | ✅ |
| Bucaramanga | ✅ | ✅ |
| Cúcuta | ✅ | ✅ |
| Ibagué | ✅ | ✅ |
| Neiva | ✅ | ✅ |
| Manizales | ✅ | ✅ |
| Pereira | ✅ | ✅ |
| Barranquilla | ✅ | ✅ |
| Montería | ✅ | ✅ |
| Valledupar | ✅ | ✅ |
| Pasto | ✅ | ✅ |
| Popayán | ✅ | ✅ |
| Villavicencio | ✅ | ✅ |
| Duitama | ✅ | ✅ |
| **Cartagena** | — | ✅ |
| **Santa Marta** | — | ✅ |
| **Tunja** | ✅ | — |

**Las tres excepciones son las que evitan un error caro:**

- En **Cartagena** y **Santa Marta** hay taller pero **no punta de venta**. Un cliente
  de allá compra en otra ciudad y le hacen el mantenimiento en la suya.
- En **Tunja** hay punto de venta pero **no taller**. El taller más cercano es
  **Duitama**, a ~60 km.

Cuadra con las cifras: **19 ciudades con taller** (las 20 menos Tunja) y **18 con
punto de venta** (las 20 menos Cartagena y Santa Marta).

## 2. Lo que esto corrige en el sitio

El material publicado dice *"26 centros de servicio en 19 ciudades"* — **es correcto**.
Pero se quedaba corto: **también hay 22 puntos de venta**, que es un argumento distinto
y más comercial. «Más sitios para atenderla que para comprarla» sigue siendo cierto:
26 talleres contra 22 salas.

## 3. Lo que sigue sin saberse

- ⚠️ **Prueba de ruta.** Tener sala no garantiza unidad de demostración. Ninguna pieza
  lo dice. El bot no lo afirma: pasa a un asesor.
- ⚠️ **Cobertura de la corredora de seguros** aliada.
- ⚠️ **Direcciones exactas** de cada punto. El bot dice la ciudad, no la dirección.

## 4. Inventario — corte del 28 de julio de 2026

Del tablero **Inventario Corautos BI → Inventario Gerencia**, categoría `EV & HEV CARS`.

| Modelo | Disponible para facturar | En tránsito | En despacho | Total |
|---|--:|--:|--:|--:|
| **Box E3** | 101 | 51 | 140 | **293** |
| **Box E2** | 29 | 9 | 6 | **45** |
| **MAGE HEV E3** | 22 | 27 (+18 en puerto) | 27 | **94** |

**Los colores que existen de verdad**, que es lo que el bot necesita para no inventar:

| Modelo | Colores |
|---|---|
| **Box E3** | Azul · Azul/Blanco · Blanco · Plata · Rojo/Blanco · Rosa Perlado/Blanco · Verde/Blanco |
| **Box E2** | Azul · Azul/Blanco · Blanco · Plata · Rosa Perlado/Blanco · Violeta Perlado/Blanco |
| **MAGE HEV E3** | Azul · Blanco · Blanco/Negro · Plata · Plata/Negro |

⚠️ **El Vigo no aparece en el tablero.** Sigue siendo el dato que falta desde el
principio: sin inventario del Vigo no se puede prometer entrega inmediata de esa
referencia.

### Regla para el bot

**Las cantidades no se publican y no se le dicen al cliente.** Cambian todos los días y
prometer stock exacto es la forma más rápida de quedar mal. Lo que sí se usa:

- **Sí hay unidades y hay entrega inmediata** — con 101 Box E3 y 22 MAGE listos para
  facturar, afirmarlo es cierto, no optimismo.
- **La carta de colores por modelo** — ya no hay que decir "no tengo la lista".
- **Que el color y la versión exacta se confirman con la sala** — que es lo único que
  de verdad varía a diario.

## 5. Qué pedirle a Corautos

- [ ] Direcciones de los 22 puntos de venta y los 26 talleres
- [ ] En cuáles salas hay unidad para prueba de ruta
- [ ] Inventario del Vigo
- [ ] Con qué frecuencia se puede recibir el corte del tablero BI (para mantener esto vivo)
