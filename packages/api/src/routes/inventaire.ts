import { Router, Request, Response } from "express";
import { authenticateJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { inventaire } from "../data/mock.js";

const router = Router();

/**
 * GET /inventaire
 * Endpoint protégé - Retourne l'inventaire de la Réserve
 * Authentification requise + Rôle 'marchand' requis (RBAC)
 */
router.get(
  "/inventaire",
  authenticateJWT,
  requireRole("marchand"),
  (req: Request, res: Response) => {
    res.json({
      inventaire,
      total: inventaire.length,
    });
  }
);

export default router;
