import { Request, Response, NextFunction } from "express";

// [KEYCLOAK] ABAC = Attribute-Based Access Control (contrôle d'accès basé sur les attributs).
// Là où le RBAC dit "tu peux accéder à cette ressource si tu as ce rôle",
// l'ABAC dit "tu peux accéder à cette ressource si tes attributs correspondent".
// Ici : un marchand ne peut voir que les artefacts de SA ville d'origine.
// L'attribut "villeOrigine" vient du token (configuré exercice 3 + mapper exercice 4).
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
  // [KEYCLOAK] Exception métier : le gouverneur supervise toute la province.
  // On vérifie son rôle (RBAC) pour lui accorder un accès élargi (toutes les villes).
  // C'est une combinaison RBAC + ABAC : le rôle détermine si la règle attribut s'applique.
  const isGouverneur = userRoles.includes("gouverneur");

  if (isGouverneur) {
    next();
    return;
  }

  // [KEYCLOAK] Pour les autres utilisateurs, on compare :
  // - "villeOrigine" : l'attribut dans le token (ex : "Nordheim"), injecté par le mapper
  // - req.params.ville : la ville demandée dans l'URL (ex : GET /villes/nordheim/artefacts)
  const villeOrigine = req.user.villeOrigine;
  const raw = req.params.ville;
  const villeRequested =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] ?? "" : "";

  if (!villeOrigine) {
    // Si le token ne contient pas "villeOrigine", le scope "attributs-valdorien"
    // n'est probablement pas assigné au client dans Keycloak (voir exercice 4).
    res.status(403).json({
      error: "Forbidden",
      message: "Attribut 'villeOrigine' manquant dans le token",
    });
    return;
  }

  // Comparaison insensible à la casse : "Nordheim" == "nordheim".
  if (String(villeOrigine).toLowerCase() !== villeRequested.toLowerCase()) {
    // 403 : l'utilisateur est authentifié et a le bon rôle, mais ses attributs
    // ne lui donnent pas accès à CETTE ressource spécifique.
    res.status(403).json({
      error: "Forbidden",
      message: `Accès refusé: vous ne pouvez consulter que les artefacts de ${villeOrigine}`,
    });
    return;
  }

  next();
};
