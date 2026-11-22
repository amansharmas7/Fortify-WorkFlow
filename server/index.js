import "dotenv/config";

import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist");

function parseAllowedOrigins(value) {
  return String(value || "").split(",").map((origin) => origin.trim()).filter(Boolean);
}

function validateTemplate(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The model returned an invalid template.");
  }
  const requiredText = (field, max) => {
    const text = value[field];
    if (typeof text !== "string" || !text.trim() || text.length > max) {
      throw new Error("The model returned an incomplete template.");
    }
    return text.trim();
  };
  if (!Array.isArray(value.steps) || value.steps.length < 1 || value.steps.length > 40) {
    throw new Error("The model returned an invalid number of workflow steps.");
  }

  const steps = value.steps.map((step) => {
    if (!step || typeof step !== "object" || Array.isArray(step)) {
      throw new Error("The model returned an invalid workflow step.");
    }
    const tools = step.tools === undefined ? [] : step.tools;
    if (
      !Array.isArray(tools) ||
      tools.length > 20 ||
      tools.some((tool) => typeof tool !== "string" || tool.length > 100)
    ) {
      throw new Error("The model returned invalid step tools.");
    }
    return {
      title: typeof step.title === "string" ? step.title.trim().slice(0, 160) : "",
      description: typeof step.description === "string" ? step.description.trim().slice(0, 2000) : "",
      role: typeof step.role === "string" ? step.role.trim().slice(0, 120) : "",
      tools: tools.map((tool) => tool.trim()),
    };
  });

  if (steps.some((step) => !step.title || !step.description || !step.role)) {
    throw new Error("The model returned an incomplete workflow step.");
  }

  return {
    title: requiredText("title", 160),
    description: requiredText("description", 2000),
    targetAudience: requiredText("targetAudience", 300),
    steps,
  };
}

async function generateWithGemini(prompt, apiKey) {
  if (!apiKey) {
    const error = new Error("Gemini is not configured on the server.");
    error.code = "MISSING_API_KEY";
    throw error;
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents:
      "Generate a detailed, standardized process documentation template for: " +
      prompt +
      ". The documentation should be clear and user-friendly for non-technical team members at Fortify Health.",
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 4096,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          targetAudience: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                role: { type: Type.STRING },
                tools: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["title", "description", "role"],
            },
          },
        },
        required: ["title", "description", "targetAudience", "steps"],
      },
    },
  });

  if (!response.text) throw new Error("Gemini returned an empty response.");
  return validateTemplate(JSON.parse(response.text));
}

export function createApp(options = {}) {
  const apiKey = options.apiKey ?? process.env.GEMINI_API_KEY;
  const allowedOrigins =
    options.allowedOrigins ?? parseAllowedOrigins(process.env.ALLOWED_ORIGINS || process.env.APP_URL);
  const rateLimit = options.rateLimit ?? 8;
  const windowMs = options.windowMs ?? 10 * 60 * 1000;
  const generate = options.generate ?? ((prompt) => generateWithGemini(prompt, apiKey));
  const requests = new Map();

  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "DENY");
    const origin = req.get("origin");
    if (origin && allowedOrigins.length && !allowedOrigins.includes(origin)) {
      return res.status(403).json({ error: "This origin is not allowed." });
    }
    return next();
  });
  app.use(express.json({ limit: "8kb", strict: true }));

  app.get("/api/health", (_req, res) => res.status(200).json({ status: "ok" }));

  app.post("/api/generate-process", async (req, res) => {
    const prompt = req.body?.prompt;
    if (typeof prompt !== "string" || !prompt.trim() || prompt.trim().length > 2000) {
      return res.status(400).json({
        error: "Provide a process description between 1 and 2,000 characters.",
      });
    }

    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || "unknown";
    let bucket = requests.get(key);
    if (!bucket || bucket.resetAt <= now) bucket = { count: 0, resetAt: now + windowMs };
    if (bucket.count >= rateLimit) {
      res.setHeader("Retry-After", String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))));
      return res.status(429).json({ error: "Generation rate limit reached. Try again later." });
    }
    bucket.count += 1;
    requests.set(key, bucket);
    if (requests.size > 10000) {
      for (const [ip, entry] of requests) {
        if (entry.resetAt <= now) requests.delete(ip);
      }
    }

    if (!apiKey && !options.generate) {
      return res.status(503).json({ error: "Gemini is not configured on the server." });
    }

    try {
      const result = validateTemplate(await generate(prompt.trim()));
      return res.status(200).json(result);
    } catch (error) {
      if (error?.code === "MISSING_API_KEY") {
        return res.status(503).json({ error: "Gemini is not configured on the server." });
      }
      console.error(
        "Gemini process generation failed:",
        error instanceof Error ? error.message : "Unknown error"
      );
      return res.status(502).json({
        error: "The process template could not be generated. Please try again.",
      });
    }
  });

  app.use(express.static(distDir));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    const indexPath = path.join(distDir, "index.html");
    if (!fs.existsSync(indexPath)) return next();
    return res.sendFile(indexPath);
  });

  app.use((error, _req, res, _next) => {
    if (error instanceof SyntaxError && "body" in error) {
      return res.status(400).json({ error: "Request body must contain valid JSON." });
    }
    if (error?.type === "entity.too.large") {
      return res.status(413).json({ error: "Request body is too large." });
    }
    return res.status(500).json({ error: "Unexpected server error." });
  });

  return app;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number.parseInt(process.env.PORT || "3001", 10);
  const app = createApp();
  app.listen(port, "0.0.0.0", () => {
    console.log("Fortify Workflow server listening on port " + port);
  });
}
