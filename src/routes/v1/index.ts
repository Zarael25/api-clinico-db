import express, { Router } from 'express'

import auth from './auth'
import usuarios from './usuarios'
import estudiantes from './estudiantes'
import condicionBase from './condicionBase'
import atencionMedica from './atencionMedica'
import medicamentos from './medicamentos'
import tutores from './tutores'

const v1: Router = express.Router()

v1.use('/usuarios', usuarios)
v1.use('/auth', auth)
v1.use('/estudiantes', estudiantes)
v1.use('/condicion-base', condicionBase)
v1.use('/atenciones', atencionMedica)
v1.use('/medicamentos', medicamentos)
v1.use('/tutores', tutores)

export default v1
