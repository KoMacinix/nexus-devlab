import { useState } from "react";
import { auth } from "../../services/auth";

/**
 * Écran de connexion — Floranet Dashboard.
 *
 * Affiché par <App/> tant que `auth.isAuthenticated()` est faux.
 * Sur succès, appelle `onLoginSuccess()` qui fait basculer App vers
 * le dashboard normal.
 *
 * Note : le logo SVG est servi depuis /public/floranet-logo.svg (Nexus)
 * plutôt qu'importé en tant que module — c'est plus simple côté Vite et
 * ça évite de dupliquer le fichier.
 */
export function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Identifiants requis");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await auth.login(username, password);
      onLoginSuccess();
    } catch (err) {
      setError(err.message || "Connexion échouée");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <img src="/floranet-logo.svg" alt="Floranet" className="login-logo" />
          <h1>Floranet</h1>
          <p className="login-subtitle">Surveillance Incendies</p>
        </div>

        <label className="login-field">
          <span>Nom d'utilisateur</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            disabled={loading}
            required
          />
        </label>

        <label className="login-field">
          <span>Mot de passe</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={loading}
            required
          />
        </label>

        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        <button type="submit" className="login-submit" disabled={loading}>
          {loading ? "Connexion…" : "Se connecter"}
        </button>

        <p className="login-hint">
          Identifiants définis dans <code>backend/.env</code>&nbsp;
          (<code>FLORANET_ADMIN_USERNAME</code> / <code>FLORANET_ADMIN_PASSWORD</code>)
        </p>
      </form>
    </div>
  );
}
