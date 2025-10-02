/**
 * Descripción:
 *   Controladores para la gestión de la condición clínica base de los estudiantes.
 *   Incluye información general de salud, alergias y vacunas.
 *
 * Características:
 *   - createOrUpdateCondicionBase: crea o actualiza la condición base de un estudiante.
 *   - getCondicionBaseByEstudiante: obtiene la condición base completa.
 *   - updateCondicionBase: edita todos los campos (condición, alergias, vacunas).
 *   - updateSoloCondicion: edita solo la condición general.
 *   - getAlergiasByEstudiante / updateAlergias: obtiene o reemplaza las alergias.
 *   - getVacunasByEstudiante / updateVacunas: obtiene o reemplaza las vacunas.
 *
 * Uso:
 *   router.post('/condicion-base/:estudianteId', createOrUpdateCondicionBase)
 *   router.get('/condicion-base/:estudianteId', getCondicionBaseByEstudiante)
 *   router.put('/condicion-base/:estudianteId', updateCondicionBase)
 *   router.patch('/condicion-base/:estudianteId/condicion', updateSoloCondicion)
 *   router.get('/condicion-base/:estudianteId/alergias', getAlergiasByEstudiante)
 *   router.put('/condicion-base/:estudianteId/alergias', updateAlergias)
 *   router.get('/condicion-base/:estudianteId/vacunas', getVacunasByEstudiante)
 *   router.put('/condicion-base/:estudianteId/vacunas', updateVacunas)
 */

import { Request, Response, NextFunction } from 'express'
import CondicionBase from '../../../database/models/CondicionBase'

// ------------------ Crear o Actualizar Condición Base ------------------
export const createOrUpdateCondicionBase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { estudianteId } = req.params
    const { condicion, alergias, vacunas } = req.body

    // Si ya existe, actualiza; si no, crea uno nuevo
    const condicionBase = await CondicionBase.findOneAndUpdate(
      { estudiante: estudianteId },
      { condicion, alergias, vacunas, estudiante: estudianteId },
      { new: true, upsert: true }
    )

    res.status(201).json(condicionBase)
  } catch (err) {
    next(err)
  }
}

// ------------------ Obtener Condición Base por Estudiante ------------------
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


// ------------------ Actualizar Toda la Condición Base ------------------
export const updateCondicionBase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { estudianteId } = req.params
    const { condicion, alergias, vacunas } = req.body

    const condicionBase = await CondicionBase.findOneAndUpdate(
      { estudiante: estudianteId },  
      { $set: { condicion, alergias, vacunas } }, 
      { new: true } 
    ).lean()

    if (!condicionBase) {
      return res.status(404).json({ message: 'Condición base no encontrada' })
    }

    res.status(200).json(condicionBase)
  } catch (err) {
    next(err)
  }
}


// ------------------ Actualizar Solo la Condición ------------------
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
      { $set: { condicion } }, 
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




// ------------------ Obtener Alergias ------------------
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



// ------------------ Actualizar Alergias ------------------
export const updateAlergias = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { estudianteId } = req.params
    let { alergias } = req.body

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




// ------------------ Obtener Vacunas ------------------
export const getVacunasByEstudiante = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { estudianteId } = req.params

    const condicionBase = await CondicionBase.findOne({ estudiante: estudianteId })
      .select('vacunas -_id')
      .lean()

    if (!condicionBase) {
      return res.status(404).json({ message: 'Condición base no encontrada' })
    }

    res.json(condicionBase.vacunas || [])
  } catch (err) {
    next(err)
  }
}



// ------------------ Actualizar Vacunas ------------------
export const updateVacunas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { estudianteId } = req.params
    let { vacunas } = req.body

    if (!Array.isArray(vacunas)) {
      return res.status(400).json({ message: "Debe enviar un array de vacunas" })
    }

    // Filtrar vacunas vacías
    const vacunasLimpias = vacunas.filter(
      (v: any) => v.vacuna && v.vacuna.trim() !== ""
    )

    
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
