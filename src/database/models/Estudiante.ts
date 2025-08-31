// models/Estudiante.ts
import { Schema, model, Document, Types } from 'mongoose'

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

  user: Types.ObjectId
  rUde: string
  codigoBanco: string
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
    user: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    rUde: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
    codigoBanco: {
      type: String,
      trim: true,
    },
    estadoInscripcion: {
      type: String,
      enum: ['INSCRITO', 'NO_INSCRITO', 'PENDIENTE'],
      default: 'PENDIENTE',
      trim: true,
    },
    estadoPago: {
      type: Boolean,
      default: false,
    },
    estadoRecepcion: {
      type: Boolean,
      default: false,
    },
    gestiones: [GestionSchema],
    tutores: [TutorSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

const Estudiante = model<EstudianteAttributes>('Estudiante', EstudianteSchema)
export default Estudiante
