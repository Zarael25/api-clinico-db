/**
 * Descripción:
 *   Controladores para la gestión de tutores en el sistema.
 *   Permiten registrar, listar, consultar detalle, actualizar,
 *   y gestionar la relación con estudiantes.
 *
 * Características:
 *   - createTutor: registra un nuevo tutor en la BD.
 *   - getTutores: devuelve lista de todos los tutores.
 *   - getTutoresConEstudiantes: lista tutores con sus estudiantes cargados.
 *   - getTutorById: obtiene detalle de un tutor junto a sus estudiantes.
 *   - updateTutor: actualiza datos de un tutor existente.
 *   - addEstudianteToTutor: agrega un estudiante a la lista de un tutor.
 *   - removeEstudianteFromTutor: elimina un estudiante de la lista de un tutor.
 *
 * Uso:
 *   router.post('/tutores', createTutor)
 *   router.get('/tutores', getTutores)
 *   router.get('/tutores/con-estudiantes', getTutoresConEstudiantes)
 *   router.get('/tutores/:id', getTutorById)
 *   router.patch('/tutores/:id', updateTutor)
 *   router.post('/tutores/:id/add-estudiante', addEstudianteToTutor)
 *   router.delete('/tutores/:id/remove-estudiante/:estudianteId', removeEstudianteFromTutor)
 */

import { Request, Response, NextFunction } from 'express'
import Tutor from '../../../database/models/Tutor'
import Estudiante from '../../../database/models/Estudiante'

// ------------------ Crear Tutor ------------------
export const createTutor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre, apellido, carnet, lugarTrabajo, parentesco, celular, estudiantes } = req.body

    // Crear nuevo tutor
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

// ------------------ Listar Tutores ------------------
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


// ------------------ Listar Tutores con Estudiantes ------------------
export const getTutoresConEstudiantes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tutores = await Tutor.find().lean()

    // Cargar estudiantes relacionados para cada tutor
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


// ------------------ Obtener Tutor por ID ------------------
export const getTutorById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    // Buscar tutor
    const tutor = await Tutor.findById(id).lean()
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor no encontrado' })
    }

    // Obtener estudiantes asociados
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


// ------------------ Actualizar Tutor ------------------
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


// ------------------ Agregar Estudiante a Tutor ------------------
export const addEstudianteToTutor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params 
    const { estudianteId } = req.body

    const tutor = await Tutor.findByIdAndUpdate(
      id,
      { $addToSet: { estudiantes: estudianteId } },
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


// ------------------ Remover Estudiante de Tutor ------------------
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
