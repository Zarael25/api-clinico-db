import { Request, Response, NextFunction } from 'express'
import AtencionMedica from '../../../database/models/AtencionMedica'

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
