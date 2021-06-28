import * as Joi from "joi";

// the password must have be more than 5 chars and at least one number and at least one uppercase char
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/;

export const schemas = {
  signup: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().regex(passwordRegex).required(),
  }),
  login: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().regex(passwordRegex).required(),
  }),
  updatePassword: Joi.object().keys({
    oldPassword: Joi.string().regex(passwordRegex).required(),
    newPassword: Joi.string().regex(passwordRegex).required(),
  }),
  id: Joi.object({ id: Joi.number().required() }),
};
