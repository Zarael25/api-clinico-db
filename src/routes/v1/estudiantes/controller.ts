/**
 * Descripción:
 *   Controladores para la gestión de estudiantes en el sistema.
 *   Permiten obtener la lista completa, buscar por parámetros dinámicos,
 *   obtener un estudiante específico por ID y listar sus tutores.
 *
 * Características:
 *   - getEstudiantes: lista todos los estudiantes registrados.
 *   - searchEstudiantes: permite búsqueda filtrada (nombre, apellidos, carnet, RUDE, curso, nivel).
 *   - getEstudianteById: obtiene un estudiante específico por ID.
 *   - getTutoresByEstudiante: devuelve los tutores asociados a un estudiante.
 *
 * Uso:
 *   router.get('/estudiantes', getEstudiantes)
 *   router.get('/estudiantes/buscar', searchEstudiantes)
 *   router.get('/estudiantes/:id', getEstudianteById)
 *   router.get('/estudiantes/:id/tutores', getTutoresByEstudiante)
 */

import { Request, Response, NextFunction } from 'express'
import Estudiante from '../../../database/models/Estudiante'

// ------------------ Listar todos los estudiantes ------------------
export const getEstudiantes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtiene todos los estudiantes de la colección
    const estudiantes = await Estudiante.find().lean()
    return res.json({
      count: estudiantes.length,
      data: estudiantes,
    })
  } catch (err) {
    next(err)
  }
}


// ------------------ Buscar estudiantes (con filtros) ------------------
export const searchEstudiantes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query
    const filter: any = {}

    // Niveles accesibles según el usuario autenticado
    const user = req.user as any
    const nivelesUsuario: string[] = user?.niveles || []

    
    filter['gestiones.nivel'] = { $in: nivelesUsuario }

    // Si hay parámetro de búsqueda (q), construir condiciones dinámicas
    if (q) {
      const terms = (q as string).replace(/_/g, ' ').trim().split(/\s+/)

      // Construir filtros combinados con $and y $or
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

    // Buscar en BD
    const estudiantes = await Estudiante.find(filter).lean()

    return res.json({
      count: estudiantes.length,
      data: estudiantes,
    })
  } catch (err) {
    next(err)
  }
}


// ------------------ Obtener estudiante por ID ------------------
export const getEstudianteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    // Buscar estudiante por su ObjectId
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



// ------------------ Obtener tutores de un estudiante ------------------
export const getTutoresByEstudiante = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params

    // Buscar estudiante solo con el campo tutores
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


// ------------------ Buscar estudiantes (con filtros + paginación) ------------------
export const searchEstudiantesPaginated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q = '', pagina = '1', limite = '12' } = req.query
    const page = Math.max(parseInt(pagina as string), 1)
    const limit = Math.max(parseInt(limite as string), 1)
    const skip = (page - 1) * limit

    const filter: any = {}

    // Niveles accesibles según el usuario autenticado
    const user = req.user as any
    const nivelesUsuario: string[] = user?.niveles || []

    // Solo aplicar si tiene niveles definidos
    if (nivelesUsuario.length > 0) {
      filter['gestiones.nivel'] = { $in: nivelesUsuario }
    }

    // Si hay parámetro de búsqueda (q), construir condiciones dinámicas
    if (q && typeof q === 'string' && q.trim() !== '') {
      const terms = q.replace(/_/g, ' ').trim().split(/\s+/)
      filter.$and = terms.map((term) => ({
        $or: [
          { nombre: { $regex: term, $options: 'i' } },
          { appaterno: { $regex: term, $options: 'i' } },
          { apmaterno: { $regex: term, $options: 'i' } },
          { carnet: { $regex: term, $options: 'i' } },
          { rude: { $regex: term, $options: 'i' } },
          { 'gestiones.curso': { $regex: term, $options: 'i' } },
          { 'gestiones.nivel': { $regex: term, $options: 'i' } },
        ],
      }))
    }

    // Contar total de coincidencias
    const total = await Estudiante.countDocuments(filter)

    // Obtener solo los registros de la página actual
    const estudiantes = await Estudiante.find(filter)
      .skip(skip)
      .limit(limit)
      .lean()

    return res.json({
      total,
      pagina: page,
      limite: limit,
      data: estudiantes,
    })
  } catch (err) {
    next(err)
  }
}
