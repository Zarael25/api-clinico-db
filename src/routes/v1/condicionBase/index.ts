import express, { Router } from 'express'
import passport from 'passport'
import {
  createOrUpdateCondicionBase,
  getCondicionBaseByEstudiante,
  updateCondicionBase,
  updateSoloCondicion,
  getAlergiasByEstudiante,
  updateAlergias,
  getVacunasByEstudiante,
  updateVacunas,
} from './controller'

import { inRoles } from '../../../middlewares/authJwt'

const condicionBase: Router = express.Router()

// ===================== SOLO LECTURA =====================

// Obtener condición base de un estudiante
condicionBase.get(
  '/:estudianteId',
  passport.authenticate('jwt', { session: false }),
  getCondicionBaseByEstudiante
)

// Obtener solo alergias de un estudiante
condicionBase.get(
  '/:estudianteId/alergias',
  passport.authenticate('jwt', { session: false }),
  getAlergiasByEstudiante
)

// Obtener solo vacunas
condicionBase.get(
  '/:estudianteId/vacunas',
  passport.authenticate('jwt', { session: false }),
  getVacunasByEstudiante
)

// ===================== LECTURA + ESCRITURA (solo admin y enfermeria) =====================

// Crear o actualizar condición base
condicionBase.post(
  '/:estudianteId',
  passport.authenticate('jwt', { session: false }),
  inRoles(['admin', 'enfermeria']),
  createOrUpdateCondicionBase
)

// Editar condición base
condicionBase.patch(
  '/:estudianteId',
  passport.authenticate('jwt', { session: false }),
  inRoles(['admin', 'enfermeria']),
  updateCondicionBase
)

// Editar solo la condición
condicionBase.patch(
  '/:estudianteId/condicion',
  passport.authenticate('jwt', { session: false }),
  inRoles(['admin', 'enfermeria']),
  updateSoloCondicion
)

// Reemplazar todas las alergias
condicionBase.put(
  '/:estudianteId/alergias',
  passport.authenticate('jwt', { session: false }),
  inRoles(['admin', 'enfermeria']),
  updateAlergias
)

// Reemplazar todas las vacunas
condicionBase.put(
  '/:estudianteId/vacunas',
  passport.authenticate('jwt', { session: false }),
  inRoles(['admin', 'enfermeria']),
  updateVacunas
)

export default condicionBase
