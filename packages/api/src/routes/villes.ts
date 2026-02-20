import { Router, Request, Response } from "express";
import { authenticateJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { requireVilleAccess } from "../middleware/abac.js";
import { artefacts, villes } from "../data/mock.js";

const router = Router();

// [KEYCLOAK] GET /villes/:ville/artefacts — RBAC + ABAC combinés.
// Trois middlewares s'enchaînent dans l'ordre :
// 1. authenticateJWT : token valide ?
// 2. requireRole("marchand") : a le rôle "marchand" ? (RBAC)
// 3. requireVilleAccess : villeOrigine du token correspond à la ville demandée ? (ABAC)
// Exemple : Brunhild (marchand, villeOrigine=Nordheim) peut accéder à /villes/nordheim/artefacts
// mais PAS à /villes/sudbourg/artefacts → 403.
// Alaric (gouverneur) passe l'ABAC directement grâce à l'exception gouverneur.
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
