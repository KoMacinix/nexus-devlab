/**
 * Service API — Communication avec le backend Nexus.
 *
 * Différences avec le Floranet original (Floranet_v4) :
 *   - Préfixe des routes : /api/* → /api/floranet/* (le backend Nexus
 *     regroupe plusieurs projets, chaque projet a son namespace).
 *   - Base URL : utilise VITE_BACKEND_URL (cohérent avec ../api.js de
 *     Nexus). En dev, le proxy Vite redirige /api → :4000 si la variable
 *     n'est pas définie. En prod, on pointe explicitement sur Render.
 *
 * Authentification : JWT Bearer attaché automatiquement à chaque requête
 * via `auth.getToken()`. Une réponse 401 déclenche
 * `auth.handleUnauthenticated()`, qui efface le token et fait basculer
 * l'application Floranet vers <Login/>.
 */

import { auth } from "./auth";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
const API_PREFIX = `${BACKEND_URL}/api/floranet`;

async function request(path, { signal } = {}) {
  const headers = {};
  const token = auth.getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_PREFIX}${path}`, { signal, headers });

  if (res.status === 401) {
    auth.handleUnauthenticated();
    throw new Error("Session expirée — reconnexion requise");
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} on ${path}`);
  }

  return res.json();
}

export const api = {
  /** Données complètes de tous les capteurs (incluant status et risk). */
  getAllSensors: (opts) => request("/sensors", opts),

  /** Données d'un capteur précis. */
  getSensor: (sensorId, opts) => request(`/sensors/${sensorId}`, opts),

  /** Historique récent (limit derniers points). */
  getHistory: (sensorId, limit = 100, opts) =>
    request(`/history/${sensorId}?limit=${limit}`, opts),

  /** Statut global (passerelle, watchdog…). */
  getStatus: (opts) => request("/status", opts),

  /** Moyennes réseau (température, humidité, fumée max). */
  getAverages: (opts) => request("/averages", opts),

  /** Identité courante (sanity check du JWT après reload). */
  getMe: (opts) => request("/auth/me", opts),
};
