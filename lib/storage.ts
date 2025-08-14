import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface StorageService {
  save(file: Buffer, filename: string): Promise<string>;
  get(filepath: string): Promise<Buffer>;
  delete(filepath: string): Promise<void>;
  getUrl(filepath: string): string;
}

class LocalStorageService implements StorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async save(file: Buffer, filename: string): Promise<string> {
    const ext = path.extname(filename);
    const hash = crypto.randomBytes(16).toString('hex');
    const newFilename = `${hash}${ext}`;
    const filepath = path.join(this.uploadDir, newFilename);
    
    await fs.writeFile(filepath, file);
    return newFilename;
  }

  async get(filepath: string): Promise<Buffer> {
    const fullPath = path.join(this.uploadDir, filepath);
    return await fs.readFile(fullPath);
  }

  async delete(filepath: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, filepath);
    await fs.unlink(fullPath);
  }

  getUrl(filepath: string): string {
    return `/api/images/${filepath}`;
  }
}

// S3 Storage Service (placeholder for when switching to S3)
class S3StorageService implements StorageService {
  async save(file: Buffer, filename: string): Promise<string> {
    // Implementation would use AWS SDK
    // const s3 = new S3Client({ region: process.env.AWS_REGION });
    // await s3.send(new PutObjectCommand({...}));
    throw new Error('S3 storage not implemented. Install @aws-sdk/client-s3');
  }

  async get(filepath: string): Promise<Buffer> {
    throw new Error('S3 storage not implemented');
  }

  async delete(filepath: string): Promise<void> {
    throw new Error('S3 storage not implemented');
  }

  getUrl(filepath: string): string {
    return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${filepath}`;
  }
}

// Factory function to get the appropriate storage service
export function getStorageService(): StorageService {
  const storageType = process.env.STORAGE_TYPE || 'local';
  
  if (storageType === 's3') {
    return new S3StorageService();
  }
  
  return new LocalStorageService();
}

export const storage = getStorageService();