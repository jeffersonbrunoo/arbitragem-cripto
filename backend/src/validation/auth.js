// backend/src/validation/auth.js

import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.empty': 'E-mail é obrigatório',
      'string.email': 'Formato de e-mail inválido'
    }),
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.empty': 'Senha é obrigatória',
      'string.min': 'Senha muito curta. Mínimo 8 caracteres'
    })
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.empty': 'E-mail é obrigatório',
      'string.email': 'Formato de e-mail inválido'
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Senha é obrigatória'
    })
});
