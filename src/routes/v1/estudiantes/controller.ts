// routes/v1/estudiantes/controller.ts
import { Request, Response, NextFunction } from 'express'
import Estudiante from '../../../database/models/Estudiante'


export const getEstudiantes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const estudiantes = await Estudiante.find().lean()
    return res.json({
      count: estudiantes.length,
      data: estudiantes,
    })
  } catch (err) {
    next(err)
  }
}

// 🔎 Nuevo buscador con un solo parámetro `q`

export const searchEstudiantes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query
    const filter: any = {}

    // 🔐 Extraer usuario autenticado desde JWT
    const user = req.user as any
    const nivelesUsuario: string[] = user?.niveles || []

    // 👇 Siempre filtrar por los niveles permitidos del usuario
    filter['gestiones.nivel'] = { $in: nivelesUsuario }

    if (q) {
      const terms = (q as string).replace(/_/g, ' ').trim().split(/\s+/)

      filter.$and = terms.map(term => ({
        $or: [
          { nombre: { $regex: term, $options: 'i' } },
          { appaterno: { $regex: term, $options: 'i' } },
          { apmaterno: { $regex: term, $options: 'i' } },
          { carnet: { $regex: term, $options: 'i' } },
          { rude: { $regex: term, $options: 'i' } },
          { 'gestiones.curso': { $regex: term, $options: 'i' } },
          { 'gestiones.nivel': { $regex: term, $options: 'i' } }, // 👈 pero igual restringido por $in de arriba
        ],
      }))
    }

    const estudiantes = await Estudiante.find(filter).lean()

    return res.json({
      count: estudiantes.length,
      data: estudiantes,
    })
  } catch (err) {
    next(err)
  }
}


// 📌 Obtener estudiante por ID
export const getEstudianteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const estudiante = await Estudiante.findById(id).lean()

    if (!estudiante) {
      return res.status(404).json({
        message: 'Estudiante no encontrado',
      })
    }

    return res.json(estudiante)
  } catch (err) {
    next(err)
  }
}



// 📌 Obtener todos los tutores de un estudiante
export const getTutoresByEstudiante = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params

    // Solo traemos el campo tutores
    const estudiante = await Estudiante.findById(id).select('tutores').lean()

    if (!estudiante) {
      return res.status(404).json({
        message: 'Estudiante no encontrado',
      })
    }

    return res.json({
      count: estudiante.tutores?.length || 0,
      data: estudiante.tutores || [],
    })
  } catch (err) {
    next(err)
  }
}