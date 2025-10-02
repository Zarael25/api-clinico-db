/**
 * Descripción:
 *   Clase personalizada para manejar errores de la API.
 *   Extiende de BaseError y permite tipar los errores con un nombre y un código
 *   definido en los tipos globales del proyecto.
 *
 * Características:
 *   - Hereda de BaseError para reutilizar la lógica de manejo de errores.
 *   - Tipada con <ErrorName, ErrorCode> para un control más estricto.
 *   - Centraliza la forma de lanzar y capturar errores en controladores y middlewares.
 *
 * Uso:
 *   throw new ApiError('ValidationError', '400_BAD_REQUEST', 'Datos inválidos');
 */

import BaseError from './BaseError'

// Importa los tipos de error predefinidos en el proyecto
import type { ErrorName, ErrorCode } from '../types'

// Clase ApiError que extiende de BaseError
class ApiError extends BaseError<ErrorName, ErrorCode> {}
export default ApiError
