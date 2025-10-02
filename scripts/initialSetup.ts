/**
 * Descripción:
 *   Script para crear un usuario administrador por defecto en el sistema.
 *   Se utiliza para asegurar que siempre exista un admin inicial con acceso completo.
 *
 * Características:
 *   - Verifica si ya existe un usuario con el email por defecto.
 *   - Si no existe, crea un nuevo admin con credenciales predefinidas.
 *   - La contraseña se encripta antes de guardarse en la base de datos.
 *   - Asigna rol "admin" y todos los niveles disponibles.
 *
 * Uso:
 *   Importar y ejecutar la función createAdmin() desde otro script o al iniciar la aplicación.
 */


import bcrypt from 'bcryptjs'
import chalk from 'chalk'
import UsuarioModel from '../src/database/models/Usuario'

const log = console.log

const createAdmin = async () => {
  try {
    // Buscar si ya existe un usuario administrador con este email
    const usuario = await UsuarioModel.findOne({
      email: 'admin@donboscosucre.edu.bo',
    })

    // Si no existe, crear el admin por defecto
    if (!usuario) {
      
      await UsuarioModel.create({
        email: 'admin@donboscosucre.edu.bo',
        // Se encripta la contraseña antes de guardarla
        password: await bcrypt.hash('D*nB*sco25', 10),
        nombre: 'Juan',
        appaterno: 'Don',
        apmaterno: 'Bosco',
        carnet: '12345678',
        complemento: '',
        expedido: 'CH',
        fechaNacimiento: new Date('1963-01-01'),
        avatar: '',
        genero: 'MASCULINO',
        celular: '76543210',
        estado: 'ACTIVE',
        roles: ['admin'], // Rol administrador
        niveles: ['PM', 'PT', 'SM', 'ST'], // Todos los niveles habilitados
      })
      log(chalk.blue('¡Usuario admin creado!'))
    }
  } catch (error) {
    // Captura y muestra errores en la consola
    log(`${chalk.bgRed('[fatal error]')} ${chalk.red(error)}`)
  }
}

export { createAdmin }
