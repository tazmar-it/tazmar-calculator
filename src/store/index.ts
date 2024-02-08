import { configureStore } from "@reduxjs/toolkit";
import generalReducer from "./slices/generalReducer";

export const store = configureStore({
  reducer: {
    generalReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch