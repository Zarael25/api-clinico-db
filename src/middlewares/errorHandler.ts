/**
 * Descripción:
 *   Middleware centralizado para el manejo de errores en la aplicación Express.
 *   Intercepta errores lanzados en rutas, middlewares o controladores y devuelve
 *   una respuesta JSON estandarizada al cliente.
 *
 * Características:
 *   - Maneja errores de validación de Joi con status 423.
 *   - Detecta expiración de tokens JWT y devuelve status 401.
 *   - Interpreta errores personalizados de tipo ApiError.
 *   - Diferencia respuestas en entornos development y production.
 *   - Devuelve un JSON consistente con el formato { error, code_response }.
 *
 * Uso:
 *   app.use(errorHandler)  // Debe ir al final de todas las rutas
 */
import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'

import ApiError from '../errors/ApiError'
import type { ValidationError } from '../types'
import EnvManager from '../config/EnvManager'

export default function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Si los headers ya fueron enviados, delegar a Express
  if (res.headersSent) {
    return next(error)
  }

  // Manejo de errores de validación con Joi
  if (Joi.isError(error)) {
    const validationError: ValidationError = {
      error: {
        name: 'VALIDATION_ERROR',
        message: 'Validation error',
        code: 'ERR_VALID',
        errors: error.details.map(item => ({
          message: item.message,
        })),
      },
      code_response: 0,
    }
    return res.status(423).json(validationError)
  }
  // Manejo de error de token JWT expirado
  if (error.name === 'TokenExpiredError') {
    error = new ApiError({
      name: 'TOKEN_EXPIRED_ERROR',
      message: 'The authorization token has expired.',
      code: 'ERR_TE',
      status: 401,
    })
  }

  // Manejo de errores personalizados (ApiError)
  if (error instanceof ApiError) {
    return res.status(error.status).json({
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
      },
      code_response: 0,
    })
  }

  // Entorno de desarrollo → incluir stack trace para debug
  if (EnvManager.getNodeEnv() === 'development') {
    
    return res.status(500).json({
      error: {
        code: 'ERR_UNKNOWN',
        message: error.message,
        stack: error.stack, 
      },
      code_response: 0,
    })
  } else {
    // Entorno de producción → ocultar stack trace, loguear el error
    console.log(error)

    res.status(500).json({
      error: {
        code: 'ERR_UNKNOWN',
        message:
          error.message ||
          'An error occurred. Please view logs for more details',
      },
      code_response: 0,
    })
  }
}
