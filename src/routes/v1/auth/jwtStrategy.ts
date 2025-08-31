// routes/v1/auth/jwtStrategy.ts
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import UsuarioRepository from '../../../repositories/UsuarioRepository'

type DoneCallback = (error: any, user?: any, info?: any) => void

const jwtStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.AUTH_JWT_SECRET!,
  },
  async (payload: any, done: DoneCallback) => {
    try {
      const userId = payload.sub ?? payload.id
      if (!userId) return done(null, false)

      const repo = new UsuarioRepository()
      const user = await repo.getById(userId)
      if (!user) return done(null, false)

      return done(null, user)
    } catch (err) {
      return done(err, false)
    }
  }
)

export default jwtStrategy
