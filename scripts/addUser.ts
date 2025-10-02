/**
 * Descripción:
 *   Script para registrar manualmente un nuevo usuario en la base de datos
 *   mediante un asistente interactivo en consola.
 *
 * Características:
 *   - Solicita datos personales y credenciales usando inquirer.
 *   - Valida la contraseña con expresión regular (mín. 8 caracteres, 1 mayúscula, 1 minúscula y 1 símbolo).
 *   - Hashea la contraseña con bcryptjs antes de guardarla.
 *   - Verifica duplicidad de correo electrónico.
 *   - Asigna roles, niveles y estado "ACTIVE" por defecto.
 *
 * Uso:
 *   ts-node scripts/addUser.ts
 */

import '../src/database/connection'
import bcrypt from 'bcryptjs'
import inquirer from 'inquirer'
import chalk from 'chalk'
import Usuario from '../src/database/models/Usuario'

async function addUser() {
  try {
    console.log(chalk.yellow('=== Registro de nuevo usuario ==='))

    
    // Expresión regular para validar la contraseña:
    // Debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula y 1 símbolo.
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
      // Datos personales obligatorios
      { type: 'input', name: 'nombre', message: 'Nombre:', validate: (i: string) => i ? true : 'Campo requerido' },
      { type: 'input', name: 'appaterno', message: 'Apellido paterno:', validate: (i: string) => i ? true : 'Campo requerido' },
      { type: 'input', name: 'apmaterno', message: 'Apellido materno:', validate: (i: string) => i ? true : 'Campo requerido' },
      { type: 'input', name: 'carnet', message: 'Carnet de identidad:', validate: (i: string) => i ? true : 'Campo requerido' },
      { type: 'input', name: 'complemento', message: 'Complemento (opcional):', default: '' },
      // Selección de departamento (expedido)
      {
        type: 'list',
        name: 'expedido',
        message: 'Expedido:',
        choices: ['CH', 'TJ', 'PT', 'LP', 'OR', 'CB', 'SC', 'BN', 'PA'],
      },
      // Otros datos opcionales
      { type: 'input', name: 'fechaNacimiento', message: 'Fecha de nacimiento (YYYY-MM-DD):' },
      { type: 'input', name: 'celular', message: 'Celular:' },
      {
        type: 'list',
        name: 'genero',
        message: 'Género:',
        choices: ['MASCULINO', 'FEMENINO'],
      },
      // Selección múltiple de roles
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
      // Selección múltiple de niveles
      {
        type: 'checkbox',
        name: 'niveles',
        message: 'Nivel(es):',
        choices: ['PM', 'PT', 'SM', 'ST'],
        validate: (input: string[]) =>
          input.length > 0 ? true : 'Debe seleccionar al menos un nivel',
      },
    ]
    // Se ejecutan las preguntas y se guardan las respuestas
    const answers = await inquirer.prompt(questions)
    // Verificar si ya existe un usuario con el mismo email
    const existe = await Usuario.findOne({ email: answers.email })
    if (existe) {
      console.log(chalk.red(`❌ Ya existe un usuario con el email ${answers.email}`))
      process.exit(1)
    }

    // Encriptar la contraseña antes de guardarla en la BD
    const hashedPassword = await bcrypt.hash(answers.password, 10)
    // Crear y guardar el nuevo usuario en la base de datos
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
    // Captura de errores en el proceso
    console.error(chalk.red('❌ Error al crear usuario:'), err)
    process.exit(1)
  }
}

addUser()
