// routes/v1/atencionMedica/index.ts
import express, { Router } from 'express'
import passport from 'passport'
import {
  createAtencionMedica,
  getAtencionesByEstudiante,
  getAtencionById,
} from './controller'



const atencionMedica: Router = express.Router()

// 📌 Crear una nueva atención
atencionMedica.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  createAtencionMedica
)

// Listar por estudiante
atencionMedica.get(
  '/estudiante/:estudianteId',
  passport.authenticate('jwt', { session: false }),
  getAtencionesByEstudiante
)

// Detalle
atencionMedica.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  getAtencionById
)




export default atencionMedica