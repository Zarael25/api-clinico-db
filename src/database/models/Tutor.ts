// models/Tutor.ts
import { Schema, model, Document, Types } from 'mongoose'

export type TutorEntity = {
  id?: string | any

  nombre: string
  apellido: string
  carnet: string
  lugarTrabajo?: string
  parentesco: string
  celular: string

  // 🔗 relación con estudiantes
  estudiantes?: Types.ObjectId[]
}

export interface TutorAttributes extends TutorEntity, Document {}

const TutorSchema = new Schema<TutorAttributes>(
  {
    nombre: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
    apellido: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
    carnet: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
    lugarTrabajo: {
      type: String,
      uppercase: true,
      trim: true,
      default: '',
    },
    parentesco: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
    celular: {
      type: String,
      trim: true,
    },
    estudiantes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Estudiante', // 🔗 referencia a la colección de estudiantes
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

const Tutor = model<TutorAttributes>('Tutor', TutorSchema)
export default Tutor
