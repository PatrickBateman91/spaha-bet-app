import { createSlice } from '@reduxjs/toolkit';

const initState = 'guest';

const userSlice = createSlice({
    name: "user",
    initialState: initState,
    reducers: {
        changeEmail(state, action){
            state.email = action.payload;
            return state;
        },

        changeNickname(state, action){
            state.nickname = action.payload;
            return state;
        },

        logOutUser(state) {
            state = initState;
            return state;
        },

        removeNotification(state, action){
            state.notifications = state.notifications.filter(notification => notification._id.toString() !== action.payload)
            return state;
        },

        updateUser(state, action) {
            state = action.payload;
            return state;
        },

        updateUserGroups(state, action){
            state.groups = action.payload;
            return state;
        },
    }
})

export default userSlice.reducer;