/**
 * Descripción:
 *   Controladores de autenticación de usuarios.
 *   Incluyen inicio de sesión con generación de JWT y endpoint para
 *   obtener el perfil del usuario autenticado.
 *
 * Características:
 *   - authUsuario → autentica credenciales con estrategia local (passport-local),
 *     genera un JWT y devuelve información básica del usuario.
 *   - getMe → devuelve el perfil completo del usuario autenticado usando JWT.
 *
 * Uso:
 *   router.post('/auth/signin', authUsuario)
 *   router.get('/auth/me', getMe)
 */

import { NextFunction, Request, Response } from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'

import { UsuarioAttributes } from '../../../database/models/Usuario'
import EnvManager from '../../../config/EnvManager'
import ApiError from '../../../errors/ApiError'

// DTO para transformar el usuario en un objeto seguro para el frontend
function toUsuarioDTO(usuario: any) {
  return {
    id: usuario.id,
    email: usuario.email,
    nombre: usuario.nombre,
    appaterno: usuario.appaterno,
    apmaterno: usuario.apmaterno,
    carnet: usuario.carnet,     
    avatar: usuario.avatar,
    roles: usuario.roles,
    niveles: usuario.niveles,
    estado: usuario.estado,
    createdAt: usuario.createdAt,
    updatedAt: usuario.updatedAt,
  }
}

// -------------------- LOGIN /signin --------------------
export const authUsuario = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  passport.authenticate('local', (error: Error, usuario: UsuarioAttributes) => {
    if (error) return next(error)

    // Passport crea req.login → aquí deshabilitamos sesiones
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

        // Construir payload mínimo para el JWT
        const payload = {
          sub: usuario.id, // mejor usar "sub" estándar
          roles: usuario.roles,
        }

        // Cargar secreto y tiempo de expiración desde .env
        const authJwtSecret = EnvManager.getAuthJwtSecret()
        const authJwtTime = EnvManager.getAuthJwtTime()
        if (!authJwtSecret || !authJwtTime)
          throw new ApiError({
            name: 'CONFIGURATION_ERROR',
            message: 'Missing AUTH_JWT_SECRET or AUTH_JWT_TIME',
            status: 500,
            code: 'ERR_CFG',
          })

        // Firmar el token
        const token = jwt.sign(payload, authJwtSecret, { expiresIn: authJwtTime })
        res.setHeader('Authorization', `Bearer ${token}`)

        // Respuesta reducida con datos básicos del usuario
        return res.status(200).json({
          message: 'signin successfully',
          token,
          usuario: {
            id: usuario.id,
            carnet: usuario.carnet,
            nombre: usuario.nombre,
            appaterno: usuario.appaterno,
            apmaterno: usuario.apmaterno,
            roles: usuario.roles,
            niveles: usuario.niveles,
          },
        })
      } catch (err) {
        next(err)
      }
    })
  })(req, res, next)
}

// -------------------- PERFIL /me --------------------
export const getMe = [
  passport.authenticate('jwt', { session: false }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const usuario = req.user as UsuarioAttributes
      // Devuelve información completa del usuario autenticado
      return res.json({
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          appaterno: usuario.appaterno,
          apmaterno: usuario.apmaterno,
          carnet: usuario.carnet,
          avatar: usuario.avatar,
          roles: usuario.roles,
          niveles: usuario.niveles,
          estado: usuario.estado,
          createdAt: usuario.createdAt,
          updatedAt: usuario.updatedAt,
        },
      })
    } catch (err) {
      next(err)
    }
  },
]