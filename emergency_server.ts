import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./server/routers";
import { createContext } from "./server/_core/context";
import { registerOAuthRoutes } from "./server/_core/oauth";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "50mb" }));

// Servir archivos estáticos desde la ruta absoluta
const publicPath = path.resolve(__dirname, "dist", "public");
console.log("Serving static files from:", publicPath);
app.use(express.static(publicPath));

// Registrar rutas de API
registerOAuthRoutes(app);
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// CUALQUIER otra ruta entrega el index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

const port = 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`EMERGENCY SERVER RUNNING ON PORT ${port}`);
});
