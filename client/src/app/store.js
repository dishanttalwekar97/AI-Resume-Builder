import {configureStore} from '@reduxjs/toolkit'
import authReducer from './featurs/authSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer
    }

})