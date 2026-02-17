import { Router, Request, Response } from "express";

const router = Router();

/**
 * GET /info
 * Endpoint public - Retourne les informations de base de la Réserve
 * Aucune authentification requise
 */
router.get("/info", (req: Request, res: Response) => {
  res.json({
    nom: "Réserve de Valdoria",
    id: "reserve-valdoria",
    description: "API protégée par Keycloak pour la formation",
  });
});

export default router;
