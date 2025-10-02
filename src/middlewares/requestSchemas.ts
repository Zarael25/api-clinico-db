/* eslint-disable max-lines */
/**
 * Descripción:
 *   Esquemas de validación con Joi para usuarios y autenticación.
 *   Se utilizan en controladores o middlewares antes de procesar la lógica
 *   para asegurar que los datos cumplen las reglas de formato y negocio.
 *
 * Características:
 *   - createUsuarioSchema → valida la creación de usuarios.
 *   - updateUsuarioSchema → valida la actualización parcial de usuarios.
 *   - updatePasswordUsuarioSchema → valida cambio de contraseña.
 *   - authSchema → valida credenciales de login.
 *
 * Uso:
 *   await createUsuarioSchema.validateAsync(req.body)
 *   await authSchema.validateAsync(req.body)
 */

import Joi from 'joi'
import { ROLES } from '../database/models/Usuario'

// <---------- Usuario Schema ---------->


//Validación para crear un nuevo usuario
 
export const createUsuarioSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(30).required(),
  nombre: Joi.string().min(2).max(50).required(),
  appaterno: Joi.string().min(2).max(50).required(),
  apmaterno: Joi.string().min(2).max(50).required(),
  carnet: Joi.string().min(5).max(15).required(),
  complemento: Joi.string().max(10).required(),
  expedido: Joi.string()
    .valid('CH', 'TJ', 'PT', 'LP', 'OR', 'CB', 'SC', 'BN', 'PA')
    .required(),
  fechaNacimiento: Joi.date().required(),
  avatar: Joi.string().uri().optional(),
  genero: Joi.string().valid('FEMENINO', 'MASCULINO').required(),
  celular: Joi.string().min(7).max(15).optional(),
  estado: Joi.string().valid('ACTIVE', 'INACTIVE').optional(),
  roles: Joi.array()
    .items(Joi.string().valid(...ROLES))
    .min(1)
    .required(),
  niveles: Joi.array()
    .items(Joi.string().valid('PM', 'PT', 'SM', 'ST'))
    .min(1)
    .required(),
})


//Validación para actualizar datos de un usuario
//Requiere al menos un campo de los listados en `.or()`
export const updateUsuarioSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().min(8).max(30),
  nombre: Joi.string().min(2).max(50),
  appaterno: Joi.string().min(2).max(50),
  apmaterno: Joi.string().min(2).max(50),
  carnet: Joi.string().min(5).max(15),
  complemento: Joi.string().max(10),
  expedido: Joi.string().valid(
    'CH',
    'TJ',
    'PT',
    'LP',
    'OR',
    'CB',
    'SC',
    'BN',
    'PA',
  ),
  fechaNacimiento: Joi.date(),
  avatar: Joi.string().uri(),
  genero: Joi.string().valid('FEMENINO', 'MASCULINO'),
  celular: Joi.string().min(7).max(15),
  estado: Joi.string().valid('ACTIVE', 'INACTIVE'),
  roles: Joi.array().items(Joi.string().valid(...ROLES)),
  niveles: Joi.array().items(Joi.string().valid('PM', 'PT', 'SM', 'ST')),
}).or(
  // Garantiza que al menos uno de estos campos sea enviado en la actualización
  'email',
  'password',
  'nombre',
  'appaterno',
  'apmaterno',
  'carnet',
  'complemento',
  'expedido',
  'fechaNacimiento',
  'avatar',
  'genero',
  'celular',
  'estado',
  'roles',
  'niveles',
)

//Validación para cambio de contraseña
export const updatePasswordUsuarioSchema = Joi.object({
  password: Joi.string().min(8).max(30).required(),
})

// <---------- Auth Schema ---------->


//Validación para login de usuario
//Exige carnet y contraseña con complejidad mínima:
// - una mayúscula
// - una minúscula
// - un número
// - un símbolo permitido



export const authSchema = Joi.object({
  carnet: Joi.string().min(5).max(15).required(),
  password: Joi.string()
    .min(8)
    .max(50)
    .pattern(/[A-Z]/, 'una mayúscula')
    .pattern(/[a-z]/, 'una minúscula')
    .pattern(/[0-9]/, 'un número')
    .pattern(/[!@#$%&*_.-]/, 'un símbolo')
    .required(),
})
