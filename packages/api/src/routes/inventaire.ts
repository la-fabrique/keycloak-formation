import { Router, Request, Response } from "express";
import { authenticateJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { inventaire } from "../data/mock.js";

const router = Router();

// [KEYCLOAK] GET /inventaire — réservé aux marchands (RBAC).
// requireRole("marchand") lit le claim realm_access.roles dans le token.
// - Cedric (rôle "sujet" uniquement) → 403 Forbidden
// - Brunhild (rôle "marchand") → 200 OK
// - Alaric (rôle "gouverneur", composite incluant "marchand") → 200 OK
// Le rôle composite "gouverneur" hérite de "marchand" (configuré exercice 2) :
// Keycloak liste tous les rôles hérités dans realm_access.roles, donc "marchand" y figure.
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
