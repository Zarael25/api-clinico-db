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

  const conex = await connect(EnvManager.getDbConnectionUrl()).catch(
    handleFatalError,
  )
  if (!conex) return

  // DROP DATABASE!
  await conex?.connection?.db?.dropDatabase()
  log(chalk.yellow('DELETED DATABASE!'))

  await createAdmin()

  log(`${chalk.bgGreen('[DB Setup]')} ${chalk.green('¡Éxito!')}`)
  process.exit(0)
}

function handleFatalError(err: any) {
  log(`${chalk.bgRed('[Fatal Error]')} ${chalk.red(err.message)}`)
  log(err.stack)
  process.exit(1)
}

setup()
