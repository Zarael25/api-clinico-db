/**
 * Descripción:
 *   Clase base genérica para la gestión de errores en el proyecto.
 *   Permite definir un error con nombre, mensaje, estado HTTP y código opcional.
 *
 * Características:
 *   - Extiende de la clase nativa Error de JavaScript.
 *   - Tipada con genéricos <N, C> para definir nombres y códigos de error válidos.
 *   - Almacena información adicional: `status` (HTTP status code) y `code` (código interno).
 *   - Base para crear clases de error más específicas como ApiError.
 *
 * Uso:
 *   throw new BaseError({
 *     name: "ValidationError",
 *     message: "El campo email es requerido",
 *     status: 400,
 *     code: "400_EMAIL_REQUIRED"
 *   });
 */


class BaseError<N extends string, C extends string> extends Error {
  name: N        // Nombre del error (ej. "ValidationError")
  message: string // Mensaje descriptivo del error
  status: number  // Código de estado HTTP asociado (ej. 400, 404, 500)
  code?: C        // Código interno de error opcional (ej. "400_EMAIL_REQUIRED")

  constructor({
    name,
    message,
    status,
    code,
  }: {
    name: N
    message: string
    status: number
    code?: C
  }) {
    super()
    this.name = name
    this.message = message
    this.status = status
    this.code = code
  }
}

export default BaseError
