import { Strategy } from 'passport-local'

import UsuarioRepository from '../../../repositories/UsuarioRepository'
import UsuarioResource from '../../../resources/UsuarioResource'
import ApiError from '../../../errors/ApiError'

const localStrategy = new Strategy(
  {
    usernameField: 'carnet', // <--- login con carnet
    passwordField: 'password',
    session: false,
  },
  async function (carnet, password, done) {
    try {
      const repository = new UsuarioRepository()
      const usuarioFound = await repository.getAuthByCarnet(carnet)

      if (!usuarioFound || !usuarioFound.password) {
        throw new ApiError({
          name: 'UNAUTHORIZED_ERROR',
          message: 'Usuario o Contraseña Incorrecto.',
          status: 401,
          code: 'ERR_UNAUTH',
        })
      }

      // 👇 Validar estado
      if (usuarioFound.estado !== 'ACTIVE') {
        throw new ApiError({
          name: 'LOCKED_USER',
          message: 'Usuario inactivo o bloqueado.',
          status: 423,
          code: 'ERR_LOCKED',
        })
      }

      // 👇 Validar roles permitidos
      const rolesPermitidos = ['admin', 'administracion', 'director', 'enfermeria']
      const tienePermiso = usuarioFound.roles?.some((rol: string) =>
        rolesPermitidos.includes(rol),
      )

      if (!tienePermiso) {
        throw new ApiError({
          name: 'FORBIDDEN_ERROR',
          message: 'Rol no autorizado para login.',
          status: 403,
          code: 'ERR_FORB',
        })
      }

      // 👇 Validar contraseña
      const matchPassword = await repository.comparePassword(
        password,
        usuarioFound.password,
      )

      if (!matchPassword) {
        throw new ApiError({
          name: 'UNAUTHORIZED_ERROR',
          message: 'Usuario o Contraseña Incorrecto.',
          status: 401,
          code: 'ERR_UNAUTH',
        })
      }

      const usuarioResource = new UsuarioResource(usuarioFound)

      return done(null, usuarioResource.item())
    } catch (error) {
      return done(error)
    }
  },
)

export default localStrategy
