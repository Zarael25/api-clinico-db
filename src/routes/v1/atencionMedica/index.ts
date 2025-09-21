// routes/v1/atencionMedica/index.ts
import express, { Router } from 'express'
import passport from 'passport'
import {
  createAtencionMedica,
  getAtencionesByEstudiante,
  getAtencionById,
  getAtencionesByFecha,
  generarReportePDF,
} from './controller'



const atencionMedica: Router = express.Router()

// 📌 Crear una nueva atención
atencionMedica.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  createAtencionMedica
)

// Listar por estudiante
atencionMedica.get(
  '/estudiante/:estudianteId',
  passport.authenticate('jwt', { session: false }),
  getAtencionesByEstudiante
)

// 📌 Listar atenciones por fecha (ej: ?fecha=2025-04-25)
atencionMedica.get(
  '/fecha',
  passport.authenticate('jwt', { session: false }),
  getAtencionesByFecha
)


// Detalle
atencionMedica.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  getAtencionById
)


// routes/v1/atencionMedica/index.ts
atencionMedica.get(
  '/reporte/pdf',
  passport.authenticate('jwt', { session: false }),
  generarReportePDF
)


export default atencionMedica