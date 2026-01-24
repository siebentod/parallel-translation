import type { IFileSystem, FileEntry } from './types';
import { db } from './db';

export class BrowserFileSystem implements IFileSystem {
  async readDirectory(dirname: string): Promise<FileEntry[]> {
    try {
      const prefix = `ParallelTranslation/${dirname}/`;

      // Получаем все файлы из директории
      const files = await db.files.where('path').startsWith(prefix).toArray();

      const filteredEntries: FileEntry[] = [];

      for (const file of files) {
        // Извлекаем имя файла из пути
        const fileName = file.path.substring(prefix.length);

        // Проверяем, что это файл напрямую в директории (не в поддиректории)
        if (fileName.includes('/')) continue;

        if (fileName.endsWith('.md')) {
          filteredEntries.push({
            name: fileName,
            dateModified: file.dateModified,
          });
        }
      }

      return filteredEntries;
    } catch (error) {
      console.error(`Ошибка чтения директории ${dirname}:`, error);
      return [];
    }
  }

  async loadFile(filepath: string): Promise<string> {
    try {
      const fullPath = `ParallelTranslation/${filepath}`;
      const file = await db.files.get(fullPath);

      if (!file) {
        // Файл не существует, создаем пустой
        await this.saveFile(filepath, '');
        return '';
      }

      return file.content;
    } catch (error) {
      console.error(`Ошибка чтения файла ${filepath}:`, error);
      // Если не удалось прочитать, создаем пустой
      await this.saveFile(filepath, '');
      return '';
    }
  }

  async saveFile(filepath: string, content: string): Promise<void> {
    try {
      const fullPath = `ParallelTranslation/${filepath}`;

      await db.files.put({
        path: fullPath,
        content,
        dateModified: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Ошибка сохранения файла ${filepath}:`, error);
      throw error;
    }
  }

  async deleteFile(filepath: string): Promise<void> {
    try {
      const fullPath = `ParallelTranslation/${filepath}`;
      await db.files.delete(fullPath);
    } catch (error) {
      console.error(`Ошибка удаления файла ${filepath}:`, error);
    }
  }

  async renameFile(oldPath: string, newPath: string): Promise<void> {
    try {
      const fullOldPath = `ParallelTranslation/${oldPath}`;
      const fullNewPath = `ParallelTranslation/${newPath}`;

      // Получаем файл по старому пути
      const file = await db.files.get(fullOldPath);

      if (!file) {
        throw new Error(`Файл ${oldPath} не найден`);
      }

      // Создаем файл с новым путем
      await db.files.put({
        path: fullNewPath,
        content: file.content,
        dateModified: new Date().toISOString(),
      });

      // Удаляем файл со старым путем
      await db.files.delete(fullOldPath);
    } catch (error) {
      console.error(
        `Ошибка переименования файла ${oldPath} -> ${newPath}:`,
        error
      );
      throw error;
    }
  }
}
