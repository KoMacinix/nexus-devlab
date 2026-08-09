import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "nexus-language";

const ENGLISH = {
  "Accueil": "Home",
  "Fermer le menu": "Close menu",
  "Ouvrir le menu": "Open menu",
  "Projet :": "Project:",
  "Projet : Pays · SOAP · Spring Boot": "Project: Countries · SOAP · Spring Boot",
  "Projet : Inventaire · Django REST Framework": "Project: Inventory · Django REST Framework",
  "Projet : Inventaire": "Project: Inventory",
  "Ouvrir le module →": "Open module →",

  "Connexion": "Sign in",
  "Connexion sécurisée": "Secure sign-in",
  "Connexion...": "Signing in...",
  "Connexion…": "Signing in…",
  "Se connecter": "Sign in",
  "Se déconnecter": "Sign out",
  "Mot de passe": "Password",
  "Mot de passe :": "Password:",
  "Nom d'utilisateur": "Username",
  "Identifiants requis": "Credentials required",
  "Connexion échouée": "Sign-in failed",
  "Vérification…": "Verifying…",
  "Entrez votre email": "Enter your email",
  "Entrez votre mot de passe": "Enter your password",
  "Pas de compte ?": "No account?",
  "Déjà un compte ?": "Already have an account?",
  "Créer un compte": "Create account",
  "Création…": "Creating…",
  "Confirmation :": "Confirmation:",
  "8 caractères min., 1 majuscule, 1 minuscule, 1 chiffre, 1 symbole": "8 characters min., 1 uppercase, 1 lowercase, 1 number, 1 symbol",
  "Compte bloqué jusqu'à": "Account locked until",
  "tentative(s) restante(s)": "attempt(s) remaining",
  "Démo : demo@nexus.dev / 123456 · 3 échecs = verrouillage 1 min": "Demo: demo@nexus.dev / 123456 · 3 failures = 1 min lockout",
  "Identifiants définis dans": "Credentials configured in",

  "Client SOAP — Authentification JWT — Parsing XML": "SOAP client — JWT authentication — XML parsing",
  "Utilise ton courriel de démo et le mot de passe indiqué pour accéder au formulaire.": "Use the demo email and the password shown to access the form.",
  "Recherche d'information sur un pays": "Country information search",
  "Connecté en tant que :": "Signed in as:",
  "Nom du pays (Spain, Poland, United Kingdom)": "Country name (Spain, Poland, United Kingdom)",
  "Requête en cours...": "Request in progress...",
  "Rechercher": "Search",
  "Erreur :": "Error:",
  "Résultat (JSON)": "Result (JSON)",
  "Pays :": "Country:",
  "Capitale :": "Capital:",
  "Population :": "Population:",
  "Devise :": "Currency:",
  "Masquer": "Hide",
  "Voir": "View",
  "le XML SOAP brut": "raw SOAP XML",

  "Gestion d'inventaire": "Inventory management",
  "Inventaire": "Inventory",
  "Liste d'achat": "Shopping list",
  "Modifier un produit": "Edit a product",
  "Ajouter un produit": "Add a product",
  "Ajouter un Produit": "Add a Product",
  "Éditer le produit": "Edit product",
  "Nom": "Name",
  "Nom :": "Name:",
  "Nom du produit": "Product name",
  "Type": "Type",
  "Quantité": "Quantity",
  "Seuil min": "Min. threshold",
  "Description": "Description",
  "Description :": "Description:",
  "Prix": "Price",
  "Prix ($)": "Price ($)",
  "Enregistrer": "Save",
  "Enregistrer le produit": "Save product",
  "Ajouter": "Add",
  "Annuler": "Cancel",
  "Produits": "Products",
  "Catalogue des Produits": "Product Catalog",
  "À acheter (quantité < seuil)": "To buy (quantity < threshold)",
  "Chargement…": "Loading…",
  "Aucun élément.": "No items.",
  "Aucun produit disponible.": "No products available.",
  "Éditer": "Edit",
  "Supprimer": "Delete",
  "Supprimer le produit": "Delete product",
  "Actions": "Actions",
  "Mettre à jour": "Update",
  "Ex. : Chocolat Noir": "E.g.: Dark Chocolate",
  "Décrivez le produit...": "Describe the product...",
  "Ex. : 1.99": "E.g.: 1.99",
  "Connecté": "Signed in",
  "Voir tous les produits": "View all products",
  "Insérer un produit": "Insert a product",
  "Mettre à jour un produit": "Update a product",
  "Bienvenue sur la page d'accueil": "Welcome to the home page",
  "Vous devez vous connecter pour ajouter ou modifier des produits.": "You must sign in to add or edit products.",

  "Joueur :": "Player:",
  "Score :": "Score:",
  "Votre nom": "Your name",
  "Rejoindre le jeu": "Join game",
  "Question :": "Question:",
  "Temps restant :": "Time remaining:",
  "Vrai": "True",
  "Faux": "False",
  "Résultats": "Results",
  "Bonne réponse :": "Correct answer:",
  "Joueur le plus rapide :": "Fastest player:",
  "Aucune bonne réponse": "No correct answer",
  "Réponses de tous :": "Everyone's answers:",
  "Fin de la partie": "Game over",
  "Classement": "Leaderboard",
  "Rejoindre une nouvelle partie": "Join a new game",
  "QUITTER LE JEU": "LEAVE GAME",
  "REPRENDRE LE JEU": "RESUME GAME",
  "En attente d'autres joueurs...": "Waiting for other players...",

  "Bienvenue sur TicketConcert": "Welcome to TicketConcert",
  "Réservez vos billets maintenant !": "Book your tickets now!",
  "Billet": "Ticket",
  "Commander": "Order",
  "Réserver un billet": "Book a ticket",
  "Informations du Client": "Customer Information",
  "Prénom": "First name",
  "Prénom :": "First name:",
  "Téléphone": "Phone",
  "Téléphone :": "Phone:",
  "Date de naissance": "Date of birth",
  "Adresse": "Address",
  "Adresse :": "Address:",
  "Informations de la Commande": "Order Information",
  "Type de billet": "Ticket type",
  "Nombre de billets": "Number of tickets",
  "Retour": "Back",
  "Commande Confirmée !": "Order Confirmed!",
  "TicketConcert vous remercie pour votre achat!": "TicketConcert thanks you for your purchase!",
  "Commande": "Order",
  "Type :": "Type:",
  "Quantité :": "Quantity:",
  "Date :": "Date:",
  "Retour à l'accueil": "Back to home",
  "Historique": "History",
  "Client": "Customer",
  "Qté": "Qty",
  "Date": "Date",
  "Billetterie de concert": "Concert ticketing",
  "Accès général à la salle": "General admission",
  "Meilleure vue + boisson": "Better view + drink",
  "Accès VIP + backstage": "VIP + backstage access",
  "Accès général à l'événement.": "General admission to the event.",
  "Accès et services exclusifs.": "Exclusive access and services.",
  "Meilleures places et accès en coulisses.": "Best seats and backstage access.",

  "Surveillance Incendies": "Wildfire Monitoring",
  "Floranet — Surveillance Incendies": "Floranet — Wildfire Monitoring",
  "En direct": "Live",
  "Statistiques": "Statistics",
  "Statistiques réseau": "Network statistics",
  "Moyennes du réseau": "Network averages",
  "Fermer le panneau": "Close panel",
  "Dernière mise à jour :": "Last updated:",
  "Passerelle active": "Gateway active",
  "Passerelle désactivée": "Gateway disabled",
  "Passerelle LoRa": "LoRa Gateway",
  "Nœuds LoRa": "LoRa Nodes",
  "Aucun nœud détecté…": "No nodes detected…",
  "Zone :": "Zone:",
  "Risque :": "Risk:",
  "Voir détails": "View details",
  "Sélectionnez un nœud": "Select a node",
  "En attente": "Waiting",
  "Signal radio": "Radio signal",
  "Batterie": "Battery",
  "Température": "Temperature",
  "Humidité": "Humidity",
  "Fumée (MQ-2)": "Smoke (MQ-2)",
  "Score de risque IA": "AI risk score",
  "FAIBLE": "LOW",
  "DÉCLENCHÉ": "TRIGGERED",
  "Résumé du réseau": "Network summary",
  "Nœuds normaux": "Normal nodes",
  "Nœuds en vigilance": "Warning nodes",
  "Nœuds en alerte": "Alert nodes",
  "Déconnectés": "Disconnected",
  "Active": "Active",
  "Désactivée": "Disabled",
  "Température Moyenne": "Average Temperature",
  "Moyenne sur tous les nœuds actifs": "Average across all active nodes",
  "Humidité Moyenne": "Average Humidity",
  "Humidité relative du réseau": "Network relative humidity",
  "Score LSTM moyen du réseau": "Average network LSTM score",
  "Fumée Max (MQ-2)": "Max Smoke (MQ-2)",
  "Valeur maximale brute (LoRa nœud 3)": "Maximum raw value (LoRa node 3)",
  "Risque IA Moyen": "Average AI Risk",
  "Cycle TDMA": "TDMA Cycle",
  "Cycle TDMA : 18s / 3 nœuds": "TDMA cycle: 18s / 3 nodes",
  "Risque IA": "AI Risk",
  "Fumée": "Smoke",
  "FUMÉE DÉTECTÉE": "SMOKE DETECTED",
  "Déconnecter": "Sign out",
  "BATTERIE FAIBLE": "LOW BATTERY",
  "ALERTE INCENDIE": "FIRE ALERT",
  "Alerte": "Alert",
  "Vigilance": "Warning",
  "Normal": "Normal",
  "Modèle LSTM": "LSTM model",
  "brut": "raw",
};

const FRAGMENTS = [
  ["Projet :", "Project:"],
  ["Qté:", "Qty:"],
  ["Seuil:", "Threshold:"],
  ["Joueur :", "Player:"],
  ["Score :", "Score:"],
  ["Question :", "Question:"],
  ["Temps restant :", "Time remaining:"],
  ["Bonne réponse :", "Correct answer:"],
  ["Joueur le plus rapide :", "Fastest player:"],
  ["Nom :", "Name:"],
  ["Prénom :", "First name:"],
  ["Téléphone :", "Phone:"],
  ["Adresse :", "Address:"],
  ["Type :", "Type:"],
  ["Quantité :", "Quantity:"],
  ["Date :", "Date:"],
  ["Zone :", "Zone:"],
  ["Risque :", "Risk:"],
  ["Alerte ≤", "Alert ≤"],
  ["Alerte ≥", "Alert ≥"],
  ["Vigilance ≤", "Warning ≤"],
  ["Vigilance ≥", "Warning ≥"],
  ["Modèle LSTM", "LSTM model"],
  ["brut", "raw"],
  ["Connecté en tant que :", "Signed in as:"],
  ["Commande #", "Order #"],
  ["Billet ", "Ticket "],
  ["le XML SOAP brut", "raw SOAP XML"],
  ["Réponses de tous :", "Everyone's answers:"],
  ["Rejoindre une nouvelle partie", "Join a new game"],
  ["Joueur le plus rapide :", "Fastest player:"],
  ["Aucune bonne réponse", "No correct answer"],
  ["Fin de la partie", "Game over"],
  ["Résultats", "Results"],
  ["Classement", "Leaderboard"],
  ["Vrai", "True"],
  ["Faux", "False"],
  ["Statistiques réseau", "Network statistics"],
  ["Température Moyenne", "Average Temperature"],
  ["Humidité Moyenne", "Average Humidity"],
  ["Fumée Max", "Max Smoke"],
  ["Risque IA Moyen", "Average AI Risk"],
  ["LoRa nœud", "LoRa node"],
  ["nœuds", "nodes"],
  ["nœud", "node"],
  ["FUMÉE DÉTECTÉE", "SMOKE DETECTED"],
  ["DÉCONNECTÉ", "DISCONNECTED"],
  ["Déconnecté", "Disconnected"],
  ["VIGILANCE", "WARNING"],
  ["ALERTE", "ALERT"],
  ["EN ATTENTE", "WAITING"],
  ["En attente", "Waiting"],
  ["Connecté", "Connected"],
  ["DÉCLENCHÉ", "TRIGGERED"],
  ["FAIBLE", "LOW"],
  ["Risque IA", "AI Risk"],
  ["Risque", "Risk"],
  ["Température", "Temperature"],
  ["Humidité", "Humidity"],
  ["Batterie", "Battery"],
  ["Fumée", "Smoke"],
  ["Dernière mise à jour", "Last updated"],
  ["Passerelle", "Gateway"],
  ["Statistiques", "Statistics"],
  ["En direct", "Live"],
];

function translateText(value) {
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const core = value.slice(leading.length, value.length - trailing.length);
  if (!core) return value;

  let translated = ENGLISH[core];
  if (!translated) {
    translated = core;
    for (const [from, to] of FRAGMENTS) translated = translated.replaceAll(from, to);
  }
  return `${leading}${translated}${trailing}`;
}

const LanguageContext = createContext(null);
const textRecords = new WeakMap();
const attributeRecords = new WeakMap();
const TRANSLATABLE_ATTRIBUTES = ["aria-label", "title", "placeholder", "data-label"];

function applyTextNode(node, language) {
  if (!node.nodeValue?.trim()) return;
  let record = textRecords.get(node);

  if (language === "fr") {
    if (record && node.nodeValue === record.translated) node.nodeValue = record.source;
    return;
  }

  if (!record || node.nodeValue !== record.translated) {
    record = { source: node.nodeValue, translated: "" };
  }
  record.translated = translateText(record.source);
  textRecords.set(node, record);
  if (record.translated !== node.nodeValue) node.nodeValue = record.translated;
}

function applyAttributes(element, language) {
  let records = attributeRecords.get(element);
  if (!records) {
    records = new Map();
    attributeRecords.set(element, records);
  }

  for (const attribute of TRANSLATABLE_ATTRIBUTES) {
    if (!element.hasAttribute?.(attribute)) continue;
    const current = element.getAttribute(attribute);
    let record = records.get(attribute);

    if (language === "fr") {
      if (record && current === record.translated) element.setAttribute(attribute, record.source);
      continue;
    }

    if (!record || current !== record.translated) record = { source: current, translated: "" };
    record.translated = translateText(record.source);
    records.set(attribute, record);
    if (record.translated !== current) element.setAttribute(attribute, record.translated);
  }
}

function applyLanguage(root, language) {
  if (!root) return;
  const forbidden = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE"]);

  if (root.nodeType === Node.TEXT_NODE && !forbidden.has(root.parentElement?.tagName)) {
    applyTextNode(root, language);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;

  if (root.nodeType === Node.ELEMENT_NODE) applyAttributes(root, language);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
      return forbidden.has(element?.tagName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    },
  });

  let node = walker.nextNode();
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) applyTextNode(node, language);
    else applyAttributes(node, language);
    node = walker.nextNode();
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "en" ? "en" : "fr";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.title = language === "en" ? "NEXUS Ko DevLab — Full-stack Portfolio" : "NEXUS Ko DevLab — Portfolio full-stack";
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute(
      "content",
      language === "en"
        ? "Full-stack project portfolio: SOAP, WebSocket, IoT, Deep Learning, Laravel, ASP.NET Core and more."
        : "Portfolio de projets full-stack : SOAP, WebSocket, IoT, Deep Learning, Laravel, ASP.NET Core et plus.",
    );

    applyLanguage(document.body, language);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") applyLanguage(mutation.target, language);
        else if (mutation.type === "attributes") applyAttributes(mutation.target, language);
        else mutation.addedNodes.forEach((node) => applyLanguage(node, language));
      }
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: TRANSLATABLE_ATTRIBUTES,
    });
    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    toggleLanguage: () => setLanguage((current) => (current === "fr" ? "en" : "fr")),
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
