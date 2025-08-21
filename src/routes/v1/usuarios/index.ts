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

users.get('/find/all', [verifyToken, inRoles(['admin'])], listUsuarios)
users.get('/', [verifyToken, inRoles(['admin'])], listPagedUsuarios)
users.get('/:id', [verifyToken, inRoles(['admin'])], getUsuario)
users.post(
  '/',
  [verifyToken, inRoles(['admin']), validateRequest(createUsuarioSchema)],
  createUsuario,
)
users.put(
  '/:id',
  [verifyToken, inRoles(['admin']), validateRequest(updateUsuarioSchema)],
  updateUsuario,
)
users.put(
  '/:id/password',
  [
    verifyToken,
    inRoles(['admin']),
    validateRequest(updatePasswordUsuarioSchema),
  ],
  updatePasswordUsuario,
)
users.delete('/:id', [verifyToken, inRoles(['admin'])], deleteUsuario)

export default users
