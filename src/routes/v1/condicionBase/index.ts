/**
 * Descripción:
 *   Rutas para la gestión de la condición clínica base de los estudiantes.
 *   Incluye acceso a condición general, alergias y vacunas.
 *
 * Características:
 *   - Solo usuarios autenticados pueden acceder (JWT requerido).
 *   - Permite lectura de datos (condición, alergias, vacunas).
 *   - Solo roles autorizados (admin, enfermería) pueden modificar información.
 *   - Diferencia entre operaciones de lectura (GET) y escritura (POST, PATCH, PUT).
 *
 * Uso:
 *   GET    /condicion-base/:estudianteId              → obtener condición base
 *   GET    /condicion-base/:estudianteId/alergias     → obtener alergias
 *   GET    /condicion-base/:estudianteId/vacunas      → obtener vacunas
 *   POST   /condicion-base/:estudianteId              → crear/actualizar condición base
 *   PATCH  /condicion-base/:estudianteId              → editar toda la condición base
 *   PATCH  /condicion-base/:estudianteId/condicion    → editar solo la condición
 *   PUT    /condicion-base/:estudianteId/alergias     → reemplazar todas las alergias
 *   PUT    /condicion-base/:estudianteId/vacunas      → reemplazar todas las vacunas
 */

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

// Obtener condición base de un estudiante (JWT requerido)
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

// Obtener solo vacunas de un estudiante
condicionBase.get(
  '/:estudianteId/vacunas',
  passport.authenticate('jwt', { session: false }),
  getVacunasByEstudiante
)

// ===================== LECTURA + ESCRITURA (solo admin y enfermeria) =====================

// Crear o actualizar condición base de un estudiante
condicionBase.post(
  '/:estudianteId',
  passport.authenticate('jwt', { session: false }),
  inRoles(['admin', 'enfermeria']),
  createOrUpdateCondicionBase
)

// Editar toda la condición base (condición, alergias, vacunas)
condicionBase.patch(
  '/:estudianteId',
  passport.authenticate('jwt', { session: false }),
  inRoles(['admin', 'enfermeria']),
  updateCondicionBase
)

// Editar únicamente la condición clínica general
condicionBase.patch(
  '/:estudianteId/condicion',
  passport.authenticate('jwt', { session: false }),
  inRoles(['admin', 'enfermeria']),
  updateSoloCondicion
)

// Reemplazar todas las alergias de un estudiante
condicionBase.put(
  '/:estudianteId/alergias',
  passport.authenticate('jwt', { session: false }),
  inRoles(['admin', 'enfermeria']),
  updateAlergias
)

// Reemplazar todas las vacunas de un estudiante
condicionBase.put(
  '/:estudianteId/vacunas',
  passport.authenticate('jwt', { session: false }),
  inRoles(['admin', 'enfermeria']),
  updateVacunas
)

export default condicionBase
