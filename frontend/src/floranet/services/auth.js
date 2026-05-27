/**
 * Service d'authentification — Floranet dans Nexus.
 *
 * Diffère légèrement du Floranet original :
 *   - L'endpoint de login est /api/floranet/auth/login (préfixé par le
 *     namespace du module dans le backend Nexus).
 *   - On utilise VITE_BACKEND_URL (cohérent avec services/api.js).
 *
 * Le JWT est stocké dans localStorage sous une clé propre à Floranet
 * (`floranet_token`) pour ne pas se mélanger avec le token Nexus
 * (`nexus_token`, utilisé par les autres modules).
 *
 * Émet un événement custom `floranet:unauthenticated` quand le token
 * devient invalide (401 sur n'importe quelle requête), pour permettre à
 * <App/> de basculer vers <Login/> sans coupler le service à React.
 */

const TOKEN_KEY = "floranet_token";
const USER_KEY = "floranet_user";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
const AUTH_PREFIX = `${BACKEND_URL}/api/floranet/auth`;

/** Événement déclenché lorsqu'une requête authentifiée est refusée (401). */
export const UNAUTH_EVENT = "floranet:unauthenticated";

function dispatchUnauth() {
  window.dispatchEvent(new CustomEvent(UNAUTH_EVENT));
}

export const auth = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUsername() {
    return localStorage.getItem(USER_KEY);
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  async login(username, password) {
    const res = await fetch(`${AUTH_PREFIX}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        if (body.detail) detail = body.detail;
      } catch {
        /* corps non JSON, on garde le code HTTP */
      }
      throw new Error(detail);
    }

    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USER_KEY, username);
    return data;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  handleUnauthenticated() {
    this.logout();
    dispatchUnauth();
  },
};
