import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { getJwksUri, getIssuer, config } from "../config.js";

/**
 * Client JWKS pour récupérer les clés publiques de Keycloak
 */
const client = jwksClient({
  jwksUri: getJwksUri(),
  cache: true,
  cacheMaxAge: 600000, // 10 minutes
});

/**
 * Récupère la clé de signature depuis Keycloak
 */
const getKey = (header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
};

/**
 * Interface pour le payload JWT décodé
 */
export interface KeycloakToken {
  sub: string;
  email?: string;
  preferred_username?: string;
  realm_access?: {
    roles: string[];
  };
  villeOrigine?: string;
  aud?: string | string[];
  iss?: string;
  exp?: number;
}

/**
 * Extension de l'interface Request d'Express pour inclure le token décodé
 */
declare global {
  namespace Express {
    interface Request {
      user?: KeycloakToken;
    }
  }
}

/**
 * Middleware d'authentification JWT
 * Vérifie la signature du token et l'injecte dans req.user
 */
export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Token d'authentification manquant",
    });
    return;
  }

  const token = authHeader.substring(7);

  jwt.verify(
    token,
    getKey,
    {
      audience: config.keycloak.clientId,
      issuer: getIssuer(),
      algorithms: ["RS256"],
    },
    (err, decoded) => {
      if (err) {
        console.error("Erreur de validation JWT:", err.message);
        res.status(401).json({
          error: "Unauthorized",
          message: "Token invalide ou expiré",
        });
        return;
      }

      req.user = decoded as KeycloakToken;
      next();
    }
  );
};
