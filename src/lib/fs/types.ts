export interface FileEntry {
  name: string;
  dateModified?: string;
}

export interface IFileSystem {
  readDirectory(dirname: string): Promise<FileEntry[]>;
  loadFile(filepath: string): Promise<string>;
  saveFile(filepath: string, content: string): Promise<void>;
  deleteFile(filepath: string): Promise<void>;
  renameFile(oldPath: string, newPath: string): Promise<void>;
}