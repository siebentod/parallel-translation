import { LazyStore } from '@tauri-apps/plugin-store';
import type { IStorage } from './types';

export class TauriStorage implements IStorage {
  private store: LazyStore;

  constructor(filename: string) {
    this.store = new LazyStore(filename);
  }

  async get(key: string): Promise<any> {
    return this.store.get(key);
  }

  async set(key: string, value: any): Promise<void> {
    await this.store.set(key, value);
  }

  async save(): Promise<void> {
    await this.store.save();
  }
}