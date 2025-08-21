import express, { Router } from 'express'
import { authUsuario } from './controller'
import validateRequest from '../../../middlewares/validateRequest'
import { authSchema } from '../../../middlewares/requestSchemas'

const auth: Router = express.Router()

auth.post('/signin', validateRequest(authSchema), authUsuario)

export default auth
