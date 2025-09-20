// routes/v1/medicamentos/index.ts
import express, { Router } from 'express'
import passport from 'passport'
import {
  createMedicamento,
  getMedicamentos,
  getMedicamentoById,
  updateMedicamento,
  deleteMedicamento,
} from './controller'

const medicamentos: Router = express.Router()

// Crear medicamento
medicamentos.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  createMedicamento
)

// Listar medicamentos
medicamentos.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  getMedicamentos
)

// Obtener por ID
medicamentos.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  getMedicamentoById
)

// Actualizar
medicamentos.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  updateMedicamento
)

// Eliminar
medicamentos.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  deleteMedicamento
)

export default medicamentos