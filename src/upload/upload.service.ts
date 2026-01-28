import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class UploadService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.post.findMany();
  }

  async deleteFile(filePath: string) {
    try {
      if (!filePath) return;
      // filePath is something like /uploads/avatars/filename.jpg
      // We want to join it with current working directory
      const fullPath = path.join(process.cwd(), filePath);
      await fs.unlink(fullPath);
      console.log('Successfully deleted:', fullPath);
    } catch (err) {
      // Don't throw to avoid failing the main request if deletion fails (e.g. file doesn't exist)
      console.warn('Delete file failed:', err.message);
    }
  }
}
