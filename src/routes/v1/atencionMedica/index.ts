/**
 * Descripción:
 *   Definición de rutas para la gestión de atenciones médicas.
 *   Todas las rutas están protegidas por autenticación JWT (passport).
 *
 * Características:
 *   - POST   /api/v1/atenciones        → Crear nueva atención médica.
 *   - GET    /api/v1/atenciones/estudiante/:estudianteId → Listar atenciones por estudiante.
 *   - GET    /api/v1/atenciones/fecha  → Listar atenciones por fecha (YYYY-MM-DD).
 *   - GET    /api/v1/atenciones/:id    → Obtener detalle de una atención por ID.
 *   - GET    /api/v1/atenciones/reporte/pdf → Generar reporte PDF de atenciones.
 *
 * Uso:
 *   import atencionMedica from './routes/v1/atenciones'
 *   app.use('/api/v1/atenciones', atencionMedica)
 */

import express, { Router } from 'express'
import passport from 'passport'
import {
  createAtencionMedica,
  getAtencionesByEstudiante,
  getAtencionById,
  getAtencionesByFecha,
  generarReportePDF,
  generarReporteEstudiantePDF,
} from './controller'



const atencionMedica: Router = express.Router()
// ------------------ Crear Atención Médica ------------------
// Solo usuarios con rol 'admin' o 'enfermeria' pueden crear
atencionMedica.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  createAtencionMedica
)

// ------------------ Atenciones por Estudiante ------------------
atencionMedica.get(
  '/estudiante/:estudianteId',
  passport.authenticate('jwt', { session: false }),
  getAtencionesByEstudiante
)

// ------------------ Atenciones por Fecha ------------------
atencionMedica.get(
  '/fecha',
  passport.authenticate('jwt', { session: false }),
  getAtencionesByFecha
)


// ------------------ Detalle de Atención por ID ------------------
atencionMedica.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  getAtencionById
)

// ------------------ Generar Reporte PDF ------------------
// Solo roles 'admin', 'enfermeria', 'administracion'
atencionMedica.get(
  '/reporte/pdf',
  passport.authenticate('jwt', { session: false }),
  generarReportePDF
)

// ------------------ Generar Reporte PDF por Estudiante ------------------
atencionMedica.get(
  '/reporte/estudiante/:estudianteId',
  passport.authenticate('jwt', { session: false }),
  generarReporteEstudiantePDF
)


export default atencionMedica