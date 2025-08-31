// models/AtencionMedica.ts
import { Schema, model, Document, Types } from 'mongoose'

export type MedicamentoAdministradoEntity = {
  medicamento: Types.ObjectId
  dosis: string
  frecuencia: string
  via: string
}

export type AtencionMedicaEntity = {
  id?: string | any

  estudiante: Types.ObjectId
  user: Types.ObjectId // el profesional que atiende (Usuario)
  motivo: string
  diagnostico: string
  tratamiento: string
  observaciones?: string

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
    frecuencia: {
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
    motivo: {
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
    observaciones: {
      type: String,
      uppercase: true,
      trim: true,
    },
    medicamentosAdministrados: [MedicamentoAdministradoSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

const AtencionMedica = model<AtencionMedicaAttributes>(
  'AtencionMedica',
  AtencionMedicaSchema,
)
export default AtencionMedica
