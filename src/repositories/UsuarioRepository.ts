/**
 * Descripción:
 *   Repositorio de usuarios que extiende de BaseRepository.
 *   Se encarga de operaciones específicas relacionadas con el modelo Usuario,
 *   incluyendo creación con encriptación de contraseñas, validaciones y autenticación.
 *
 * Características:
 *   - Define campos permitidos para ordenamiento y filtrado.
 *   - Sobrescribe el método create para encriptar contraseñas antes de guardar.
 *   - Permite comparar contraseñas usando bcrypt.
 *   - Proporciona método para actualizar contraseñas por ID de usuario.
 *   - Permite obtener credenciales de acceso mediante el carnet de identidad.
 *
 * Uso:
 *   const repo = new UsuarioRepository()
 *   await repo.create({ nombre, email, password, ... })
 *   const usuario = await repo.getAuthByCarnet('123456')
 */

import bcrypt from 'bcryptjs'

import Usuario, { UsuarioAttributes } from '../database/models/Usuario'
import BaseRepository from './BaseRepository'
import { Types, UpdateQuery } from 'mongoose'

export default class UsuarioRepository extends BaseRepository<UsuarioAttributes> {
  // Campos que se permiten para ordenamiento
  protected allowedSortByFields = [
    'role_name',
    'status',
    'createdAt',
    'updatedAt',
  ]

  // Campos que se permiten para filtrado
  protected allowedFilterByFields = ['fullname', 'doc_number']

  public constructor() {
    super(Usuario)// Inicializa el repositorio con el modelo Usuario
  }

  //Crear usuario con contraseña encriptada
  public async create(body: Record<string, any>): Promise<UsuarioAttributes> {
    await this.validateReferences(body) // Validar referencias si existen campos *_id
    body.password = await this.encryptPassword(body.password) // Encriptar contraseña
    return this.model.create(body)
  }


  //Encriptar contraseña usando bcrypt
  private async encryptPassword(password: string) {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
  }

  //Comparar contraseña ingresada con la almacenada en la BD
  public async comparePassword(password: string, receivedPassword: string) {
    return await bcrypt.compare(password, receivedPassword)
  }

  //Actualizar contraseña de un usuario por ID
  public async updatePasswordByUsuarioId(
    userId: string | Types.ObjectId,
    data: UpdateQuery<UsuarioAttributes>,
  ) {
    data.password = await this.encryptPassword(data.password)

    return this.model.findByIdAndUpdate(userId, data, { new: true }).exec()
  }

  //Obtener usuario para login a través del carnet de identidad
  public getAuthByCarnet(carnet: string): Promise<UsuarioAttributes | null> {
    return this.model.findOne({ carnet }).exec()
  }
}
