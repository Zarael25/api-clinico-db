// routes/v1/estudiantes/controller.ts
import { Request, Response, NextFunction } from 'express'
import Estudiante from '../../../database/models/Estudiante'

export const getEstudiantes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const estudiantes = await Estudiante.find().lean()
    return res.json({
      count: estudiantes.length,
      data: estudiantes,
    })
  } catch (err) {
    next(err)
  }
}

// 🔎 Nuevo buscador
export const searchEstudiantes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre, appaterno, apmaterno, carnet, nivel, curso } = req.query

    const filter: any = {}

    if (nombre) {
      filter.nombre = { $regex: new RegExp(nombre as string, 'i') }
    }
    if (appaterno) {
      filter.appaterno = { $regex: new RegExp(appaterno as string, 'i') }
    }
    if (apmaterno) {
      filter.apmaterno = { $regex: new RegExp(apmaterno as string, 'i') }
    }
    if (carnet) {
      filter.carnet = { $regex: new RegExp(carnet as string, 'i') }
    }
    if (nivel) {
      filter['gestiones.nivel'] = { $regex: new RegExp(nivel as string, 'i') }
    }
    if (curso) {
      filter['gestiones.curso'] = { $regex: new RegExp(curso as string, 'i') }
    }

    const estudiantes = await Estudiante.find(filter).lean()

    return res.json({
      count: estudiantes.length,
      data: estudiantes,
    })
  } catch (err) {
    next(err)
  }
}
