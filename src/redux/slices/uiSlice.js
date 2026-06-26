import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  resetToken: null,
  apiError: null,
  user: null,
  
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setResetToken: (state, action) => {
      state.resetToken = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setApiError: (state, action) => {
      state.apiError = action.payload;
    },
    clearUiState: (state) => {
      state.resetToken = null;
      state.apiError = null;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setResetToken, setApiError, clearUiState, setUser, clearUser } = uiSlice.actions;

export default uiSlice.reducer;
