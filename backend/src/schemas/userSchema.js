import joi from 'joi'

const emailSchema = joi.string().email().required().messages({
  'string.email': 'Invalid email format',
  'string.empty': 'Email cannot be empty',
  'any.required': 'Email is required',
})

const passwordSchema = joi.string().min(8).max(32).required().messages({
  'string.min': 'Password must be at least 8 characters long',
  'string.max': 'Password must be at most 32 characters long',
  'string.empty': 'Password cannot be empty',
  'any.required': 'Password is required',
})

const displayNameSchema = joi.string().min(8).max(64).required().messages({
  'string.min': 'Display name must be at least 8 characters long',
  'string.max': 'Display name must be at most 64 characters long',
  'string.empty': 'Display name cannot be empty',
  'any.required': 'Display name is required',
})

const loginValidate = joi.object({
  email: emailSchema,
  password: passwordSchema,
})

const emailValidate = joi.object({
  email: emailSchema,
})

const registerValidate = joi.object({
  display_name: displayNameSchema,
  password: passwordSchema,
  confirmPassword: joi.string().valid(joi.ref('password')).required().messages({
    'any.only': 'Confirm password must match password',
    'any.required': 'Confirm password is required',
    'string.empty': 'Confirm password cannot be empty',
  }),
})

const displaynameValidate = joi.object({
  display_name: displayNameSchema,
})

const newDisplayNameValidate = joi.object({
  new_display_name: displayNameSchema,
})

const resetPasswordValidate = joi.object({
  newPassword: passwordSchema,
  confirmNewPassword: joi
    .string()
    .valid(joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Confirm new password must match new password',
      'any.required': 'Confirm new password is required',
      'string.empty': 'Confirm new password cannot be empty',
    }),
})

const changePasswordValidate = joi.object({
  oldPassword: passwordSchema,
  newPassword: passwordSchema.disallow(joi.ref('oldPassword')).messages({
    'any.invalid': 'New password must be different from old password',
  }),
  confirmNewPassword: joi
    .string()
    .valid(joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Confirm new password must match new password',
      'any.required': 'Confirm new password is required',
      'string.empty': 'Confirm new password cannot be empty',
    }),
})

const refreshTokenValidate = joi.string().trim().required().messages({
  'any.required': 'Refresh token is required',
  'string.empty': 'Refresh token cannot be empty',
})
const accessTokenValidate = joi.string().trim().required().messages({
  'any.required': 'Access token is required',
  'string.empty': 'Refresh token cannot be empty',
})

export default {
  loginValidate,
  emailValidate,
  registerValidate,
  displaynameValidate,
  resetPasswordValidate,
  changePasswordValidate,
  refreshTokenValidate,
  newDisplayNameValidate,
  accessTokenValidate,
}
