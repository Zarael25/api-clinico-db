// models/Medicamento.ts
import { Schema, model, Document } from 'mongoose'

export type MedicamentoEntity = {
  id?: string | any

  nombre_comercial: string
  nombre_generico: string
  presentacion: string

  createdAt?: Date
  updatedAt?: Date
}

export interface MedicamentoAttributes extends MedicamentoEntity, Document {}

const MedicamentoSchema = new Schema<MedicamentoAttributes>(
  {
    nombre_comercial: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
    nombre_generico: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
    presentacion: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

const Medicamento = model<MedicamentoAttributes>(
  'Medicamento',
  MedicamentoSchema,
)
export default Medicamento
