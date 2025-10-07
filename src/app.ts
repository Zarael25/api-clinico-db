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
import express, { Application, json, urlencoded } from 'express'
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
app.disable('x-powered-by') // Seguridad extra: oculta cabecera de tecnología
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
    // Permitir peticiones sin origen (como en tests o preflight OPTIONS)
    if (!origin) return callback(null, true)

    // Comparar sin distinción de mayúsculas/minúsculas
    const allowed = whitelist.some((url) =>
      origin.toLowerCase().startsWith(url.toLowerCase()),
    )

    if (allowed) {
      callback(null, true)
    } else {
      console.warn('🚫 CORS bloqueado para:', origin)
      callback(null, false) // ✅ no lanzamos error, solo rechazamos
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  exposedHeaders: ['Authorization', 'Content-Disposition'],
  credentials: true,
  optionsSuccessStatus: 204, // evita errores con preflight OPTIONS
}

// Middleware global y soporte para preflight requests
app.use(cors(corsOptions))

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
