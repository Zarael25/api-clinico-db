/**
 * Descripción:
 *   Estrategia de autenticación con JWT para Passport.
 *   Permite proteger rutas validando el token enviado en el header Authorization.
 *
 * Características:
 *   - Extrae el token de "Authorization: Bearer <token>".
 *   - Valida el token usando la clave secreta definida en AUTH_JWT_SECRET.
 *   - Busca el usuario en la base de datos a partir del campo "sub" (o "id") del payload.
 *   - Si el usuario existe → lo adjunta a req.user.
 *   - Si no existe → rechaza la autenticación.
 *
 * Uso:
 *   import passport from 'passport'
 *   import jwtStrategy from './routes/v1/auth/jwtStrategy'
 *
 *   passport.use(jwtStrategy)
 *   app.use(passport.initialize())
 *
 *   // Ejemplo en una ruta:
 *   router.get('/perfil',
 *     passport.authenticate('jwt', { session: false }),
 *     perfilController
 *   )
 */

import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import UsuarioRepository from '../../../repositories/UsuarioRepository'

type DoneCallback = (error: any, user?: any, info?: any) => void

const jwtStrategy = new JwtStrategy(
  {
    // Extrae el token del encabezado Authorization
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.AUTH_JWT_SECRET!,
  },
  async (payload: any, done: DoneCallback) => {
    try {
      // Identificador de usuario (sub es el estándar en JWT)
      const userId = payload.sub ?? payload.id
      if (!userId) return done(null, false)

      // Buscar usuario en BD
      const repo = new UsuarioRepository()
      const user = await repo.getById(userId)
      if (!user) return done(null, false)

      // Usuario válido → se adjunta a req.user
      return done(null, user)
    } catch (err) {
      return done(err, false)
    }
  }
)

export default jwtStrategy
