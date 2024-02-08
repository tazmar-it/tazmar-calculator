import { createSlice } from '@reduxjs/toolkit';

interface GeneralReducer {
  idNodeToUpdate: string;
  isNodeRemove: boolean;
}

const initialState: GeneralReducer = {
  idNodeToUpdate: '',
  isNodeRemove: false,
};

const generalSlice = createSlice({
  name: 'generalReducer',
  initialState,
  reducers: {
    setIdNodeToUpdate(state, action) {
      state.idNodeToUpdate = action.payload;
    },
    setIsNodeRemove(state, action) {
      state.isNodeRemove = action.payload;
    },
  },
});

export const { setIdNodeToUpdate, setIsNodeRemove } = generalSlice.actions;

export default generalSlice.reducer;
