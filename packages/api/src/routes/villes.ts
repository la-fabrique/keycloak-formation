import { Router, Request, Response } from "express";
import { authenticateJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { requireVilleAccess } from "../middleware/abac.js";
import { artefacts, villes } from "../data/mock.js";

const router = Router();

/**
 * GET /villes/:ville/artefacts
 * Endpoint protégé - Retourne les artefacts d'une ville
 * Authentification requise + Rôle 'marchand' requis (RBAC)
 * + Accès limité à la ville d'origine sauf pour les gouverneurs (ABAC)
 */
router.get(
  "/villes/:ville/artefacts",
  authenticateJWT,
  requireRole("marchand"),
  requireVilleAccess,
  (req: Request, res: Response) => {
    const { ville } = req.params;

    // Vérifier que la ville existe
    if (!villes.includes(ville)) {
      res.status(404).json({
        error: "Not Found",
        message: `La ville '${ville}' n'existe pas`,
        villes_disponibles: villes,
      });
      return;
    }

    const artefactsVille = artefacts[ville] || [];

    res.json({
      ville,
      artefacts: artefactsVille,
      total: artefactsVille.length,
    });
  }
);

export default router;
