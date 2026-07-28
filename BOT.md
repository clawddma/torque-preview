# TORQ — Motor de interacción de WhatsApp

> Lógica, estructura e infraestructura del bot. El simulador vivo está en `bot.html`:
> ahí se puede conversar con la lógica antes de montar nada.
> Actualizado: 27 de julio de 2026.

## 1. Qué hace y qué NO hace

TORQ es una sala de ventas virtual multimarca. El bot **no vende**: resuelve dudas con
hechos verificables y consigue que el interesado avance hasta un asesor humano.

**Su trabajo es que el lead llegue tibio y trazado, no cerrar la venta.**

| Sí hace | Nunca hace |
|---|---|
| Responde precio de lista, ficha, garantía, consumo, cobertura | Da precio final, descuento o negocia |
| Explica la reforma en condicional | Aprueba crédito o dice una tasa |
| Explica la devolución de IVA como verificación | Promete la devolución como un hecho |
| Confirma que hay red de servicio y dónde | Promete fecha de entrega |
| Pregunta ciudad, plazo, forma de pago | Pide cédula, dirección o datos de pago |
| Escala cuando no sabe | Inventa un dato que no tiene |

Regla madre: **si no está en la base de conocimiento, escala.** Un "no sé, te paso con
alguien" cuesta un lead tibio; un dato inventado cuesta la relación con Corautos.

## 2. Base de conocimiento

Vive en **`bot-motor.js`** — no en la página. Ese archivo es el motor completo y lo usan
dos cosas: el simulador visual (`bot.html`) y el probador automático (`bot-sim.js`,
`node bot-sim.js`). **Es el mismo motor**: lo que pasa la prueba es lo que contesta en
el chat, y al revés. Un bot que se prueba distinto de como responde no está probado.

| Bloque | Qué contiene |
|---|---|
| `VEH` | Los tres vehículos: precio, autonomía, motor, batería, baúl, gancho, artículo (la MAGE / el Vigo) y las palabras con que el cliente los nombra. **Cambiar un precio es editar una fila.** |
| `COMUN` | Lo que es igual para los tres (garantía, red de servicio, seguridad). Una sola fuente. |
| `VETO` | Los temas que nunca responde. Se evalúan primero y ganan siempre. |
| `KB` | 27 temas. La respuesta puede depender del vehículo y de lo que ya sabe del cliente. |
| `CARGA` · `USO` · `PLAZO` · `PAGO` · `CIUDADES` | Señales que va capturando de la conversación. |

Los temas: precio, cuál me conviene, enchufe, instalación del cargador, consumo, ficha,
espacio, garantía, servicio, seguridad, colores, reforma, devolución de IVA, pico y
placa, seguro, prueba de ruta, crédito, retoma, renting, disponibilidad, marca,
reventa, comparativo, pedir humano, saludo, gracias y despedida.

**El enrutador de vehículo ya está.** El bot detecta de cuál le hablan y cambia de foco
solo; en producción el vehículo de arranque lo trae el anuncio (`?v=box`).

Toda cifra sale de la ficha técnica o de fuentes ya verificadas en `CONTEXTO.md`.

### Lo que decide con reglas, no con criterio

La recomendación **no** sale de una charla libre: sale de un eje único —¿puede cargar en
casa?— y de ahí a Vigo, Box o MAGE. Nació de un defecto que encontró la simulación: el
bot le recomendaba un eléctrico a quien acababa de decir que parquea en la calle, porque
*"no tengo parqueadero"* contiene *"tengo parqueadero"*. Las negaciones se evalúan
primero, siempre.

Otras dos reglas que salieron de la misma prueba:

- **Las muletillas no mandan.** "listo", "ok", "bueno" solo ganan si son casi todo el
  mensaje. Antes, *"listo, quiero verla"* caía en "gracias" y el cliente que pedía cita
  recibía un "con gusto".
- **El bot no dice "no entendí" cuando el cliente acaba de contestarle.** Si el turno
  trae una señal nueva (ciudad, plazo, uso, si puede cargar), la usa y sigue.

## 3. Reglas de escalamiento

Trece motivos pasan la conversación a humano:

| Motivo | Por qué |
|---|---|
| `pedido` | Lo pidió explícitamente |
| `agenda` | Prueba de ruta o visita a sala: se cierra con persona |
| `credito` | Tasa y aprobación son de la sala |
| `retoma` | El avalúo es presencial |
| `renting` | Propuesta caso por caso; además todavía no está modelado |
| `tributario` | La devolución de IVA depende del caso y el criterio DIAN ha cambiado |
| `normativo` | Pico y placa e impuesto vehicular: cambian por ciudad y por año |
| `seguro` | La póliza la cotiza la aseguradora, no el bot |
| `instalacion` | El cargador depende de la acometida y del permiso de la copropiedad |
| `descuento` | Negociar es de la sala, nunca del bot |
| `reclamo` | Una queja la atiende una persona, no un chat |
| `datos` | Pidió o intentó dar cédula, cuenta o pago. El bot no los toca |
| `nose` | Tres turnos sin entender: antes de frustrar, pasa a humano |

Los tres últimos que se agregaron —`normativo`, `seguro`, `instalacion`— son los que más
protegen: son preguntas frecuentísimas en Colombia donde la respuesta suena fácil y es
distinta en cada ciudad. Un bot que contesta "los eléctricos no tienen pico y placa" sin
saber dónde vive el cliente está publicando información falsa.

## 3b. Prueba de usabilidad

`bot-sim.js` corre **20 clientes falsos, 61 turnos**, escritos como escribe la gente en
WhatsApp: sin tildes, con errores, en desorden. Cada turno declara qué *debería* pasar
—qué tema debe reconocer, si debe escalar y por qué motivo, y con `contiene`, qué
vehículo debe nombrar. El probador compara y saca la cuenta.

```bash
node bot-sim.js
```

También corre desde `bot.html` con el botón **Correr simulación**, con el detalle de cada
conversación y el lead que quedó al final. Estado hoy: **100% de respuestas correctas,
93% de preguntas entendidas, 18 escaladas correctas, 0 escaladas faltantes.**

El 7% que no entiende es a propósito: son los turnos donde el cliente escribe algo
ininteligible y el bot **debe** admitir que no entendió en vez de adivinar. A los tres
seguidos, pasa a humano.

Los clientes de prueba cubren: el que compra de una, el que regatea, el que no puede
cargar en casa, la familia, el escéptico de la marca, el que financia, el de la retoma,
la empresa con flota, el del IVA, el de pico y placa, el del seguro, el que compara
marcas, el molesto, el que intenta dar datos sensibles, el que no sabe qué quiere, el
del cargador, la del afán de entrega, el confuso, la conversación larga completa y el
que solo quiere hablar con una persona.

**Regla: todo defecto que se encuentre se convierte en un cliente de prueba.** Así no
vuelve. Los cinco que ya están blindados salieron de correr esto la primera vez.

## 4. Infraestructura

### Los tres niveles

| Nivel | Da | Exige | Costo |
|---|---|---|---|
| **1 · Click to chat** *(hoy)* | El cliente llega con contexto | Nada | $0 |
| **2 · WhatsApp Business App** | Saludo automático, ausencia, respuestas rápidas, etiquetas | Instalar la app con el número | $0 |
| **3 · Cloud API + bot** | Conversación real con IA, CRM conectado | Meta Business verificado, número dedicado, servidor | Por conversación + hosting + modelo |

**Un número no puede estar en la app de Business y en la Cloud API al mismo tiempo.**
Migrar a la API lo saca del teléfono. Por eso el orden es 2 primero, 3 cuando el
volumen lo justifique.

### Arquitectura del nivel 3

```
Anuncio Meta ─► torque-preview (?c=CODIGO) ─► calificador ─► WhatsApp
                                                                │
                                              Meta Cloud API ◄──┘
                                                     │ webhook
                                                     ▼
                                            Servidor TORQ
                                    ┌────────┬────────┬────────┐
                                    │ Router │  KB    │ Reglas │
                                    └────┬───┴────┬───┴────┬───┘
                                         ▼        ▼        ▼
                                      Modelo   SQLite   Escalada
                                     (Claude)  (leads)  a Daniel
                                                  │
                                                  ▼
                                            Panel de leads
                                     (patrón planner.bellapop.co)
```

**Componentes y decisiones:**

- **Número dedicado.** No usar el 305 431 0851 si va a seguir en el teléfono. La API
  necesita una línea propia.
- **Servidor.** Un webhook pequeño, siempre disponible. **No montarlo en el Mac mini
  que corre los bots de trading**: mezclar un servicio de cara al cliente con esa
  infraestructura es pedir un incidente. Un contenedor barato aparte es suficiente.
- **Modelo.** La KB y los guardarraíles van en el prompt de sistema. Modelo rápido y
  económico para conversación; no hace falta el más grande.
- **Persistencia.** Una tabla de conversaciones y otra de leads con los estados que
  exige el contrato: `entregado → contactado → agendado → facturado`. Sin esos
  estados no hay comisión defendible.
- **Panel.** Reutilizar el modelo de `planner.bellapop.co`, que ya resuelve pipeline,
  seguimiento y recurrencia.

> Las tarifas de Meta y los cupos de conversaciones gratuitas cambian con frecuencia:
> **hay que verificarlos al momento de implementar**, no darlos por sabidos.

## 5. Ventana de 24 horas

Meta solo permite responder libremente dentro de las 24 horas siguientes al último
mensaje del cliente. Pasado ese plazo, únicamente plantillas aprobadas.

Consecuencia operativa: **el seguimiento se diseña dentro de la ventana o no existe.**
Si el asesor contesta al tercer día, hay que pagar plantilla y la conversación ya se
enfrió. Es otro argumento para que el SLA de respuesta sea cláusula del contrato.

## 6. Qué falta para prender el nivel 3

1. Número dedicado para la API.
2. Cuenta Meta Business verificada.
3. Autorización escrita de Corautos para marcas y fotografías.
4. Política de datos completa y revisada por abogado.
5. Contrato firmado con la definición de lead válido y el SLA.
6. Decidir dónde corre el servidor.

## 7. Antes de eso, lo que sí se puede hacer hoy

Instalar **WhatsApp Business** en el 305 431 0851 y configurar el saludo automático.
Eso cubre la respuesta inmediata sin costo ni desarrollo, y es lo único que separa hoy
al proyecto de recibir su primer lead bien atendido.
