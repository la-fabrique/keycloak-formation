import "dotenv/config";

const KEYCLOAK_URL = process.env.KEYCLOAK_URL ?? "http://localhost:8080";
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM ?? "valdoria";
const CLIENT_ID = process.env.CLIENT_ID ?? "automate-imperial";
const CLIENT_SECRET = process.env.CLIENT_SECRET ?? "";
const API_URL = process.env.API_URL ?? "http://localhost:3001";

// --- Étape 1 : obtenir un token via Client Credentials ---

console.log(`\n[1] Demande de token pour le client "${CLIENT_ID}"...`);

const tokenEndpoint = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;

const tokenResponse = await fetch(tokenEndpoint, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  }),
});

if (!tokenResponse.ok) {
  const error = await tokenResponse.text();
  console.error(`Erreur lors de l'obtention du token : ${tokenResponse.status}`);
  console.error(error);
  process.exit(1);
}

const { access_token } = (await tokenResponse.json()) as { access_token: string };

// --- Étape 2 : décoder et afficher les rôles du token ---

const payload = JSON.parse(
  Buffer.from(access_token.split(".")[1], "base64url").toString()
) as {
  sub: string;
  azp: string;
  realm_access?: { roles: string[] };
  exp: number;
};

console.log(`\n[2] Token obtenu. Contenu :`);
console.log(`    sub  : ${payload.sub}`);
console.log(`    azp  : ${payload.azp}`);
console.log(`    rôles: ${payload.realm_access?.roles?.join(", ") ?? "(aucun)"}`);
console.log(`    exp  : ${new Date(payload.exp * 1000).toLocaleTimeString()}`);

// --- Étape 3 : appeler GET /inventaire ---

console.log(`\n[3] Appel de GET ${API_URL}/inventaire...`);

const inventaireResponse = await fetch(`${API_URL}/inventaire`, {
  headers: { Authorization: `Bearer ${access_token}` },
});

console.log(`    Statut : ${inventaireResponse.status}`);

if (inventaireResponse.ok) {
  const data = await inventaireResponse.json();
  console.log(`    Réponse :`);
  console.log(JSON.stringify(data, null, 4));
} else {
  const error = await inventaireResponse.text();
  console.error(`    Erreur : ${error}`);
}
