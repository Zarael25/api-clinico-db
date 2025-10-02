/**
 * Descripción:
 *   Estrategia local de Passport para autenticación con carnet y contraseña.
 *   Se utiliza en el endpoint /auth/signin junto con passport-local.
 *
 * Características:
 *   - usernameField = 'carnet' → el login se hace con el carnet de identidad.
 *   - passwordField = 'password'.
 *   - Verifica que el usuario exista en la BD y tenga contraseña.
 *   - Valida que el usuario esté activo (estado = ACTIVE).
 *   - Valida que el usuario tenga roles autorizados para iniciar sesión.
 *   - Compara la contraseña ingresada con la almacenada usando bcrypt.
 *   - Devuelve un UsuarioResource limpio (sin exponer password).
 *
 * Uso:
 *   import passport from 'passport'
 *   import localStrategy from './routes/v1/auth/localStrategy'
 *
 *   passport.use(localStrategy)
 */

import { Strategy } from 'passport-local'

import UsuarioRepository from '../../../repositories/UsuarioRepository'
import UsuarioResource from '../../../resources/UsuarioResource'
import ApiError from '../../../errors/ApiError'

const localStrategy = new Strategy(
  {
    usernameField: 'carnet',
    passwordField: 'password',
    session: false,
  },
  async function (carnet, password, done) {
    try {
      const repository = new UsuarioRepository()
      const usuarioFound = await repository.getAuthByCarnet(carnet)

      // ---------------- Validar existencia ----------------
      if (!usuarioFound || !usuarioFound.password) {
        throw new ApiError({
          name: 'UNAUTHORIZED_ERROR',
          message: 'Usuario o Contraseña Incorrecto.',
          status: 401,
          code: 'ERR_UNAUTH',
        })
      }

      // ---------------- Validar estado ----------------
      if (usuarioFound.estado !== 'ACTIVE') {
        throw new ApiError({
          name: 'LOCKED_USER',
          message: 'Usuario inactivo o bloqueado.',
          status: 423,
          code: 'ERR_LOCKED',
        })
      }

      // ---------------- Validar roles permitidos ----------------
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

      // ---------------- Transformar usuario a DTO seguro ----------------
      const usuarioResource = new UsuarioResource(usuarioFound)

      return done(null, usuarioResource.item())
    } catch (error) {
      return done(error)
    }
  },
)

export default localStrategy
