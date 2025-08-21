import express, { Router } from 'express'

import auth from './auth'
import usuarios from './usuarios'

const v1: Router = express.Router()

v1.use('/usuarios', usuarios)
v1.use('/auth', auth)

export default v1
