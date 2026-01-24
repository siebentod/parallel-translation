import { StateCreator } from 'zustand';
import { Store, Translation, TranslationFile } from '../types';
import toast from 'react-hot-toast';
import { deleteFile, loadFile, renameFile, saveFile } from 'src/lib/fs';
import { generateSlug } from 'src/lib/generate-slug';
import { storeFile } from '..';

export interface DataSlice {
  translations: Record<string, Translation>;
  isDataLoaded: boolean;

  openTranslation: (baseName: string, language?: string) => Promise<void>;
  createTranslation: (
    shownName: string,
    language: string,
    content?: string
  ) => Promise<{ success: boolean; error?: string }>;
  deleteTranslation: (baseName: string) => Promise<void>;
  renameTranslation: (
    oldBaseName: string,
    newShownName: string
  ) => Promise<{ success: boolean; error?: string }>;
  editStatus: (oldBaseName: string, newStatus: string) => Promise<void>;
}

export const createDataSlice: StateCreator<Store, [], [], DataSlice> = (
  set,
  get
) => ({
  translations: {},
  isDataLoaded: false,

  openTranslation: async (baseName: string, language?: string) => {
    try {
      const translation = get()._getTranslation(baseName);
      if (!translation) {
        toast.error(`Перевод "${baseName}" не найден`);
        return;
      }

      // Определяем язык для открытия
      let targetLanguage = language;
      if (!targetLanguage) {
        // Берем последний открытый язык или первый доступный
        targetLanguage =
          get()._getLastLanguageForText(baseName) ||
          translation.availableLanguages[0];
      }

      if (!targetLanguage) {
        toast.error('Нет доступных переводов для этого текста');
        return;
      }

      // Загружаем оригинал
      let originalFile: TranslationFile | null = null;
      if (translation.languages.original) {
        const originalPath = `translations/${translation.languages.original.fullName}`;
        const originalContent = await loadFile(originalPath);
        originalFile = {
          ...translation.languages.original,
          content: originalContent,
          // Восстанавливаем lastPosition для оригинала
          lastPosition: translation.languages.original.lastPosition || 0,
        };
      }

      // Загружаем перевод
      const translationFileInfo = translation.languages[targetLanguage];
      if (!translationFileInfo) {
        toast.error(`Перевод на язык "${targetLanguage}" не найден`);
        return;
      }

      const translationPath = `translations/${translationFileInfo.fullName}`;
      const translationContent = await loadFile(translationPath);
      const translationFile: TranslationFile = {
        ...translationFileInfo,
        content: translationContent,
        // Восстанавливаем lastPosition для перевода
        lastPosition: translationFileInfo.lastPosition || 0,
      };

      // Обновляем состояние
      set({
        currentTranslation: {
          baseName,
          originalFile,
          translationFile,
          currentLanguage: targetLanguage,
          isDataLoaded: true,
        },
      });

      // Сохраняем информацию о последнем открытом
      await get()._saveTranslationInfo(baseName, targetLanguage);
    } catch (error) {
      console.error(`Ошибка открытия перевода ${baseName}:`, error);
      toast.error('Ошибка открытия перевода');
    }
  },
  createTranslation: async (shownName: string, language = 'ru') => {
    try {
      const baseName = generateSlug(shownName);
      const originalName = `${baseName}-original.md`;
      const translationName = `${baseName}-${language}.md`;

      if (get().translations[baseName]) {
        toast.error(`Перевод "${shownName}" уже существует`);
        return {
          success: false,
          error: `Перевод "${baseName}" уже существует`,
        };
      }

      const originalPath = `translations/${originalName}`;
      const translationPath = `translations/${translationName}`;
      await saveFile(originalPath, '');
      await saveFile(translationPath, '');

      // Создаем запись в сторе
      const { translations } = get();
      const newTranslation: Translation = {
        baseName,
        shownName,
        lastLanguage: language,
        dateModified: new Date().toISOString(),
        languages: {
          original: {
            name: `${baseName}-original`,
            fullName: originalName,
            baseName,
            language: 'original',
            lastPosition: 0,
          },
          [language]: {
            name: `${baseName}-${language}`,
            fullName: translationName,
            baseName,
            language,
            lastPosition: 0,
          },
        },
        availableLanguages: [language],
        status: 'Новый',
      };

      const newTranslations = {
        ...translations,
        [baseName]: newTranslation,
      };

      await storeFile.set('translations', newTranslations);
      await storeFile.save();
      set({ translations: newTranslations });

      return { success: true };
    } catch (error) {
      console.error(`Ошибка создания перевода ${shownName}:`, error);
      toast.error('Ошибка создания файла перевода');
      return { success: false, error: 'Catch error' };
    }
  },

  renameTranslation: async (baseName: string, newShownName: string) => {
    try {
      const translation = get()._getTranslation(baseName);
      if (!translation) {
        toast.error(`Перевод "${baseName}" не найден`);
        return { success: false, error: 'Перевод не найден' };
      }

      const oldShownName = translation.shownName;
      if (oldShownName === newShownName) {
        return { success: true };
      }

      const newBaseName = generateSlug(newShownName);

      if (newBaseName !== baseName && get().translations[newBaseName]) {
        toast.error(`Перевод "${newShownName}" уже существует`);
        return {
          success: false,
          error: `Перевод "${newBaseName}" уже существует`,
        };
      }

      const { translations } = get();

      // Переименовываем все файлы перевода
      const newLanguages: Translation['languages'] = {};

      // Переименовываем original файл
      const oldOriginalPath = `translations/${baseName}-original.md`;
      const newOriginalPath = `translations/${newBaseName}-original.md`;
      await renameFile(oldOriginalPath, newOriginalPath);

      newLanguages.original = {
        ...translation.languages.original,
        name: `${newBaseName}-original`,
        fullName: `${newBaseName}-original.md`,
        baseName: newBaseName,
      };

      // Переименовываем файлы всех языков
      for (const lang of translation.availableLanguages) {
        const oldPath = `translations/${baseName}-${lang}.md`;
        const newPath = `translations/${newBaseName}-${lang}.md`;
        await renameFile(oldPath, newPath);

        newLanguages[lang] = {
          ...translation.languages[lang],
          name: `${newBaseName}-${lang}`,
          fullName: `${newBaseName}-${lang}.md`,
          baseName: newBaseName,
        };
      }

      // Создаем обновленный объект перевода
      const updatedTranslation: Translation = {
        ...translation,
        baseName: newBaseName,
        shownName: newShownName,
        dateModified: new Date().toISOString(),
        languages: newLanguages,
      };

      // Обновляем translations: удаляем старый ключ, добавляем новый
      const newTranslations = { ...translations };
      delete newTranslations[baseName];
      newTranslations[newBaseName] = updatedTranslation;

      await storeFile.set('translations', newTranslations);
      await storeFile.save();
      set({ translations: newTranslations });

      return { success: true, newBaseName };
    } catch (error) {
      console.error(`Ошибка редактирования перевода ${baseName}:`, error);
      toast.error('Ошибка редактирования перевода');
      return { success: false, error: 'Catch error' };
    }
  },

  editStatus: async (baseName: string, newStatus: string) => {
    try {
      const { translations } = get();
      const translation = translations[baseName];

      if (!translation) return;

      const updatedTranslation = {
        ...translation,
        status: newStatus,
      };

      const newTranslations = {
        ...translations,
        [baseName]: updatedTranslation,
      };

      await storeFile.set('translations', newTranslations);
      await storeFile.save();

      set({ translations: newTranslations });
    } catch (error) {
      console.error('Ошибка сохранения статуса перевода:', error);
    }
  },

  deleteTranslation: async (baseName: string) => {
    try {
      const translation = get()._getTranslation(baseName);
      if (!translation) {
        toast.error(`Перевод "${baseName}" не найден`);
        return;
      }

      const deletePromises: Promise<void>[] = [];

      // Удаляем все файлы (включая оригинал и переводы)
      Object.values(translation.languages).forEach((translationFile) => {
        const filePath = `translations/${translationFile.fullName}`;
        deletePromises.push(deleteFile(filePath));
      });

      await Promise.all(deletePromises);

      // Удаляем из стора
      const { translations } = get();
      const newTranslations = { ...translations };
      delete newTranslations[baseName];

      await storeFile.set('translations', newTranslations);
      await storeFile.save();

      set({ translations: newTranslations });

      // Если удаляемый перевод открыт, закрываем его
      const { currentTranslation } = get();
      if (currentTranslation.baseName === baseName) {
        get().closeCurrentTranslation();
      }

      toast.success(`Перевод "${translation.shownName}" удален`);
    } catch (error) {
      console.error(`Ошибка удаления перевода ${baseName}:`, error);
      toast.error('Ошибка удаления перевода');
    }
  },
});
