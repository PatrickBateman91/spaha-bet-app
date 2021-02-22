import { createSlice } from '@reduxjs/toolkit';

const initState = [];

const groupsSlice = createSlice({
    name: "groups",
    initialState: initState,
    reducers: {
        emptyGroups(state){
            state = initState;
            return state;
        },
        
        setGroups(state, action){
            state = action.payload
            return state;
        }
    }
})

export default groupsSlice.reducer;