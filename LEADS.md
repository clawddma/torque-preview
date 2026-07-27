# TORQ — Base de leads en Google Sheets

> Cómo conectar `index.html` y `leads.html` a una hoja de cálculo real, sin
> backend propio. Actualizado: 27 de julio de 2026.

## Qué hace esto

Cada vez que alguien completa el calificador (o toca "Solo quiero preguntar
algo") y sale hacia WhatsApp, la página manda esos datos a una hoja de
Google Sheets. `leads.html` lee esa misma hoja, la deja filtrar por fecha,
estado, ciudad o vehículo, y descargar el resultado en CSV para enviarlo a
Corautos o a la casa matriz.

No hay servidor propio: Apps Script (gratis, de Google) recibe el dato y lo
escribe en la hoja; la hoja publicada como CSV es lo que `leads.html` lee.

## Paso 1 · Crear la hoja

1. Crea una hoja de cálculo nueva en Google Sheets. Nómbrala **TORQ — Leads**.
2. Renombra la primera pestaña a **Leads** (el nombre importa, el script lo busca así).
3. En la fila 1, estas nueve columnas exactas, en este orden:

   ```
   Fecha | Nombre | Ciudad | Compra | Pago | Retoma | Vehículo | Campaña | Estado
   ```

## Paso 2 · El script que recibe los leads

1. En la hoja: *Extensiones → Apps Script*.
2. Borra el contenido de `Código.gs` y pega esto:

   ```javascript
   var HOJA = "Leads";

   function doPost(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA);
     var d = JSON.parse(e.postData.contents);
     sheet.appendRow([
       new Date(),
       d.nombre || "",
       d.ciudad || "",
       d.compra || "",
       d.pago || "",
       d.retoma || "",
       d.vehiculo || "MAGE HEV",
       d.campana || "directo",
       "Nuevo"
     ]);
     return ContentService.createTextOutput(JSON.stringify({ok:true}))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

3. Guarda (ícono de disquete, o `Cmd/Ctrl+S`). Nombra el proyecto **TORQ Leads**.

## Paso 3 · Publicarlo como Web App

1. Arriba a la derecha: **Implementar → Nueva implementación**.
2. Tipo: **Aplicación web**.
3. **Ejecutar como:** tu cuenta (Daniel).
4. **Quién tiene acceso:** **Cualquier usuario** — sin esto, la página no
   puede escribir en la hoja desde el navegador del cliente.
5. **Implementar**. Google va a pedir autorizar el script — es tu propia
   cuenta accediendo a tu propia hoja, acepta.
6. Copia la **URL de la aplicación web** que te da (termina en `/exec`).

## Paso 4 · Publicar la hoja como CSV (para leerla)

1. En la hoja: **Archivo → Compartir → Publicar en la Web**.
2. En el primer selector, elige la pestaña **Leads** (no "Todo el documento").
3. En el segundo selector, elige **Valores separados por comas (.csv)**.
4. **Publicar** → confirma.
5. Copia el enlace que te da (algo como
   `https://docs.google.com/spreadsheets/d/e/2PACX.../pub?output=csv`).

## Paso 5 · Pegar las dos URLs en el código

| Dónde | Qué pegar |
|---|---|
| `index.html`, constante `LEADS_URL` (cerca de `var WA=`) | La URL del Paso 3 (`.../exec`) |
| `leads.html`, constante `CSV_URL` (dentro del `<script>`, al principio) | La URL del Paso 4 (`.../pub?output=csv`) |

Envíame las dos URLs cuando las tengas y las dejo puestas — o edítalas tú
mismo, son las dos únicas líneas a tocar en cada archivo.

## Paso 6 · La clave de `leads.html`

`leads.html` pide una clave antes de mostrar nada (`var CLAVE="torq2026"`,
al inicio del script). **Cámbiala** antes de dejar esto corriendo en serio —
la de fábrica es solo para que puedas probar. No es seguridad real (está en
el código fuente, cualquiera que lo revise la puede leer), es una barrera
contra quien entra por accidente. Los datos que hay ahí son personales
(nombre, ciudad, intención de compra) y caen bajo la Ley 1581 — tú eres el
Responsable del Tratamiento (ver `CONTEXTO.md`), así que no lo dejes como
único resguardo si esto crece.

## Qué NO hace todavía

- **No se puede cambiar el estado de un lead desde `leads.html`.** Es de
  lectura y descarga. Para pasar un lead de `Nuevo` a `Contactado`,
  `Facturado`, etc., edita la celda directo en la hoja de Google — igual la
  vas a tener abierta para revisar.
- **Si el navegador del cliente bloquea el `fetch` de registro** (algún
  bloqueador de rastreadores agresivo), el lead igual llega por WhatsApp,
  simplemente no queda en la hoja. El WhatsApp nunca depende de esto.
- Un solo vehículo hoy (columna Vehículo siempre "MAGE HEV"). Cuando entre
  una segunda marca, ese campo ya existe y el filtro de `leads.html` ya lo
  soporta — no hay que tocar nada ahí.
