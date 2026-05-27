/**
 * Page Nexus — point d'entrée de la sous-app Floranet.
 *
 * Tout le code Floranet vit dans ../floranet/ (composants, hooks, services,
 * styles, etc.) pour rester strictement isolé du reste de Nexus. Cette page
 * ne fait que monter la sous-app ; toute la logique métier est dans
 * floranet/App.jsx (qui reprend exactement le code du projet Floranet_v4
 * d'origine).
 *
 * Nexus enveloppe ses pages dans <main class="max-w-5xl mx-auto px-4 pb-16">,
 * ce qui contraint la largeur. Le CSS de Floranet (cf. .floranet-root dans
 * floranet/styles/style.css) "casse" cette contrainte via margin négatif
 * et prend toute la largeur disponible — sans toucher au reste de Nexus.
 */

import FloranetApp from "../floranet/App";

export default function FloraNet() {
  return <FloranetApp />;
}
