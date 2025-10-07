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
 */

import boom from '@hapi/boom'
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

// ✅ Middleware CORS completamente manual
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin
  const allowed =
    origin &&
    whitelist.some((url) =>
      origin.toLowerCase().replace(/\/$/, '').startsWith(url.toLowerCase()),
    )

  console.log('🌐 Solicitud desde:', origin)

  if (allowed) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Credentials', 'true')
    console.log('✅ CORS permitido para:', origin)
  } else if (origin) {
    console.warn('🚫 CORS bloqueado para:', origin)
  }

  res.header(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  )
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type')

  // ✅ Si es preflight OPTIONS, responder inmediatamente
  if (req.method === 'OPTIONS') {
    console.log('🟢 Respondiendo preflight CORS desde:', origin)
    return res.sendStatus(200)
  }

  next()
})
// ------------------ Ruta raíz ------------------
app.get('/', (_req, res) => {
  res.json({
    environment: EnvManager.getNodeEnv(),
    name: pkg.name,
    version: pkg.version,
    message: 'Welcome to my API: Don Bosco Clínico',
  })
})

// ------------------ Rutas API v1 ------------------
app.use('/v1', v1)

// ------------------ Rutas inexistentes ------------------
app.use((_req, res) => {
  const { output } = boom.notFound('Página no encontrada')
  res.status(output.statusCode).json(output.payload)
})

// ------------------ Manejo de errores ------------------
app.use(errorHandler)

export default app
