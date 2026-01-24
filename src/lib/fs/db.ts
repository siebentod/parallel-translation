import Dexie, { Table } from 'dexie';

export interface FileRecord {
  path: string; // Primary key, например "ParallelTranslation/translations/test-original.md"
  content: string;
  dateModified: string;
}

export interface StorageRecord {
  key: string; // Primary key
  value: any;
}

export class AppDatabase extends Dexie {
  files!: Table<FileRecord, string>;
  storage!: Table<StorageRecord, string>;

  constructor() {
    super('ParallelTranslationDB');
    
    this.version(1).stores({
      files: 'path, dateModified', // path - primary key, dateModified - индекс
      storage: 'key' // key - primary key
    });
  }
}

export const db = new AppDatabase();