// routes/v1/estudiantes/index.ts
import express, { Router } from 'express'
import passport from 'passport'
import { getEstudiantes, searchEstudiantes, getEstudianteById, getTutoresByEstudiante } from './controller'

const estudiantes: Router = express.Router()

// 📌 Listar todos los estudiantes
estudiantes.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  getEstudiantes
)

// 📌 Buscador avanzado
estudiantes.get(
  '/buscar/',
  passport.authenticate('jwt', { session: false }),
  searchEstudiantes
)


// 📌 Obtener estudiante por ID
estudiantes.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  getEstudianteById
)


// 📌 Obtener tutores de un estudiante
estudiantes.get(
  '/:id/tutores',
  passport.authenticate('jwt', { session: false }),
  getTutoresByEstudiante,
)




export default estudiantes