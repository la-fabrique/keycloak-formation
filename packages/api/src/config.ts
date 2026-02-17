import dotenv from "dotenv";

dotenv.config();

/**
 * Configuration de l'API et de Keycloak
 */
export const config = {
  port: process.env.PORT || 3001,
  keycloak: {
    url: process.env.KEYCLOAK_URL || "http://localhost:8080",
    realm: process.env.KEYCLOAK_REALM || "valdoria",
    clientId: process.env.KEYCLOAK_CLIENT_ID || "reserve-valdoria",
  },
};

/**
 * URL du endpoint JWKS pour récupérer les clés publiques de Keycloak
 */
export const getJwksUri = (): string => {
  return `${config.keycloak.url}/realms/${config.keycloak.realm}/protocol/openid-connect/certs`;
};

/**
 * Issuer attendu dans les tokens JWT
 */
export const getIssuer = (): string => {
  return `${config.keycloak.url}/realms/${config.keycloak.realm}`;
};
