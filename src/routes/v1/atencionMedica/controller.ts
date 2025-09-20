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
