import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import fs from "node:fs";
import path from "node:path";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
// Larger limit so uploaded logos (base64 data URLs) fit in the settings payload.
app.use(express.json({ limit: "3mb" }));
app.use(express.urlencoded({ extended: true, limit: "3mb" }));

app.use("/api", router);

// Serve the built frontend (SPA) when it is present alongside the server
// bundle. In the Docker runtime image the compiled bundle lives at
// /app/dist/index.mjs and the Vite build is copied to /app/public, so it
// resolves to /app/public. In local dev the frontend runs on its own Vite
// dev server and this directory does not exist, so serving is skipped.
const publicDir =
  process.env["PUBLIC_DIR"] ?? path.resolve(__dirname, "..", "public");
const indexHtml = path.join(publicDir, "index.html");

if (fs.existsSync(indexHtml)) {
  app.use(express.static(publicDir));

  // SPA fallback: any non-API GET request returns index.html so client-side
  // routing (wouter) can take over.
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(indexHtml);
  });

  logger.info({ publicDir }, "Serving frontend from static build");
} else {
  logger.warn(
    { publicDir },
    "No frontend build found; serving API only (GET / will 404)",
  );
}

export default app;
