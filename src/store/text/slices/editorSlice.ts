import { StateCreator } from 'zustand';
import { Store, TranslationFile, LineColor } from '../types';
import { saveFile } from 'src/lib/fs';
import toast from 'react-hot-toast';
import { storeFile } from '..';

interface CurrentTranslation {
  baseName: string | null;
  originalFile: TranslationFile | null;
  translationFile: TranslationFile | null;
  currentLanguage: string | null;
  isDataLoaded: boolean;
}

export interface EditorSlice {
  currentTranslation: CurrentTranslation;

  saveCurrentTranslation: () => Promise<void>;
  updateOriginalContent: (content: string) => void;
  updateTranslationContent: (content: string) => void;
  closeCurrentTranslation: () => void;
  setLineColor: (
    baseName: string,
    language: string,
    line: number,
    color: 'red' | 'orange' | 'green' | null
  ) => void;
  getLineColors: (baseName: string, language: string) => LineColor[];
}

export const createEditorSlice: StateCreator<Store, [], [], EditorSlice> = (
  set,
  get
) => ({
  currentTranslation: {
    baseName: null,
    originalFile: null,
    translationFile: null,
    currentLanguage: null,
    isDataLoaded: false,
  },

  saveCurrentTranslation: async () => {
    const { currentTranslation } = get();

    if (!currentTranslation.isDataLoaded || !currentTranslation.baseName) {
      console.error('Нет открытого перевода для сохранения');
      return;
    }

    try {
      const promises: Promise<void>[] = [];

      // Сохраняем оригинал, если он изменился
      if (
        currentTranslation.originalFile &&
        currentTranslation.originalFile.content !== undefined
      ) {
        const originalPath = `translations/${currentTranslation.originalFile.fullName}`;
        promises.push(
          saveFile(originalPath, currentTranslation.originalFile.content)
        );
      }

      // Сохраняем перевод
      if (
        currentTranslation.translationFile &&
        currentTranslation.translationFile.content !== undefined
      ) {
        const translationPath = `translations/${currentTranslation.translationFile.fullName}`;
        promises.push(
          saveFile(translationPath, currentTranslation.translationFile.content)
        );
      }

      await Promise.all(promises);

      // Обновляем дату модификации
      await get()._updateDateModified(currentTranslation.baseName);
    } catch (error) {
      console.error(
        `Ошибка сохранения перевода ${currentTranslation.baseName}:`,
        error
      );
      toast.error('Ошибка сохранения перевода');
    }
  },

  // Обновить содержимое оригинала
  updateOriginalContent: (content: string) => {
    const current = get().currentTranslation;
    if (!current.originalFile || current.originalFile.content === content)
      return;

    set({
      currentTranslation: {
        ...current,
        originalFile: {
          ...current.originalFile,
          content,
        },
      },
    });
  },

  // Обновить содержимое перевода
  updateTranslationContent: (content: string) => {
    const current = get().currentTranslation;
    if (!current.translationFile || current.translationFile.content === content)
      return;

    set({
      currentTranslation: {
        ...current,
        translationFile: {
          ...current.translationFile,
          content,
        },
      },
    });
  },

  // Закрыть текущий перевод
  closeCurrentTranslation: async () => {
    await get().saveCurrentTranslation();
    set({
      currentTranslation: {
        baseName: null,
        originalFile: null,
        translationFile: null,
        currentLanguage: null,
        isDataLoaded: false,
      },
    });
  },
  setLineColor: (baseName, language, line, color) => {
    set((state) => {
      const translation = get().translations[baseName];
      if (!translation || !translation.languages[language]) return state;

      const file = translation.languages[language];
      const lineColors = file.lineColors || [];

      // Удаляем существующую метку для этой строки
      const filteredColors = lineColors.filter((lc) => lc.line !== line);

      // Добавляем новую метку, если цвет не null
      const newLineColors = color
        ? [...filteredColors, { line, color }]
        : filteredColors;

      const updatedTranslation = {
        ...translation,
        languages: {
          ...translation.languages,
          [language]: {
            ...file,
            lineColors: newLineColors,
          },
        },
      };

      const newTranslations = {
        ...state.translations,
        [baseName]: updatedTranslation,
      };

      storeFile.set('translations', newTranslations);
      storeFile.save();

      return {
        ...state,
        translations: {
          ...state.translations,
          [baseName]: {
            ...translation,
            languages: {
              ...translation.languages,
              [language]: {
                ...file,
                lineColors: newLineColors,
              },
            },
          },
        },
      };
    });
  },

  // Получает все цветные метки для файла
  getLineColors: (baseName, language) => {
    const state = get();
    const translation = state.translations[baseName];
    if (!translation || !translation.languages[language]) return [];

    return translation.languages[language].lineColors || [];
  },
});
