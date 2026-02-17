import { Request, Response, NextFunction } from "express";

/**
 * Middleware RBAC (Role-Based Access Control)
 * Vérifie que l'utilisateur possède au moins un des rôles requis
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentification requise",
      });
      return;
    }

    const userRoles = req.user.realm_access?.roles || [];
    const hasRole = roles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      res.status(403).json({
        error: "Forbidden",
        message: `Rôle requis: ${roles.join(" ou ")}`,
      });
      return;
    }

    next();
  };
};
