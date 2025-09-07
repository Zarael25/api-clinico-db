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




// 📌 Obtener solo las alergias de un estudiante
export const getAlergiasByEstudiante = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { estudianteId } = req.params

    const condicionBase = await CondicionBase.findOne({ estudiante: estudianteId })
      .select('alergias -_id') // 👈 solo trae el campo alergias, sin _id
      .lean()

    if (!condicionBase) {
      return res.status(404).json({ message: 'Condición base no encontrada' })
    }

    res.json(condicionBase.alergias || [])
  } catch (err) {
    next(err)
  }
}



// Reemplazar todas las alergias de un estudiante (limpiando vacías)
export const updateAlergias = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { estudianteId } = req.params
    let { alergias } = req.body // 👈 { "alergias": [{ "alergia": "Polvo" }] }

    if (!Array.isArray(alergias)) {
      return res.status(400).json({ message: "Debe enviar un array de alergias" })
    }

    // 🔎 Filtrar vacías
    const alergiasLimpias = alergias.filter(
      (a: any) => a.alergia && a.alergia.trim() !== ""
    )

    // 👇 Guardar reemplazando toda la lista
    const condicionBase = await CondicionBase.findOneAndUpdate(
      { estudiante: estudianteId },
      { $set: { alergias: alergiasLimpias } },
      { new: true, upsert: true }
    ).lean()

    if (!condicionBase) {
      return res.status(404).json({ message: "Condición base no encontrada" })
    }

    res.status(200).json(condicionBase)
  } catch (err) {
    next(err)
  }
}




// Obtener solo las vacunas de un estudiante
export const getVacunasByEstudiante = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { estudianteId } = req.params

    const condicionBase = await CondicionBase.findOne({ estudiante: estudianteId })
      .select('vacunas -_id') // 👈 solo trae el campo vacunas, sin _id
      .lean()

    if (!condicionBase) {
      return res.status(404).json({ message: 'Condición base no encontrada' })
    }

    res.json(condicionBase.vacunas || [])
  } catch (err) {
    next(err)
  }
}



// Reemplazar todas las vacunas de un estudiante (limpiando vacías)
export const updateVacunas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { estudianteId } = req.params
    let { vacunas } = req.body // 👈 { "vacunas": [{ "vacuna": "Influenza 2024" }] }

    if (!Array.isArray(vacunas)) {
      return res.status(400).json({ message: "Debe enviar un array de vacunas" })
    }

    // 🔎 Filtrar vacías
    const vacunasLimpias = vacunas.filter(
      (v: any) => v.vacuna && v.vacuna.trim() !== ""
    )

    // 👇 Guardar reemplazando toda la lista
    const condicionBase = await CondicionBase.findOneAndUpdate(
      { estudiante: estudianteId },
      { $set: { vacunas: vacunasLimpias } },
      { new: true, upsert: true }
    ).lean()

    if (!condicionBase) {
      return res.status(404).json({ message: "Condición base no encontrada" })
    }

    res.status(200).json(condicionBase)
  } catch (err) {
    next(err)
  }
}
