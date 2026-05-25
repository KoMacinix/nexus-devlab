const express = require("express");
const { parseStringPromise, processors } = require("xml2js");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// ── Données pays (simule le CountryRepository Spring Boot) ──
const COUNTRIES = {
  spain:           { name: "Spain",          capital: "Madrid",    population: 46704314,  currency: "EUR" },
  poland:          { name: "Poland",         capital: "Warsaw",    population: 38186860,  currency: "PLN" },
  "united kingdom":{ name: "United Kingdom", capital: "London",    population: 66488991,  currency: "GBP" },
  france:          { name: "France",         capital: "Paris",     population: 67390000,  currency: "EUR" },
  canada:          { name: "Canada",         capital: "Ottawa",    population: 38000000,  currency: "CAD" },
  japan:           { name: "Japan",          capital: "Tokyo",     population: 125800000, currency: "JPY" },
  algeria:         { name: "Algeria",        capital: "Algiers",   population: 44700000,  currency: "DZD" },
  brazil:          { name: "Brazil",         capital: "Brasilia",  population: 214000000, currency: "BRL" },
  germany:         { name: "Germany",        capital: "Berlin",    population: 83200000,  currency: "EUR" },
  australia:       { name: "Australia",      capital: "Canberra",  population: 26000000,  currency: "AUD" },
};

/**
 * Génère une réponse SOAP XML à partir d'un pays.
 */
function buildSoapResponse(country) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
  <SOAP-ENV:Header/>
  <SOAP-ENV:Body>
    <ns2:getCountryResponse xmlns:ns2="http://spring.io/guides/gs-producing-web-service">
      <ns2:country>
        <ns2:name>${country.name}</ns2:name>
        <ns2:population>${country.population}</ns2:population>
        <ns2:capital>${country.capital}</ns2:capital>
        <ns2:currency>${country.currency}</ns2:currency>
      </ns2:country>
    </ns2:getCountryResponse>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;
}

// ── GET /api/countries/list ──
router.get("/list", (_req, res) => {
  const list = Object.values(COUNTRIES).map((c) => ({
    name: c.name,
    capital: c.capital,
  }));
  res.json(list);
});

// ── POST /api/countries/soap ── (protégé par JWT)
router.post("/soap", authMiddleware, async (req, res) => {
  try {
    const { pays } = req.body;

    if (!pays || !pays.trim()) {
      return res.status(400).json({ error: 'Le champ "pays" est obligatoire' });
    }

    const key = pays.trim().toLowerCase();
    const country = COUNTRIES[key];

    if (!country) {
      return res.status(404).json({
        error: `Pays « ${pays} » introuvable dans le service SOAP`,
        available: Object.values(COUNTRIES).map((c) => c.name),
      });
    }

    // 1. Générer la réponse SOAP XML (comme Spring Boot le ferait)
    const soapXml = buildSoapResponse(country);

    // 2. Parser le XML → JSON (comme le faisait le client Next.js)
    const parsed = await parseStringPromise(soapXml, {
      explicitArray: false,
      tagNameProcessors: [processors.stripPrefix],
    });

    const result = parsed?.Envelope?.Body?.getCountryResponse?.country;

    if (!result) {
      return res.status(500).json({ error: "Erreur de parsing SOAP" });
    }

    // 3. Retourner le JSON final + le XML brut pour la démo
    res.json({
      country: {
        name: result.name,
        capital: result.capital,
        population: Number(result.population),
        currency: result.currency,
      },
      rawXml: soapXml, // Pour afficher le XML dans le frontend
    });
  } catch (err) {
    console.error("SOAP error:", err);
    res.status(500).json({ error: "Erreur lors de l'appel SOAP" });
  }
});

module.exports = router;
