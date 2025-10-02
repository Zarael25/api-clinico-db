/**
 * Descripción:
 *   Archivo principal de configuración del servidor Express.
 *   Aquí se inicializan middlewares globales, seguridad, CORS,
 *   logging, Passport (autenticación) y rutas de la API.
 *
 * Características:
 *   - Configura seguridad con Helmet (desactiva `x-powered-by`).
 *   - Manejo de logs con Morgan en modo 'dev'.
 *   - Soporte para JSON y URL-encoded en requests.
 *   - Configuración de Passport con estrategias Local y JWT.
 *   - Control de CORS con whitelist personalizada.
 *   - Rutas base: `/v1` (versionado de la API).
 *   - Ruta raíz `/` que devuelve información de `package.json`.
 *   - Manejo centralizado de errores con Boom y middleware `errorHandler`.
 *
 * Uso:
 *   - Importado en `server.ts` o `index.ts` para ejecutar `app.listen(port)`.
 *   - Ejecutar en desarrollo con: `npm run dev` o `ts-node-dev`.
 *   - Endpoints disponibles bajo: `http://localhost:<port>/v1/...`
 */

import boom from '@hapi/boom'
import cors from 'cors'
import express, { Application, json, urlencoded } from 'express'
import fs from 'fs'
import helmet from 'helmet'
import morgan from 'morgan'

import './database/connection'

import EnvManager from './config/EnvManager'
import errorHandler from './middlewares/errorHandler'
import v1 from './routes/v1'
import passport from 'passport'
import localStrategy from './routes/v1/auth/localStrategy'
import jwtStrategy from './routes/v1/auth/jwtStrategy'


const app: Application = express()
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
const port = EnvManager.getPort() ?? 3000

// ------------------ Configuración inicial ------------------
app.disable('x-powered-by') // seguridad extra (oculta tecnología)
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
  'http://localhost:4000'  
]

const options: cors.CorsOptions = {
  exposedHeaders: 'Authorization, Content-Disposition',
  origin: (
    origin: string | undefined,
    _callback: (_err: Error | null, _allow?: boolean) => void,
  ) => {
    if (whitelist.includes(origin as string) || !origin) {
      _callback(null, true)
    } else {
      _callback(new Error('no permitido'))
    }
  },

  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true, 

}
app.use(cors(options))

// ------------------ Ruta raíz ------------------
app.get('/', (req, res) => {
  res.json({
    environment: EnvManager.getNodeEnv(),
    name: app.get('pkg').name,
    version: app.get('pkg').version,
    message: 'Welcome to my API: Don Bosco Clinico',
    description: app.get('pkg').description,
    repository: app.get('pkg').repository.url,
    bugs: app.get('pkg').bugs.url,
    license: app.get('pkg').license,
    homepage: app.get('pkg').homepage,
    keywords: app.get('pkg').keywords,
    // author: app.get('pkg').author,
  })
})

// ------------------ Rutas API v1 ------------------
app.use('/v1', v1)

// ------------------ Manejo de rutas inexistentes ------------------
app.use((req, res) => {
  const {
    output: { statusCode, payload },
  } = boom.notFound('Página no encontrada')

  res.status(statusCode).json(payload)
})


// ------------------ Manejo centralizado de errores ------------------
app.use(errorHandler)

export default app
