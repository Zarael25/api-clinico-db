import bcrypt from 'bcryptjs'

import Usuario, { UsuarioAttributes } from '../database/models/Usuario'
import BaseRepository from './BaseRepository'
import { Types, UpdateQuery } from 'mongoose'

export default class UsuarioRepository extends BaseRepository<UsuarioAttributes> {
  protected allowedSortByFields = [
    'role_name',
    'status',
    'createdAt',
    'updatedAt',
  ]
  protected allowedFilterByFields = ['fullname', 'doc_number']

  public constructor() {
    super(Usuario)
  }

  public async create(body: Record<string, any>): Promise<UsuarioAttributes> {
    await this.validateReferences(body)
    body.password = await this.encryptPassword(body.password)
    return this.model.create(body)
  }

  private async encryptPassword(password: string) {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
  }

  public async comparePassword(password: string, receivedPassword: string) {
    return await bcrypt.compare(password, receivedPassword)
  }

  public async updatePasswordByUsuarioId(
    userId: string | Types.ObjectId,
    data: UpdateQuery<UsuarioAttributes>,
  ) {
    data.password = await this.encryptPassword(data.password)

    return this.model.findByIdAndUpdate(userId, data, { new: true }).exec()
  }

  public getAuthByCarnet(carnet: string): Promise<UsuarioAttributes | null> {
    return this.model.findOne({ carnet }).exec()
  }
}
