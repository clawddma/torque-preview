#!/bin/bash
# Procesa las fotos originales de Corautos a los derivados que sirve el sitio.
#
#   ./build-img.sh <carpeta-con-las-fotos-originales>
#
# Solo usa sips y cwebp, que ya vienen/estan en el Mac. Sin npm, sin servicios.
# Reprocesar es seguro: sobreescribe siempre a partir del original.
#
# De cada foto salen:
#   <nombre>-640.webp .. -2560.webp   los anchos que consume el srcset
#   <nombre>.jpg                      respaldo unico para navegador sin webp
#   t-<nombre>.jpg                    miniatura de 400px para las tiras
# Y al final img/lqip.json, con el desenfoque de 20px de cada foto en base64
# para incrustarlo en el HTML: la foto aparece al instante y sin peticion extra.

set -euo pipefail
SRC="${1:-}"
[ -z "$SRC" ] && { echo "uso: ./build-img.sh <carpeta-fotos>"; exit 1; }
[ -d "$SRC" ] || { echo "no existe: $SRC"; exit 1; }
command -v cwebp >/dev/null || { echo "falta cwebp (brew install webp)"; exit 1; }

RAIZ="$(cd "$(dirname "$0")" && pwd)"
IMG="$RAIZ/img"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Reducir una foto pierde acutancia y hay que devolverla. Este es el paso que
# decide si la foto se ve nitida o pastosa, y el que estaba mal:
#
#   sips --resampleWidth  ablanda. Una foto de 5.847px bajada a 2.560 salia
#     con los bordes lavados -medido: PSNR 39,0 contra 35,2 de lanczos-. A
#     tamano completo en el carrusel eso se ve como pixelado.
#   lanczos  conserva el filo al reducir. Cuesta ~20% mas de peso.
#   unsharp 0.5  devuelve la acutancia que se pierde al reducir. Se probaron
#     0,4 · 0,6 · 1,0 mirando la llanta al 100%: en 1,0 aparecen halos en el
#     borde de los rines, que se ven peor que la foto blanda. 0,5 no.
reducir() {   # <origen> <ancho> <destino.png>
  ffmpeg -nostdin -v error -y -i "$1" \
    -vf "scale=$2:-2:flags=lanczos,unsharp=3:3:0.5" "$3"
}

# El hero se sirve hasta 2560 porque ocupa el ancho completo en pantalla grande.
# El resto no pasa de 1920: vive dentro de un marco que nunca es mas ancho.
ANCHOS_HERO="640 1280 1920 2560"
ANCHOS_GAL="640 1280 1920"

# origen relativo a $SRC | destino img/<modelo>/<nombre> | hero?
#
# Los nombres salen de mirar las fotos una por una. El orden del archivo
# original no dice nada del angulo, y equivocarlo se ve en la galeria.
MANIFIESTO=$(cat <<'FIN'
BOX/AZUL/BOX AZUL 2.jpg|box/azul-tresq|hero
BOX/AZUL/BOX AZUL 1.jpg|box/azul-tresq-izq|gal
BOX/AZUL/BOX AZUL 3.jpg|box/azul-lateral|gal
BOX/AZUL/BOX AZUL 4.jpg|box/azul-trasera|gal
BOX/BLANCO/BOX BLANCO 2.jpg|box/blanco-tresq|hero
BOX/BLANCO/BOX BLANCO 1.jpg|box/blanco-tresq-izq|gal
BOX/BLANCO/BOX BLANCO 3.jpg|box/blanco-lateral|gal
BOX/BLANCO/BOX BLANCO 4.jpg|box/blanco-trasera|gal
BOX/GRIS/BOX GRIS 2.jpg|box/gris-tresq|hero
BOX/GRIS/BOX GRIS 1.jpg|box/gris-tresq-izq|gal
BOX/GRIS/BOX GRIS 3.jpg|box/gris-lateral|gal
BOX/GRIS/BOX GRIS 4.jpg|box/gris-trasera|gal
VIGO E2/VIGO E2 4.jpg|vigo/e2-tresq|hero
VIGO E2/VIGO E2 1.jpg|vigo/e2-frontal|gal
VIGO E2/VIGO E2 3.jpg|vigo/e2-lateral|gal
VIGO E2/VIGO E2 2.jpg|vigo/e2-trasera|gal
VIGO E2/VIGO E2 5.jpg|vigo/e2-interior|gal
VIGO E2+/VIGO E2+ 4.jpg|vigo/e2mas-tresq|hero
VIGO E2+/VIGO E2+ 1.jpg|vigo/e2mas-frontal|gal
VIGO E2+/VIGO E2+ 3.jpg|vigo/e2mas-lateral|gal
VIGO E2+/VIGO E2+ 2.jpg|vigo/e2mas-trasera|gal
MAGE/MAGE 2.jpg|mage/tresq|hero
MAGE/MAGE 1.jpg|mage/frontal|gal
MAGE/MAGE 3.jpg|mage/trasera|gal
MAGE/MAGE 4.jpg|mage/baul|gal
MAGE/MAGE 5.jpg|mage/interior|gal
HUGE/HUGE 2.jpg|huge/tresq|gal
HUGE/HUGE 1.jpg|huge/frontal|gal
HUGE/HUGE 3.jpg|huge/lateral|hero
HUGE/HUGE 4.jpg|huge/baul|gal
E70/E70 2.jpg|e70/tresq|gal
E70/E70 1.jpg|e70/frontal|gal
E70/E70 3.jpg|e70/trasera|gal
E70/E70 4.jpg|e70/tresq-tras|hero
FIN
)

echo "→ procesando en $IMG"
LQIP="$TMP/lqip.parts"; : > "$LQIP"
n=0

while IFS='|' read -r origen destino tipo; do
  [ -z "$origen" ] && continue
  fuente="$SRC/$origen"
  if [ ! -f "$fuente" ]; then echo "  ⚠ falta: $origen"; continue; fi

  mkdir -p "$IMG/$(dirname "$destino")"
  base="$IMG/$destino"
  nombre="$(basename "$destino")"
  carpeta="$(dirname "$destino")"

  if [ "$tipo" = "hero" ]; then anchos="$ANCHOS_HERO"; else anchos="$ANCHOS_GAL"; fi

  # El original puede ser mas angosto que el ancho mas grande de la lista.
  # Ampliarlo no agrega detalle, solo peso: se salta.
  wsrc=$(sips -g pixelWidth "$fuente" | tail -1 | tr -dc '0-9')

  for w in $anchos; do
    [ "$w" -gt "$wsrc" ] && continue
    reducir "$fuente" "$w" "$TMP/w.png"
    cwebp -quiet -metadata none -q 82 -m 6 -sharp_yuv "$TMP/w.png" -o "${base}-${w}.webp"
  done

  # Respaldo unico en jpeg. El srcset de webp cubre el 97% de los navegadores;
  # este archivo es para el 3% restante y no necesita variantes.
  reducir "$fuente" 1280 "$TMP/j.png"
  ffmpeg -nostdin -v error -y -i "$TMP/j.png" -q:v 3 "${base}.jpg"

  # Miniatura para la tira de la galeria.
  reducir "$fuente" 400 "$TMP/t.png"
  ffmpeg -nostdin -v error -y -i "$TMP/t.png" -q:v 4 "$IMG/$carpeta/t-$nombre.jpg"

  # Desenfoque de arranque: 24px de ancho, incrustado en el HTML como data:.
  # En webp, no en jpeg: sips le mete un perfil de color de 5 KB a una imagen
  # que deberia pesar 200 bytes, y eso engorda cada pagina 30 veces sin motivo.
  cwebp -quiet -metadata none -q 45 -resize 24 0 "$fuente" -o "$TMP/lq.webp"
  b64=$(base64 -i "$TMP/lq.webp" | tr -d '\n')
  alto=$(sips -g pixelHeight "$fuente" | tail -1 | tr -dc '0-9')
  printf '  "%s": {"w":%s,"h":%s,"lqip":"data:image/webp;base64,%s"}\n' \
         "$destino" "$wsrc" "$alto" "$b64" >> "$LQIP"

  n=$((n+1)); printf "  %-24s %s\n" "$destino" "${wsrc}px"
done <<< "$MANIFIESTO"


# ── EL CARRUSEL DE LA PORTADA ───────────────────────────────────────────────
# Las tres bandas de apertura estaban infladas desde fotos de 1.280px -las que
# llegaron por WhatsApp- hasta 3.840. Ampliar no agrega detalle: agrega peso y
# se ve pastoso, que es justo lo que Daniel vio. Ahora salen de los originales
# de Corautos, que si tienen la resolucion.
#
# La banda es 16:9. La Vigo ya viene en esa proporcion y entra tal cual; el
# Box y la Mage son 3:2 y hay que recortarles arriba y abajo, con el encuadre
# corrido para no cortarle el techo ni las llantas al carro.
#
#   destino | origen | recorte (posicion vertical del recorte 16:9)
CARRUSEL=$(cat <<'FIN'
vigo|VIGO E2+/VIGO E2+ 4.jpg|0.5
box|BOX/AZUL/BOX AZUL 2.jpg|0.52
mage|MAGE/MAGE 2.jpg|0.46
FIN
)

echo "→ carrusel de la portada"
mkdir -p "$IMG/carr"
while IFS='|' read -r dest origen corte; do
  [ -z "$dest" ] && continue
  fuente="$SRC/$origen"
  [ -f "$fuente" ] || { echo "  ⚠ falta: $origen"; continue; }

  # -d 2560 y -d2x 3840 para pantallas retina; -m es la vertical de movil.
  for par in "d:2560:1440" "d2x:3840:2160" "m:1200:1600"; do
    suf="${par%%:*}"; resto="${par#*:}"; aw="${resto%%:*}"; ah="${resto##*:}"
    ffmpeg -nostdin -v error -y -i "$fuente" -vf \
      "scale=${aw}:${ah}:force_original_aspect_ratio=increase:flags=lanczos,crop=${aw}:${ah}:(iw-${aw})/2:(ih-${ah})*${corte},unsharp=3:3:0.5" \
      "$TMP/c.png"
    cwebp -quiet -metadata none -q 82 -m 6 -sharp_yuv "$TMP/c.png" -o "$IMG/carr/${dest}-${suf}.webp"
    ffmpeg -nostdin -v error -y -i "$TMP/c.png" -q:v 3 "$IMG/carr/${dest}-${suf}.jpg"
  done
  printf "  %-6s desde %s\n" "$dest" "$origen"
done <<< "$CARRUSEL"


# ── FOTOS HEREDADAS DE LA MAGE ──────────────────────────────────────────────
# Los detalles de cabina de la Mage -tablero, volante, controles- no vinieron
# en el envio nuevo, y las copias que estaban publicadas en el repo eran las
# reducidas: 933 a 1.400px cuando el original guardado afuera tiene 1.334 a
# 2.000. Se estaban sirviendo un 43% mas pequenas de lo que existia.
HEREDADAS="$RAIZ/../torque/img"
if [ -d "$HEREDADAS" ]; then
  echo "→ detalles de cabina de la Mage"
  for d in 5 6 7 8; do
    f="$HEREDADAS/g$d.jpg"
    [ -f "$f" ] || continue
    w=$(sips -g pixelWidth "$f" | tail -1 | tr -dc '0-9')
    for a in 640 1280; do
      [ "$a" -gt "$w" ] && continue
      reducir "$f" "$a" "$TMP/h.png"
      cwebp -quiet -metadata none -q 82 -m 6 -sharp_yuv "$TMP/h.png" -o "$IMG/mage/detalle$d-$a.webp"
    done
    reducir "$f" $([ "$w" -lt 1280 ] && echo "$w" || echo 1280) "$TMP/h.png"
    ffmpeg -nostdin -v error -y -i "$TMP/h.png" -q:v 3 "$IMG/mage/detalle$d.jpg"
    reducir "$f" 400 "$TMP/h.png"
    ffmpeg -nostdin -v error -y -i "$TMP/h.png" -q:v 4 "$IMG/mage/t-detalle$d.jpg"
    printf "  detalle%s  %spx\n" "$d" "$w"
  done
fi

{ echo "{"; sed '$!s/$/,/' "$LQIP"; echo "}"; } > "$IMG/lqip.json"

echo "→ $n fotos · peso total de img/: $(du -sh "$IMG" | cut -f1)"
echo "→ img/lqip.json escrito"
