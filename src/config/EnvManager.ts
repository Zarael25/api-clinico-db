/**
 * Descripción:
 *   Gestor centralizado de variables de entorno para el proyecto.
 *   Provee métodos para construir URLs de conexión a MongoDB y acceder a
 *   cualquier variable definida en `.env` con soporte para valores por defecto.
 *
 * Características:
 *   - Construye la URL de conexión para la base de datos principal.
 *   - Construye la URL de conexión para la base de datos de estudiantes.
 *   - Permite acceder dinámicamente a variables de entorno usando un Proxy.
 *   - Convierte valores de tipo string en booleanos o números automáticamente.
 *
 * Uso:
 *   EnvManager.getDbConnectionUrl()
 *   EnvManager.getDbConnectionUrlEstudiantes()
 *   EnvManager.getJwtSecret('valorPorDefecto')
 */


import dotenv from 'dotenv'
import { studlyCaseToSnakeCase } from '../utils/functions'

// Carga las variables definidas en el archivo .env
dotenv.config()

class EnvManager {
  [x: string]: any

  // Genera la URL de conexión para la base de datos principal
  public getDbConnectionUrl() {
    const USER = encodeURIComponent(process.env.DB_USERNAME ?? '')
    const PASSWORD = encodeURIComponent(process.env.DB_PASSWORD ?? '')
    const HOST = process.env.DB_HOST ?? 'localhost'
    const PORT = process.env.DB_PORT ?? '27017'
    const DB_NAME = process.env.DB_NAME ?? 'test'

    return `mongodb://${USER}:${PASSWORD}@${HOST}:${PORT}/${DB_NAME}?authMechanism=DEFAULT`
  }

  // Genera la URL de conexión para la base de datos de estudiantes
  public getDbConnectionUrlEstudiantes() {
    const USER = encodeURIComponent(process.env.DB_USERNAME ?? '')
    const PASSWORD = encodeURIComponent(process.env.DB_PASSWORD ?? '')
    const HOST = process.env.DB_HOST ?? 'localhost'
    const PORT = process.env.DB_PORT ?? '27017'
    const DB_NAME_ESTUDIANTES = process.env.DB_NAME_ESTUDIANTES ?? 'EstudiantesDonBoscoSucre'

    return `mongodb://${USER}:${PASSWORD}@${HOST}:${PORT}/${DB_NAME_ESTUDIANTES}?authMechanism=DEFAULT`
  }
}

// Instancia del gestor de variables de entorno
const envManager = new EnvManager()

// Proxy para interceptar llamadas a métodos dinámicos (ej: EnvManager.getJwtSecret())
export default new Proxy(envManager, {
  get(envManager: EnvManager, field: string) {
    return function (defaultValue?: string | number | boolean) {
      // Si el método existe en la clase, ejecutarlo directamente
      if (field in envManager) {
        
        return envManager[field](defaultValue)
      }

      // Convertir el nombre del método a formato ENV (ej: getJwtSecret → JWT_SECRET)
      let envVariable: string | number | undefined =
        process.env[studlyCaseToSnakeCase(field.replace('get', ''))]

       // Si la variable es 'true' o 'false', convertir a boolean
      if (envVariable && /^true$/i.test(envVariable)) {
        return true
      }

      if (envVariable && /^false$/i.test(envVariable)) {
        return false
      }
      // Si es numérica, convertir a número
      if (envVariable && /^[0-9]+$/.test(envVariable)) {
        envVariable = parseInt(envVariable, 10)
      }
      // Retornar la variable de entorno o el valor por defecto
      return envVariable || defaultValue
    }
  },
})