import { Router, Request, Response } from "express";
import { authenticateJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";

const router = Router();

/**
 * GET /info
 * Endpoint protégé - Retourne les informations de base de la Réserve
 * Authentification requise + Rôle 'sujet' requis (RBAC)
 */
router.get("/info", authenticateJWT, requireRole("sujet"), (req: Request, res: Response) => {
  res.json({
    nom: "Réserve de Valdoria",
    id: "reserve-valdoria",
    description: "API protégée par Keycloak pour la formation",
  });
});

export default router;
