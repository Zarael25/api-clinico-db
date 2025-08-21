import { NextFunction, Request, Response } from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'

import { UsuarioAttributes } from '../../../database/models/Usuario'
import EnvManager from '../../../config/EnvManager'
import ApiError from '../../../errors/ApiError'

export const authUsuario = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  passport.authenticate('local', (error: Error, usuario: UsuarioAttributes) => {
    if (error) return next(error)

    req.login(usuario, { session: false }, async error => {
      if (error) return next(error)

      try {
        if (!usuario)
          throw new ApiError({
            name: 'UNAUTHORIZED_ERROR',
            message: 'Usuario o Contraseña Incorrecto.',
            status: 401,
            code: 'ERR_UNAUTH',
          })

        const payload = {
          id: usuario.id,
          nombreCompleto: `${usuario.appaterno} ${usuario.apmaterno} ${usuario.nombre}`,
          carnet: usuario.carnet,
          roles: usuario.roles,
          niveles: usuario.niveles,
        }

        const authJwtSecret = EnvManager.getAuthJwtSecret()
        const authJwtTime = EnvManager.getAuthJwtTime()
        if (!authJwtSecret || !authJwtTime)
          throw new ApiError({
            name: 'CONFIGURATION_ERROR',
            message:
              'Required environment variables "authJwtSecret" and/or "authJwtTime" are missing',
            status: 500,
            code: 'ERR_CFG',
          })

        const token = jwt.sign(payload, authJwtSecret, {
          expiresIn: authJwtTime,
        })

        res.setHeader('Authorization', `Bearer ${token}`)

        return res.status(200).json({
          message: 'signin successfully',
          data: payload,
        })
      } catch (err) {
        next(err)
      }
    })
  })(req, res, next)
}
