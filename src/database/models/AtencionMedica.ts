// models/AtencionMedica.ts
import { Schema, model, Document, Types } from 'mongoose'
import { connUsuarios } from '../connection'  // 👈 importa tu conexión correcta

export type MedicamentoAdministradoEntity = {
  medicamento: Types.ObjectId
  dosis: string
  via: string
}

export type AtencionMedicaEntity = {
  id?: string | any

  estudiante: Types.ObjectId
  user: Types.ObjectId // el profesional que atiende (Usuario)
  fecha: Date
  motivo_consulta: string
  diagnostico: string
  tratamiento: string
  sugerir_baja: boolean

  medicamentosAdministrados?: MedicamentoAdministradoEntity[]

  createdAt?: Date
  updatedAt?: Date
}

export interface AtencionMedicaAttributes
  extends AtencionMedicaEntity,
    Document {}

const MedicamentoAdministradoSchema = new Schema<MedicamentoAdministradoEntity>(
  {
    medicamento: {
      type: Schema.Types.ObjectId,
      ref: 'Medicamento',
      required: true,
    },
    dosis: {
      type: String,
      trim: true,
      required: true,
    },
    via: {
      type: String,
      enum: ['ORAL', 'INTRAVENOSA', 'INTRAMUSCULAR', 'SUBCUTANEA', 'TOPICA'],
      uppercase: true,
      trim: true,
      required: true,
    },
  },
  { _id: false },
)

const AtencionMedicaSchema = new Schema<AtencionMedicaAttributes>(
  {
    estudiante: {
      type: Schema.Types.ObjectId,
      ref: 'Estudiante',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
    motivo_consulta: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
    diagnostico: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
    tratamiento: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
    sugerir_baja: {
      type: Boolean,
      default: false,
    },
    medicamentosAdministrados: [MedicamentoAdministradoSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

const AtencionMedica = connUsuarios.model<AtencionMedicaAttributes>(
  'AtencionMedica',
  AtencionMedicaSchema,
)

export default AtencionMedica
