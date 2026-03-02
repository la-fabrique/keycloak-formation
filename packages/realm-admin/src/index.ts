import "dotenv/config";

const KEYCLOAK_URL = process.env.KEYCLOAK_URL ?? "http://localhost:8080";
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM ?? "valdoria";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "roderick";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const RESERVE_CLIENT_ID = process.env.RESERVE_CLIENT_ID ?? "";
const COMPTOIR_CLIENT_ID = process.env.COMPTOIR_CLIENT_ID ?? "";

const TOKEN_ENDPOINT = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
const ADMIN_API = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}`;

// --- Helpers ---

function ok(label: string) {
  console.log(`  ✅ ${label}`);
}

function fail(label: string, status: number, body: string) {
  console.log(`  ❌ ${label} → HTTP ${status}`);
  console.log(`     ${body}`);
}

async function adminFetch(
  token: string,
  path: string,
  options: RequestInit = {}
): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${ADMIN_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const text = await res.text();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body };
}

// --- Étape 1 : obtenir un token pour Roderick (ROPC) ---

console.log(`\n[1] Authentification de "${ADMIN_USERNAME}" via l'API Keycloak...`);
console.log(`    (flux Resource Owner Password Credentials — usage formation uniquement)`);

const tokenRes = await fetch(TOKEN_ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "password",
    client_id: "admin-cli",
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
  }),
});

if (!tokenRes.ok) {
  const error = await tokenRes.text();
  console.error(`  Échec de l'authentification : ${tokenRes.status}`);
  console.error(`  ${error}`);
  process.exit(1);
}

const { access_token } = (await tokenRes.json()) as { access_token: string };
ok(`Token obtenu pour "${ADMIN_USERNAME}"`);

// Décoder le token pour observer les rôles octroyés
const payload = JSON.parse(
  Buffer.from(access_token.split(".")[1], "base64url").toString()
) as {
  preferred_username: string;
  resource_access?: Record<string, { roles: string[] }>;
};

const realmMgmtRoles = payload.resource_access?.["realm-management"]?.roles ?? [];
console.log(`\n    Rôles realm-management dans le token :`);
if (realmMgmtRoles.length === 0) {
  console.log(`    (aucun rôle global — accès délégué via fine-grained permissions)`);
} else {
  realmMgmtRoles.forEach((r) => console.log(`    - ${r}`));
}

// --- Étape 2 : lister les rôles de reserve-valdoria ---

console.log(`\n[2] Lister les rôles du client "reserve-valdoria"...`);

let reserveClient: { id: string; clientId: string };
let comptoirClient: { id: string; clientId: string };

if (RESERVE_CLIENT_ID && COMPTOIR_CLIENT_ID) {
  // Roderick n'a pas la permission de lister les clients (fine-grained) — utiliser les IDs fournis
  reserveClient = { id: RESERVE_CLIENT_ID, clientId: "reserve-valdoria" };
  comptoirClient = { id: COMPTOIR_CLIENT_ID, clientId: "comptoir-des-voyageurs" };
} else {
  const clientsRes = await adminFetch(access_token, `/clients?clientId=reserve-valdoria`);

  if (clientsRes.status !== 200) {
    if (clientsRes.status === 403) {
      console.error(
        "  Roderick n'a pas la permission de lister les clients (fine-grained).",
        "Ajoutez RESERVE_CLIENT_ID et COMPTOIR_CLIENT_ID dans .env (voir README exercice 4.1)."
      );
    } else {
      fail("Impossible de lister les clients", clientsRes.status, JSON.stringify(clientsRes.body));
    }
    process.exit(1);
  }

  const clients = clientsRes.body as Array<{ id: string; clientId: string }>;
  const foundReserve = clients.find((c) => c.clientId === "reserve-valdoria");
  const foundComptoir = clients.find((c) => c.clientId === "comptoir-des-voyageurs");

  if (!foundReserve || !foundComptoir) {
    console.error("  Clients introuvables. Vérifiez que l'exercice 4 est complété.");
    process.exit(1);
  }
  reserveClient = foundReserve;
  comptoirClient = foundComptoir;
}

const rolesRes = await adminFetch(access_token, `/clients/${reserveClient.id}/roles`);

if (rolesRes.status === 200) {
  const roles = rolesRes.body as Array<{ name: string }>;
  ok(`Rôles de "reserve-valdoria" : ${roles.map((r) => r.name).join(", ") || "(aucun)"}`);
} else {
  fail("Lecture des rôles de reserve-valdoria refusée", rolesRes.status, JSON.stringify(rolesRes.body));
}

// --- Étape 3 : créer un rôle client sur reserve-valdoria ---

console.log(`\n[3] Créer le rôle client "gardien" sur "reserve-valdoria"...`);

const createRoleRes = await adminFetch(access_token, `/clients/${reserveClient.id}/roles`, {
  method: "POST",
  body: JSON.stringify({
    name: "gardien",
    description: "Gardien de la Réserve — rôle créé par Roderick le Régisseur",
  }),
});

if (createRoleRes.status === 201) {
  ok(`Rôle "gardien" créé sur "reserve-valdoria"`);
} else if (createRoleRes.status === 409) {
  ok(`Rôle "gardien" déjà existant (idempotent)`);
} else {
  fail("Création du rôle refusée", createRoleRes.status, JSON.stringify(createRoleRes.body));
}

// --- Étape 4 : lister les rôles de comptoir-des-voyageurs ---

console.log(`\n[4] Lister les rôles du client "comptoir-des-voyageurs"...`);

const comptoirRolesRes = await adminFetch(access_token, `/clients/${comptoirClient.id}/roles`);

if (comptoirRolesRes.status === 200) {
  const roles = comptoirRolesRes.body as Array<{ name: string }>;
  ok(`Rôles de "comptoir-des-voyageurs" : ${roles.map((r) => r.name).join(", ") || "(aucun)"}`);
} else {
  fail("Lecture des rôles de comptoir-des-voyageurs refusée", comptoirRolesRes.status, JSON.stringify(comptoirRolesRes.body));
}

// --- Étape 5 : tenter de lister les utilisateurs du realm (doit échouer) ---

console.log(`\n[5] Tenter de lister les utilisateurs du realm (doit être refusé)...`);

const usersRes = await adminFetch(access_token, `/users`);

if (usersRes.status === 403) {
  ok(`Accès aux utilisateurs refusé (403 Forbidden) — la délégation est correctement scopée`);
} else if (usersRes.status === 200) {
  console.log(`  ⚠️  Accès aux utilisateurs autorisé — vérifiez les permissions accordées à roderick`);
  console.log(`     Roderick ne devrait PAS avoir accès aux utilisateurs du realm.`);
} else {
  console.log(`  ℹ️  Statut inattendu : ${usersRes.status}`);
}

console.log(`\n✅ Vérification terminée.\n`);
