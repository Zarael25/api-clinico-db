// routes/v1/atencionMedica/controller.ts
import { Request, Response, NextFunction } from 'express'
import AtencionMedica from '../../../database/models/AtencionMedica'
import Estudiante from '../../../database/models/Estudiante'

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


export const getAtencionesByFecha = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fecha } = req.query

    if (!fecha) {
      return res.status(400).json({ message: 'Debe enviar una fecha en formato YYYY-MM-DD' })
    }

    const inicio = new Date(`${fecha}T00:00:00.000Z`)
    const fin = new Date(`${fecha}T23:59:59.999Z`)

    // Traigo las atenciones (sin populate de estudiante porque está en otra DB)
    const atenciones = await AtencionMedica.find({
      fecha: { $gte: inicio, $lte: fin }
    })
      .populate('user', 'nombre correo')
      .populate('medicamentosAdministrados.medicamento', 'nombre_comercial presentacion')
      .lean() // 👈 convierte a objetos planos
      .exec()

    // Extraigo los IDs de estudiantes
    const idsEstudiantes = atenciones.map(a => a.estudiante).filter(Boolean)

    // Consulto estudiantes en su propia conexión
    const estudiantes = await Estudiante.find({ _id: { $in: idsEstudiantes } })
      .select('nombre appaterno apmaterno carnet rude tutores gestiones')
      .lean()

    // Combino estudiantes con sus atenciones
    const estudiantesMap = new Map(estudiantes.map(e => [String(e._id), e]))

    const resultado = atenciones.map(a => ({
      ...a,
      estudiante: estudiantesMap.get(String(a.estudiante)) || null
    }))

    res.json(resultado)
  } catch (err) {
    next(err)
  }
}