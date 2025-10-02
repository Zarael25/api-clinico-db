/**
 * Descripción:
 *   Configuración y establecimiento de las conexiones a las bases de datos MongoDB
 *   del sistema clínico. Se crean dos conexiones independientes: 
 *   - Una para usuarios/autenticación (clinicodb).
 *   - Otra para estudiantes (EstudiantesDonBoscoSucre).
 *
 * Características:
 *   - Utiliza mongoose para manejar múltiples conexiones.
 *   - Usa EnvManager para obtener las URLs de conexión desde el archivo .env.
 *   - Registra eventos de conexión y error con mensajes en consola y debug.
 *   - Aplica colores a los logs de debug para mayor legibilidad.
 *
 * Uso:
 *   Importar { connUsuarios, connEstudiantes } en modelos o repositorios 
 *   para definir esquemas sobre la base de datos correspondiente.
 */

import mongoose from 'mongoose'
import Debug from 'debug'
import EnvManager from '../config/EnvManager'

// Habilitar colores en la salida de debug
process.env.DEBUG_COLORS = 'true'

// Canales de log separados para conexión e errores
const debug = Debug('app:database')
const dError = Debug('app:error')
dError.color = '1'


// Mostrar en consola las URLs que se están usando
console.log('🔗 URL Usuarios:', EnvManager.getDbConnectionUrl())
console.log('🔗 URL Estudiantes:', EnvManager.getDbConnectionUrlEstudiantes())



// Conexión a la base de datos de usuarios/autenticación
export const connUsuarios = mongoose.createConnection(EnvManager.getDbConnectionUrl())

// Conexión a la base de datos de estudiantes
export const connEstudiantes = mongoose.createConnection(EnvManager.getDbConnectionUrlEstudiantes())

// Eventos de conexión exitosa
connUsuarios.on('connected', () => debug('✅ Conectado a DB Usuarios (clinicodb)'))
connEstudiantes.on('connected', () => debug('✅ Conectado a DB Estudiantes (EstudiantesDonBoscoSucre)'))

// Eventos de error de conexión
connUsuarios.on('error', (err) => dError('❌ Error DB Usuarios:', err))
connEstudiantes.on('error', (err) => dError('❌ Error DB Estudiantes:', err))
