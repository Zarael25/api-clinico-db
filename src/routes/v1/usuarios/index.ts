/**
 * Descripción:
 *   Rutas para la gestión de usuarios dentro del sistema.
 *   Todas las operaciones requieren autenticación JWT y rol de administrador.
 *
 * Características:
 *   - GET /find/all: lista todos los usuarios sin paginación.
 *   - GET /: lista usuarios con paginación y filtros.
 *   - GET /:id: obtiene un usuario por ID.
 *   - POST /: crea un nuevo usuario validando el esquema de datos.
 *   - PUT /:id: actualiza los datos de un usuario existente.
 *   - PUT /:id/password: actualiza solo la contraseña de un usuario.
 *   - DELETE /:id: elimina un usuario por su ID.
 *
 * Uso:
 *   import usersRouter from './routes/v1/usuarios'
 *   app.use('/api/v1/usuarios', usersRouter)
 */


import express, { Router } from 'express'

import {
  listUsuarios,
  getUsuario,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  updatePasswordUsuario,
  listPagedUsuarios,
} from './controller'
import validateRequest from '../../../middlewares/validateRequest'
import {
  createUsuarioSchema,
  updatePasswordUsuarioSchema,
  updateUsuarioSchema,
} from '../../../middlewares/requestSchemas'
import { inRoles, verifyToken } from '../../../middlewares/authJwt'

const users: Router = express.Router()

// ================== RUTAS DE LECTURA ==================

// Obtener todos los usuarios (sin paginación) -> Solo admin

users.get('/find/all', [verifyToken, inRoles(['admin'])], listUsuarios)

// Obtener usuarios paginados (limit, page, filtros) -> Solo admin
users.get('/', [verifyToken, inRoles(['admin'])], listPagedUsuarios)

// Obtener detalle de un usuario por ID -> Solo admin
users.get('/:id', [verifyToken, inRoles(['admin'])], getUsuario)


// ================== RUTAS DE ESCRITURA ==================
// Crear un nuevo usuario con validación Joi -> Solo admin
users.post(
  '/',
  [verifyToken, inRoles(['admin']), validateRequest(createUsuarioSchema)],
  createUsuario,
)

// Actualizar datos generales de un usuario -> Solo admin
users.put(
  '/:id',
  [verifyToken, inRoles(['admin']), validateRequest(updateUsuarioSchema)],
  updateUsuario,
)

// Actualizar contraseña de un usuario -> Solo admin
users.put(
  '/:id/password',
  [
    verifyToken,
    inRoles(['admin']),
    validateRequest(updatePasswordUsuarioSchema),
  ],
  updatePasswordUsuario,
)

// Eliminar un usuario por ID -> Solo admin
users.delete('/:id', [verifyToken, inRoles(['admin'])], deleteUsuario)

export default users
