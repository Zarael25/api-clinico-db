// routes/v1/atencionMedica/controller.ts
import { Request, Response, NextFunction } from 'express'
import AtencionMedica from '../../../database/models/AtencionMedica'

// 📌 Crear una nueva atención médica
export const createAtencionMedica = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { estudiante, motivo_consulta, diagnostico, tratamiento, sugerir_baja, medicamentosAdministrados } = req.body

    // ⚡ El usuario autenticado lo saco del token, no del body
    const userId = (req.user as any)._id

    const nuevaAtencion = await AtencionMedica.create({
      estudiante,
      user: userId,  // siempre viene del token
      motivo_consulta,
      diagnostico,
      tratamiento,
      sugerir_baja,
      medicamentosAdministrados
    })

    res.status(201).json(nuevaAtencion)
  } catch (err) {
    next(err)
  }
}


// 📌 Listar atenciones de un estudiante
export const getAtencionesByEstudiante = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { estudianteId } = req.params

    const atenciones = await AtencionMedica.find({ estudiante: estudianteId })
      .populate('user', 'nombre correo') // solo campos básicos del profesional
      .populate('medicamentosAdministrados.medicamento', 'nombre_comercial presentacion')
      .sort({ fecha: -1 }) // más recientes primero

    res.json(atenciones)
  } catch (err) {
    next(err)
  }
}

// 📌 Obtener detalle de una atención por ID
export const getAtencionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const atencion = await AtencionMedica.findById(id)
      .populate('user', 'nombre correo')
      .populate('medicamentosAdministrados.medicamento', 'nombre_comercial nombre_generico presentacion')

    if (!atencion) {
      return res.status(404).json({ message: 'Atención no encontrada' })
    }

    res.json(atencion)
  } catch (err) {
    next(err)
  }
}


