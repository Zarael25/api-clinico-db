import mongoose from 'mongoose'
import Debug from 'debug'
import EnvManager from '../config/EnvManager'

process.env.DEBUG_COLORS = 'true'

const debug = Debug('app:database')
const dError = Debug('app:error')
dError.color = '1'


// Logs para verificar qué URL se está usando
console.log('🔗 URL Usuarios:', EnvManager.getDbConnectionUrl())
console.log('🔗 URL Estudiantes:', EnvManager.getDbConnectionUrlEstudiantes())




// conexión para la DB de usuarios / auth
export const connUsuarios = mongoose.createConnection(EnvManager.getDbConnectionUrl())

// conexión para la DB de estudiantes
export const connEstudiantes = mongoose.createConnection(EnvManager.getDbConnectionUrlEstudiantes())

// logs de conexión
connUsuarios.on('connected', () => debug('✅ Conectado a DB Usuarios (clinicodb)'))
connEstudiantes.on('connected', () => debug('✅ Conectado a DB Estudiantes (EstudiantesDonBoscoSucre)'))

connUsuarios.on('error', (err) => dError('❌ Error DB Usuarios:', err))
connEstudiantes.on('error', (err) => dError('❌ Error DB Estudiantes:', err))
