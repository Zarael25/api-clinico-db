/**
 * Descripción:
 *   Controladores para la gestión de usuarios del sistema.
 *   Incluyen operaciones CRUD, obtención de usuarios paginados
 *   y actualización de contraseñas de manera segura.
 *
 * Características:
 *   - listUsuarios: devuelve lista completa de usuarios (opcionalmente filtrada/ordenada).
 *   - listPagedUsuarios: devuelve lista paginada de usuarios con validación de parámetros.
 *   - getUsuario: obtiene detalle de un usuario por su ID.
 *   - createUsuario: crea un nuevo usuario con validaciones y encriptación de contraseña.
 *   - updateUsuario: actualiza datos generales de un usuario existente.
 *   - updatePasswordUsuario: actualiza solo la contraseña de un usuario (hash seguro).
 *   - deleteUsuario: elimina un usuario por ID.
 *
 * Uso:
 *   router.get('/usuarios', listUsuarios)
 *   router.get('/usuarios/paged', listPagedUsuarios)
 *   router.get('/usuarios/:id', getUsuario)
 *   router.post('/usuarios', createUsuario)
 *   router.patch('/usuarios/:id', updateUsuario)
 *   router.patch('/usuarios/:id/password', updatePasswordUsuario)
 *   router.delete('/usuarios/:id', deleteUsuario)
 */

import { NextFunction, Request, Response } from 'express'
import UsuarioResource from '../../../resources/UsuarioResource'
import UsuarioRepository from '../../../repositories/UsuarioRepository'
import ApiError from '../../../errors/ApiError'

// ------------------ Listar todos los usuarios ------------------
export const listUsuarios = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const repository = new UsuarioRepository()
    const usuarios = UsuarioResource.collection(
      await repository.getAll({
        sortBy: req.query.sort_by as string,
        filterBy: req.query.filter_by as string,
      }),
    )
    res.status(200).json({ usuarios })
  } catch (error: any) {
    next(error)
  }
}

// ------------------ Listar usuarios paginados ------------------
export const listPagedUsuarios = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const repository = new UsuarioRepository()

    const limit = req.query.limit ? +req.query.limit : 10
    const page = req.query.page ? +req.query.page : 1
    const sortBy = req.query.sort_by as string
    const filterBy = req.query.filter_by as string

    if (isNaN(limit) || isNaN(page)) {
      throw new ApiError({
        name: 'INVALID_DATA_ERROR',
        message: 'Los parámetros de paginación deben ser números enteros',
        status: 422,
        code: 'ERR_INV',
      })
    }

    const usuarioPaged = UsuarioResource.paged(
      await repository.getPaged({
        limit,
        page,
        sortBy,
        filterBy,
      }),
    )

    res.status(200).json({ usuarioPaged })
  } catch (error: any) {
    next(error)
  }
}


// ------------------ Obtener un usuario por ID ------------------
export const getUsuario = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const repository = new UsuarioRepository()
    const usuarioResource = new UsuarioResource(
      await repository.getById(req.params.id),
    )
    res.status(200).json({ usuario: usuarioResource.item() })
  } catch (error: any) {
    next(error)
  }
}

// ------------------ Crear un nuevo usuario ------------------
export const createUsuario = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const repository = new UsuarioRepository()
    const usuarioResource = new UsuarioResource(
      await repository.create(req.body),
    )
    res.status(201).json({ usuario: usuarioResource.item() })
  } catch (error) {
    next(error)
  }
}
// ------------------ Actualizar datos de un usuario ------------------
export const updateUsuario = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const repository = new UsuarioRepository()
    const usuarioResource = new UsuarioResource(
      await repository.update(req.params.id, req.body),
    )
    res.status(200).json({ usuario: usuarioResource.item() })
  } catch (error) {
    next(error)
  }
}


// ------------------ Actualizar contraseña de un usuario ------------------
export const updatePasswordUsuario = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const repository = new UsuarioRepository()
    const usuarioResource = new UsuarioResource(
      await repository.updatePasswordByUsuarioId(req.params.id, req.body),
    )
    res.status(200).json({ usuario: usuarioResource.item() })
  } catch (error) {
    next(error)
  }
}

// ------------------ Eliminar un usuario ------------------
export const deleteUsuario = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const repository = new UsuarioRepository()
    await repository.delete(req.params.id)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
