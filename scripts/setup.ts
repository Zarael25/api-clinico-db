/**
 * Descripción:
 *   Script de configuración inicial del sistema.
 *   Elimina por completo la base de datos existente y crea un usuario administrador por defecto.
 *
 * Características:
 *   - Solicita confirmación al usuario antes de borrar la base de datos (modo seguro).
 *   - Conexión a MongoDB usando la URL definida en EnvManager.
 *   - Elimina toda la base de datos (dropDatabase).
 *   - Crea el usuario admin inicial mediante createAdmin().
 *   - Muestra mensajes de éxito o error en consola con colores para mejor legibilidad.
 *
 * Uso:
 *   ts-node scripts/setup.ts
 *   (agregar flag --yes para ejecutar directamente sin confirmación)
 */

import { connect } from 'mongoose'
import inquirer from 'inquirer'
import chalk from 'chalk'
import minimist from 'minimist'
import EnvManager from '../src/config/EnvManager'
import { createAdmin } from './initialSetup'

const args = minimist(process.argv)
const prompt = inquirer.createPromptModule()
const log = console.log

async function setup() {
  // Si no se pasa --yes como argumento, pedir confirmación al usuario
  if (!args.yes) {
    const answer = await prompt([
      {
        type: 'confirm',
        name: 'setup',
        message: '⚠️ ¡¡Esto destruirá tu base de datos!! ⛓️‍💥  Estás seguro?',
      },
    ])

    if (!answer.setup) {
      return log(chalk.blue('No pasó nada 😀'))
    }
  }

  // Conexión a la base de datos
  const conex = await connect(EnvManager.getDbConnectionUrl()).catch(
    handleFatalError,
  )
  if (!conex) return

  // Eliminar por completo la base de datos actual
  await conex?.connection?.db?.dropDatabase()
  log(chalk.yellow('DELETED DATABASE!'))

  // Crear usuario administrador inicial
  await createAdmin()

  log(`${chalk.bgGreen('[DB Setup]')} ${chalk.green('¡Éxito!')}`)
  process.exit(0)
}

// Manejo de errores fatales en la ejecución
function handleFatalError(err: any) {
  log(`${chalk.bgRed('[Fatal Error]')} ${chalk.red(err.message)}`)
  log(err.stack)
  process.exit(1)
}

// Ejecutar el script
setup()
