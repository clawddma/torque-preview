# TORQ — El bot que responde solo

> Esto es el **cuerpo** del bot: lo que recibe los mensajes de WhatsApp y contesta
> sin que nadie esté mirando el celular. El **cerebro** —qué responde y qué se
> niega a responder— vive en `../bot-motor.js` y es el mismo que corre en el
> simulador de la página.
>
> Estado: **construido y probado. Falta conectarlo a la cuenta de WhatsApp.**

## Qué hace, en una frase

Un cliente escribe al número. En dos segundos tiene respuesta con datos reales.
Si pregunta algo que el bot no puede responder —crédito, descuento, pico y placa—
le contesta con honestidad y **te llega un aviso a Telegram con la conversación
completa**. Tú entras cuando ya hay algo que atender, no a revisar chats.

## Probarlo sin cuenta, sin token y sin gastar un mensaje

```bash
node --no-warnings servidor/prueba-punta-a-punta.js
```

Levanta el servidor real y le mete mensajes con la misma forma exacta que manda
Meta. **25 verificaciones**: firma, mensajes repetidos, memoria entre mensajes,
guardarraíles, escalada, código de campaña y los estados del contrato. Lo único
simulado es la salida a WhatsApp, que se captura en vez de enviarse.

Y el cerebro se prueba aparte, con 20 clientes falsos:

```bash
node bot-sim.js
```

## Las tres cosas que faltan, y solo tú puedes hacerlas

### 1 · Verificar la empresa en Meta

Meta exige que la empresa exista antes de dejarla mandar mensajes automáticos.
En `business.facebook.com` → Configuración → Verificación de empresa. Piden
documentos de la sociedad (RUT o Cámara de Comercio) y suele tardar días, no
horas. **Empieza por aquí porque es lo único que no depende de nadie más.**

### 2 · Aceptar que el número sale del celular

Al conectar la línea a la Cloud API, **WhatsApp Business deja de funcionar en ese
teléfono para ese número.** No es reversible en la práctica.

No pierdes nada que importe: el bot atiende, y a ti te llegan las escaladas por
Telegram con el hilo completo. Pero es una decisión tuya y hay que tomarla
sabiendo eso.

### 3 · Un servidor donde viva

Un contenedor pequeño, unos **USD 5–7 al mes**. Necesita estar prendido siempre y
tener una dirección pública con HTTPS, porque Meta le empuja los mensajes ahí.

**No va en el Mac mini de los bots de trading.** Un servicio de cara al público
en la misma máquina que la infraestructura de dinero es pedir un incidente.

## Cuando esas tres estén, se prende con esto

```bash
export WA_TOKEN=...            # token permanente de la app de Meta
export WA_PHONE_ID=...         # id del número emisor (lo da Meta, no es el teléfono)
export WA_VERIFY=torq2026      # una clave que inventas; se la das a Meta al registrar
export WA_APP_SECRET=...       # secreto de la app; valida que los mensajes sean de Meta
export TG_TOKEN=...            # bot de Telegram para los avisos
export TG_CHAT=...             # tu chat de Telegram
export ANTHROPIC_API_KEY=...   # opcional: el intérprete

node --no-warnings servidor/servidor.js
```

Al arrancar dice en la consola qué tiene y qué le falta. `GET /salud` responde lo
mismo en JSON.

En Meta se registra el webhook apuntando a `https://tu-servidor/webhook`, con la
clave de `WA_VERIFY`, y se suscribe al campo **messages**.

## Cómo está armado

Cada mensaje entrante pasa por siete pasos, en este orden y por estas razones:

| | Paso | Por qué existe |
|---|---|---|
| 1 | **Firma** | Sin esto, cualquiera que descubra la dirección le hace decir lo que quiera al bot |
| 2 | **Repetido** | Meta reintenta si tardamos en responder. Sin control, el cliente recibe la misma respuesta tres veces |
| 3 | **Memoria** | Se recupera el estado del chat. Sin esto, el bot saluda igual en el mensaje 1 que en el 9 |
| 4 | **Reglas** | El motor. Los guardarraíles ganan siempre, sin consultar a nadie |
| 5 | **Intérprete** | Solo si las reglas no entendieron. Y solo para **elegir el tema** |
| 6 | **Responder** | Se envía por la API |
| 7 | **Escalar** | Registra el lead y avisa a Telegram con el hilo |

### La regla que sostiene todo: la IA entiende, no responde

El modelo nunca escribe lo que lee el cliente. Cuando las palabras clave no
reconocen un mensaje —*"oiga y esa vaina toca enchufarla o qué"*— se le pregunta
al modelo **a cuál tema se parece**, y devuelve un identificador de una lista
cerrada. El texto sale siempre de la base de conocimiento.

Un modelo que redacta sobre carros inventa cifras. Un precio inventado o una
fecha de entrega prometida rompe la relación con Corautos y expone bajo la Ley
1480. Un modelo que solo clasifica no puede inventar: o acierta el tema, o dice
que no sabe y la conversación pasa a un humano.

Si no hay llave de API, el sistema funciona igual con las reglas solas.

## Los archivos

| Archivo | Qué es |
|---|---|
| `servidor.js` | El webhook, el envío y el orden de los siete pasos |
| `almacen.js` | SQLite: conversaciones, mensajes y leads |
| `interprete.js` | La IA que clasifica, y nada más |
| `prueba-punta-a-punta.js` | Las 25 verificaciones |
| `datos/torq.db` | La base. **No se sube al repositorio** |

## Dos defectos que encontró la prueba y ya están corregidos

Vale la pena dejarlos escritos, porque los dos eran invisibles leyendo el código:

1. **El bot olvidaba cuántas veces seguidas no había entendido.** Como la sesión
   se rearma en cada mensaje, el contador volvía a cero y nunca llegaba a los tres
   intentos. Un cliente confundido se quedaba dando vueltas para siempre sin que
   nadie lo rescatara. Ahora ese contador se guarda con la conversación.
2. **Decía "el MAGE".** Es la MAGE. Cada vehículo lleva su artículo.
