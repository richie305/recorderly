import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isRecording: false,
  recordings: [],
  currentRecording: null,
  isProcessing: false,
  error: null,
  transcription: '',
  rewriteOptions: [
    { id: 'formal', label: 'Formal' },
    { id: 'bullet-points', label: 'Bullet Points' },
    { id: 'email', label: 'Email' },
    { id: 'summary', label: 'Summary' },
    { id: 'to-do', label: 'To-Do List' },
    { id: 'journal', label: 'Journal Entry' },
  ],
  selectedRewriteOption: null,
  rewrittenText: '',
};

const recordingSlice = createSlice({
  name: 'recording',
  initialState,
  reducers: {
    startRecording: (state) => {
      state.isRecording = true;
      state.error = null;
    },
    stopRecording: (state) => {
      state.isRecording = false;
    },
    setCurrentRecording: (state, action) => {
      state.currentRecording = action.payload;
    },
    addRecording: (state, action) => {
      state.recordings.unshift({
        id: Date.now().toString(),
        ...action.payload,
        createdAt: new Date().toISOString(),
      });
    },
    setTranscription: (state, action) => {
      state.transcription = action.payload;
    },
    setRewrittenText: (state, action) => {
      state.rewrittenText = action.payload;
    },
    setSelectedRewriteOption: (state, action) => {
      state.selectedRewriteOption = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearCurrentRecording: (state) => {
      state.currentRecording = null;
      state.transcription = '';
      state.rewrittenText = '';
      state.selectedRewriteOption = null;
    },
  },
});

export const {
  startRecording,
  stopRecording,
  setCurrentRecording,
  addRecording,
  setTranscription,
  setRewrittenText,
  setSelectedRewriteOption,
  setError,
  clearCurrentRecording,
} = recordingSlice.actions;

export default recordingSlice.reducer;
