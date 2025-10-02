/**
 * Descripción:
 *   Middlewares de autenticación y autorización basados en JWT y roles.
 *   Se utilizan para proteger rutas y restringir el acceso según los permisos
 *   del usuario autenticado.
 *
 * Características:
 *   - verifyToken:
 *       • Extrae y valida el token JWT desde el header "Authorization".
 *       • Si es válido, agrega el objeto decodificado en req.user.
 *       • Si falta o es inválido, lanza un ApiError con status 401.
 *   - inRoles:
 *       • Recibe un array de roles permitidos.
 *       • Verifica si el usuario autenticado tiene al menos uno de esos roles.
 *       • Si no cumple, lanza un ApiError con status 403.
 *
 * Uso:
 *   app.get('/ruta-protegida', verifyToken, inRoles(['admin', 'enfermeria']), controlador)
 */

import jwt from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'
import EnvManager from '../config/EnvManager'
import ApiError from '../errors/ApiError'


//Middleware para verificar la validez del token JWT
export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Extraer token del header Authorization (formato: Bearer <token>)
  const token = req.headers['authorization']?.split(' ')[1]

  try {
    if (!token || token === 'null')
      throw new ApiError({
        name: 'NO_TOKEN_PROVIDED',
        message: 'Authorization token is required.',
        code: 'ERR_NT',
        status: 401,
      })

    // Verificar y decodificar el token con la clave secreta
    const decoded = jwt.verify(token, EnvManager.getAuthJwtSecret())
    req.user = decoded

    next()
  } catch (error) {
    return next(error)
  }
}

//Middleware de autorización por roles
export const inRoles = (roles: string[] = []) => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const userRoles: string[] = req.user?.roles || []

      // Verifica si el usuario tiene al menos uno de los roles requeridos
      const accede = userRoles.some((r) => roles.includes(r))

      if (!accede) {
        throw new ApiError({
          name: 'FORBIDDEN_ERROR',
          message: 'User does not have the necessary permissions',
          code: 'ERR_FORB',
          status: 403,
        })
      }

      return next()
    } catch (error) {
      return next(error)
    }
  }
}
