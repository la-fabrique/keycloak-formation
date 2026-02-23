import { Router, Request, Response } from "express";
import { authenticateJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";

const router = Router();

// [FORMATION KEYCLOAK] GET /info — accessible à tous les sujets authentifiés.
// Les deux middlewares s'enchaînent dans l'ordre :
// 1. authenticateJWT : vérifie que le token est valide (signé par Keycloak, non expiré, bonne audience)
// 2. requireRole("sujet") : vérifie que l'utilisateur a le rôle "sujet" dans realm_access.roles
// Cedric, Brunhild et Alaric ont tous le rôle "sujet" → ils peuvent tous y accéder.
router.get("/info", authenticateJWT, requireRole("sujet"), (req: Request, res: Response) => {
  res.json({
    nom: "Réserve de Valdoria",
    id: "reserve-valdoria",
    description: "API protégée par Keycloak pour la formation",
  });
});

export default router;
