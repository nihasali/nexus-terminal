import {createSlice,createAsyncThunk} from '@reduxjs/toolkit';
import { loginUser } from '../api/authService';
import { getCurrentUser } from "../api/authService";


export const loginThunk=createAsyncThunk(
    'auth/login',
    async(data,{rejectWithValue})=>{
        try{
            const response = await loginUser(data);
            return response.data
        }
        catch(error){
            return rejectWithValue(error.response.data)
        }
    }
);

export const loadUserThunk = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCurrentUser();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const authSlice=createSlice({
    name:'auth',
    initialState:{
        user:null,
        isAuthenticated:false,
        error:null,
        loading:true,
    },
    reducers:{
        logout:(state)=>{
            state.user=null;
            state.isAuthenticated=false;
        },
    },
    extraReducers:(builder)=>{
        builder.addCase(loginThunk.fulfilled,(state,action)=>{
            state.isAuthenticated=true;
            state.user=action.payload.user;
            state.error=null;
            state.loading = false;
        });

        builder.addCase(loginThunk.rejected,(state,action)=>{
            state.error = action.payload.error;
            state.loading = false;
        });

        builder.addCase(loadUserThunk.fulfilled, (state, action) => {
            state.isAuthenticated = true;

            
            state.user = {
                email: action.payload.email,
                fullname: action.payload.fullname,
                user_type: action.payload.user_type
            };

                state.loading = false;
    });

        builder.addCase(loadUserThunk.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
        });

    },

});



export const {logout}=authSlice.actions;
export default authSlice.reducer;