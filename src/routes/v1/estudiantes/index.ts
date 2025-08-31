// routes/v1/estudiantes/index.ts
import express, { Router } from 'express'
import passport from 'passport'
import { getEstudiantes, searchEstudiantes } from './controller'

const estudiantes: Router = express.Router()

//  protege este endpoint con JWT
estudiantes.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  getEstudiantes
)

// Buscador avanzado
estudiantes.get(
  '/buscar',
  passport.authenticate('jwt', { session: false }),
  searchEstudiantes
)


export default estudiantes