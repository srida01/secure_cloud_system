import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const LOCAL_PATH = process.env.LOCAL_UPLOAD_PATH || './uploads';

// Ensure upload directory exists
if (!fs.existsSync(LOCAL_PATH)) {
  fs.mkdirSync(LOCAL_PATH, { recursive: true });
}

export const storageService = {
  async uploadFile(buffer: Buffer, originalName: string, mimeType: string): Promise<{ key: string; checksum: string }> {
    const key = `${uuidv4()}-${Date.now()}-${originalName}`;
    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');

    if (process.env.USE_LOCAL_STORAGE === 'true') {
      const filePath = path.join(LOCAL_PATH, key);
      fs.writeFileSync(filePath, buffer);
      return { key, checksum };
    }

    // S3 upload (optional)
    // const s3 = new S3Client({ region: process.env.AWS_REGION });
    // await s3.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: key, Body: buffer }));
    return { key, checksum };
  },

  async deleteFile(key: string): Promise<void> {
    if (process.env.USE_LOCAL_STORAGE === 'true') {
      const filePath = path.join(LOCAL_PATH, key);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  },

  getFileUrl(key: string): string {
    if (process.env.USE_LOCAL_STORAGE === 'true') {
      return `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${key}`;
    }
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  },
};