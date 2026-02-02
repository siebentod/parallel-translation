import type { IStorage } from './types';

// 🔥 Переключение импортов вручную для browser/desktop билда
// import { BrowserStorage as StorageClass } from './browser-storage';
import { TauriStorage as StorageClass } from './tauri-storage';

// 🔥 Не билдящееся решение из-за top-level await
// const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
// let StorageClass: any;
// if (isTauri) {
//   // Динамический импорт только для Tauri
//   StorageClass = (await import('./tauri-storage')).TauriStorage;
// } else {
//   StorageClass = (await import('./browser-storage')).BrowserStorage;
// }

export const createStorage = (filename: string): IStorage => {
  return new StorageClass(filename);
};
