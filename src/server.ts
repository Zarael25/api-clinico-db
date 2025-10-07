/**
 * Descripción:
 *   Punto de entrada del servidor.
 *   Soporta ejecución local con `app.listen()`
 *   y modo serverless para Vercel exportando la app.
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
const port = app.get('port') || 3000

// ------------------ Detección de entorno ------------------
const isVercel = process.env.VERCEL === '1' || process.env.NOW_REGION

// ------------------ Inicio del servidor ------------------
if (!isVercel) {
  // Modo local o Render/Railway/Docker
  app.listen(port, '0.0.0.0', () => {
    debug(`Listening on http://localhost:${port}`)
  })
}

// Exportar la app para Vercel (modo serverless)
export default app