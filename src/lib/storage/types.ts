export interface IStorage {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  save(): Promise<void>;
}