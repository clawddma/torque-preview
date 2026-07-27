# TORQ — Base de leads y CRM

> Cómo conectar `index.html`, `crm.html` y `leads.html` a una hoja de cálculo
> real, sin servidor propio. Actualizado: 27 de julio de 2026.

## Qué hace esto

| Pieza | Papel |
|---|---|
| `index.html` | **Escribe.** Cada lead que sale hacia WhatsApp cae en la hoja |
| `crm.html` | **Trabaja.** Pipeline, seguimiento, notas, teléfono, SLA. Lee y escribe |
| `leads.html` | **Reporta.** Tabla plana y descarga para enviar a Corautos. Solo lee |
| Google Sheets | La base de datos. Editable a mano cuando haga falta |

Un solo Apps Script (gratis, de Google) atiende las tres: recibe leads nuevos,
devuelve la lista y guarda los cambios del CRM.

## Paso 1 · Crear la hoja

1. Hoja nueva en Google Sheets, llamada **TORQ — Leads**.
2. Renombra la primera pestaña a **Leads** (el nombre importa).
3. En la fila 1, estas columnas exactas, en este orden:

   ```
   ID | Fecha | Nombre | Teléfono | Ciudad | Compra | Pago | Retoma | Vehículo | Campaña | Estado | Entregado | Contactado | Próximo paso | Seguimiento | Notas | Actualizado
   ```

   `Entregado` y `Contactado` son sellos de tiempo: la distancia entre los dos
   **es el SLA de la sala**, el dato con el que vas a negociar esa cláusula del
   contrato. No los llenes a mano; el CRM los pone solo al mover la tarjeta.

## Paso 2 · El script

1. En la hoja: *Extensiones → Apps Script*.
2. Borra todo y pega esto tal cual:

   ```javascript
   var HOJA = "Leads";

   function abrir_() {
     return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA);
   }

   /* Lee: devuelve todos los leads como JSON. Se llama por JSONP desde
      crm.html, así que responde envuelto en el callback que le pidan. */
   function doGet(e) {
     var sheet = abrir_();
     var datos = sheet.getDataRange().getValues();
     var head = datos.shift();
     var leads = datos.filter(function (f) { return f[0] !== ""; })
       .map(function (f) {
         var o = {};
         head.forEach(function (h, i) {
           var v = f[i];
           o[h] = (v instanceof Date) ? v.toISOString() : String(v);
         });
         return o;
       });
     var salida = JSON.stringify({ ok: true, leads: leads });
     var cb = e && e.parameter && e.parameter.callback;
     if (cb) {
       return ContentService.createTextOutput(cb + "(" + salida + ")")
         .setMimeType(ContentService.MimeType.JAVASCRIPT);
     }
     return ContentService.createTextOutput(salida)
       .setMimeType(ContentService.MimeType.JSON);
   }

   /* Escribe: crea un lead nuevo (desde la página) o actualiza campos
      de uno existente (desde el CRM). */
   function doPost(e) {
     var sheet = abrir_();
     var d = JSON.parse(e.postData.contents);
     var head = sheet.getDataRange().getValues()[0];

     if (d.accion === "actualizar") {
       var datos = sheet.getDataRange().getValues();
       for (var i = 1; i < datos.length; i++) {
         if (String(datos[i][0]) === String(d.id)) {
           for (var campo in d.campos) {
             var col = head.indexOf(campo);
             if (col > -1) sheet.getRange(i + 1, col + 1).setValue(d.campos[campo]);
           }
           break;
         }
       }
     } else {
       var id = "L" + Utilities.formatDate(new Date(), "GMT-5", "yyMMddHHmmss");
       var fila = {
         ID: id, Fecha: new Date(), Nombre: d.nombre || "", "Teléfono": "",
         Ciudad: d.ciudad || "", Compra: d.compra || "", Pago: d.pago || "",
         Retoma: d.retoma || "", "Vehículo": d.vehiculo || "MAGE HEV",
         "Campaña": d.campana || "directo", Estado: "Nuevo",
         Entregado: "", Contactado: "", "Próximo paso": "",
         Seguimiento: "", Notas: "", Actualizado: new Date()
       };
       sheet.appendRow(head.map(function (h) { return fila[h] !== undefined ? fila[h] : ""; }));
     }
     return ContentService.createTextOutput(JSON.stringify({ ok: true }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

3. Guarda. Nombra el proyecto **TORQ Leads**.

## Paso 3 · Publicarlo

1. **Implementar → Nueva implementación**.
2. Tipo: **Aplicación web**.
3. **Ejecutar como:** tu cuenta.
4. **Quién tiene acceso:** **Cualquier usuario** — sin esto la página no puede
   escribir desde el navegador del cliente.
5. **Implementar** y autoriza (es tu cuenta entrando a tu propia hoja).
6. Copia la **URL de la aplicación web**. Termina en `/exec`.

> Cada vez que edites el script hay que **volver a implementar** (*Implementar →
> Administrar implementaciones → editar → Nueva versión*), si no sigue corriendo
> el código viejo.

## Paso 4 · Pegar la URL

Es la **misma URL** en los tres archivos:

| Archivo | Constante |
|---|---|
| `index.html` | `LEADS_URL` (junto a `var WA=`) |
| `crm.html` | `API_URL` (al inicio del `<script>`) |
| `leads.html` | `CSV_URL` — *ver nota abajo* |

`leads.html` todavía lee por CSV publicado. Si prefieres no publicar la hoja,
usa solo `crm.html`: hace lo mismo y además descarga CSV. Para dejar `leads.html`
funcionando: *Archivo → Compartir → Publicar en la Web → pestaña Leads → CSV*,
y pega ese enlace en `CSV_URL`.

Mándame las URLs y las dejo puestas, o edítalas tú: es una línea en cada archivo.

## Paso 5 · La clave

`crm.html` y `leads.html` piden una clave (`var CLAVE="torq2026"`). **Cámbiala.**
No es seguridad real —está en el código fuente—, es una barrera contra quien
entra por accidente. Adentro hay datos personales: nombre, ciudad, teléfono,
intención de compra. Aplica la Ley 1581 y tú eres el Responsable del
Tratamiento (ver `CONTEXTO.md`). Si esto crece, esta compuerta no alcanza.

## Cómo se usa el CRM

- **Mover de etapa:** arrastra la tarjeta (computador) o abre la ficha y toca la
  etapa (celular). Al pasar a *Entregado* y a *Contactado* se sellan las horas
  automáticamente; ese par es el SLA.
- **Teléfono:** no lo pide el calificador —sería fricción justo antes del
  handoff, y de todas formas la persona te escribe desde su número. Lo pegas en
  la ficha cuando escriba, y desde ahí el botón de WhatsApp queda activo.
- **Seguimiento:** fecha + qué toca hacer. Lo vencido se marca en naranja en la
  tarjeta y sube como alerta arriba.
- **Alertas:** leads entregados que llevan más de 24 h sin que la sala los
  contacte, y seguimientos vencidos. Ese primer número es el argumento del
  contrato, medido, no opinado.

## Qué NO hace todavía

- **Sin historial de cambios.** Se ve el estado actual, no quién lo movió ni
  cuándo (salvo los dos sellos del SLA). Para dos personas alcanza.
- **Escritura a ciegas.** El navegador no puede leer la respuesta de Apps
  Script, así que la pantalla se actualiza de una vez y el guardado va detrás.
  Si falla, el refresco del minuto siguiente lo revela. El lead nunca se pierde:
  llega por WhatsApp pase lo que pase.
- **Un solo vehículo.** La columna existe y el filtro ya la soporta; cuando
  entre la segunda marca no hay que tocar nada aquí.
