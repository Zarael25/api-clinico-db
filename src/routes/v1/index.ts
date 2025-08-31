import express, { Router } from 'express'

import auth from './auth'
import usuarios from './usuarios'
import estudiantes from './estudiantes'


const v1: Router = express.Router()

v1.use('/usuarios', usuarios)
v1.use('/auth', auth)
v1.use('/estudiantes', estudiantes)

export default v1
