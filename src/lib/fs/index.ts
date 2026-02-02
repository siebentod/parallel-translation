import type { IFileSystem } from './types';

// 🔥 Переключение импортов вручную для browser/desktop билда
// import { BrowserFileSystem as FileSystemClass } from './browser-fs';
import { TauriFileSystem as FileSystemClass } from './tauri-fs';

// 🔥 Не билдящееся решение из-за top-level await. К сожалению проще вручную переключать импорты
// const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
// let FileSystemClass: any;
// if (isTauri) {
//   FileSystemClass = (await import('./tauri-fs')).TauriFileSystem;
// } else {
//   FileSystemClass = (await import('./browser-fs')).BrowserFileSystem;
// }

export const createFileSystem = (): IFileSystem => {
  return new FileSystemClass();
};

// Создаем синглтон
export const fs = createFileSystem();

export const readDirectory = fs.readDirectory.bind(fs);
export const loadFile = fs.loadFile.bind(fs);
export const saveFile = fs.saveFile.bind(fs);
export const deleteFile = fs.deleteFile.bind(fs);
export const renameFile = fs.renameFile.bind(fs);
