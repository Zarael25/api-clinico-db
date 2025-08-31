// models/Estudiante.ts
import { Schema, model, Document } from 'mongoose'
import { connEstudiantes } from '../connection'

export type GestionEntity = {
  gestion: number
  curso: string
  cursoGob: string
  nivel: string
  reprobado: boolean
}

export type TutorEntity = {
  nombre: string
  apellido: string
  parentesco: string
  celular: string
}

export type EstudianteEntity = {
  id?: string | any

  nombre: string
  appaterno: string
  apmaterno?: string
  carnet: string

  rude: string
  codigoBanco?: string
  estadoInscripcion: string
  estadoPago: boolean
  estadoRecepcion: boolean

  gestiones?: GestionEntity[]
  tutores?: TutorEntity[]
}

export interface EstudianteAttributes extends EstudianteEntity, Document {}

const GestionSchema = new Schema<GestionEntity>(
  {
    gestion: { type: Number, required: true },
    curso: { type: String, trim: true, required: true },
    cursoGob: { type: String, trim: true },
    nivel: { type: String, trim: true, required: true },
    reprobado: { type: Boolean, default: false },
  },
  { _id: false },
)

const TutorSchema = new Schema<TutorEntity>(
  {
    nombre: { type: String, uppercase: true, trim: true, required: true },
    apellido: { type: String, uppercase: true, trim: true, required: true },
    parentesco: { type: String, uppercase: true, trim: true, required: true },
    celular: { type: String, trim: true },
  },
  { _id: false },
)

const EstudianteSchema = new Schema<EstudianteAttributes>(
  {
    nombre: { type: String, uppercase: true, trim: true, required: true },
    appaterno: { type: String, uppercase: true, trim: true, required: true },
    apmaterno: { type: String, uppercase: true, trim: true },
    carnet: { type: String, uppercase: true, trim: true, required: true },

    rude: { type: String, uppercase: true, trim: true, required: true, unique: true },
    codigoBanco: { type: String, uppercase: true, trim: true },
    estadoInscripcion: {
      type: String,
      enum: ['INSCRITO', 'NO_INSCRITO', 'PENDIENTE'],
      default: 'PENDIENTE',
      trim: true,
    },
    estadoPago: { type: Boolean, default: false },
    estadoRecepcion: { type: Boolean, default: false },

    gestiones: [GestionSchema],
    tutores: [TutorSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// Index RUDE para búsquedas rápidas
EstudianteSchema.index({ rude: 1 }, { unique: true })

// 👇 Usamos la conexión de estudiantes
const Estudiante = connEstudiantes.model<EstudianteAttributes>('Estudiante', EstudianteSchema)
export default Estudiante
