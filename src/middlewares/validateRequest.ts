/**
 * Descripción:
 *   Middleware genérico para validar el cuerpo (body) de las peticiones HTTP
 *   usando un esquema de Joi. Evita repetir lógica de validación en cada ruta.
 *
 * Características:
 *   - Recibe un esquema Joi como parámetro.
 *   - Valida el contenido de req.body contra el esquema.
 *   - Recolecta todos los errores (abortEarly: false).
 *   - En caso de error, lo pasa al errorHandler centralizado.
 *   - Si no hay errores, llama a next() para continuar.
 *
 * Uso:
 *   import validateRequest from '../middlewares/validateRequest'
 *   import { createUsuarioSchema } from '../schemas/usuarioSchema'
 *
 *   router.post('/usuarios', validateRequest(createUsuarioSchema), crearUsuario)
 */



import { NextFunction, Request, Response } from 'express'
import { ObjectSchema } from 'joi'

export default function validateRequest(schema: ObjectSchema) {
  return async function validator(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    // Si no hay body, continuar sin validar
    if (!req.body) {
      next()
    }
    try {
      // Validar req.body con el esquema Joi
      await schema.validateAsync(req.body, { abortEarly: false })
    } catch (error) {
      // Enviar error al middleware central de manejo de errores
      next(error)
      return
    }
    // Continuar si no hubo errores
    next()
  }
}
