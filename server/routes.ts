import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { currencyService } from "./services/currency";
import { fileProcessor } from "./services/file-processor";
import multer from "multer";
import path from "path";
import { z } from "zod";

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types, validation will be done per endpoint
    cb(null, true);
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Currency API routes
  app.get("/api/currency/rates/:base", async (req, res) => {
    try {
      const { base } = req.params;
      
      if (!base || !/^[A-Z]{3}$/.test(base)) {
        return res.status(400).json({ error: "Invalid currency code" });
      }

      const rates = await currencyService.getExchangeRates(base);
      res.json(rates);
    } catch (error) {
      console.error("Currency API error:", error);
      res.status(500).json({ error: "Failed to fetch exchange rates" });
    }
  });

  // PDF processing routes
  app.post("/api/pdf/merge", upload.array('pdf', 20), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length < 2) {
        return res.status(400).json({ error: "At least 2 PDF files required" });
      }

      // Validate all files are PDFs
      for (const file of files) {
        if (file.mimetype !== 'application/pdf') {
          return res.status(400).json({ error: `${file.originalname} is not a PDF file` });
        }
      }

      const keepBookmarks = req.body.keepBookmarks === 'true';
      const fileOrder = req.body.fileOrder ? JSON.parse(req.body.fileOrder) : null;

      const result = await fileProcessor.mergePDFs(files, { keepBookmarks, fileOrder });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="merged.pdf"');
      
      res.send(result.buffer);
    } catch (error) {
      console.error("PDF merge error:", error);
      res.status(500).json({ error: "Failed to merge PDFs" });
    }
  });

  app.post("/api/pdf/split", upload.single('pdf'), async (req, res) => {
    try {
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: "PDF file required" });
      }

      if (file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: "File must be a PDF" });
      }

      const { splitMode, pageRanges, everyNPages, preserveMetadata } = req.body;

      const result = await fileProcessor.splitPDF(file, {
        splitMode,
        pageRanges,
        everyNPages: parseInt(everyNPages),
        preserveMetadata: preserveMetadata === 'true'
      });

      res.json(result);
    } catch (error) {
      console.error("PDF split error:", error);
      res.status(500).json({ error: "Failed to split PDF" });
    }
  });

  app.post("/api/pdf/info", upload.single('pdf'), async (req, res) => {
    try {
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: "PDF file required" });
      }

      const info = await fileProcessor.getPDFInfo(file);
      res.json(info);
    } catch (error) {
      console.error("PDF info error:", error);
      res.status(500).json({ error: "Failed to get PDF info" });
    }
  });

  // Image processing routes
  app.post("/api/image/resize", upload.single('image'), async (req, res) => {
    try {
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: "Image file required" });
      }

      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({ error: "File must be an image" });
      }

      const { width, height, format, quality, resizeMode } = req.body;

      const result = await fileProcessor.resizeImage(file, {
        width: parseInt(width),
        height: parseInt(height),
        format,
        quality: parseInt(quality),
        resizeMode
      });

      res.setHeader('Content-Type', `image/${format}`);
      res.send(result.buffer);
    } catch (error) {
      console.error("Image resize error:", error);
      res.status(500).json({ error: "Failed to resize image" });
    }
  });

  app.post("/api/image/compress", upload.single('image'), async (req, res) => {
    try {
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: "Image file required" });
      }

      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({ error: "File must be an image" });
      }

      const { quality, format, targetSize } = req.body;

      const result = await fileProcessor.compressImage(file, {
        quality: parseInt(quality),
        format,
        targetSize: targetSize ? parseInt(targetSize) : undefined
      });

      res.setHeader('Content-Type', `image/${format}`);
      res.send(result.buffer);
    } catch (error) {
      console.error("Image compress error:", error);
      res.status(500).json({ error: "Failed to compress image" });
    }
  });

  // Audio processing routes
  app.post("/api/audio/cut", upload.single('audio'), async (req, res) => {
    try {
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: "Audio file required" });
      }

      if (!file.mimetype.startsWith('audio/')) {
        return res.status(400).json({ error: "File must be an audio file" });
      }

      const { startTime, endTime, fadeIn, fadeOut, fadeDuration } = req.body;

      const result = await fileProcessor.cutAudio(file, {
        startTime: parseFloat(startTime),
        endTime: parseFloat(endTime),
        fadeIn: fadeIn === 'true',
        fadeOut: fadeOut === 'true',
        fadeDuration: parseFloat(fadeDuration)
      });

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', 'attachment; filename="cut-audio.mp3"');
      res.send(result.buffer);
    } catch (error) {
      console.error("Audio cut error:", error);
      res.status(500).json({ error: "Failed to cut audio" });
    }
  });

  // Tool usage tracking
  app.post("/api/tools/usage", async (req, res) => {
    try {
      const usageSchema = z.object({
        toolId: z.string(),
        category: z.string(),
        sessionId: z.string().optional(),
      });

      const usage = usageSchema.parse(req.body);
      
      await storage.trackToolUsage(usage);
      res.json({ success: true });
    } catch (error) {
      console.error("Tool usage tracking error:", error);
      res.status(500).json({ error: "Failed to track usage" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      services: {
        currency: "available",
        fileProcessor: "available"
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
