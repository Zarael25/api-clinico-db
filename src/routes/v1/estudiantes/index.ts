/**
 * Descripción:
 *   Definición de rutas para la gestión de estudiantes.
 *   Incluye listado completo, búsqueda por parámetros dinámicos,
 *   obtención de un estudiante específico y listado de tutores.
 *
 * Características:
 *   - Protegidas con autenticación JWT (passport-jwt).
 *   - Uso de controladores especializados para cada acción.
 *
 * Uso:
 *   router.get('/estudiantes', getEstudiantes)
 *   router.get('/estudiantes/buscar', searchEstudiantes)
 *   router.get('/estudiantes/:id', getEstudianteById)
 *   router.get('/estudiantes/:id/tutores', getTutoresByEstudiante)
 */

import express, { Router } from 'express'
import passport from 'passport'
import { getEstudiantes, searchEstudiantes, getEstudianteById, getTutoresByEstudiante, searchEstudiantesPaginated, } from './controller'

const estudiantes: Router = express.Router()


// ------------------ Listar todos los estudiantes ------------------
estudiantes.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  getEstudiantes
)


// ------------------ Buscar estudiantes ------------------
estudiantes.get(
  '/buscar/',
  passport.authenticate('jwt', { session: false }),
  searchEstudiantes
)

// ------------------ Buscar estudiantes con paginación ------------------
estudiantes.get(
  '/buscar/paginado',
  passport.authenticate('jwt', { session: false }),
  searchEstudiantesPaginated
)



// ------------------ Obtener estudiante por ID ------------------
estudiantes.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  getEstudianteById
)


// ------------------ Obtener tutores de un estudiante ------------------
estudiantes.get(
  '/:id/tutores',
  passport.authenticate('jwt', { session: false }),
  getTutoresByEstudiante,
)




export default estudiantes