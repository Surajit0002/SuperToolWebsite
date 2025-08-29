import { storage } from "../storage";
import fs from 'fs/promises';
import path from 'path';
import cron from 'node-cron';

class CleanupService {
  private isRunning: boolean = false;

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Run cleanup every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      await this.cleanupExpiredFiles();
    });

    // Run cleanup every hour for database
    cron.schedule('0 * * * *', async () => {
      await this.cleanupExpiredJobs();
    });

    console.log('Cleanup service started');
  }

  stop() {
    this.isRunning = false;
    console.log('Cleanup service stopped');
  }

  private async cleanupExpiredFiles() {
    try {
      const expiredJobs = await storage.getExpiredJobs();
      
      for (const job of expiredJobs) {
        try {
          // Delete result file if it exists
          if (job.resultPath) {
            await fs.unlink(job.resultPath).catch(() => {
              // Ignore errors if file doesn't exist
            });
          }

          // Delete job record
          await storage.deleteFileProcessingJob(job.id);
          
          console.log(`Cleaned up expired job: ${job.id}`);
        } catch (error) {
          console.error(`Failed to cleanup job ${job.id}:`, error);
        }
      }

      // Clean up orphaned files in temp directories
      await this.cleanupOrphanedFiles();
      
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  private async cleanupExpiredJobs() {
    try {
      const expiredJobs = await storage.getExpiredJobs();
      
      for (const job of expiredJobs) {
        await storage.deleteFileProcessingJob(job.id);
      }

      console.log(`Cleaned up ${expiredJobs.length} expired jobs`);
    } catch (error) {
      console.error('Job cleanup error:', error);
    }
  }

  private async cleanupOrphanedFiles() {
    try {
      const tempDirs = ['uploads', 'temp_files', 'processed'];
      
      for (const dir of tempDirs) {
        try {
          await fs.access(dir);
          const files = await fs.readdir(dir);
          
          for (const file of files) {
            try {
              const filePath = path.join(dir, file);
              const stats = await fs.stat(filePath);
              
              // Delete files older than 2 hours
              const age = Date.now() - stats.mtime.getTime();
              if (age > 2 * 60 * 60 * 1000) {
                await fs.unlink(filePath);
                console.log(`Deleted orphaned file: ${filePath}`);
              }
            } catch (error) {
              // Ignore individual file errors
            }
          }
        } catch (error) {
          // Directory doesn't exist, skip
        }
      }
    } catch (error) {
      console.error('Orphaned files cleanup error:', error);
    }
  }

  async forceCleanup() {
    console.log('Starting force cleanup...');
    await this.cleanupExpiredFiles();
    await this.cleanupExpiredJobs();
    console.log('Force cleanup completed');
  }
}

export const cleanupService = new CleanupService();

// Auto-start cleanup service
cleanupService.start();

// Graceful shutdown
process.on('SIGINT', () => {
  cleanupService.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanupService.stop();
  process.exit(0);
});
