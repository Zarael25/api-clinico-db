/**
 * Descripción:
 *   Definición de rutas para autenticación de usuarios.
 *   Incluye inicio de sesión (login) con validación de credenciales
 *   y obtención del perfil del usuario autenticado.
 *
 * Características:
 *   - POST /auth/signin → autentica credenciales y devuelve un JWT.
 *   - GET  /auth/me     → devuelve información del usuario autenticado.
 *
 * Uso:
 *   import auth from './routes/v1/auth'
 *   app.use('/api/v1/auth', auth)
 */

import express, { Router } from 'express'
import { authUsuario, getMe } from './controller'
import validateRequest from '../../../middlewares/validateRequest'
import { authSchema } from '../../../middlewares/requestSchemas'

const auth: Router = express.Router()

// ------------------ LOGIN ------------------
// Valida credenciales (carnet y password) con Joi antes de procesar
auth.post('/signin', validateRequest(authSchema), authUsuario)

// ------------------ PERFIL /me ------------------
// Requiere JWT en el header: Authorization: Bearer <token>
auth.get('/me', ...getMe)

export default auth
