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
    const ville = req.params.ville as string;

    // Résolution insensible à la casse (cohérent avec l'ABAC)
    const villeKey = villes.find((v) => v.toLowerCase() === ville.toLowerCase());

    if (!villeKey) {
      res.status(404).json({
        error: "Not Found",
        message: `La ville '${ville}' n'existe pas`,
        villes_disponibles: villes,
      });
      return;
    }

    const artefactsVille = artefacts[villeKey] || [];

    res.json({
      ville: villeKey,
      artefacts: artefactsVille,
      total: artefactsVille.length,
    });
  }
);

export default router;
