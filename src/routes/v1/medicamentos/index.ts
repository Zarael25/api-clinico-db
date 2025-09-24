import express, { Router } from 'express'
import passport from 'passport'
import {
  createMedicamento,
  getMedicamentos,
  getMedicamentoById,
  updateMedicamento,
  deleteMedicamento,
} from './controller'

import { inRoles } from '../../../middlewares/authJwt' // 👈 importa tu middleware de roles

const medicamentos: Router = express.Router()

// ===================== SOLO ADMIN Y ENFERMERÍA =====================

// Crear medicamento
medicamentos.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  inRoles(['admin', 'enfermeria']),
  createMedicamento
)

// Listar medicamentos
medicamentos.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  inRoles(['admin', 'enfermeria']),
  getMedicamentos
)

// Obtener por ID
medicamentos.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  inRoles(['admin', 'enfermeria']),
  getMedicamentoById
)

// Actualizar
medicamentos.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  inRoles(['admin', 'enfermeria']),
  updateMedicamento
)

// Eliminar
medicamentos.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  inRoles(['admin', 'enfermeria']),
  deleteMedicamento
)

export default medicamentos
