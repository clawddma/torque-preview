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

Video Vigo en móvil corregido: causa real era autoplay muteado bloqueado por ahorro de batería/datos; botón de play manual en las 4 páginas de producto. Hero decluttering estilo Dongfeng NZ, submenú pegajoso y 404 de `subnav.js` resueltos y confirmados en producción. Home: pixelado de galería resuelto de raíz — no era por fotos ampliadas, sino porque el pipeline topaba el ancho servido en 1.920 px por diseño; corrido completo desde originales de 6.000 px, `srcset`/`sizes` actualizados y verificados. Acceso a torq.bellapop.co resuelto (usuario Daniel, confirmado). Llegó carpeta nueva "Fotos Dongfeng HEV" (141 fotos, Mage/Huge ext./int., ~1,5 GB), compartida hoy por solanomolina@gmail.com — distinta de `DONGFENG EV`, sin revisar.

**Pendiente**

Confirmación del usuario sobre si el hero cumple el estándar aspiracional (paisaje, montañas) de Kia/Tesla/BMW/Audi/Mercedes. Re-muestreo de colores tras recorte de tarjetas (Box), sin confirmar empalme. Enviar a Camilo la lista de 17 fotos faltantes. Guardar la contraseña de torq.bellapop.co, mostrada solo una vez. Revisar y clasificar las 141 fotos nuevas de "Fotos Dongfeng HEV".

**Próximo paso**

Confirmar con el usuario si el hero actualizado satisface el estándar aspiracional antes de seguir con el re-muestreo de colores.
<!-- SESION:END -->
