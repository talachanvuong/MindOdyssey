export const MESSAGE = {
  VALIDATE: {
    TIME_PER_QUESTION:
      'The allowed time for each question must be between 30 seconds and 3 minutes!',
  },
  COURSE: {
    EXISTED: 'Course already exists!',
    NOT_FOUND: 'Course not found!',
    CREATE_SUCCESS: 'Create course successfully!',
    GET_SUCCESS: 'Get courses successfully!',
  },
  DOCUMENT: {
    NOT_FOUND: 'Document not found!',
    CREATE_SUCCESS: 'Create document successfully!',
    GET_SUCCESS: 'Get document successfully!',
    REMOVE_SUCCESS: 'Remove document successfully!',
    INVALID_AUTHOR: 'Invalid author!',
  },
  QUESTION: {
    EXISTED_ORDER: 'Order already exists!',
    NOT_FOUND: 'Question not found!',
    EXCEEDED: 'Exceeded total questions!',
    CREATE_SUCCESS: 'Create question successfully!',
    GET_SUCCESS: 'Get question successfully!',
  },
  CONTENT: {
    EXISTED_TYPE: 'Type already exists!',
    CREATE_SUCCESS: 'Create content successfully!',
    GET_SUCCESS: 'Get content successfully!',
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
  },
  AUTH: {
    ACCESS_TOKEN: {
      INVALID: 'Invalid access token!',
      EXPIRED: 'Access token expired!',
    },
    REFRESH_TOKEN: {
      NOT_FOUND: 'Refresh token not found!',
      INVALID: 'Invalid refresh token!',
      EXPIRED: 'Refresh token expired!',
      SUCCESS: 'Refresh token successfully!',
    },
  },
  PRACTICE: {
    GET_DOCS_SUCCESS: 'Get documents successfully!',
    NOT_FOUND_DOCS: 'No results found for this keyword!',
    PAGE_EXCEEDS_TOTAL: 'The requested page exceeds the total number of pages!',
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
