/**
 * Descripción:
 *   Punto de entrada del servidor. 
 *   Inicia la aplicación Express definida en `app.ts`
 *   y la expone en el puerto configurado.
 *
 * Características:
 *   - Usa `debug` para logs de inicio (namespace: "app:server").
 *   - Obtiene el puerto desde `app.get('port')` (configurado en `app.ts`).
 *   - Escucha en `0.0.0.0` para permitir conexiones externas (LAN/producción).
 *
 * Uso:
 *   - Ejecutar con `ts-node src/server.ts` o con un script de npm (`npm run dev`).
 *   - En producción, normalmente es levantado por PM2, Docker o similar.
 *   - API disponible en: http://localhost:<port>/v1
 */
import Debug from 'debug'
import app from './app'

// ------------------ Configuración Debug ------------------
const debug = Debug('app:server')

// ------------------ Puerto del servidor ------------------
const port = app.get('port')

// ------------------ Inicio del servidor ------------------
app.listen(port, '0.0.0.0', () => {
  debug(`Listening http://localhost:${port}`)
})
