import dotenv from 'dotenv'
import { studlyCaseToSnakeCase } from '../utils/functions'

dotenv.config()

class EnvManager {
  [x: string]: any

  // conexión base de datos principal
  public getDbConnectionUrl() {
    const USER = encodeURIComponent(process.env.DB_USERNAME ?? '')
    const PASSWORD = encodeURIComponent(process.env.DB_PASSWORD ?? '')
    const HOST = process.env.DB_HOST ?? 'localhost'
    const PORT = process.env.DB_PORT ?? '27017'
    const DB_NAME = process.env.DB_NAME ?? 'test'

    return `mongodb://${USER}:${PASSWORD}@${HOST}:${PORT}/${DB_NAME}?authMechanism=DEFAULT`
  }

  // conexión base de datos de estudiantes
  public getDbConnectionUrlEstudiantes() {
    const USER = encodeURIComponent(process.env.DB_USERNAME ?? '')
    const PASSWORD = encodeURIComponent(process.env.DB_PASSWORD ?? '')
    const HOST = process.env.DB_HOST ?? 'localhost'
    const PORT = process.env.DB_PORT ?? '27017'
    const DB_NAME_ESTUDIANTES = process.env.DB_NAME_ESTUDIANTES ?? 'EstudiantesDonBoscoSucre'

    return `mongodb://${USER}:${PASSWORD}@${HOST}:${PORT}/${DB_NAME_ESTUDIANTES}?authMechanism=DEFAULT`
  }
}

const envManager = new EnvManager()

export default new Proxy(envManager, {
  get(envManager: EnvManager, field: string) {
    return function (defaultValue?: string | number | boolean) {
      if (field in envManager) {
        // si el método existe en la clase (ej. getDbConnectionUrlEstudiantes)
        return envManager[field](defaultValue)
      }

      let envVariable: string | number | undefined =
        process.env[studlyCaseToSnakeCase(field.replace('get', ''))]

      if (envVariable && /^true$/i.test(envVariable)) {
        return true
      }

      if (envVariable && /^false$/i.test(envVariable)) {
        return false
      }

      if (envVariable && /^[0-9]+$/.test(envVariable)) {
        envVariable = parseInt(envVariable, 10)
      }

      return envVariable || defaultValue
    }
  },
})