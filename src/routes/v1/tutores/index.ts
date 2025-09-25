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

// Crear tutor
tutores.post('/', passport.authenticate('jwt', { session: false }), createTutor)

// Listar tutores sin estudiantes
tutores.get('/', passport.authenticate('jwt', { session: false }), getTutores)

// Listar tutores con estudiantes (join manual)
tutores.get('/con-estudiantes', passport.authenticate('jwt', { session: false }), getTutoresConEstudiantes)

// Obtener un tutor por ID (con estudiantes)
tutores.get('/:id', passport.authenticate('jwt', { session: false }), getTutorById)

// Editar tutor completo
tutores.patch('/:id', passport.authenticate('jwt', { session: false }), updateTutor)

// Agregar estudiante a tutor
tutores.post('/:id/add-estudiante', passport.authenticate('jwt', { session: false }), addEstudianteToTutor)

// Remover estudiante de tutor
tutores.delete('/:id/remove-estudiante/:estudianteId', passport.authenticate('jwt', { session: false }), removeEstudianteFromTutor)

export default tutores