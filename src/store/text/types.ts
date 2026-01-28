// store/translations/types.ts
import { InternalSlice } from './slices/internalSlice';
import { EditorSlice } from './slices/editorSlice';
import { DataSlice } from './slices/dataSlice';

export interface Translation {
  baseName: string;
  shownName: string;
  lastLanguage: string;
  dateModified: string;
  dateCreated: string;
  languages: Record<string, TranslationFile>; // { 'original': file, 'ru': file, 'en': file, etc. }
  availableLanguages: string[];
  status?: string;
}

export interface TranslationFile {
  name: string;
  fullName: string;
  baseName: string; // название без суффикса -original, -ru, etc.
  language: string; // 'original', 'ru', 'en', 'x', etc.
  content?: string;
  lastPosition?: number;
  lineColors?: LineColor[];
}

export interface LineColor {
  line: number;
  color: 'red' | 'orange' | 'green';
}

export type Store = InternalSlice & EditorSlice & DataSlice;
