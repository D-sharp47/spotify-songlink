import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { loadState, saveState } from "../util/localStorage";
import authSlice from "./authSlice";

const persistedState = loadState();

const rootReducer = combineReducers({
  auth: authSlice.reducer,
});

const store = configureStore({
  reducer: rootReducer,
  preloadedState: persistedState
});

store.subscribe(() => {
  saveState(store.getState());
});

export default store;
