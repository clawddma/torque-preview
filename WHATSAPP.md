# TORQ — Configuración de WhatsApp Business

> Todo lo que se puede dejar funcionando **sin contrato y sin costo**, mientras llega
> el acuerdo con Corautos. Línea: **+57 305 431 0851**.
> Actualizado: 28 de julio de 2026.

**Estado (28 de julio de 2026):** la línea **305 431 0851 está confirmada como
dedicada** y con **WhatsApp Business ya instalado y configurado**. Los pasos 1 y 2
están hechos. El sitio ya sale a ese número: `contacto.js`, variable `WA`.

**Nota de versión (27 de julio de 2026):** WhatsApp Business movió "Herramientas
para la empresa" fuera de Ajustes. Ahora vive en una **pestaña propia llamada
"Herramientas"**, en la barra inferior de la app (junto a Chats, Estados,
Llamadas) — no dentro de Ajustes → Cuenta ni de Ajustes → Editar perfil. Todos
los pasos de abajo siguen siendo válidos en contenido; solo cambia la ruta para
llegar: entra por esa pestaña, no por Ajustes.

## La decisión que sigue: hasta dónde llega la app, y qué cuesta pasarse

Con la app de Business instalada, la línea llega hasta el **nivel 2**: saludo
automático, mensaje de ausencia, respuestas rápidas, etiquetas y catálogo. Todo
manual: el bot no contesta solo, lo contestas tú con un atajo.

**El bot real (nivel 3) exige la Cloud API, y la Cloud API saca el número del
teléfono.** No es reversible en la práctica: una vez migrado, la app de Business
deja de funcionar en esa línea y toda la atención pasa a vivir en un servidor y en
una bandeja web que hay que construir. No se puede tener las dos cosas.

Por eso el orden correcto es:

| | Qué se gana | Qué se pierde |
|---|---|---|
| **Quedarse en la app** *(hoy)* | Atención desde el celular, cero costo, cero infraestructura | Alguien tiene que responder. De noche solo contesta el mensaje de ausencia |
| **Migrar a Cloud API** | Responde solo, 24/7, con la lógica de `bot-motor.js` | El número sale del teléfono. Hay que construir bandeja, servidor y hosting |

**Recomendación: no migrar todavía.** Primero hay que ver volumen real de leads con
pauta corriendo. Migrar antes es montar infraestructura para atender un tráfico que
todavía no existe, y perder el celular como herramienta de trabajo a cambio de nada.
El día que las respuestas rápidas no den abasto —ese es el síntoma— se migra.

Si algún día se migra, **haz copia de seguridad antes**: *Ajustes → Chats → Copia de
seguridad → Guardar ahora*.

---

## Paso 1 · Instalar y migrar

1. Descarga **WhatsApp Business** (App Store / Google Play).
2. Ábrela y registra el **mismo número**: 305 431 0851.
3. Detecta que ya existe una cuenta y ofrece migrarla. Acepta.
4. Restaura la copia cuando lo pida.

## Paso 2 · Perfil de la empresa

*Ajustes → Herramientas para empresas → Perfil de empresa*

| Campo | Qué poner |
|---|---|
| Nombre | **TORQ** |
| Categoría | Automotriz / Concesionario de vehículos |
| Descripción | Compra y renting de carros. Te acompañamos a elegir con datos, no con presión. |
| Horario | El real de atención. Define el mensaje de ausencia |
| Sitio web | `https://clawddma.github.io/torque-preview/` |
| Foto | El logotipo TORQ sobre negro |

Correo: usa uno dedicado, no el personal. Cuando exista la política de datos, ese
mismo correo es el canal de derechos del titular.

## Paso 3 · Mensaje de bienvenida

*Herramientas para empresas → Mensaje de bienvenida* → activar → destinatarios: **todos**.

```
¡Hola! Gracias por escribir a TORQ.

Ya tenemos tu mensaje. Un asesor especializado te contacta en las próximas
horas para acompañarte en todo el proceso: disponibilidad real, prueba de
ruta y condiciones de compra o renting.

Mientras tanto, cuéntame en qué ciudad estás y qué te gustaría saber.
```

Se envía solo cuando alguien escribe por primera vez o después de 14 días de silencio.

## Paso 4 · Mensaje de ausencia

*Herramientas para empresas → Mensaje de ausencia* → **Horario personalizado**.

```
Gracias por escribir a TORQ. En este momento estamos fuera de horario.

Te respondemos apenas abramos. Si quieres adelantar, déjame tu ciudad y
para cuándo estás pensando la compra, y llegamos con todo listo.
```

## Paso 5 · Respuestas rápidas

**Ya no se escriben a mano aquí.** Se generan del motor del bot y se copian desde
`respuestas.html` — ábrela en el celular mientras configuras la app:

<https://clawddma.github.io/torque-preview/respuestas.html>

Son **43 respuestas** para los tres vehículos, con botón de copiar en cada una,
filtro por vehículo y separadas entre informativas y las que pasan a un asesor.
Caben en el límite de WhatsApp Business.

**Por qué se generan y no se escriben:** mientras existieron dos listas —una en
`bot.html` y otra aquí— la única garantía de que dijeran lo mismo era la memoria.
Ahora hay una sola fuente (`bot-motor.js`): si cambia un precio, cambian el chat,
el simulador y las respuestas rápidas al mismo tiempo. **Nunca vas a tener una
cifra en WhatsApp distinta a la del sitio.**

Los atajos siguen el patrón `/tema` o `/tema-vehiculo`: `/precio-vigo`,
`/enchufe-mage`, `/garantia` (igual para los tres), `/picoyplaca`.

### Regla antes de enviar cualquiera que pregunte la ciudad

Mira si el mensaje con el que te escribió ya la trae. Si vino del calificador de
la página, empieza con "Estoy en [ciudad]" — en ese caso **borra la pregunta de la
ciudad antes de enviar**. Solo pregúntala si el mensaje llegó sin ese dato.

**Nunca por WhatsApp:** descuentos, tasas de crédito, fechas de entrega, la
devolución de IVA como un hecho, ni si un vehículo tiene o no pico y placa en una
ciudad. Eso lo define la sala. Las razones están en `BOT.md`.

## Paso 5.5 · Catálogo

*Herramientas para empresas → Catálogo → Añadir artículo o servicio.*

**Tres artículos, uno por vehículo.** Los datos exactos (nombre, precio,
descripción y enlace) están al final de `respuestas.html`, generados del mismo
motor. Las fotos se suben desde el teléfono: `img/vigo/`, `img/box/` e `img/g1.jpg`.

## Paso 5.6 · Anuncios (el botón "Anuncios" o "Promocionar" dentro de la app)

**No lo uses todavía.** Ese botón crea campañas simplificadas desde el celular,
sin pasar por Meta Ads Manager. Dos problemas si lo usas ahora:

1. **Pierde el código de campaña.** Todo el mensaje que llega por `?c=` hasta
   WhatsApp (ver `index.html`) depende de que el anuncio venga de una campaña
   armada en Ads Manager con la estructura de `PAUTA.md`. Un anuncio creado desde
   la app no lleva ese código: no sabrías qué ángulo ni qué plaza generó el lead.
2. **Es plata sin atribución.** Sin código de campaña no puedes medir costo por
   lead calificado, que es el número que sostiene todo el negocio.

Cuando llegue el momento de pautar (después de los 4 bloqueantes de más abajo),
la pauta se monta desde Meta Ads Manager, no desde este botón.

## Paso 6 · Etiquetas

*Herramientas para empresas → Etiquetas*. Usa **los estados del contrato**, no
categorías inventadas — así la etiqueta sirve para cobrar la comisión:

| Etiqueta | Cuándo |
|---|---|
| `1 Nuevo` | Escribió, sin calificar |
| `2 Calificado` | Ciudad, plazo, forma de pago y retoma |
| `3 Entregado a Corautos` | Ya se pasó a la sala — **anota fecha y hora** |
| `4 Contactado` | La sala confirmó contacto |
| `5 Agendado` | Con prueba de ruta o cita |
| `6 Facturado` | Venta cerrada → comisión |
| `X No califica` | «Todavía estoy mirando» o fuera de alcance |

La distancia entre `3` y `4` es tu SLA. Mídela desde el primer día: es el argumento
con datos para la cláusula del contrato.

## Paso 7 · Probarlo de punta a punta

Desde **otro teléfono**, no el tuyo:

1. Abre `https://clawddma.github.io/torque-preview/`
2. Completa el calificador con datos de prueba.
3. Marca la autorización y toca **Abrir WhatsApp**.
4. Envía el mensaje.
5. Verifica que llegue el **saludo automático** y que el texto se lea como una persona.
6. Etiqueta esa conversación como `1 Nuevo` para probar el flujo.

Si algo se ve raro, es el momento de corregirlo: todavía no hay pauta corriendo.

## Lo que queda pendiente y NO depende de ti

- Contrato firmado con Corautos (lead válido, atribución, SLA, escala de comisión).
- Autorización escrita para marcas Dongfeng y fotografías.
- Política de datos completa y revisada por abogado.
- Verificar la ficha de la competencia del comparador.

Hasta que esos cuatro estén, **no se prende pauta**. Pero con los pasos de arriba, el
día que llegue el primer lead ya está bien atendido.
