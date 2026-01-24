import type { IStorage } from './types';
import { db } from '../fs/db';

export class BrowserStorage implements IStorage {
  private storagePrefix: string;

  constructor(filename: string) {
    // Используем filename как префикс для ключей
    this.storagePrefix = `storage_${filename}_`;
  }

  async get(key: string): Promise<any> {
    try {
      const fullKey = this.storagePrefix + key;
      const record = await db.storage.get(fullKey);
      return record?.value;
    } catch (error) {
      console.error(`Ошибка чтения из storage (${key}):`, error);
      return undefined;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      const fullKey = this.storagePrefix + key;
      await db.storage.put({
        key: fullKey,
        value,
      });
    } catch (error) {
      console.error(`Ошибка записи в storage (${key}):`, error);
      throw error;
    }
  }

  async save(): Promise<void> {
    // В IndexedDB сохранение происходит автоматически при put()
    // Этот метод оставляем для совместимости интерфейса
    return Promise.resolve();
  }
}