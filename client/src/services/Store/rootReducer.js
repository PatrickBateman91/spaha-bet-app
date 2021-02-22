import {combineReducers} from 'redux';
import appStatesReducer from './appStatesSlice';
import betsReducer from './betsSlice';
import groupsReducer from './groupsSlice';
import userReducer from './userSlice';

const rootReducer = combineReducers({
    appStates: appStatesReducer,
    bets: betsReducer,
    groups: groupsReducer,
    user: userReducer
})

export default rootReducer;