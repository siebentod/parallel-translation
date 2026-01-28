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
    language?: string,
    content?: string
  ) => Promise<{ success: boolean; error?: string }>;
  deleteTranslation: (baseName: string) => Promise<void>;
  renameTranslation: (
    oldBaseName: string,
    newShownName: string
  ) => Promise<{ success: boolean; error?: string }>;
  editStatus: (oldBaseName: string, newStatus: string) => Promise<void>;
  createNewLanguage: (
    baseName: string,
    language: string,
    content?: string
  ) => Promise<{ success: boolean; error?: string }>;
  deleteOneLanguage: (
    baseName: string,
    language: string
  ) => Promise<{ success: boolean; error?: string }>;
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

  createTranslation: async (shownName: string, language = '') => {
    try {
      const baseName = generateSlug(shownName);
      const originalName = `${baseName}-original.md`;

      if (get().translations[baseName]) {
        toast.error(`Перевод "${shownName}" уже существует`);
        return {
          success: false,
          error: `Перевод "${baseName}" уже существует`,
        };
      }

      const originalPath = `translations/${originalName}`;
      await saveFile(originalPath, '');

      const translationName = language ? `${baseName}-${language}.md` : '';

      if (language) {
        const translationPath = `translations/${translationName}`;
        await saveFile(translationPath, '');
      }

      // Создаем запись в сторе
      const { translations } = get();
      const newTranslation: Translation = {
        baseName,
        shownName,
        lastLanguage: language,
        dateModified: new Date().toISOString(),
        dateCreated: new Date().toISOString(),
        languages: {
          original: {
            name: `${baseName}-original`,
            fullName: originalName,
            baseName,
            language: 'original',
            lastPosition: 0,
          },
          ...(language
            ? {
                [language]: {
                  name: `${baseName}-${language}`,
                  fullName: translationName,
                  baseName,
                  language,
                  lastPosition: 0,
                },
              }
            : {}),
        },
        availableLanguages: language ? [language] : [],
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

  createNewLanguage: async (baseName: string, language: string) => {
    const translation = get()._getTranslation(baseName);
    if (!translation) {
      toast.error(`Перевод "${baseName}" не найден`);
      return { success: false, error: 'Перевод не найден' };
    }
    if (translation.languages[language]) {
      toast.error(`Язык "${language}" уже существует`);
      return { success: false, error: 'Язык уже существует' };
    }

    const name = `${baseName}-${language}`;
    const fullName = `${name}.md`;

    const updatedTranslation: Translation = {
      ...translation,
      languages: {
        ...translation.languages,
        [language]: {
          name,
          fullName,
          baseName,
          language,
          lastPosition: 0,
        },
      },
      availableLanguages: [...translation.availableLanguages, language],
    };

    const newTranslations = {
      ...get().translations,
      [baseName]: updatedTranslation,
    };

    await storeFile.set('translations', newTranslations);
    await storeFile.save();
    set({ translations: newTranslations });

    const translationPath = `translations/${fullName}`;
    await saveFile(translationPath, '');

    return { success: true };
  },

  deleteOneLanguage: async (baseName: string, language: string) => {
    try {
      const translation = get()._getTranslation(baseName);
      if (!translation) {
        toast.error(`Перевод "${baseName}" не найден`);
        return { success: false, error: 'Перевод не найден' };
      }

      if (language === 'original') {
        toast.error('Нельзя удалить оригинальный файл');
        return { success: false, error: 'Нельзя удалить оригинальный файл' };
      }

      if (!translation.languages[language]) {
        toast.error(`Язык "${language}" не найден`);
        return { success: false, error: 'Язык не найден' };
      }

      // Обновляем languages и availableLanguages
      const newLanguages = { ...translation.languages };
      delete newLanguages[language];

      const newAvailableLanguages = translation.availableLanguages.filter(
        (lang) => lang !== language
      );

      const updatedTranslation: Translation = {
        ...translation,
        languages: newLanguages,
        availableLanguages: newAvailableLanguages,
        dateModified: new Date().toISOString(),
        // Если удаляемый язык был последним открытым, меняем на первый доступный
        lastLanguage:
          translation.lastLanguage === language
            ? newAvailableLanguages[0]
            : translation.lastLanguage,
      };

      const newTranslations = {
        ...get().translations,
        [baseName]: updatedTranslation,
      };

      await storeFile.set('translations', newTranslations);
      await storeFile.save();
      set({ translations: newTranslations });

      // Удаляем файл языка
      const filePath = `translations/${translation.languages[language].fullName}`;
      await deleteFile(filePath);

      toast.success(`Язык "${language}" удален`);
      return { success: true };
    } catch (error) {
      console.error(`Ошибка удаления языка ${language}:`, error);
      toast.error('Ошибка удаления языка');
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

      toast.success(`Перевод "${translation.shownName}" удален`);
    } catch (error) {
      console.error(`Ошибка удаления перевода ${baseName}:`, error);
      toast.error('Ошибка удаления перевода');
    }
  },
});
