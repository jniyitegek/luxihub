import fs from 'fs';
import path from 'path';

export interface StorageAdapter {
  upload(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string>;
}

/**
 * Local filesystem storage adapter.
 * Saves files to public/uploads/ and returns public relative URL /uploads/[filename].
 * Swap with S3StorageAdapter or CloudinaryStorageAdapter in production.
 */
export class LocalStorageAdapter implements StorageAdapter {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(fileBuffer: Buffer, fileName: string, _mimeType: string): Promise<string> {
    const sanitizedExt = path.extname(fileName).toLowerCase() || '.jpg';
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${sanitizedExt}`;
    const filePath = path.join(this.uploadDir, uniqueName);

    await fs.promises.writeFile(filePath, fileBuffer);
    return `/uploads/${uniqueName}`;
  }
}

// Single instance export for app consumption
export const storageAdapter: StorageAdapter = new LocalStorageAdapter();
