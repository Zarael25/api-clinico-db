// routes/v1/atencionMedica/index.ts
import express, { Router } from 'express'
import passport from 'passport'
import {
  createAtencionMedica,
} from './controller'

const atencionMedica: Router = express.Router()

// 📌 Crear una nueva atención
atencionMedica.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  createAtencionMedica
)

export default atencionMedica