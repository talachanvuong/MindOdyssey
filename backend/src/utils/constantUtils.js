export const MESSAGE = {
  COURSE: {
    EXISTED: 'Course already exists!',
    NOT_FOUND: 'Course not found!',
    CREATE_COURSE_SUCCESS: 'Create course successfully!',
    GET_COURSES_SUCCESS: 'Get courses successfully!',
  },
  DOCUMENT: {
    NOT_FOUND: 'Document not found!',
    NOT_OWNED: 'Document not owned!',
    NOT_APPROVED: 'Document not approved!',
    PAGE_NOT_VALID: 'Page not valid!',
    CREATE_DOCUMENT_SUCCESS: 'Create document successfully!',
    GET_DOCUMENT_DETAIL_SUCCESS: 'Get document detail successfully!',
    GET_DOCUMENTS_SUCCESS: 'Get documents successfully!',
    DELETE_DOCMENT_SUCCESS: 'Delete document successfully!',
    EDIT_DOCUMENT_SUCCESS: 'Edit document successfully!',
    NOT_REVIEWED: 'This document was not reviewed!',
    REVIEWED: 'This document was reviewed!',
  },
  QUESTION: {
    NOT_FOUND: 'Question not found!',
    NOT_OWNED: 'Question not owned!',
    INVALID_ORDER: 'Invalid order!',
    LAST_REMAIN: 'Cannot delete the last question!',
    NOT_BELONGED: 'Question not belonged!',
  },
  CONTENT: {
    NOT_FOUND: 'Content not found!',
    NOT_OWNED: 'Content not owned!',
    EMPTY: 'Neither text nor attachment can be empty!',
    NOT_BELONGED: 'Content not belonged!',
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
    GET_USER_ID_SUCCESS: 'Get user id successfully!',
  },
  ADMIN: {
    NOT_FOUND: 'Admin not found!',
    WRONG_PASSWORD: 'Wrong password!',
    LOGIN_SUCCESS: 'Admin login successfully!',
    LOGOUT_SUCCESS: 'Admin logout successfully!',
    GET_UNAPPROVED_DOCUMENTS_SUCCESS: 'Get unapproved documents successfully!',
    GET_DOCUMENT_DETAIL_SUCCESS: 'Get document detail successfully!',
    REVIEW_DOCUMENT_SUCCESS: 'Review document successfully!',
  },
  AUTH: {
    ACCESS_TOKEN: {
      INVALID: 'Invalid access token!',
      EXPIRED: 'Access token expired!',
      MISSING: 'Missing access token!',
    },
    REFRESH_TOKEN: {
      NOT_FOUND: 'Refresh token not found!',
      INVALID: 'Invalid refresh token!',
      EXPIRED: 'Refresh token expired!',
      SUCCESS: 'Refresh token successfully!',
    },
  },
  PRACTICE: {
    GET_PRACTICE_HISTORY_SUCCESS: 'Get practice histories successfully!',
    GET_DOCS_SUCCESS: 'Get documents successfully!',
    NOT_FOUND_DOCS: 'No results found for this keyword!',
    NOT_FOUND_HISTORY: 'No practice history found!',
    PAGE_EXCEEDS_TOTAL: 'The requested page exceeds the total number of pages!',
  },
  SERVER: {
    ERROR: 'Internal server error!',
    PROCCESSING: 'Request is already being processed!',
    NO_PAYLOAD: 'Cannot send payload!',
    PRIVACY: 'You cannot access this!',
  },
}

export const STATUS_CODE = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
}

export const EVENT = {
  PRACTICE: {},
}
