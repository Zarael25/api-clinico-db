/**
 * Descripción:
 *   Script para inicializar las condiciones clínicas base de todos los estudiantes
 *   en la base de datos. Garantiza que cada estudiante tenga un registro asociado
 *   en la colección CondicionBase.
 *
 * Características:
 *   - Recorre todos los estudiantes registrados.
 *   - Verifica si ya existe una condición base para cada estudiante.
 *   - Crea un registro vacío con campos predeterminados (condición, alergias, vacunas) si no existe.
 *   - Muestra un resumen con la cantidad de registros creados y ya existentes.
 *
 * Uso:
 *   ts-node scripts/initCondicionesBase.ts
 */

import '../src/database/connection'
import Estudiante from '../src/database/models/Estudiante'
import CondicionBase from '../src/database/models/CondicionBase'

async function initCondicionesBase() {
  try {
    // Obtener todos los estudiantes registrados en la base de datos
    const estudiantes = await Estudiante.find()
    let creados = 0
    let existentes = 0

    // Recorrer cada estudiante para verificar si ya tiene condición base
    for (const est of estudiantes) {
      const existe = await CondicionBase.findOne({ estudiante: est._id })

      // Si ya tiene condición base, solo contar como existente
      if (existe) {
        existentes++
        continue
      }

      // Crear una nueva condición base vacía para el estudiante
      await CondicionBase.create({
        estudiante: est._id,
        condicion: '',
        alergias: [],
        vacunas: [],
      })
      
      console.log(`🟢 Creada condición base para estudiante ${est.nombre}`)
      creados++
    }

    // Mostrar un resumen final con cuántos se crearon y cuántos ya existían
    console.log(`\nResumen: ${creados} creados, ${existentes} ya existían`)
    process.exit(0)
  } catch (err) {
    // Captura de errores durante la ejecución del script
    console.error('❌ Error ejecutando script:', err)
    process.exit(1)
  }
}

initCondicionesBase()
