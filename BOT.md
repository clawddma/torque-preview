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

Vive en `bot.html`, arreglo `KB`. Cada tema tiene disparadores, respuesta y si obliga a
escalar. Hoy cubre 20 temas: precio, enchufe, consumo, ficha, garantía, servicio,
colores, seguridad, espacio, reforma, devolución de IVA, prueba de ruta, crédito,
retoma, renting, disponibilidad, marca, comparativo, pedir humano y saludo.

Toda cifra sale de la ficha técnica o de fuentes ya verificadas en `CONTEXTO.md`.
Cuando entren más marcas, la KB se parte por vehículo y se le suma un enrutador.

## 3. Reglas de escalamiento

Ocho motivos pasan la conversación a humano. Seis son de negocio y dos de protección:

| Motivo | Por qué |
|---|---|
| `pedido` | Lo pidió explícitamente |
| `agenda` | Prueba de ruta: se cierra con persona |
| `credito` | Tasa y aprobación son de la sala |
| `retoma` | El avalúo es presencial |
| `renting` | Propuesta caso por caso; además todavía no está modelado |
| `tributario` | La devolución depende del caso y el criterio DIAN ha cambiado |
| `descuento` | Negociar es de la sala, nunca del bot |
| `reclamo` | Una queja la atiende una persona, no un chat |
| `nose` | Tres turnos sin entender: antes de frustrar, pasa a humano |

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
