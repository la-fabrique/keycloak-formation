import { Request, Response, NextFunction } from "express";

/**
 * Middleware ABAC (Attribute-Based Access Control)
 * Vérifie que l'attribut ville_origine de l'utilisateur correspond à la ville demandée
 * Exception: les gouverneurs ont accès à toutes les villes
 */
export const requireVilleAccess = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Authentification requise",
    });
    return;
  }

  const userRoles = req.user.realm_access?.roles || [];
  const isGouverneur = userRoles.includes("gouverneur");

  // Les gouverneurs ont accès à toutes les villes
  if (isGouverneur) {
    next();
    return;
  }

  // Pour les autres utilisateurs, vérifier la ville d'origine
  const villeOrigine = req.user.ville_origine;
  const villeRequested = req.params.ville;

  if (!villeOrigine) {
    res.status(403).json({
      error: "Forbidden",
      message: "Attribut 'ville_origine' manquant dans le token",
    });
    return;
  }

  if (villeOrigine !== villeRequested) {
    res.status(403).json({
      error: "Forbidden",
      message: `Accès refusé: vous ne pouvez consulter que les artefacts de ${villeOrigine}`,
    });
    return;
  }

  next();
};
