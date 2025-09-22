import '../src/database/connection'
import bcrypt from 'bcryptjs'
import inquirer from 'inquirer'
import chalk from 'chalk'
import Usuario from '../src/database/models/Usuario'

async function addUser() {
  try {
    console.log(chalk.yellow('=== Registro de nuevo usuario ==='))

    // RegEx igual que en authSchema:
    // - mínimo 8 caracteres
    // - al menos 1 mayúscula
    // - al menos 1 minúscula
    // - al menos 1 símbolo
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.{8,})/

    const questions: any = [
      {
        type: 'input',
        name: 'email',
        message: 'Correo electrónico:',
        validate: (input: string) =>
          input ? true : 'El email es obligatorio',
      },
      {
        type: 'password',
        name: 'password',
        message: 'Contraseña:',
        mask: '*',
        validate: (input: string) => {
          if (!passwordRegex.test(input)) {
            return 'Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un símbolo'
          }
          return true
        },
      },
      { type: 'input', name: 'nombre', message: 'Nombre:', validate: (i: string) => i ? true : 'Campo requerido' },
      { type: 'input', name: 'appaterno', message: 'Apellido paterno:', validate: (i: string) => i ? true : 'Campo requerido' },
      { type: 'input', name: 'apmaterno', message: 'Apellido materno:', validate: (i: string) => i ? true : 'Campo requerido' },
      { type: 'input', name: 'carnet', message: 'Carnet de identidad:', validate: (i: string) => i ? true : 'Campo requerido' },
      { type: 'input', name: 'complemento', message: 'Complemento (opcional):', default: '' },
      {
        type: 'list',
        name: 'expedido',
        message: 'Expedido:',
        choices: ['CH', 'TJ', 'PT', 'LP', 'OR', 'CB', 'SC', 'BN', 'PA'],
      },
      { type: 'input', name: 'fechaNacimiento', message: 'Fecha de nacimiento (YYYY-MM-DD):' },
      { type: 'input', name: 'celular', message: 'Celular:' },
      {
        type: 'list',
        name: 'genero',
        message: 'Género:',
        choices: ['MASCULINO', 'FEMENINO'],
      },
      {
        type: 'checkbox',
        name: 'roles',
        message: 'Rol(es):',
        choices: [
          'admin',
          'administracion',
          'contabilidad',
          'director',
          'secretaria',
          'profesor',
          'regencia',
          'inscriptor',
          'enfermeria',
          'psicologia',
          'informaciones',
          'estudiante',
        ],
        validate: (input: string[]) =>
          input.length > 0 ? true : 'Debe seleccionar al menos un rol',
      },
      {
        type: 'checkbox',
        name: 'niveles',
        message: 'Nivel(es):',
        choices: ['PM', 'PT', 'SM', 'ST'],
        validate: (input: string[]) =>
          input.length > 0 ? true : 'Debe seleccionar al menos un nivel',
      },
    ]

    const answers = await inquirer.prompt(questions)

    // Verificar si ya existe
    const existe = await Usuario.findOne({ email: answers.email })
    if (existe) {
      console.log(chalk.red(`❌ Ya existe un usuario con el email ${answers.email}`))
      process.exit(1)
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(answers.password, 10)

    // Crear usuario
    const nuevo = await Usuario.create({
      ...answers,
      password: hashedPassword,
      fechaNacimiento: answers.fechaNacimiento
        ? new Date(answers.fechaNacimiento)
        : null,
      estado: 'ACTIVE',
    })

    console.log(chalk.green(`✅ Usuario creado con éxito: ${nuevo.email}`))
    process.exit(0)
  } catch (err) {
    console.error(chalk.red('❌ Error al crear usuario:'), err)
    process.exit(1)
  }
}

addUser()
