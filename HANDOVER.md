# HANDOVER — torque-preview

> Qué hacer si esto se cae.

<!-- VIVO:BEGIN -->
## Cómo revivirlo

> Regenerado cada noche. Son los comandos reales de este proyecto, leídos de los LaunchAgents instalados.


**Comprobar que responde:**
```bash
lsof -ti :8790   # quién escucha
curl -sI https://torq.bellapop.co | head -1
lsof -ti :8790   # quién escucha
curl -sI https://torque.bellapop.co | head -1
lsof -ti :8795   # quién escucha
curl -sI https://torque.themesa.co | head -1
lsof -ti :8795   # quién escucha
curl -sI https://showroom.bellapop.co | head -1
```

Si el puerto responde local pero la URL no, el problema es el túnel:
```bash
launchctl list | grep -i cloudflared
```
<!-- VIVO:END -->

---

<!-- SESION:BEGIN -->
**Qué se hizo**

Home: se sacaron las 5 escenas "de la calle" (fotogramas de video, sin emoción) y el hero se reconstruyó con 2 fotos de estudio en alta resolución, foto y texto siempre en planos separados. Vigo: hero pixelado corregido con fotogramas de mayor emoción. Hallazgo sobre el propio testing: el headless reportaba 500px de ancho aunque se pidieran 390 — las capturas "móviles" previas eran falsas; corregido con banco de iframe real, reverificado en 7 páginas × 4 anchos × 390px reales, sin solapamientos ni desbordes. Paralaje del hero (vigo/mage/huge/e70) derramaba la foto hasta 151px sobre la franja de cifras (solo 30-56px de aire) — eliminado, junto con código muerto en `efectos.js`. Contraste extendido a páginas de producto: `--mut` sin margen contra nav/chips/fichas/precios tachados en ambos temas, corregido; igual `--paper` en `simulador.html`. Inventario Camilo corregido: las 34 fotos del zip ya están en alta (4.000-6.200px); faltan 17 puntuales (artifact entregado). Push y verificación en vivo confirmadas (9dc4cfd→5e9a440).

**Pendiente**

Re-muestreo de colores de campo tras el recorte de tarjetas (Box), sin confirmar empalme. Enviar a Camilo la lista de 17 fotos.

**Próximo paso**

Cerrar el re-muestreo de colores de campo y verificar el empalme en las tarjetas recortadas.
<!-- SESION:END -->
