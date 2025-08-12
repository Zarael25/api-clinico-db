/* eslint-disable max-lines */
import Joi from 'joi'

// User
export const createUserSchema = Joi.object({
  fullname: Joi.string().min(3).max(50).required(),
  doc_number: Joi.string().min(6).max(13).required(),
  role_name: Joi.string().min(3).max(10).required(),
  password: Joi.string().min(8).max(30).required(),
  status: Joi.string().min(3).max(10),
  /*email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    .required(),*/
})

export const updateUserSchema = Joi.object({
  fullname: Joi.string().min(3).max(50),
  doc_number: Joi.string().min(6).max(13),
  role_name: Joi.string().min(3).max(10),
  password: Joi.string().min(8).max(30),
  status: Joi.string().min(3).max(10),
}).or('fullname', 'doc_number', 'role_name', 'password', 'status')

export const updatePasswordUserSchema = Joi.object({
  password: Joi.string().min(6).max(30).required(),
})
