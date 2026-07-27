# TORQ — Configuración de WhatsApp Business

> Todo lo que se puede dejar funcionando **sin contrato y sin costo**, mientras llega
> el acuerdo con Corautos. Línea: **+57 305 431 0851**.
> Actualizado: 27 de julio de 2026.

## Antes de empezar — dos advertencias

1. **La migración no tiene devolución.** Una vez el número pasa a WhatsApp Business,
   WhatsApp no ofrece un camino de vuelta a la app personal. Si ese número es también
   tu WhatsApp personal, piénsalo: quizá convenga una línea aparte para TORQ.
2. **Haz copia de seguridad antes.** En la app personal:
   *Ajustes → Chats → Copia de seguridad → Guardar ahora*. Con eso los chats, fotos y
   audios pasan a Business.

WhatsApp Business es una **app distinta**, no una actualización. Se descarga aparte y
puede convivir en el mismo teléfono con la app personal, siempre que usen números
diferentes.

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

*Herramientas para empresas → Respuestas rápidas*. Son la versión manual del bot:
escribes `/precio` y se despliega el texto. **Mismas cifras que `bot.html`.**

### `/precio`
```
El precio de lanzamiento de la MAGE HEV es de $109.000.000, con IVA incluido.

Está sujeto a confirmación con la sala, porque depende de disponibilidad y
versión. ¿En qué ciudad estás? Te confirmo el precio vigente allá.
```

### `/enchufe`
```
No se enchufa. Es híbrida autorecargable: recupera energía sola mientras andas.

Sin cargador, sin instalación en la casa y sin buscar estación. Tanqueas
gasolina como siempre, solo que mucho menos seguido.
```

### `/consumo`
```
4,9 litros cada 100 km y más de 1.000 km de autonomía total.

En la página hay un simulador donde pones tu consumo actual y los kilómetros
que haces al mes, y te dice cuánto cambiaría tu gasto:
https://clawddma.github.io/torque-preview/#simulador
```

### `/ficha`
```
288 hp de potencia combinada y 565 Nm de torque. Motor 1.5T turbo de inyección
directa más motor eléctrico, transmisión híbrida dedicada de 4 velocidades.

Techo panorámico de 1,08 m², 6 airbags y conducción asistida nivel 2.
Ficha completa: https://clawddma.github.io/torque-preview/#ficha
```

### `/garantia`
```
Batería y motor eléctrico: 8 años o 200.000 km.
Vehículo completo: 5 años o 150.000 km.

Es de las garantías más largas del segmento en Colombia.
```

### `/servicio`
```
26 centros de servicio en 19 ciudades del país y más de 100 puntos de repuestos.

Son más sitios para atenderla que para comprarla. Dime tu ciudad y te digo
cuál te queda más cerca.
```

### `/reforma`
```
Hoy los híbridos pagan 5% de IVA. El 22 de julio se radicó un proyecto que
lo subiría a 19%.

Si se aprueba, esta misma camioneta pasaría de $109.000.000 a unos
$123.500.000. Está radicado, no aprobado: todavía puede cambiar.
```

### `/credito`
```
El crédito lo estudia y aprueba la sala con sus aliados financieros, así que
no puedo darte una tasa por aquí.

Lo que sí puedo es ponerte con un asesor que te dé condiciones reales hoy
mismo. ¿Te sirve?
```

### `/prueba`
```
Con gusto agendamos prueba de ruta.

¿En qué ciudad estás y qué día te queda mejor? Lo cuadro con la sala y te
confirmo.
```

### `/cierre`
```
Listo. Ya le paso tus datos al asesor de tu ciudad; te contacta en las
próximas horas.

Cualquier cosa que se te ocurra mientras tanto, escríbeme por aquí.
```

**Nunca por WhatsApp:** descuentos, tasas de crédito, fechas de entrega, ni la
devolución de IVA como un hecho. Eso lo define la sala. Las razones están en `BOT.md`.

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
