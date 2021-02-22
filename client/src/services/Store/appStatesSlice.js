import { createSlice } from '@reduxjs/toolkit';

const initState = {
    appLoaded: false,
    error:false,
    errorMessage:"",
    firstRead:true,
    loading: false,
    needsUpdate:false,
    shortStats:{
        balance:0,
        totalNumberOfBets:0,
        waitingNotifications:0
    },
    selectedGroup: "",
    selectedGroupName:""
}

const appStatesSlice = createSlice({
    name: "appStates",
    initialState: initState,
    reducers: {
        needsUpdateFunction: (state, action) => {
            state.needsUpdate = action.payload;
            return state;
        },

        pageReady: (state, action) => {
            state.appLoaded = action.payload;
            return state;
        },

        revertToDefault: (state) => {
            state = initState
            return state;
        },

        setAppLoaded: (state, action) => {
            state.appLoaded = action.payload;
            return state;
        },

        setError: (state, action) => {
            state.error = action.payload;
            return state;
        },

        setErrorMessage: (state, action) => {
            state.errorMessage = action.payload;
            return state;
        },

        setFirstRead: (state, action) => {
            state.firstRead = action.payload;
            return state;
        },

        setGroup: (state, action) => {
            state.selectedGroup = action.payload;
            return state;
        },
        
        setGroupName: (state, action) => {
            state.selectedGroupName = action.payload;
            return state;
        },

        setNeedsUpdate: (state, action) => {
            state.needsUpdate = action.payload;
            return state;
        },

        setShortStats: (state, action) => {
            state.shortStats = action.payload;
            return state;
        }
    }
})

export default appStatesSlice.reducer;