import { Request, Response, NextFunction } from 'express'
import AtencionMedica from '../../../database/models/AtencionMedica'
import Estudiante from '../../../database/models/Estudiante'

// ------------------ Obtener Resumen del Dashboard Clínico ------------------
export const getDashboardResumen = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ahora = new Date()
    const anioActual = ahora.getFullYear()

    const inicioAnio = new Date(anioActual, 0, 1)
    const finAnio = new Date(anioActual, 11, 31, 23, 59, 59)
    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
    const finHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59)

    // 1️⃣ Total de atenciones del año
    const atencionesTotales = await AtencionMedica.countDocuments({
      fecha: { $gte: inicioAnio, $lte: finAnio },
    })

    // 2️⃣ Estudiantes únicos atendidos
    const estudiantesAtendidos = await AtencionMedica.distinct('estudiante', {
      fecha: { $gte: inicioAnio, $lte: finAnio },
    })

    // 3️⃣ Medicamentos administrados
    const medicamentos = await AtencionMedica.aggregate([
      { $match: { fecha: { $gte: inicioAnio, $lte: finAnio } } },
      { $unwind: '$medicamentosAdministrados' },
      { $count: 'total' },
    ])
    const medicamentosAdministrados = medicamentos[0]?.total || 0

    // 4️⃣ Casos con sugerencia de baja
    const casosConBaja = await AtencionMedica.countDocuments({
      sugerir_baja: true,
      fecha: { $gte: inicioAnio, $lte: finAnio },
    })

    // 5️⃣ Atenciones de hoy
    const atencionesHoy = await AtencionMedica.countDocuments({
      fecha: { $gte: inicioHoy, $lte: finHoy },
    })

    // Enviar el resumen
    res.json({
      atencionesTotales,
      estudiantesAtendidos: estudiantesAtendidos.length,
      medicamentosAdministrados,
      casosConBaja,
      atencionesHoy,
    })
  } catch (err) {
    next(err)
  }
}


// ------------------ Obtener Atenciones por Nivel ------------------
export const getAtencionesPorNivel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ahora = new Date()
    const anioActual = ahora.getFullYear()

    const inicioAnio = new Date(anioActual, 0, 1)
    const finAnio = new Date(anioActual, 11, 31, 23, 59, 59)

    // 1️⃣ Obtener todas las atenciones del año actual
    const atenciones = await AtencionMedica.find({
      fecha: { $gte: inicioAnio, $lte: finAnio },
    }).lean()

    if (!atenciones.length) {
      return res.json({
        message: 'No hay atenciones registradas este año',
        data: [
          { nivel: 'PM', totalAtenciones: 0, estudiantesAtendidos: 0 },
          { nivel: 'SM', totalAtenciones: 0, estudiantesAtendidos: 0 },
          { nivel: 'PT', totalAtenciones: 0, estudiantesAtendidos: 0 },
          { nivel: 'ST', totalAtenciones: 0, estudiantesAtendidos: 0 },
        ],
      })
    }

    // 2️⃣ Sacar todos los IDs de estudiantes involucrados
    const idsEstudiantes = [...new Set(atenciones.map((a) => a.estudiante?.toString()))]

    // 3️⃣ Obtener los estudiantes de la otra base
    const estudiantes = await Estudiante.find({ _id: { $in: idsEstudiantes } }).lean()

    // 4️⃣ Crear un mapa de niveles por estudiante
    const mapaNiveles = new Map<string, string>()

    for (const est of estudiantes) {
      const gestionActual = est.gestiones?.find((g) => g.gestion === anioActual)
      if (gestionActual) mapaNiveles.set(est._id.toString(), gestionActual.nivel)
    }

    // 5️⃣ Contar atenciones y estudiantes por nivel
    const resumen: Record<string, { totalAtenciones: number; estudiantes: Set<string> }> = {
      PM: { totalAtenciones: 0, estudiantes: new Set() },
      SM: { totalAtenciones: 0, estudiantes: new Set() },
      PT: { totalAtenciones: 0, estudiantes: new Set() },
      ST: { totalAtenciones: 0, estudiantes: new Set() },
    }

    for (const at of atenciones) {
      const id = at.estudiante?.toString()
      const nivel = mapaNiveles.get(id)
      if (nivel && resumen[nivel]) {
        resumen[nivel].totalAtenciones++
        resumen[nivel].estudiantes.add(id)
      }
    }

    // 6️⃣ Formatear respuesta
    const data = Object.keys(resumen).map((nivel) => ({
      nivel,
      totalAtenciones: resumen[nivel].totalAtenciones,
      estudiantesAtendidos: resumen[nivel].estudiantes.size,
    }))

    res.json({
      message: 'Estadísticas de atenciones por nivel',
      data,
    })
  } catch (err) {
    next(err)
  }
}