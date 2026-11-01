# Panel de Óscar (oscaromargp.xyz/panel)

Panel de estado del **enjambre**: qué hace cada equipo, qué procesos corren, qué agentes están
trabajando y en qué va cada pendiente. HTML plano servido por el WordPress del VPS desde
`/var/www/html/panel/`. Los datos llegan por `fetch` desde los JSON de esta misma carpeta.

## Para qué existe

Óscar lo pidió así: *«me es importante ver qué está pasando»*. El panel no es un tablero
bonito: es la única forma que tiene de saber si el enjambre está trabajando o caído.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | portada del panel: tarjetas de estado por equipo, pendientes y accesos |
| `consola.html` | consola del enjambre: procesos por equipo y agentes trabajando |
| `estado.html` | estado detallado del sistema |
| `bitacora.html` | bitácora de actividad |
| `estado-enjambre.json` | CPU, RAM, disco, carga por equipo — **lo escribe `estado-enjambre.sh` cada 5 min** |
| `eventos.json` | eventos del enjambre |
| `progreso.json`, `trabajos.json` | avance de trabajos en curso |

## Problemas conocidos (1-nov-2026)

1. **RESUELTO — el panel mostraba datos de septiembre.** `estado-enjambre.sh` escribía en
   `/var/www/html/estado-enjambre.json` (raíz) mientras el panel lee
   `/panel/estado-enjambre.json`. Eran dos archivos distintos: el script reportaba éxito y el
   navegador seguía viendo el de semanas atrás. Corregida la ruta del script el 1-nov-2026.
   **Regla:** cuando un dato del panel no cambia, comparar la ruta donde escribe el generador
   contra la que pide el `fetch`. No basta con que el cron diga OK.
2. **`progreso.json` y `trabajos.json` siguen sin generador activo** (última escritura 25-oct).
3. **Falta `estado-bitacora.json`** actualizado (27-sep).

## Rediseño pendiente (pedido de Óscar, 1-nov-2026)

- **Portada menos pesada:** el scroll es largo y se ve cargado. Ordenar en **módulos, bloques o
  pestañas**.
- **Métricas de administración reales:** estado, procesador, RAM, VRAM, disco, y qué medio está
  conectado (Drive, OneDrive, Google, Facebook). Debe verse el estado del sistema para trabajar.
- **Si algo se cae, que se vea:** que se note que hay falla, que se está corrigiendo y que quedó
  resuelto. Nada de fallas silenciosas.
- **Qué hace cada equipo:** qué procesos corre y si hay agentes trabajando, para saber qué se
  levanta o se prende para seguir con los pendientes.
- **Consola:** hoy el diseño está cargado, bloques montados uno sobre otro y poca letra legible;
  debe verse al detalle qué pasa en cada equipo.

## Reglas de trabajo

- Nada de datos inventados: si un equipo no responde, la tarjeta dice **sin conexión**, no un
  cero.
- Un dato con más de 15 minutos de antigüedad se marca como viejo en pantalla.
- Los cambios se prueban contra los JSON reales del VPS antes de publicar.
