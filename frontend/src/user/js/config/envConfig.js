export default {
    //user
    apiLogin: import.meta.env.VITE_API_LOGIN,
    apiShowInfo: import.meta.env.VITE_API_SHOW_INFO,
    apiRegister: import.meta.env.VITE_API_REGISTER,
    apiLogout: import.meta.env.VITE_API_LOGOUT,
    apiVerifyEmail: import.meta.env.VITE_API_VERIFY_EMAIL,
    apiForgetPassword: import.meta.env.VITE_API_FORGET_PASSWORD,
    apiResetPassword: import.meta.env.VITE_API_RESET_PASSWORD,
    apiChangePassword: import.meta.env.VITE_API_CHANGE_PASSWORD,
    apiUpdate: import.meta.env.VITE_API_UPDATE,
    apiRefreshToken: import.meta.env.VITE_API_REFRESH_TOKEN,

    //get course
    apiGetCourse: import.meta.env.VITE_API_GET_COURSE,

    //get document
    apiGetDocument: import.meta.env.VITE_API_GET_DOCUMENT,

    //practice history
    apiPracticeHistory:import.meta.env.VITE_API_PRACTICE_HISTORY,
    apiAuthorDocument:import.meta.env.VITE_API_AUTHOR_DOCUMENT
}