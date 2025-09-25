import { Request, Response, NextFunction } from 'express'
import Tutor from '../../../database/models/Tutor'
import Estudiante from '../../../database/models/Estudiante'

/**
 * 📌 Crear un nuevo tutor
 */
export const createTutor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre, apellido, carnet, lugarTrabajo, parentesco, celular, estudiantes } = req.body

    const tutor = new Tutor({
      nombre,
      apellido,
      carnet,
      lugarTrabajo,
      parentesco,
      celular,
      estudiantes,
    })

    await tutor.save()

    return res.status(201).json({
      message: 'Tutor registrado correctamente',
      tutor,
    })
  } catch (error: any) {
    console.error(error)
    return res.status(500).json({ message: 'Error al registrar tutor', error: error.message })
  }
}

/**
 * 📌 Listar todos los tutores (sin estudiantes detallados)
 */
export const getTutores = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tutores = await Tutor.find().lean()
    return res.status(200).json({
      message: 'Lista de tutores obtenida correctamente',
      tutores,
    })
  } catch (error: any) {
    console.error(error)
    return res.status(500).json({ message: 'Error al obtener tutores', error: error.message })
  }
}

/**
 * 📌 Obtener tutores con estudiantes (join manual con connEstudiantes)
 */
export const getTutoresConEstudiantes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tutores = await Tutor.find().lean()

    const resultado = await Promise.all(
      tutores.map(async (tutor: any) => {
        const estudiantes = await Estudiante.find({
          _id: { $in: tutor.estudiantes },
        }).lean()

        return {
          ...tutor,
          estudiantes,
        }
      })
    )

    return res.status(200).json({
      message: 'Lista de tutores con estudiantes cargados',
      tutores: resultado,
    })
  } catch (error: any) {
    console.error(error)
    return res.status(500).json({ message: 'Error al obtener tutores con estudiantes', error: error.message })
  }
}

/**
 * 📌 Obtener un tutor por ID
 */
export const getTutorById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const tutor = await Tutor.findById(id).lean()
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor no encontrado' })
    }

    // traer estudiantes asociados
    const estudiantes = await Estudiante.find({
      _id: { $in: tutor.estudiantes },
    }).lean()

    return res.status(200).json({
      message: 'Tutor obtenido correctamente',
      tutor: { ...tutor, estudiantes },
    })
  } catch (error: any) {
    console.error(error)
    return res.status(500).json({ message: 'Error al obtener tutor', error: error.message })
  }
}

/**
 * 📌 Editar tutor completo
 */
export const updateTutor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { nombre, apellido, carnet, lugarTrabajo, parentesco, celular, estudiantes } = req.body

    const tutor = await Tutor.findByIdAndUpdate(
      id,
      { nombre, apellido, carnet, lugarTrabajo, parentesco, celular, estudiantes },
      { new: true }
    ).lean()

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor no encontrado' })
    }

    return res.status(200).json({
      message: 'Tutor actualizado correctamente',
      tutor,
    })
  } catch (error: any) {
    console.error(error)
    return res.status(500).json({ message: 'Error al actualizar tutor', error: error.message })
  }
}

/**
 * 📌 Agregar estudiante a tutor
 */
export const addEstudianteToTutor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params // id del tutor
    const { estudianteId } = req.body

    const tutor = await Tutor.findByIdAndUpdate(
      id,
      { $addToSet: { estudiantes: estudianteId } }, // evita duplicados
      { new: true }
    ).lean()

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor no encontrado' })
    }

    return res.status(200).json({
      message: 'Estudiante agregado al tutor correctamente',
      tutor,
    })
  } catch (error: any) {
    console.error(error)
    return res.status(500).json({ message: 'Error al agregar estudiante al tutor', error: error.message })
  }
}

/**
 * 📌 Remover estudiante de tutor
 */
export const removeEstudianteFromTutor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, estudianteId } = req.params

    const tutor = await Tutor.findByIdAndUpdate(
      id,
      { $pull: { estudiantes: estudianteId } },
      { new: true }
    ).lean()

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor no encontrado' })
    }

    return res.status(200).json({
      message: 'Estudiante removido del tutor correctamente',
      tutor,
    })
  } catch (error: any) {
    console.error(error)
    return res.status(500).json({ message: 'Error al remover estudiante del tutor', error: error.message })
  }
}
