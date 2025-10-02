/**
 * Descripción:
 *   Definición de rutas para la gestión de medicamentos.
 *   Todas las rutas están protegidas por autenticación JWT
 *   y restringidas a usuarios con rol `admin` o `enfermeria`.
 *
 * Características:
 *   - POST /medicamentos → crear medicamento.
 *   - GET /medicamentos → listar todos los medicamentos.
 *   - GET /medicamentos/:id → obtener medicamento por ID.
 *   - PATCH /medicamentos/:id → actualizar medicamento existente.
 *   - DELETE /medicamentos/:id → eliminar medicamento por ID.
 *
 * Uso:
 *   router.post('/medicamentos', createMedicamento)
 *   router.get('/medicamentos', getMedicamentos)
 *   router.get('/medicamentos/:id', getMedicamentoById)
 *   router.patch('/medicamentos/:id', updateMedicamento)
 *   router.delete('/medicamentos/:id', deleteMedicamento)
 */

import express, { Router } from 'express'
import passport from 'passport'
import {
  createMedicamento,
  getMedicamentos,
  getMedicamentoById,
  updateMedicamento,
  deleteMedicamento,
} from './controller'

import { inRoles } from '../../../middlewares/authJwt' 

const medicamentos: Router = express.Router()


// ------------------ Crear medicamento ------------------
medicamentos.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  inRoles(['admin', 'enfermeria']),
  createMedicamento
)

// ------------------ Listar todos los medicamentos ------------------
medicamentos.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  inRoles(['admin', 'enfermeria']),
  getMedicamentos
)

// ------------------ Obtener medicamento por ID ------------------
medicamentos.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  inRoles(['admin', 'enfermeria']),
  getMedicamentoById
)

// ------------------ Actualizar medicamento ------------------
medicamentos.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  inRoles(['admin', 'enfermeria']),
  updateMedicamento
)

// ------------------ Eliminar medicamento ------------------
medicamentos.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  inRoles(['admin', 'enfermeria']),
  deleteMedicamento
)

export default medicamentos
