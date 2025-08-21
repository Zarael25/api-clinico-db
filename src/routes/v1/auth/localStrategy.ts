import { Strategy } from 'passport-local'

import UsuarioRepository from '../../../repositories/UsuarioRepository'
import UsuarioResource from '../../../resources/UsuarioResource'
import ApiError from '../../../errors/ApiError'

const localStrategy = new Strategy(
  {
    session: false,
  },
  async function (carnet, password, done) {
    try {
      const repository = new UsuarioRepository()
      const usuarioFound = await repository.getAuthByCarnet(carnet)

      if (!usuarioFound || !usuarioFound.password)
        throw new ApiError({
          name: 'UNAUTHORIZED_ERROR',
          message: 'Usuario o Contraseña Incorrecto.',
          status: 401,
          code: 'ERR_UNAUTH',
        })

      const matchPassword = await repository.comparePassword(
        password,
        usuarioFound.password,
      )

      if (!matchPassword)
        throw new ApiError({
          name: 'UNAUTHORIZED_ERROR',
          message: 'Usuario o Contraseña Incorrecto.',
          status: 401,
          code: 'ERR_UNAUTH',
        })

      const usuarioResource = new UsuarioResource(usuarioFound)

      return done(null, usuarioResource.item())
    } catch (error) {
      return done(error)
    }
  },
)

export default localStrategy
