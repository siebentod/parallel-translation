import { StateCreator } from 'zustand';
import { Store, Translation, TranslationFile } from '../types';
import { storeFile } from '..';
import { readDirectory } from 'src/lib/fs';

export interface InternalSlice {
  _loadTranslations: () => Promise<void>;
  _refreshLoad: () => Promise<void>;
  _getTranslation: (baseName: string) => Translation | undefined;

  _saveTranslationInfo: (baseName: string, language: string) => Promise<void>;
  _updateDateModified: (baseName: string) => Promise<void>;
  _getLastLanguageForText: (baseName: string) => string | null;
}

export const createInternalSlice: StateCreator<Store, [], [], InternalSlice> = (
  set,
  get
) => ({
  _loadTranslations: async () => {
    try {
      // Загружаем существующую информацию из JSON
      const existingTranslations = await storeFile.get('translations');
      const translationsFromStore: Record<string, Translation> =
        existingTranslations || {};

      const entries = await readDirectory('translations'); // предполагаем папку translations

      // Группируем файлы по базовому имени
      const translationMap: Record<string, Translation> = {};

      entries.forEach((entry) => {
        const fileName = entry.name;
        if (!fileName.endsWith('.md')) return;

        const nameWithoutExt = fileName.replace('.md', '');
        let baseName: string;
        let language: string;

        // Определяем базовое имя и язык
        if (nameWithoutExt.endsWith('-original')) {
          baseName = nameWithoutExt.replace('-original', '');
          language = 'original';
        } else {
          const lastDashIndex = nameWithoutExt.lastIndexOf('-');
          if (lastDashIndex === -1) return; // пропускаем файлы без суффикса языка

          baseName = nameWithoutExt.substring(0, lastDashIndex);
          language = nameWithoutExt.substring(lastDashIndex + 1);
        }

        // Берем существующую информацию из стора или создаем новую
        const existingTranslation = translationsFromStore[baseName];
        const shownName = existingTranslation?.shownName || baseName;
        const lastLanguage = existingTranslation?.lastLanguage || 'ru';
        const status = existingTranslation?.status || 'Новый';
        const dateCreated = existingTranslation?.dateCreated || new Date().toISOString();

        // Определяем дату модификации - берем максимальную из файла и существующей записи
        const fileDateModified = entry.dateModified || new Date().toISOString();
        const existingDateModified =
          existingTranslation?.dateModified || fileDateModified;
        const dateModified =
          fileDateModified > existingDateModified
            ? fileDateModified
            : existingDateModified;

        // Восстанавливаем lastPosition из существующих данных, если они есть
        const existingFileInfo = existingTranslation?.languages?.[language];
        const lastPosition = existingFileInfo?.lastPosition || 0;
        const existingLineColors = existingFileInfo?.lineColors || [];

        const translationFile: TranslationFile = {
          name: nameWithoutExt,
          fullName: fileName,
          baseName,
          language,
          lastPosition,
          lineColors: existingLineColors,
        };

        if (!translationMap[baseName]) {
          translationMap[baseName] = {
            baseName,
            shownName,
            lastLanguage,
            dateModified,
            dateCreated,
            languages: {},
            availableLanguages: [],
            status,
          };
        }

        translationMap[baseName].languages[language] = translationFile;

        // Обновляем дату модификации, если файл новее
        if (fileDateModified > translationMap[baseName].dateModified) {
          translationMap[baseName].dateModified = fileDateModified;
        }
      });

      // Формируем availableLanguages для каждого перевода
      Object.values(translationMap).forEach((translation) => {
        translation.availableLanguages = Object.keys(
          translation.languages
        ).filter((lang) => lang !== 'original');
      });

      set({ translations: translationMap, isDataLoaded: true });
    } catch (error) {
      console.error('Ошибка загрузки переводов:', error);
      set({ translations: {}, isDataLoaded: true });
    }
  },
  _refreshLoad: async () => {
    set({ isDataLoaded: false });
    await get()._loadTranslations();
  },
  _getTranslation: (baseName: string) => {
    return get().translations[baseName];
  },

  _saveTranslationInfo: async (baseName: string, language: string) => {
    try {
      const { translations } = get();
      const translation = translations[baseName];

      if (!translation) return;

      const updatedTranslation = {
        ...translation,
        lastLanguage: language,
      };

      const newTranslations = {
        ...translations,
        [baseName]: updatedTranslation,
      };

      await storeFile.set('translations', newTranslations);
      await storeFile.save();

      set({ translations: newTranslations });
    } catch (error) {
      console.error('Ошибка сохранения информации о переводе:', error);
    }
  },
  _updateDateModified: async (baseName: string) => {
    try {
      const { translations } = get();
      const translation = translations[baseName];

      if (!translation) return;

      const updatedTranslation = {
        ...translation,
        dateModified: new Date().toISOString(),
      };

      const newTranslations = {
        ...translations,
        [baseName]: updatedTranslation,
      };

      await storeFile.set('translations', newTranslations);
      await storeFile.save();

      set({ translations: newTranslations });
    } catch (error) {
      console.error('Ошибка обновления даты модификации:', error);
    }
  },
  _getLastLanguageForText: (baseName: string) => {
    const translation = get().translations[baseName];
    return translation?.lastLanguage || null;
  },
});
