import { Request, Response, NextFunction } from "express";

// [KEYCLOAK] RBAC = Role-Based Access Control (contrôle d'accès basé sur les rôles).
// Ce middleware vérifie que l'utilisateur possède le rôle requis pour accéder à une route.
// Les rôles sont lus depuis le claim "realm_access.roles" de l'access token —
// exactement la section qu'on voit dans la page Debug : realm_access > roles.
// Ces rôles sont configurés dans Keycloak (exercice 2) et injectés dans le token
// via le mapper "realm roles" du scope "roles" (exercice 4).
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      // Normalement ce cas ne se produit pas si authenticateJWT est appelé avant.
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentification requise",
      });
      return;
    }

    // On lit les rôles depuis le payload du token, déjà décodé par authenticateJWT.
    const userRoles = req.user.realm_access?.roles || [];

    // [KEYCLOAK] On cherche si l'utilisateur possède AU MOINS UN des rôles requis.
    // Exemple : requireRole("marchand") → l'utilisateur doit avoir le rôle "marchand".
    // Grâce aux rôles composites (exercice 2), un "gouverneur" hérite de "marchand",
    // donc il passera aussi ce contrôle même si on ne vérifie que "marchand".
    const hasRole = roles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      // 403 = token valide mais droits insuffisants (authentifié mais pas autorisé).
      // Différence importante avec 401 : ici l'identité est connue, c'est le rôle qui manque.
      res.status(403).json({
        error: "Forbidden",
        message: `Rôle requis: ${roles.join(" ou ")}`,
      });
      return;
    }

    next();
  };
};
