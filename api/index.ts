import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import cors from "cors";

const app = express();

// Middleware básico
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Rutas de OAuth
registerOAuthRoutes(app);

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Manejador para cualquier otra ruta de API
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

export default app;
