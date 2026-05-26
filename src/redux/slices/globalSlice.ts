import { createSlice } from "@reduxjs/toolkit"



type GlobalInitialState = Record<string, unknown>;
  
const initialState: GlobalInitialState = {

}

const globalSlice = createSlice({
    name: "global",
    initialState,
    reducers: {
      
       
    }
})
export const actions = globalSlice.actions
export default globalSlice.reducer