/**
 * Descripción:
 *   Rutas para la gestión de tutores en el sistema.
 *   Permiten registrar, listar, obtener detalle, actualizar
 *   y gestionar la relación entre tutores y estudiantes.
 *
 * Características:
 *   - POST   /tutores: registra un nuevo tutor.
 *   - GET    /tutores: lista todos los tutores sin estudiantes.
 *   - GET    /tutores/con-estudiantes: lista tutores con sus estudiantes cargados.
 *   - GET    /tutores/:id: obtiene detalle de un tutor específico con estudiantes.
 *   - PATCH  /tutores/:id: actualiza datos completos de un tutor.
 *   - POST   /tutores/:id/add-estudiante: agrega un estudiante a la lista de un tutor.
 *   - DELETE /tutores/:id/remove-estudiante/:estudianteId: remueve un estudiante de un tutor.
 *
 * Uso:
 *   router.post('/tutores', createTutor)
 *   router.get('/tutores', getTutores)
 *   router.get('/tutores/con-estudiantes', getTutoresConEstudiantes)
 *   router.get('/tutores/:id', getTutorById)
 *   router.patch('/tutores/:id', updateTutor)
 *   router.post('/tutores/:id/add-estudiante', addEstudianteToTutor)
 *   router.delete('/tutores/:id/remove-estudiante/:estudianteId', removeEstudianteFromTutor)
 */

import express, { Router } from 'express'
import passport from 'passport'
import {
  createTutor,
  getTutores,
  getTutorById,
  updateTutor,
  getTutoresConEstudiantes,
  addEstudianteToTutor,
  removeEstudianteFromTutor,
} from './controller'

const tutores: Router = express.Router()

// ------------------ Crear Tutor ------------------
tutores.post('/', passport.authenticate('jwt', { session: false }), createTutor)

// ------------------ Listar Tutores ------------------
tutores.get('/', passport.authenticate('jwt', { session: false }), getTutores)

// ------------------ Listar Tutores con Estudiantes ------------------
tutores.get('/con-estudiantes', passport.authenticate('jwt', { session: false }), getTutoresConEstudiantes)

// ------------------ Obtener Tutor por ID ------------------
tutores.get('/:id', passport.authenticate('jwt', { session: false }), getTutorById)


// ------------------ Actualizar Tutor ------------------
tutores.patch('/:id', passport.authenticate('jwt', { session: false }), updateTutor)

// ------------------ Agregar Estudiante a Tutor ------------------
tutores.post('/:id/add-estudiante', passport.authenticate('jwt', { session: false }), addEstudianteToTutor)

// ------------------ Remover Estudiante de Tutor ------------------
tutores.delete('/:id/remove-estudiante/:estudianteId', passport.authenticate('jwt', { session: false }), removeEstudianteFromTutor)

export default tutores