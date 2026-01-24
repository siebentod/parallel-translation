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
import type { IFileSystem, FileEntry } from './types';
import toast from 'react-hot-toast';

export class TauriFileSystem implements IFileSystem {
  async readDirectory(dirname: string): Promise<FileEntry[]> {
    try {
      await this.ensureDirectory(dirname);
      const entries = await readDir(`ParallelTranslation\\${dirname}`, {
        baseDir: BaseDirectory.Document,
      });

      const filteredEntries = [];
      for (const entry of entries) {
        if (entry.name.endsWith('.md')) {
          const dateModified = await stat(
            `ParallelTranslation\\${dirname}\\${entry.name}`,
            {
              baseDir: BaseDirectory.Document,
            }
          );
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
  }

  async loadFile(filepath: string): Promise<string> {
    try {
      const fileExists = await exists(`ParallelTranslation\\${filepath}`, {
        baseDir: BaseDirectory.Document,
      });

      if (!fileExists) {
        // Создаем пустой файл если его нет
        await this.saveFile(filepath, '');
        return '';
      }

      const content = await readTextFile(`ParallelTranslation\\${filepath}`, {
        baseDir: BaseDirectory.Document,
      });

      return content;
    } catch (error) {
      console.error(`Ошибка чтения файла ${filepath}:`, error);
      // Если файл не удалось прочитать, создаем пустой
      await this.saveFile(filepath, '');
      return '';
    }
  }

  async saveFile(filepath: string, content: string): Promise<void> {
    try {
      await writeTextFile(`ParallelTranslation\\${filepath}`, content, {
        baseDir: BaseDirectory.Document,
      });
    } catch (error: any) {
      if (error.includes('os error 3')) {
        try {
          await this.createFile(filepath, content);
        } catch (error: any) {
          if (error.includes('os error 3')) {
            try {
              filepath.includes('projects')
                ? await this.createDirectory('projects')
                : await this.createDirectory('notes');
              await this.createFile(filepath, content);
            } catch (error) {
              toast.error(`Ошибка сохранения файла ${filepath}: ${error}`);
              console.error(`Ошибка сохранения файла ${filepath}:`, error);
            }
          }
        }
      }
    }
  }

  async deleteFile(filepath: string): Promise<void> {
    try {
      await remove(`ParallelTranslation\\${filepath}`, {
        baseDir: BaseDirectory.Document,
      });
    } catch (error) {
      console.error(`Ошибка удаления файла ${filepath}:`, error);
    }
  }

  async renameFile(oldPath: string, newPath: string): Promise<void> {
    try {
      await rename(`ParallelTranslation\\${oldPath}`, `ParallelTranslation\\${newPath}`, {
        oldPathBaseDir: BaseDirectory.Document,
        newPathBaseDir: BaseDirectory.Document,
      });
    } catch (error) {
      console.error(`Ошибка переименования файла ${oldPath} в ${newPath}:`, error);
    }
  }

  private async ensureDirectory(dirname: string): Promise<void> {
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
  }

  private async createDirectory(dirname: string): Promise<void> {
    await mkdir(`ParallelTranslation\\${dirname}`, {
      baseDir: BaseDirectory.Document,
    });
  }

  private async createFile(filepath: string, content: string): Promise<void> {
    const file = await create(`ParallelTranslation\\${filepath}`, {
      baseDir: BaseDirectory.Document,
    });
    await writeTextFile(`ParallelTranslation\\${filepath}`, content, {
      baseDir: BaseDirectory.Document,
    });
    await file.close();
  }
}
