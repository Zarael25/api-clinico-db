import express, { Router } from 'express'
import passport from 'passport'
import { createTutor, getTutores, updateTutor, getTutorById } from './controller'

const tutores: Router = express.Router()

// Crear tutor
tutores.post('/', passport.authenticate('jwt', { session: false }), createTutor)

// Listar tutores
tutores.get('/', passport.authenticate('jwt', { session: false }), getTutores)

// Obtener por ID
tutores.get('/:id', passport.authenticate('jwt', { session: false }), getTutorById)

// Editar por ID
tutores.patch('/:id', passport.authenticate('jwt', { session: false }), updateTutor)

export default tutores