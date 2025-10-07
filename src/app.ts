/**
 * Descripción:
 *   Archivo principal de configuración del servidor Express.
 *   Inicializa middlewares globales, seguridad, CORS,
 *   logging, Passport (autenticación) y rutas de la API.
 *
 * Características:
 *   - Seguridad con Helmet (oculta tecnología y políticas CSP).
 *   - Logging de peticiones con Morgan en modo dev.
 *   - Soporte JSON y URL-encoded en requests.
 *   - Configuración de Passport con estrategias Local y JWT.
 *   - Control de CORS con whitelist dinámica y preflight OPTIONS.
 *   - Rutas base: `/v1` (API versionada).
 *   - Ruta raíz `/` devuelve metadatos del proyecto.
 *   - Manejo centralizado de errores con Boom y middleware custom.
 *
 * Uso:
 *   - Importado en `server.ts` para ejecutar `app.listen(port)`.
 *   - Ejecutar en desarrollo con: `npm run dev` o `pnpm dev`.
 *   - Endpoints disponibles bajo: `https://api-clinico-db.vercel.app/v1/...`
 */

import boom from '@hapi/boom'
import cors from 'cors'
import express, { Application, json, urlencoded, Request, Response, NextFunction } from 'express'
import fs from 'fs'
import helmet from 'helmet'
import morgan from 'morgan'
import passport from 'passport'

import './database/connection'
import EnvManager from './config/EnvManager'
import errorHandler from './middlewares/errorHandler'
import v1 from './routes/v1'
import localStrategy from './routes/v1/auth/localStrategy'
import jwtStrategy from './routes/v1/auth/jwtStrategy'

const app: Application = express()
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
const port = EnvManager.getPort() ?? 3000

// ------------------ Configuración inicial ------------------
app.disable('x-powered-by')
app.set('pkg', pkg)
app.set('port', port)

// ------------------ Middlewares globales ------------------
app.use(json())
app.use(urlencoded({ extended: true }))
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(morgan('dev'))

// ------------------ Passport ------------------
app.use(passport.initialize())
passport.use(localStrategy)
passport.use(jwtStrategy)

// ------------------ Configuración CORS ------------------
const whitelist: string[] = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://192.168.1.101:4000',
  'http://localhost:4000',
  'https://don-bosco-clinico.vercel.app',
  'https://api-clinico-db.vercel.app',
  'https://web-clinico-db.vercel.app', // frontend desplegado en Vercel
]

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    const allowed = whitelist.some((url) =>
      origin.toLowerCase().startsWith(url.toLowerCase()),
    )
    allowed
      ? callback(null, true)
      : callback(new Error('CORS no permitido para este origen'))
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  exposedHeaders: ['Authorization', 'Content-Disposition'],
  credentials: true,
  optionsSuccessStatus: 204,
}

// ✅ Middleware global CORS
app.use(cors(corsOptions))

// ✅ Preflight OPTIONS global (Express 5 compatible)
app.options(/.*/, cors(corsOptions))

// ✅ Reforzar headers CORS en respuestas válidas
app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin && whitelist.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Credentials', 'true')
  }
  next()
})

// ✅ Reforzar CORS en todas las respuestas de error también
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin
  const allowed = whitelist.some((url) =>
    origin?.toLowerCase().startsWith(url.toLowerCase()),
  )

  if (allowed) {
    res.header('Access-Control-Allow-Origin', origin!)
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    )
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }
  next(err)
})

// ✅ Manejador de errores CORS (antes del errorHandler)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err && err.message.includes('CORS')) {
    console.warn('❌ Bloqueado por CORS:', req.headers.origin)
    return res.status(403).json({
      error: {
        name: 'CORS_BLOCKED',
        message: 'Origen no autorizado por CORS',
        code: 'ERR_CORS',
      },
      code_response: 0,
    })
  }
  next(err)
})

// ------------------ Ruta raíz ------------------
app.get('/', (_req, res) => {
  res.json({
    environment: EnvManager.getNodeEnv(),
    name: pkg.name,
    version: pkg.version,
    message: 'Welcome to my API: Don Bosco Clínico',
    description: pkg.description,
    repository: pkg.repository.url,
    bugs: pkg.bugs.url,
    license: pkg.license,
    homepage: pkg.homepage,
    keywords: pkg.keywords,
  })
})

// ------------------ Rutas API v1 ------------------
app.use('/v1', v1)

// ------------------ Manejo de rutas inexistentes ------------------
app.use((_req, res) => {
  const {
    output: { statusCode, payload },
  } = boom.notFound('Página no encontrada')
  res.status(statusCode).json(payload)
})

// ------------------ Manejo centralizado de errores ------------------
app.use(errorHandler)

export default app
