import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // AI Analyze PDF or Image
  app.post('/api/ai/analyze', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const prompt = req.body.prompt || "Explain what this document is about.";
      const isHighThinking = req.body.thinking === 'true';
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const fileMimeType = req.file.mimetype;
      const fileBuffer = req.file.buffer;
      
      const config: any = {};
      let modelName = 'gemini-3.1-flash-lite';
      
      if (isHighThinking) {
        modelName = 'gemini-3.1-pro-preview';
        config.thinkingConfig = { thinkingBudgetTokens: 1024 }; // Provide a budget for thinking
      } else if (fileMimeType.startsWith('image/')) {
        modelName = 'gemini-3.1-pro-preview';
      }

      const result = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: fileBuffer.toString('base64'),
                  mimeType: fileMimeType
                }
              },
              { text: prompt }
            ]
          }
        ],
        config
      });

      res.json({ text: result.text });
    } catch (error: any) {
      console.error('AI Analysis error:', error);
      res.status(500).json({ error: error.message || 'Analysis failed' });
    }
  });

  // Vite Middleware (for development)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
