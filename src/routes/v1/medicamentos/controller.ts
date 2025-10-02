/**
 * Descripción:
 *   Controladores para la gestión de medicamentos en el sistema.
 *   Permiten crear, listar, obtener por ID, actualizar y eliminar medicamentos.
 *
 * Características:
 *   - createMedicamento: registra un nuevo medicamento.
 *   - getMedicamentos: lista todos los medicamentos almacenados.
 *   - getMedicamentoById: obtiene un medicamento específico por su ID.
 *   - updateMedicamento: actualiza la información de un medicamento existente.
 *   - deleteMedicamento: elimina un medicamento por ID.
 *
 * Uso:
 *   router.post('/medicamentos', createMedicamento)
 *   router.get('/medicamentos', getMedicamentos)
 *   router.get('/medicamentos/:id', getMedicamentoById)
 *   router.patch('/medicamentos/:id', updateMedicamento)
 *   router.delete('/medicamentos/:id', deleteMedicamento)
 */

import { Request, Response, NextFunction } from 'express'
import Medicamento from '../../../database/models/Medicamento'

// ------------------ Crear medicamento ------------------
export const createMedicamento = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre_comercial, nombre_generico, presentacion } = req.body

    // Crear nuevo documento en MongoDB
    const nuevo = await Medicamento.create({
      nombre_comercial,
      nombre_generico,
      presentacion
    })

    res.status(201).json(nuevo)
  } catch (err) {
    next(err)
  }
}

// ------------------ Listar todos los medicamentos ------------------
export const getMedicamentos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const meds = await Medicamento.find().lean()
    res.json(meds)
  } catch (err) {
    next(err)
  }
}

// ------------------ Obtener medicamento por ID ------------------
export const getMedicamentoById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const med = await Medicamento.findById(id).lean()

    if (!med) return res.status(404).json({ message: 'Medicamento no encontrado' })

    res.json(med)
  } catch (err) {
    next(err)
  }
}

// ------------------ Actualizar medicamento ------------------
export const updateMedicamento = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { nombre_comercial, nombre_generico, presentacion } = req.body

    // Actualizar documento y devolver el actualizado
    const actualizado = await Medicamento.findByIdAndUpdate(
      id,
      { nombre_comercial, nombre_generico, presentacion },
      { new: true }
    ).lean()

    if (!actualizado) return res.status(404).json({ message: 'Medicamento no encontrado' })

    res.json(actualizado)
  } catch (err) {
    next(err)
  }
}


// ------------------ Eliminar medicamento ------------------
export const deleteMedicamento = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const eliminado = await Medicamento.findByIdAndDelete(id).lean()

    if (!eliminado) return res.status(404).json({ message: 'Medicamento no encontrado' })

    res.json({ message: 'Medicamento eliminado correctamente' })
  } catch (err) {
    next(err)
  }
}
