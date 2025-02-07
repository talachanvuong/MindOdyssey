export const MESSAGE = {
  VALIDATE: {
    REQUIRED: 'Missing required field!',
    DISPLAY_NAME: 'Display name must be between 8 and 64 characters long!',
    EMAIL: 'Invalid email address!',
    PASSWORD: 'Password must be between 8 and 32 characters long!',
    TITLE: 'Title must be between 8 and 256 characters long!',
    CONTENT: 'Content must be less than 4096 characters long!',
    ATTACHMENT: 'Size must be less than 5 MB!',
    DESCRIPTION: 'Desciption must be les than 2048 characters long!',
    TIME_PER_QUESTION:
      'The allowed time for each question must be between 30 seconds and 3 minutes!',
    REASON: 'Reason must be less than 2048 characters long!',
  },
  COURSE: {
    EXISTED: 'Course already exists!',
    NOT_FOUND: 'Course not found!',
    CREATE_SUCCESS: 'Create course successfully!',
    GET_SUCCESS: 'Get course(s) successfully!',
  },
  DOCUMENT: {
    NOT_FOUND: 'Document not found!',
    INVALID_AUTHOR: 'Invalid document author!',
    CREATE_SUCCESS: 'Create document successfully!',
    GET_SUCCESS: 'Get document successfully!',
    REMOVE_SUCCESS: 'Remove document successfully!',
    EDIT_SUCCESS: 'Edit document successfully!',
  },
  QUESTION: {
    NOT_FOUND: 'Question not found!',
    INVALID_AUTHOR: 'Invalid question author!',
    INVALID_ORDER: 'Invalid order!',
    LAST: 'Cannot delete the last question!',
  },
  CONTENT: {
    NOT_FOUND: 'Content not found!',
    INVALID_AUTHOR: 'Invalid content author!',
    EMPTY: 'Neither text nor attachment can be empty!',
  },
  USER: {
    EXISTED: 'User already exists!',
    NOT_FOUND: 'User not found!',
    REGISTER_SUCCESS: 'User registered successfully!',
    SEND_EMAIL_SUCCESS: 'Send email successfully!',
    LOGIN_SUCCESS: 'User login successfully!',
    WRONG_PASSWORD: 'Wrong password!',
    GET_INFO_SUCCESS: 'Get user information successfully!',
    UPDATE_SUCCESS: 'Update user successfully!',
    RESET_PASSWORD_SUCCESS: 'Reset password successfully!',
    CHANGE_PASSWORD_SUCCESS: 'Change password successfully!',
    LOGOUT_SUCCESS: 'Logout and delete refresh token successfully!',
    PASSWORD_NOT_MATCH: 'Password does not match!',
    SAME_DISPLAY_NAME: 'New display name must be different from the old one!',
    SAME_PASSWORD: 'New password must be different from the old one!',
  },
  AUTH: {
    ACCESS_TOKEN: {
      MISSING: 'Access token missing!',
      INVALID: 'Invalid access token!',
      EXPIRED: 'Access token expired!',
    },
    REFRESH_TOKEN: {
      MISSING: 'Refresh token missing!',
      NOT_FOUND: 'Refresh token not found!',
      INVALID: 'Invalid refresh token!',
      EXPIRED: 'Refresh token expired!',
      SUCCESS: 'Refresh token successfully!',
    },
  },
  SERVER: {
    ERROR: 'Internal server error!',
    PROCCESSING: 'Request is already being processed!',
  },
}

export const STATUS_CODE = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
}

export const sendResponse = (res, status, message, result = null) => {
  const response = { message }
  if (result !== null) {
    response.result = result
  }

  return res.status(status).json(response)
}
