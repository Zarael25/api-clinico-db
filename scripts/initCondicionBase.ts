import '../src/database/connection'
import Estudiante from '../src/database/models/Estudiante'
import CondicionBase from '../src/database/models/CondicionBase'

async function initCondicionesBase() {
  try {
    const estudiantes = await Estudiante.find()
    let creados = 0
    let existentes = 0

    for (const est of estudiantes) {
      const existe = await CondicionBase.findOne({ estudiante: est._id })
      if (existe) {
        existentes++
        continue
      }

      await CondicionBase.create({
        estudiante: est._id,
        condicion: '',
        alergias: [],
        vacunas: [],
      })

      console.log(`🟢 Creada condición base para estudiante ${est.nombre}`)
      creados++
    }

    console.log(`\nResumen: ${creados} creados, ${existentes} ya existían`)
    process.exit(0)
  } catch (err) {
    console.error('❌ Error ejecutando script:', err)
    process.exit(1)
  }
}

initCondicionesBase()
