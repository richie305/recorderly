import { configureStore } from '@reduxjs/toolkit';
import recordingReducer from './recordingSlice';

export const store = configureStore({
  reducer: {
    recording: recordingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
