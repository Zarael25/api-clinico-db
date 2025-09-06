import { Request, Response, NextFunction } from 'express'
import CondicionBase from '../../../database/models/CondicionBase'

// 📌 Crear o actualizar la condición base de un estudiante
export const createOrUpdateCondicionBase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { estudianteId } = req.params
    const { condicion, alergias, vacunas } = req.body

    // Si ya existe, actualizar; si no, crear
    const condicionBase = await CondicionBase.findOneAndUpdate(
      { estudiante: estudianteId },
      { condicion, alergias, vacunas, estudiante: estudianteId },
      { new: true, upsert: true } // 👈 crea si no existe
    )

    res.status(201).json(condicionBase)
  } catch (err) {
    next(err)
  }
}

// 📌 Obtener condición base de un estudiante
export const getCondicionBaseByEstudiante = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { estudianteId } = req.params

    const condicionBase = await CondicionBase.findOne({ estudiante: estudianteId }).lean()

    if (!condicionBase) {
      return res.status(404).json({ message: 'Condición base no encontrada' })
    }

    res.json(condicionBase)
  } catch (err) {
    next(err)
  }
}


// 📌 Editar condición base de un estudiante
export const updateCondicionBase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { estudianteId } = req.params
    const { condicion, alergias, vacunas } = req.body

    const condicionBase = await CondicionBase.findOneAndUpdate(
      { estudiante: estudianteId },   // buscar por ObjectId
      { $set: { condicion, alergias, vacunas } }, // campos a modificar
      { new: true } // devuelve el documento actualizado
    ).lean()

    if (!condicionBase) {
      return res.status(404).json({ message: 'Condición base no encontrada' })
    }

    res.status(200).json(condicionBase)
  } catch (err) {
    next(err)
  }
}


// 📌 Editar solo la condición base de un estudiante
export const updateSoloCondicion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { estudianteId } = req.params
    const { condicion } = req.body

    const condicionBase = await CondicionBase.findOneAndUpdate(
      { estudiante: estudianteId },
      { $set: { condicion } }, // 👈 solo se actualiza este campo
      { new: true }
    ).lean()

    if (!condicionBase) {
      return res.status(404).json({ message: "Condición base no encontrada" })
    }

    res.status(200).json(condicionBase)
  } catch (err) {
    next(err)
  }
}
