import { useState, useEffect, useMemo, useCallback } from "react";
import CryptoJS from "crypto-js";
import api from "../api";

/**
 * Tutti Frutti — page Forge.
 *
 * Reproduit fidèlement l'UI/UX du projet PHP/Laravel d'origine :
 *
 *   - Layout Bootstrap : navbar transparente noire avec backdrop blur,
 *     container max-width 800px, cartes blanches arrondies.
 *   - Background : image fixed cover + fruits PNG animés flottants (floatUp).
 *   - Pages : accueil (titre gradient + CTA), catalogue PUBLIC, create/edit
 *     protégés, login dédié (gradient bleu pâle), register dédié avec
 *     validation password identique à AuthController.php.
 *   - Icônes : Font Awesome 6.4.0 (chargé via @import en tête de TF_CSS),
 *     exactement les mêmes que dans les vues Blade originales.
 *
 * Adaptations pour le contexte hébergé (Render / OVH) :
 *   - L'auth AES tape sur /api/store/login-encrypted (clé "CeciEstUneCleSecrete"
 *     — la même que l'original ; surchargeable côté backend via AES_SECRET_KEY).
 *   - Le token JWT est persisté dans localStorage (clé "nexus_token",
 *     partagée avec les autres modules type GeoIntel) pour survivre aux
 *     navigations entre pages internes — l'intercepteur de ../api.js
 *     l'injecte automatiquement en header Authorization.
 *   - Les images flottantes viennent de /fruits/*.png et le background de
 *     /tutti-frutti/background.jpg dans frontend/public.
 *
 * Le CSS est scopé sous `.tf-scope` pour ne pas polluer le reste du site.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_PRODUCT = { id: null, name: "", description: "", price: "" };
const FRUIT_IMAGES = [
  "/fruits/pomme.png",
  "/fruits/banane.png",
  "/fruits/cerise.png",
  "/fruits/ananas.png",
  "/fruits/fraise.png",
];
// On utilise les mêmes clés localStorage que les autres modules (GeoIntel etc.)
// → l'intercepteur de api.js se charge tout seul d'ajouter le Bearer token.
const TOKEN_KEY = "nexus_token";
const USER_KEY = "nexus_user";

// Doit matcher AES_SECRET_KEY côté backend (par défaut "CeciEstUneCleSecrete").
const AES_KEY = "CeciEstUneCleSecrete";

// ─────────────────────────────────────────────────────────────────────────────
// Fruits flottants — équivalent du @for de product/index.blade.php
// ─────────────────────────────────────────────────────────────────────────────
function FruitBackground() {
  // Mémorisé : on évite de regénérer les positions à chaque render.
  const items = useMemo(
    () =>
      Array.from({ length: 15 }, () => ({
        img: FRUIT_IMAGES[Math.floor(Math.random() * FRUIT_IMAGES.length)],
        left: Math.random() * 95, // pourcentage
        duration: 8 + Math.random() * 12, // 8 - 20s
        size: 30 + Math.random() * 30, // 30 - 60px
        delay: Math.random() * 10, // 0 - 10s
      })),
    []
  );

  return (
    <div className="fruit-background" aria-hidden="true">
      {items.map((f, i) => (
        <img
          key={i}
          src={f.img}
          alt=""
          className="fruit"
          style={{
            left: `${f.left}%`,
            width: `${f.size}px`,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS scopé — reproduction du public/css/app.css + bootstrap + auth gradient.
//
// /!\ Le @import Font Awesome DOIT être la toute première règle CSS du bloc,
//      sinon le navigateur l'ignore.
// ─────────────────────────────────────────────────────────────────────────────
const TF_CSS = `
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css");

/* Wrapper plein écran SOUS la navbar nexus (sticky h-14 = 56px) */
.tf-page-host {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
  overflow-y: auto;
  overflow-x: hidden;
  /* Background image — équivalent du body { background: url(...) } original */
  background: url("/tutti-frutti/background.jpg") no-repeat center center fixed;
  background-size: cover;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.tf-scope {
  min-height: 100%;
  position: relative;
}

/* ── Fond fruits animés — équivalent .fruit-background du CSS original ── */
.tf-scope .fruit-background {
  position: fixed;
  top: 56px; /* sous la navbar nexus */
  left: 0;
  width: 100%;
  height: calc(100% - 56px);
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}
.tf-scope .fruit {
  position: absolute;
  bottom: -100px;
  height: auto;
  opacity: 0.6;
  animation-name: tfFloatUp;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
@keyframes tfFloatUp {
  0%   { transform: translateY(0) rotate(0deg);      opacity: 0.7; }
  50%  { transform: translateY(-50vh) rotate(180deg); opacity: 1; }
  100% { transform: translateY(-120vh) rotate(360deg); opacity: 0; }
}

/* ── Navbar Tutti Frutti — transparente noire + blur (original) ── */
.tf-scope .tf-navbar {
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
  z-index: 10;
}
.tf-scope .tf-navbar-inner {
  max-width: 1140px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px;
}
.tf-scope .tf-brand {
  font-weight: 700;
  font-size: 18px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  cursor: pointer;
}
.tf-scope .tf-nav-links {
  display: flex;
  gap: 20px;
  align-items: center;
  font-size: 14px;
}
.tf-scope .tf-nav-link {
  color: #fff;
  cursor: pointer;
  font-weight: bold;
  text-decoration: none;
  padding: 4px 8px;
}
.tf-scope .tf-nav-link:hover { color: rgba(255,255,255,0.85); }
.tf-scope .tf-nav-badge {
  color: #ffc107; /* text-warning */
  font-weight: bold;
}

/* ── Container principal — equivalent .container du CSS original ── */
.tf-scope .tf-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px 40px;
  position: relative;
  z-index: 1;
}

/* ── Cards Bootstrap — original : border-radius 15px, marges, ombre ── */
.tf-scope .card {
  margin-top: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  background: #fff;
  color: #212529;
  padding: 1.5rem;
  border: 1px solid rgba(0,0,0,0.05);
}

/* ── Titre gradient page d'accueil — exact original ── */
.tf-scope .gradient-static {
  background: linear-gradient(90deg, #b1dee3, #534290, #727600, #006132, #2c0000, #001a0b, #2d002cc3);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  font-weight: 700;
  text-align: center;
  margin: 32px 0 16px;
  font-size: 32px;
}

.tf-scope .tf-home-link {
  color: #fff;
  font-weight: bold;
  font-size: 1.25rem;
  text-decoration: none;
  cursor: pointer;
}
.tf-scope .tf-home-link:hover { text-decoration: underline; }

/* ── Boutons Bootstrap-like ── */
.tf-scope .btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid transparent;
  font-size: 1rem;
  font-weight: 400;
  text-align: center;
  cursor: pointer;
  text-decoration: none;
  font-family: inherit;
  line-height: 1.5;
  transition: background-color 0.15s ease;
}
.tf-scope .btn:disabled { opacity: 0.65; cursor: not-allowed; }
.tf-scope .btn-primary  { background: #0d6efd; color: #fff; border-color: #0d6efd; }
.tf-scope .btn-primary:hover:not(:disabled)  { background: #0b5ed7; border-color: #0a58ca; }
.tf-scope .btn-success  { background: #198754; color: #fff; border-color: #198754; }
.tf-scope .btn-success:hover:not(:disabled)  { background: #157347; border-color: #146c43; }
.tf-scope .btn-warning  { background: #ffc107; color: #000; border-color: #ffc107; }
.tf-scope .btn-warning:hover:not(:disabled)  { background: #ffca2c; border-color: #ffc720; }
.tf-scope .btn-danger   { background: #dc3545; color: #fff; border-color: #dc3545; }
.tf-scope .btn-danger:hover:not(:disabled)   { background: #bb2d3b; border-color: #b02a37; }
.tf-scope .btn-secondary{ background: #6c757d; color: #fff; border-color: #6c757d; }
.tf-scope .btn-secondary:hover:not(:disabled){ background: #5c636a; border-color: #565e64; }
.tf-scope .btn-sm { padding: 0.25rem 0.5rem; font-size: 0.875rem; border-radius: 4px; }
.tf-scope .w-100 { width: 100%; }
.tf-scope .d-grid { display: grid; }
.tf-scope .d-inline-block { display: inline-block; }

/* ── Alerts Bootstrap ── */
.tf-scope .alert {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  font-size: 0.95rem;
}
.tf-scope .alert ul { margin: 0; padding-left: 1.25rem; }
.tf-scope .alert-success { background: #d1e7dd; border-color: #badbcc; color: #0f5132; }
.tf-scope .alert-danger  { background: #f8d7da; border-color: #f5c2c7; color: #842029; }
.tf-scope .alert-info    { background: #cff4fc; border-color: #b6effb; color: #055160; }

/* ── Forms Bootstrap ── */
.tf-scope .form-label { display: block; margin-bottom: 0.4rem; font-size: 0.95rem; color: #212529; }
.tf-scope .form-control {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
  background: #fff;
  color: #212529;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
}
.tf-scope .form-control:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13,110,253,0.25);
}
.tf-scope textarea.form-control { min-height: 80px; resize: vertical; }
.tf-scope .mb-3 { margin-bottom: 1rem; }
.tf-scope .mt-4 { margin-top: 1.5rem; }
.tf-scope .text-center { text-align: center; }
.tf-scope .text-danger { color: #dc3545; }

/* Petit espacement entre une icône FA et le texte qui suit dans un bouton/label */
.tf-scope .fas + * { margin-left: 0.35em; }

/* ── Table Bootstrap (table-striped table-hover, thead-dark) ── */
.tf-scope .tf-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  background: transparent;
}
.tf-scope .tf-table thead th {
  background: #212529;
  color: #fff;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #32383e;
}
.tf-scope .tf-table tbody td {
  padding: 0.75rem;
  border-top: 1px solid #dee2e6;
  vertical-align: middle;
}
.tf-scope .tf-table tbody tr:nth-of-type(odd)  { background: rgba(0,0,0,0.025); }
.tf-scope .tf-table tbody tr:hover             { background: rgba(0,0,0,0.06); }

/* ── Page LOGIN dédiée : gradient bleu pâle (original
       TestAutenAuto/authentification.php) ── */
.tf-scope .tf-login-bg {
  background: linear-gradient(135deg, #dfefff, #f6f9fc);
  min-height: calc(100vh - 56px - 56px); /* navbar nexus + tf-navbar */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  position: relative;
  z-index: 1;
}
.tf-scope .tf-login-card {
  max-width: 400px;
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  background: #fff;
  padding: 24px;
  color: #212529;
}
.tf-scope .tf-login-card h4 { text-align: center; margin: 0 0 16px; font-size: 1.25rem; }
.tf-scope .tf-switch-link { text-align: center; margin-top: 14px; font-size: 0.875rem; color: #6c757d; }
.tf-scope .tf-switch-link a { color: #0d6efd; cursor: pointer; text-decoration: underline; }

/* ── Helpers d'inline ── */
.tf-scope .tf-actions { display: flex; gap: 4px; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers AES — équivalent du soumettre() de authentification.php
// ─────────────────────────────────────────────────────────────────────────────
function encryptPassword(plain) {
  const enc = CryptoJS.AES.encrypt(JSON.stringify(plain), AES_KEY);
  return JSON.stringify({
    ct: enc.ciphertext.toString(CryptoJS.enc.Base64),
    iv: enc.iv.toString(),
    s: enc.salt.toString(),
  });
}

// Validation register côté client (miroir du backend, pour feedback instantané)
function validateRegisterClient({ name, email, password, password_confirmation }) {
  const errors = {};
  if (!name || !name.trim()) errors.name = "Le nom est obligatoire.";
  else if (name.length > 255) errors.name = "Le nom est trop long (max 255 caractères).";
  if (!email || !email.trim()) errors.email = "L'adresse email est obligatoire.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "L'adresse e-mail n'est pas valide. Elle doit être au format suivant : exemple@exemple.com";
  if (!password) errors.password = "Le mot de passe est requis.";
  else if (password.length < 8) errors.password = "Le mot de passe doit contenir au moins 8 caractères.";
  else if (!/[a-z]/.test(password) || !/[A-Z]/.test(password))
    errors.password = "Le mot de passe doit contenir au moins une lettre majuscule et une minuscule.";
  else if (!/[0-9]/.test(password)) errors.password = "Le mot de passe doit contenir au moins un chiffre.";
  else if (!/[^a-zA-Z0-9]/.test(password)) errors.password = "Le mot de passe doit contenir au moins un symbole.";
  if (password && password_confirmation !== password)
    errors.password_confirmation = "La confirmation du mot de passe ne correspond pas.";
  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page principale
// ─────────────────────────────────────────────────────────────────────────────
export default function Forge() {
  // Auth (persistée dans localStorage pour survivre aux changements de "page")
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; } catch { return null; }
  });

  // Routing interne (équivalent des routes Laravel /, /product, /product/create, /register, ...)
  const [page, setPage] = useState("home"); // home | products | create | edit | login | register
  const [pendingRedirect, setPendingRedirect] = useState(null); // page à atteindre après login
  const [flashSuccess, setFlashSuccess] = useState("");

  // Catalogue
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Formulaire create / edit
  const [form, setForm] = useState({ ...EMPTY_PRODUCT });
  const [productErrors, setProductErrors] = useState({}); // {champ: msg}
  const [productError, setProductError] = useState("");

  // Login state
  const [loginEmail, setLoginEmail] = useState("demo@nexus.dev");
  const [loginPassword, setLoginPassword] = useState("123456");
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const [lockedUntil, setLockedUntil] = useState(null);

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regErrors, setRegErrors] = useState({});
  const [regLoading, setRegLoading] = useState(false);

  const isLogged = !!token;

  // ── Effets ──
  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  // Charge le catalogue dès qu'on entre sur products/home (lecture publique)
  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const { data } = await api.get("/store/products");
      setProducts(data);
    } catch {
      /* silent */
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (page === "home" || page === "products") loadProducts();
  }, [page, loadProducts]);

  // ── Navigation ──
  function go(p) {
    setFlashSuccess("");
    setPage(p);
  }

  // Tente d'aller sur une page protégée. Si pas loggé, redirige vers login et
  // mémorise la destination — équivalent du ExternalAuth middleware Laravel.
  function goProtected(p, ctx) {
    if (!isLogged) {
      setPendingRedirect({ page: p, ctx });
      go("login");
      return;
    }
    if (ctx) setForm(ctx);
    go(p);
  }

  // ── Login ──
  async function handleLogin(e) {
    e.preventDefault();
    setLoginErr(""); setAttemptsLeft(null); setLoginLoading(true);
    try {
      const encryptedPass = encryptPassword(loginPassword);
      const res = await api.post("/store/login-encrypted", {
        user: loginEmail,
        pass: encryptedPass,
      });
      setToken(res.data.token);
      setUser(res.data.user);
      setLoginPassword("");
      // redirection mémorisée ou retour à l'accueil
      if (pendingRedirect) {
        const { page: target, ctx } = pendingRedirect;
        if (ctx) setForm(ctx);
        setPendingRedirect(null);
        go(target);
      } else {
        go("home");
      }
    } catch (err) {
      const d = err.response?.data;
      setLoginErr(d?.error || "Erreur de connexion");
      if (d?.attemptsLeft != null) setAttemptsLeft(d.attemptsLeft);
      if (d?.locked) setLockedUntil(d.lockedUntil);
    } finally {
      setLoginLoading(false);
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
    setPendingRedirect(null);
    go("home");
  }

  // ── Register ──
  async function handleRegister(e) {
    e.preventDefault();
    setRegErrors({}); setRegLoading(true);

    // Validation client immédiate
    const clientErrors = validateRegisterClient({
      name: regName, email: regEmail,
      password: regPass, password_confirmation: regConfirm,
    });
    if (Object.keys(clientErrors).length > 0) {
      setRegErrors(clientErrors); setRegLoading(false); return;
    }

    try {
      await api.post("/store/register", {
        name: regName, email: regEmail,
        password: regPass, password_confirmation: regConfirm,
      });
      setRegName(""); setRegEmail(""); setRegPass(""); setRegConfirm("");
      setFlashSuccess("Compte créé avec succès.");
      go("home");
    } catch (err) {
      if (err.response?.status === 422) {
        setRegErrors(err.response.data.errors || {});
      } else {
        setRegErrors({ _global: err.response?.data?.error || "Erreur lors de la création du compte." });
      }
    } finally {
      setRegLoading(false);
    }
  }

  // ── CRUD produits ──
  async function saveProduct(e) {
    e.preventDefault();
    setProductErrors({}); setProductError("");
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: form.price === "" ? "" : Number(form.price),
      };
      if (form.id) {
        await api.put(`/store/products/${form.id}`, payload);
        setFlashSuccess("Produit mis à jour avec succès.");
      } else {
        await api.post("/store/products", payload);
        setFlashSuccess("Produit créé avec succès.");
      }
      setForm({ ...EMPTY_PRODUCT });
      await loadProducts();
      go("home");
    } catch (err) {
      if (err.response?.status === 422) {
        setProductErrors(err.response.data.errors || {});
      } else if (err.response?.status === 401) {
        // Token expiré / invalide → on déconnecte et on renvoie au login
        setToken(null); setUser(null);
        setPendingRedirect({ page: form.id ? "edit" : "create", ctx: form });
        go("login");
      } else {
        setProductError("Erreur de sauvegarde");
      }
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm("Supprimer ce produit ?")) return;
    try {
      await api.delete(`/store/products/${id}`);
      setFlashSuccess("Produit supprimé avec succès.");
      await loadProducts();
    } catch (err) {
      if (err.response?.status === 401) {
        setToken(null); setUser(null); go("login");
      }
    }
  }

  // ── Token JWT pour les requêtes protégées ──
  // L'intercepteur de ../api.js lit déjà localStorage["nexus_token"] et
  // l'ajoute en header Authorization. Rien à faire ici — on partage simplement
  // la même clé que les autres modules (GeoIntel, etc.).

  // ─────────────────────────────────────────────────────────────────────────
  // Rendu
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="tf-page-host">
      <style>{TF_CSS}</style>
      <div className="tf-scope">
        <FruitBackground />

        {/* ── Navbar ── */}
        <nav className="tf-navbar">
          <div className="tf-navbar-inner">
            <span className="tf-brand" onClick={() => go("home")}>
              <i className="fas fa-store"></i> Tutti Frutti
            </span>
            <div className="tf-nav-links">
              <a className="tf-nav-link" onClick={() => go("products")}>Produits</a>
              {!isLogged && (
                <a className="tf-nav-link" onClick={() => go("register")}>Créer un compte</a>
              )}
              {isLogged ? (
                <>
                  <span className="tf-nav-badge">Connecté{user?.name ? ` (${user.name})` : ""}</span>
                  <a className="tf-nav-link" onClick={logout}>
                    <i className="fas fa-sign-out-alt"></i> Se déconnecter
                  </a>
                </>
              ) : (
                <a className="tf-nav-link" onClick={() => go("login")}>Connexion</a>
              )}
            </div>
          </div>
        </nav>

        {/* ── Page LOGIN — fond gradient bleu pâle dédié ── */}
        {page === "login" && (
          <div className="tf-login-bg">
            <div className="tf-login-card">
              <h4><i className="fas fa-lock"></i> Connexion sécurisée</h4>
              {lockedUntil && new Date(lockedUntil) > new Date() && (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle"></i> Compte bloqué jusqu'à {new Date(lockedUntil).toLocaleTimeString("fr")}
                </div>
              )}
              {loginErr && (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle"></i> {loginErr} {attemptsLeft != null && `(${attemptsLeft} tentative(s) restante(s))`}
                </div>
              )}
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label">Email :</label>
                  <input
                    type="email" className="form-control"
                    value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Entrez votre email"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Mot de passe :</label>
                  <input
                    type="password" className="form-control"
                    value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Entrez votre mot de passe"
                  />
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary" disabled={loginLoading}>
                    {loginLoading
                      ? "Vérification…"
                      : <><i className="fas fa-sign-in-alt"></i> Se connecter</>}
                  </button>
                </div>
              </form>
              <div className="tf-switch-link">
                Pas de compte ? <a onClick={() => go("register")}>Créer un compte</a>
              </div>
              <p style={{ fontSize: 11, color: "#888", textAlign: "center", marginTop: 12 }}>
                Démo : demo@nexus.dev / 123456 · 3 échecs = verrouillage 1 min
              </p>
            </div>
          </div>
        )}

        {/* ── Pages catalogue / accueil / create / edit / register (tf-container) ── */}
        {page !== "login" && (
          <div className="tf-container">
            {flashSuccess && (
              <div className="alert alert-success mt-4">{flashSuccess}</div>
            )}

            {/* ── HOME — produit/index.blade.php (l'original utilise des EMOJIS ici) ── */}
            {page === "home" && (
              <>
                <h1 className="gradient-static">Bienvenue sur la page d'accueil</h1>
                <p style={{ textAlign: "center" }}>
                  <a className="tf-home-link" onClick={() => go("products")}>
                    Voir tous les produits
                  </a>
                </p>

                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <p>
                    <button
                      className="btn btn-success"
                      onClick={() => goProtected("create", { ...EMPTY_PRODUCT })}
                    >
                      ➕ Insérer un produit
                    </button>
                  </p>
                  <p>
                    <button
                      className="btn btn-warning"
                      onClick={() => isLogged ? go("products") : (setPendingRedirect({ page: "products" }), go("login"))}
                    >
                      ✏️ Mettre à jour un produit
                    </button>
                  </p>
                </div>
              </>
            )}

            {/* ── PRODUCTS — product/product.blade.php (catalogue public) ── */}
            {page === "products" && (
              <div className="card">
                <h3 style={{ margin: "0 0 16px" }}>Catalogue des Produits</h3>

                {isLogged ? (
                  <button
                    className="btn btn-success mb-3"
                    onClick={() => { setForm({ ...EMPTY_PRODUCT }); go("create"); }}
                  >
                    <i className="fas fa-plus-circle"></i> Ajouter un produit
                  </button>
                ) : (
                  <div className="alert alert-info">
                    <i className="fas fa-lock"></i> Vous devez vous connecter pour ajouter ou modifier des produits.
                  </div>
                )}

                <table className="tf-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Description</th>
                      <th>Prix</th>
                      {isLogged && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {productsLoading ? (
                      <tr>
                        <td colSpan={isLogged ? 4 : 3} className="text-center">
                          Chargement…
                        </td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan={isLogged ? 4 : 3} className="text-center">
                          Aucun produit disponible.
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => (
                        <tr key={p.id}>
                          <td>{p.name}</td>
                          <td>{p.description}</td>
                          <td>{Number(p.price).toFixed(2)} $/LB</td>
                          {isLogged && (
                            <td className="tf-actions">
                              <button
                                className="btn btn-sm btn-warning"
                                title="Éditer"
                                onClick={() => { setForm({ id: p.id, name: p.name, description: p.description, price: p.price }); go("edit"); }}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                title="Supprimer"
                                onClick={() => deleteProduct(p.id)}
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── CREATE — product/create.blade.php ── */}
            {page === "create" && (
              <div className="card mt-4">
                <h2 className="text-center" style={{ marginBottom: 24 }}>
                  <i className="fas fa-plus-circle"></i> Ajouter un Produit
                </h2>

                {(Object.keys(productErrors).length > 0 || productError) && (
                  <div className="alert alert-danger">
                    <ul>
                      {productError && <li><i className="fas fa-exclamation-circle"></i> {productError}</li>}
                      {Object.entries(productErrors).map(([k, v]) => (
                        <li key={k}><i className="fas fa-exclamation-circle"></i> {v}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <form onSubmit={saveProduct}>
                  <div className="mb-3">
                    <label className="form-label">Nom du produit</label>
                    <input
                      type="text" className="form-control"
                      value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ex. : Chocolat Noir"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control" rows={3}
                      value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Décrivez le produit..."
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Prix ($)</label>
                    <input
                      type="number" step="0.01" className="form-control"
                      value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="Ex. : 1.99"
                    />
                  </div>
                  <div className="d-grid">
                    <button type="submit" className="btn btn-success">
                      <i className="fas fa-check-circle"></i> Enregistrer le produit
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── EDIT — product/edit.blade.php ── */}
            {page === "edit" && (
              <div className="card mt-4">
                <h2 className="text-center" style={{ marginBottom: 24 }}>
                  <i className="fas fa-edit"></i> Éditer le produit
                </h2>

                {(Object.keys(productErrors).length > 0 || productError) && (
                  <div className="alert alert-danger">
                    <ul>
                      {productError && <li><i className="fas fa-exclamation-circle"></i> {productError}</li>}
                      {Object.entries(productErrors).map(([k, v]) => (
                        <li key={k}><i className="fas fa-exclamation-circle"></i> {v}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <form onSubmit={saveProduct}>
                  <div className="mb-3">
                    <label className="form-label">Nom :</label>
                    <input
                      type="text" className="form-control"
                      value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description :</label>
                    <textarea
                      className="form-control"
                      value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Prix ($)</label>
                    <input
                      type="number" step="0.01" className="form-control"
                      value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />
                  </div>
                  <div className="d-grid">
                    <button type="submit" className="btn btn-warning">
                      <i className="fas fa-save"></i> Mettre à jour
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── REGISTER — auth/register.blade.php ── */}
            {page === "register" && (
              <div className="card">
                <h3 style={{ marginBottom: 16 }}>Créer un compte</h3>

                {Object.keys(regErrors).length > 0 && (
                  <div className="alert alert-danger">
                    <ul>
                      {Object.entries(regErrors).map(([k, v]) => (
                        <li key={k}><i className="fas fa-exclamation-circle"></i> {v}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <form onSubmit={handleRegister}>
                  <div className="mb-3">
                    <label className="form-label">Nom :</label>
                    <input
                      type="text" className="form-control"
                      value={regName} onChange={(e) => setRegName(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email :</label>
                    <input
                      type="text" className="form-control"
                      value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mot de passe :</label>
                    <input
                      type="password" className="form-control"
                      value={regPass} onChange={(e) => setRegPass(e.target.value)}
                    />
                    <small style={{ fontSize: 11, color: "#6c757d" }}>
                      8 caractères min., 1 majuscule, 1 minuscule, 1 chiffre, 1 symbole
                    </small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirmation :</label>
                    <input
                      type="password" className="form-control"
                      value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={regLoading}>
                    {regLoading
                      ? "Création…"
                      : <><i className="fas fa-user-plus"></i> Créer un compte</>}
                  </button>
                </form>
                <div className="tf-switch-link">
                  Déjà un compte ? <a onClick={() => go("login")}>Se connecter</a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
