import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import isEmpty from "../util/is-empty"

export interface AuthState {
  isAuthenticated: boolean;
  user: object;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: {}
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCurrentUser(state, action: PayloadAction<object>) {
      state.isAuthenticated = !isEmpty(action.payload);
      state.user = action.payload;
    }
  }
});

export const { setCurrentUser } = authSlice.actions;

export default authSlice;