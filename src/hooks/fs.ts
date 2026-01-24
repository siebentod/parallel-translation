import {
  create,
  writeTextFile,
  open,
  readTextFile,
  readDir,
  mkdir,
  exists,
  stat,
  BaseDirectory,
  remove,
  rename,
} from '@tauri-apps/plugin-fs';
import toast from 'react-hot-toast';

const ensureDirectory = async (dirname: string) => {
  try {
    const dirExists = await exists(`ParallelTranslation\\${dirname}`, {
      baseDir: BaseDirectory.Document,
    });

    if (!dirExists) {
      await mkdir(`ParallelTranslation\\${dirname}`, {
        baseDir: BaseDirectory.Document,
        recursive: true,
      });
    }
  } catch (error) {
    console.error(`Ошибка создания директории ${dirname}:`, error);
  }
};

const createDirectory = async (dirname: string) => {
  await mkdir(`ParallelTranslation\\${dirname}`, {
    baseDir: BaseDirectory.Document,
  });
};

export const readDirectory = async (dirname: string) => {
  try {
    await ensureDirectory(dirname);
    const entries = await readDir(`ParallelTranslation\\${dirname}`, {
      baseDir: BaseDirectory.Document,
    });

    const filteredEntries = [];
    for (const entry of entries) {
      if (entry.name.endsWith('.md')) {
        const dateModified = await stat(`ParallelTranslation\\${dirname}\\${entry.name}`, {
          baseDir: BaseDirectory.Document,
        });
        filteredEntries.push({
          name: entry.name,
          dateModified: dateModified?.mtime?.toISOString(),
        });
      }
    }

    return filteredEntries;
  } catch (error) {
    console.error(`Ошибка чтения директории ${dirname}:`, error);
    return [];
  }
};

export const createFile = async (filepath: string, content: string) => {
  const file = await create(`ParallelTranslation\\${filepath}`, {
    baseDir: BaseDirectory.Document,
  });
  await writeTextFile(`ParallelTranslation\\${filepath}`, content, {
    baseDir: BaseDirectory.Document,
  });
  await file.close();
};

export const saveFile = async (filepath: string, content: string) => {
  try {
    await writeTextFile(`ParallelTranslation\\${filepath}`, content, {
      baseDir: BaseDirectory.Document,
    });
  } catch (error: any) {
    if (error.includes('os error 3')) {
      try {
        await createFile(filepath, content);
      } catch (error: any) {
        if (error.includes('os error 3')) {
          try {
            filepath.includes('projects')
              ? await createDirectory('projects')
              : await createDirectory('notes');
            await createFile(filepath, content);
          } catch (error) {
            toast.error(`Ошибка сохранения файла ${filepath}: ${error}`);
            console.error(`Ошибка сохранения файла ${filepath}:`, error);
          }
        }
      }
    }
  }
};

export const loadFile = async (filepath: string) => {
  try {
    const fileExists = await exists(`ParallelTranslation\\${filepath}`, {
      baseDir: BaseDirectory.Document,
    });

    if (!fileExists) {
      // Создаем пустой файл если его нет
      await saveFile(filepath, '');
      return '';
    }

    const content = await readTextFile(`ParallelTranslation\\${filepath}`, {
      baseDir: BaseDirectory.Document,
    });

    return content;
  } catch (error) {
    console.error(`Ошибка чтения файла ${filepath}:`, error);
    // Если файл не удалось прочитать, создаем пустой
    await saveFile(filepath, '');
    return '';
  }
};

export const deleteFile = async (filepath: string) => {
  try {
    await remove(`ParallelTranslation\\${filepath}`, {
      baseDir: BaseDirectory.Document,
    });
  } catch (error) {
    console.error(`Ошибка удаления файла ${filepath}:`, error);
  }
};
