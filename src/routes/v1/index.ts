import express, { Router } from 'express'

import auth from './auth'
import usuarios from './usuarios'
import estudiantes from './estudiantes'
import condicionBase from './condicionBase'

const v1: Router = express.Router()

v1.use('/usuarios', usuarios)
v1.use('/auth', auth)
v1.use('/estudiantes', estudiantes)
v1.use('/condicion-base', condicionBase)

export default v1
