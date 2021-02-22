import {configureStore} from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

const configure = () => {
    return configureStore({
        reducer: rootReducer
    })
}

export default configure;