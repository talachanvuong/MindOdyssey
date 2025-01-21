export const MESSAGE = {
  VALIDATE: {
    REQUIRED: 'Missing required field!',
    DISPLAY_NAME: 'Display name must be between 8 and 64 characters long!',
    EMAIL: 'Invalid email address!',
    PASSWORD: 'Password must be between 8 and 32 characters long!',
    TITLE_COURSE: 'Title must be between 8 and 256 characters long!',
  },
  COURSE: {
    EXISTED: 'Course already exists!',
    CREATE_SUCCESS: 'Create course successfully!',
    GET_SUCCESS: 'Get courses successfully!',
  },
  SERVER: {
    ERROR: 'Internal server error!',
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
