import express, { Router } from 'express'
import passport from 'passport'
import { getDashboardResumen, getAtencionesPorNivel } from './controller'
import { inRoles } from '../../../middlewares/authJwt'

const dashboard: Router = express.Router()

// ------------------ Resumen Dashboard Clínico ------------------
// Solo roles 'admin', 'enfermeria' y 'administracion'
dashboard.get(
  '/resumen',
  passport.authenticate('jwt', { session: false }),
  inRoles(['admin', 'enfermeria', 'administracion']),
  getDashboardResumen
)

// ------------------ Atenciones por Nivel ------------------
dashboard.get(
  '/atenciones-nivel',
  passport.authenticate('jwt', { session: false }),
  inRoles(['admin', 'enfermeria', 'administracion']),
  getAtencionesPorNivel
)


export default dashboard
