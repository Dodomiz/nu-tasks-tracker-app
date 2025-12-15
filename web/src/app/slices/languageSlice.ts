import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export type Language = 'en' | 'he';
export type Direction = 'ltr' | 'rtl';

interface LanguageState {
  current: Language;
  direction: Direction;
}

const initialState: LanguageState = {
  current: 'en',
  direction: 'ltr',
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.current = action.payload;
      state.direction = action.payload === 'he' ? 'rtl' : 'ltr';
    },
  },
});

export const { setLanguage } = languageSlice.actions;

export const selectLanguage = (state: RootState) => state.language.current;
export const selectDirection = (state: RootState) => state.language.direction;

export default languageSlice.reducer;
