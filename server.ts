import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/generate-place-details", async (req, res) => {
    try {
      const { cityName, country } = req.body;
      
      if (!cityName || !country) {
        return res.status(400).json({ error: "City and country are required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        // Fallback if no API key is present or it's the placeholder
        return res.json({
          description: `A beautiful and unique place in ${country}. The architecture and natural landscapes of ${cityName} offer an unforgettable experience.`,
          highlights: ["Local Culture", "Historic Architecture", "Scenic Views"]
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `Generate a poetic, cinematic description (around 2 sentences) for the city of ${cityName}, ${country}. Also, provide exactly 3 specific, famous representative architectural or natural landmarks for this city.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: {
                type: Type.STRING,
                description: "A poetic, cinematic description of the city."
              },
              highlights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 representative architectural or natural landmarks."
              }
            },
            required: ["description", "highlights"]
          }
        }
      });

      const text = response.text;
      if (text) {
        const data = JSON.parse(text);
        res.json(data);
      } else {
        throw new Error("Empty response from Gemini");
      }
    } catch (error) {
      console.error("Error generating place details:", error);
      // Fallback on error
      res.json({
        description: `A beautiful and unique place in ${req.body.country}. The architecture and natural landscapes of ${req.body.cityName} offer an unforgettable experience.`,
        highlights: ["Local Culture", "Historic Architecture", "Scenic Views"]
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
