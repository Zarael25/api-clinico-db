import express, { Router } from 'express'
import { authUsuario, getMe } from './controller'
import validateRequest from '../../../middlewares/validateRequest'
import { authSchema } from '../../../middlewares/requestSchemas'

const auth: Router = express.Router()

// Login
auth.post('/signin', validateRequest(authSchema), authUsuario)

// Perfil (requiere JWT en Authorization: Bearer <token>)
auth.get('/me', ...getMe)

export default auth
