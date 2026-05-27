/**
 * Seuils utilisés pour la coloration des marqueurs et l'évaluation
 * "normal / vigilance / alerte" côté frontend.
 *
 * NB : la source de vérité pour le statut reste le backend
 * (champ `sensor.status`). Ces seuils servent uniquement à colorer
 * la carte et à dériver des couleurs locales (barres, badges).
 */

export const THRESHOLDS = {
    temp_warning:    40,   // °C — vigilance
    temp_critical:   50,   // °C — alerte
    hum_warning:     18,   // % — vigilance (sécheresse)
    hum_critical:    10,   // % — alerte (sécheresse)
    smoke_warning:   300,  // valeur brute MQ-2 (0–4095)
    smoke_critical:  700,  // valeur brute MQ-2 — alerte
    risk_warning:    0.3,  // score IA — vigilance
    risk_critical:   0.7,  // score IA — alerte
};

/** Seuils batterie (en %). */
export const BATTERY_LOW      = 20;
export const BATTERY_WARNING  = 40;

/** Échelle MQ-2 brute (ESP32 ADC 12 bits). */
export const SMOKE_MAX = 4095;

/** Échelle température affichage (max barre). */
export const TEMP_MAX_DISPLAY = 80;
