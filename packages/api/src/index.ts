import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "./config.js";
import publicRoutes from "./routes/public.js";
import inventaireRoutes from "./routes/inventaire.js";
import villesRoutes from "./routes/villes.js";

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Logging des requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/", publicRoutes);
app.use("/", inventaireRoutes);
app.use("/", villesRoutes);

// Route de health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Gestion des routes non trouvées
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} non trouvée`,
  });
});

// Gestion globale des erreurs
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error("Erreur serveur:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: "Une erreur interne est survenue",
  });
});

// Démarrage du serveur
app.listen(config.port, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║          🏰  Réserve de Valdoria  🏰                       ║
║                                                            ║
║  API protégée par Keycloak pour la formation              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

✅ Serveur démarré sur le port ${config.port}
🔐 Keycloak: ${config.keycloak.url}
🏛️  Realm: ${config.keycloak.realm}
🎯 Client ID: ${config.keycloak.clientId}

📋 Endpoints disponibles:
   • GET  /info                        (public)
   • GET  /inventaire                  (RBAC: marchand)
   • GET  /villes/:ville/artefacts     (RBAC + ABAC)
   • GET  /health                      (health check)
`);
});
