import { UsuarioAttributes, UsuarioEntity } from '../database/models/Usuario'
import BaseResource from './BaseResource'

class UsuarioResource extends BaseResource<UsuarioAttributes, UsuarioEntity>() {
  public item() {
    const usuarioResource: UsuarioEntity = {
      id: this.instance.id,

      email: this.instance.email,
      nombre: this.instance.nombre,
      appaterno: this.instance.appaterno,
      apmaterno: this.instance.apmaterno,
      carnet: this.instance.carnet,
      complemento: this.instance.complemento,
      expedido: this.instance.expedido,
      fechaNacimiento: this.instance.fechaNacimiento,
      avatar: this.instance.avatar,
      genero: this.instance.genero,
      celular: this.instance.celular,
      estado: this.instance.estado,
      roles: this.instance.roles,
      niveles: this.instance.niveles,

      createdAt: this.instance.createdAt,
      updatedAt: this.instance.updatedAt,
    }

    return usuarioResource
  }
}

export default UsuarioResource
