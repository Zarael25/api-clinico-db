// controllers/tutores/controller.ts
import { Request, Response, NextFunction } from 'express'
import Tutor from '../../../database/models/Tutor'

/**
 * 📌 Crear un nuevo tutor
 */
export const createTutor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre, apellido, carnet, lugarTrabajo, parentesco, celular, estudiantes } = req.body

    // ✅ Crear tutor
    const tutor = new Tutor({
      nombre,
      apellido,
      carnet,
      lugarTrabajo,
      parentesco,
      celular,
      estudiantes, // array de ObjectId de estudiantes si los envías
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
 * 📌 Listar todos los tutores
 */
export const getTutores = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tutores = await Tutor.find().populate('estudiantes') // 👈 si quieres traer estudiantes completos

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
 * 📌 Editar tutor por ID
 */
export const updateTutor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { nombre, apellido, carnet, lugarTrabajo, parentesco, celular, estudiantes } = req.body

    const tutor = await Tutor.findByIdAndUpdate(
      id,
      {
        nombre,
        apellido,
        carnet,
        lugarTrabajo,
        parentesco,
        celular,
        estudiantes,
      },
      { new: true }
    ).populate('estudiantes')

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
 * 📌 Obtener un tutor por ID
 */
export const getTutorById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const tutor = await Tutor.findById(id).populate('estudiantes')

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor no encontrado' })
    }

    return res.status(200).json({
      message: 'Tutor obtenido correctamente',
      tutor,
    })
  } catch (error: any) {
    console.error(error)
    return res.status(500).json({ message: 'Error al obtener tutor', error: error.message })
  }
}
