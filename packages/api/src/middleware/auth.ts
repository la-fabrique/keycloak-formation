import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { getJwksUri, getIssuer, config } from "../config.js";

// [FORMATION KEYCLOAK] Keycloak signe les tokens JWT avec une clé privée RSA.
// Pour vérifier un token, l'API doit récupérer la clé publique correspondante
// depuis l'endpoint JWKS de Keycloak (/.well-known/openid-configuration → jwks_uri).
// jwks-rsa gère ce téléchargement automatiquement et met la clé en cache 10 minutes.
const client = jwksClient({
  jwksUri: getJwksUri(),
  cache: true,
  cacheMaxAge: 600000, // 10 minutes
});

// [FORMATION KEYCLOAK] Chaque token JWT contient un "kid" (Key ID) dans son header.
// Cette fonction demande à Keycloak la clé publique correspondant à ce kid,
// ce qui permet à l'API de vérifier la signature sans appeler Keycloak à chaque requête.
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

// [FORMATION KEYCLOAK] Structure du payload de l'access token émis par Keycloak.
// Ces champs correspondent exactement à ce qu'on voit dans la page Debug de l'app :
// - sub : identifiant unique de l'utilisateur dans Keycloak
// - preferred_username : le nom d'utilisateur (ex : "alaric")
// - realm_access.roles : les rôles de royaume (configurés dans l'exercice 2)
// - villeOrigine : l'attribut personnalisé injecté via le scope "attributs-valdorien" (exercice 4)
// - aud : l'audience — indique pour quelle API ce token est destiné
// - iss : l'issuer — l'URL du realm Keycloak qui a émis le token
// - exp : timestamp d'expiration du token
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

// Permet d'accéder à req.user dans toutes les routes Express après authentification.
declare global {
  namespace Express {
    interface Request {
      user?: KeycloakToken;
    }
  }
}

// [FORMATION KEYCLOAK] Ce middleware est le gardien de l'API.
// Il est appelé avant chaque route protégée et effectue 4 vérifications :
// 1. Présence du token dans le header Authorization: Bearer <token>
// 2. Signature valide (le token a bien été émis par Keycloak, pas falsifié)
// 3. Audience correcte : le token est bien destiné à "reserve-valdoria" (claim "aud")
// 4. Issuer correct : le token vient bien du realm "valdoria" (claim "iss")
// Si tout est valide, le payload décodé est mis dans req.user pour les middlewares suivants.
export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  // [FORMATION KEYCLOAK] L'access token est transmis dans le header HTTP "Authorization"
  // avec le préfixe "Bearer ". C'est la convention standard OAuth 2.0.
  // Sans token = 401 Unauthorized (non authentifié).
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Token d'authentification manquant",
    });
    return;
  }

  // On retire le préfixe "Bearer " pour obtenir le token brut (les 7 premiers caractères).
  const token = authHeader.substring(7);

  jwt.verify(
    token,
    getKey,
    {
      // [FORMATION KEYCLOAK] L'audience doit correspondre au client ID de l'API ("reserve-valdoria").
      // Si ce claim est absent ou différent, jwt.verify renvoie une erreur.
      // C'est ce qu'on configure dans l'exercice 4 avec le mapper "audience resolve".
      audience: config.keycloak.clientId,
      // [FORMATION KEYCLOAK] L'issuer doit correspondre à l'URL du realm Keycloak.
      // Format : http://localhost:8080/realms/valdoria
      // Cela garantit que le token vient bien de notre Keycloak, pas d'un autre serveur.
      issuer: getIssuer(),
      // [FORMATION KEYCLOAK] RS256 = signature asymétrique RSA. Keycloak signe avec sa clé privée,
      // l'API vérifie avec la clé publique récupérée via JWKS.
      algorithms: ["RS256"],
    },
    (err, decoded) => {
      if (err) {
        console.error("Erreur de validation JWT:", err.message);
        // 401 = token absent, invalide ou expiré (problème d'authentification).
        res.status(401).json({
          error: "Unauthorized",
          message: "Token invalide ou expiré",
        });
        return;
      }

      // Le token est valide : on stocke le payload décodé dans req.user.
      // Les middlewares RBAC et ABAC liront ensuite req.user pour vérifier les droits.
      req.user = decoded as KeycloakToken;
      next();
    }
  );
};
