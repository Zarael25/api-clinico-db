import express, { Router } from 'express'
import passport from 'passport'
import {
  createOrUpdateCondicionBase,
  getCondicionBaseByEstudiante,
  updateCondicionBase,
  updateSoloCondicion,
  getAlergiasByEstudiante,
  updateAlergias,
} from './controller'

const condicionBase: Router = express.Router()

// Obtener condición base de un estudiante
condicionBase.get(
  '/:estudianteId',
  passport.authenticate('jwt', { session: false }),
  getCondicionBaseByEstudiante
)

// Crear o actualizar condición base
condicionBase.post(
  '/:estudianteId',
  passport.authenticate('jwt', { session: false }),
  createOrUpdateCondicionBase
)

// Editar condición base
condicionBase.patch(
  '/:estudianteId',
  passport.authenticate('jwt', { session: false }),
  updateCondicionBase
)

// Editar condición base
condicionBase.patch(
  "/:estudianteId/condicion",
  passport.authenticate("jwt", { session: false }),
  updateSoloCondicion
)


// Obtener solo alergias de un estudiante
condicionBase.get(
  '/:estudianteId/alergias',
  passport.authenticate('jwt', { session: false }),
  getAlergiasByEstudiante
)


// Reemplazar todas las alergias
condicionBase.put(
  '/:estudianteId/alergias',
  passport.authenticate('jwt', { session: false }),
  updateAlergias
)


export default condicionBase