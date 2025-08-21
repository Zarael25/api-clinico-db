import bcrypt from 'bcryptjs'
import chalk from 'chalk'
import UsuarioModel from '../src/database/models/Usuario'

const log = console.log

const createAdmin = async () => {
  try {
    // check for an existing admin user
    const usuario = await UsuarioModel.findOne({
      email: 'admin@donboscosucre.edu.bo',
    })

    if (!usuario) {
      // create a new admin user
      await UsuarioModel.create({
        email: 'admin@donbosco.edu.bo',
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
        roles: ['admin'],
        niveles: ['PM', 'PT', 'SM', 'ST'],
      })
      log(chalk.blue('¡Usuario admin creado!'))
    }
  } catch (error) {
    log(`${chalk.bgRed('[fatal error]')} ${chalk.red(error)}`)
  }
}

export { createAdmin }
