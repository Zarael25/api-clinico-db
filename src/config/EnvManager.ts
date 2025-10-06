/**
 * Descripción:
 *   Gestor centralizado de variables de entorno para el proyecto.
 *   Provee métodos para construir URLs de conexión a MongoDB y acceder a
 *   cualquier variable definida en `.env` con soporte para valores por defecto.
 *
 * Características:
 *   - Soporta conexión local y MongoDB Atlas automáticamente.
 *   - Usa variables personalizadas MONGO_URI_PRINCIPAL y MONGO_URI_ESTUDIANTES si existen.
 *   - Permite acceder dinámicamente a variables del .env.
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

  /**
   * Retorna la URL de conexión para la base principal (usuarios, auth, etc.)
   * Si existe MONGO_URI_PRINCIPAL, la usa (Atlas). Si no, genera una local.
   */
  public getDbConnectionUrl() {
    if (process.env.MONGO_URI_PRINCIPAL) {
      return process.env.MONGO_URI_PRINCIPAL
    }

    const USER = encodeURIComponent(process.env.DB_USERNAME ?? '')
    const PASSWORD = encodeURIComponent(process.env.DB_PASSWORD ?? '')
    const HOST = process.env.DB_HOST ?? 'localhost'
    const PORT = process.env.DB_PORT ?? '27017'
    const DB_NAME = process.env.DB_NAME ?? 'test'

    return `mongodb://${USER}:${PASSWORD}@${HOST}:${PORT}/${DB_NAME}?authMechanism=DEFAULT`
  }

  /**
   * Retorna la URL de conexión para la base de estudiantes.
   * Si existe MONGO_URI_ESTUDIANTES, la usa (Atlas). Si no, genera una local.
   */
  public getDbConnectionUrlEstudiantes() {
    if (process.env.MONGO_URI_ESTUDIANTES) {
      return process.env.MONGO_URI_ESTUDIANTES
    }

    const USER = encodeURIComponent(process.env.DB_USERNAME ?? '')
    const PASSWORD = encodeURIComponent(process.env.DB_PASSWORD ?? '')
    const HOST = process.env.DB_HOST ?? 'localhost'
    const PORT = process.env.DB_PORT ?? '27017'
    const DB_NAME_ESTUDIANTES = process.env.DB_NAME_ESTUDIANTES ?? 'EstudiantesDonBoscoSucre'

    return `mongodb://${USER}:${PASSWORD}@${HOST}:${PORT}/${DB_NAME_ESTUDIANTES}?authMechanism=DEFAULT`
  }
}

// Instancia del gestor
const envManager = new EnvManager()

// Proxy dinámico para obtener cualquier variable del .env
export default new Proxy(envManager, {
  get(envManager: EnvManager, field: string) {
    return function (defaultValue?: string | number | boolean) {
      if (field in envManager) {
        return envManager[field](defaultValue)
      }

      let envVariable: string | number | undefined =
        process.env[studlyCaseToSnakeCase(field.replace('get', ''))]

      if (envVariable && /^true$/i.test(envVariable)) return true
      if (envVariable && /^false$/i.test(envVariable)) return false
      if (envVariable && /^[0-9]+$/.test(envVariable)) envVariable = parseInt(envVariable, 10)

      return envVariable || defaultValue
    }
  },
})
