import { Schema, model, Document, Types } from 'mongoose'

export type AlergiaEntity = {
  alergia: string
}

export type VacunaEntity = {
  vacuna: string
}

export type CondicionBaseEntity = {
  id?: string | any

  estudiante: Types.ObjectId
  condicion: string

  alergias?: AlergiaEntity[]
  vacunas?: VacunaEntity[]
}

export interface CondicionBaseAttributes extends CondicionBaseEntity, Document {}

const AlergiaSchema = new Schema<AlergiaEntity>(
  {
    alergia: { type: String, uppercase: true, trim: true, required: true },
  },
  { _id: false },
)

const VacunaSchema = new Schema<VacunaEntity>(
  {
    vacuna: { type: String, uppercase: true, trim: true, required: true },
  },
  { _id: false },
)

const CondicionBaseSchema = new Schema<CondicionBaseAttributes>(
  {
    estudiante: {
      type: Schema.Types.ObjectId,
      ref: 'Estudiante',
      required: true,
    },
    condicion: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
    alergias: [AlergiaSchema],
    vacunas: [VacunaSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

const CondicionBase = model<CondicionBaseAttributes>(
  'CondicionBase',
  CondicionBaseSchema,
)
export default CondicionBase