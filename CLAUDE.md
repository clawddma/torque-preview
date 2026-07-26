# TORQUE

Motor de generación de leads calificados para el sector automotriz colombiano.
Socios: Daniel Mesa (tecnología, datos, growth) y Camilo (industria automotriz).
Primer aliado: Corautos Andino (Dongfeng). Piloto: MAGE HEV.

**Lee `CONTEXTO.md` antes de tocar nada.** Ahí está el modelo de negocio, la
matemática de la comisión, los nombres ya descartados y por qué, los datos de
mercado, los hallazgos del tablero y los pendientes legales.

## Estructura

| Archivo | Qué es |
|---|---|
| `index.html` | Showroom de la MAGE HEV |
| `analitica.html` | Inteligencia de mercado (mapa, matriz de oportunidad, series) |
| `img/` | 9 fotos optimizadas a 1400px |
| `CONTEXTO.md` | Traspaso completo del proyecto |

Se publica en GitHub Pages: https://clawddma.github.io/torque-preview/

## Reglas de este repo

- **Cero dependencias externas.** Nada de CDN, nada de frameworks. Todo el SVG
  está escrito a mano. Si necesitas un gráfico, lo dibujas; no importas librerías.
- **HTML monolítico**, un archivo por página, estilos en un `<style>` al inicio.
- **Español de Colombia.** Miles con punto, decimales con coma ($109.000.000, 4,9 L).
- **Marca provisional.** TORQUE no está cerrado. Está aislado en el `<div class="logo">`
  del nav y en el footer de cada página — cambiarlo debe ser editar esos dos puntos.
- **`noindex` en todas las páginas.** Esto es material de revisión interna, no
  producción. No quitar el meta hasta resolver los pendientes legales de `CONTEXTO.md`.

## Línea gráfica

Fondo `#08090a`, superficie `#0e1013`, texto `#fafafa`, acento lima `#c8f24a`.
Tipografía de sistema, pesos altos, tracking negativo en titulares.
Referencias: Polestar, Zeekr, configurador de Porsche. Nunca estética de concesionario.

**El lima es solo interfaz** — botones, filtros activos, eyebrows. Nunca codifica datos.
Los colores de datos son la paleta validada para fondo oscuro:
`#3987e5` (azul), `#d95926` (naranja), `#199e70` (aqua), y la rampa secuencial azul
`#cde2fb → #184f95`. Si agregas un gráfico, usa esos y no inventes colores.

## Lenguaje

Regla madre: **nunca nombres el miedo, ni siquiera para negarlo.** "No te quedes sin
respaldo" instala la duda que no estaba. El miedo se responde con un hecho verificable
que lo vuelve irrelevante, no con adjetivos ni con promesas.

El comprador de una marca china no teme el taller: teme quedarse solo. Toda palabra que
presuponga una falla trabaja en su contra.

| No uses | Por qué | Usa |
|---|---|---|
| reparar, arreglar | presupone que se dañó | atender, cuidar, mantener |
| taller | lugar al que se va cuando algo salió mal | centro de servicio, servicio |
| falla, avería, problema, daño | escribe la escena que él teme | (no se menciona) |
| posventa | jerga interna del gremio | acompañamiento, respaldo |
| "no te preocupes", "tranquilo" | la negación activa la preocupación | un número concreto |
| "unidades limitadas", "última oportunidad" | presión sin prueba; riesgo Ley 1480 | "sujeto a disponibilidad" |

Cifras antes que adjetivos. "26 centros de servicio" convence; "amplia red de respaldo"
no dice nada y no se puede verificar.

Nada que insinúe que ir a la sala del aliado es un fastidio: Corautos es el socio, no
el obstáculo. TORQUE resuelve antes de la visita, no en lugar de la visita.

Toda afirmación en condicional cuando el hecho lo es (`pasaría`, `podrías`), en
indicativo cuando está probado. Un condicional mal puesto es una promesa.

## Datos

Todas las cifras salen de fuentes citadas al pie de cada página (Fenalco-ANDI y Sufi,
junio 2026, sobre datos RUNT). **No estimar ni interpolar.** Si un dato no existe en
la fuente, se dice que no existe — por ejemplo, no hay desglose de híbridos y
eléctricos por departamento, y el tablero lo declara explícitamente.

## Publicar

```bash
git add -A && git commit -m "mensaje" && git push
```

GitHub Pages tarda 1–2 minutos en reconstruir. Verifica con `curl -o /dev/null -w "%{http_code}"`
antes de pasarle un enlace a alguien.

Los archivos fuente pesados (3 PDFs de mercado, 50 fotos originales, script de
empaquetado `build_artifact.py`) viven fuera de este repo, en
`~/braindma/proyectos/Mobility now/torque/`. Una sesión en la nube no los tiene.
