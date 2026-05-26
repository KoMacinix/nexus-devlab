import React, { useState, useEffect, useRef } from "react";
import socket from "../socket";

/**
 * Tookah — page Arena.
 *
 * Reproduit fidèlement l'UI/UX du projet Tookah original (socket-io-client) :
 *   - App.js d'origine : toggle "QUITTER LE JEU" / "REPRENDRE LE JEU" qui
 *     démonte/remonte le composant client (= reset socket complet).
 *   - ClientComponent.js d'origine : états, événements socket, timer, rendu.
 *   - index.css d'origine : gradient orange, Segoe UI, .section-card colorées.
 *
 * Adaptations pour le contexte hébergé (Render / OVH) :
 *   - Le socket utilise le client partagé ../socket.js qui pointe sur
 *     VITE_BACKEND_URL (URL Render du backend en prod).
 *   - Le wrapper se loge SOUS la navbar nexus (qui est sticky, hauteur 56px)
 *     pour rester cohérent avec le reste du portfolio — sans rien changer
 *     au rendu intérieur de Tookah.
 *   - Le CSS est scopé sous `.tookah-scope` pour ne pas polluer le site.
 */

// ── Styles scopés sous `.tookah-scope` — reprise du index.css original ──
const TOOKAH_CSS = `
/* Wrapper plein écran sous la navbar nexus (sticky, h-14 = 56px) */
.tookah-page-host {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
  background: linear-gradient(to right, #ff6239, #fe944a);
  overflow-y: auto;
  overflow-x: hidden;
}

/* 🎨 Arrière-plan général — équivalent du body original */
.tookah-scope {
  min-height: 100%;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(to right, #ff6239, #fe944a);
  color: #fff;
  text-align: center;
  overflow-x: hidden;
  padding-bottom: 40px;
}

/* 🌟 En-tête général */
.tookah-scope h1,
.tookah-scope h2,
.tookah-scope h3,
.tookah-scope h4 {
  margin: 0.8rem 0;
  font-weight: 700;
  text-shadow: 1px 1px 4px rgba(0,0,0,0.2);
  color: #fff;
}

/* 📝 Champ pseudo */
.tookah-scope input {
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: none;
  margin: 0.5rem;
  font-size: 1rem;
  outline: none;
  width: 250px;
  text-align: center;
  background: #fff;
  color: #333;
}

/* 🔘 Boutons */
.tookah-scope button {
  margin: 0.5rem;
  padding: 0.8rem 1.6rem;
  font-size: 1.1rem;
  border-radius: 12px;
  border: none;
  background: #21264b;
  color: white;
  cursor: pointer;
  transition: 0.3s ease;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
.tookah-scope button:hover {
  background: #343a6a;
  transform: scale(1.05);
}

/* ✅ Mise en avant de la réponse choisie */
.tookah-scope .correct {
  background: #28a745 !important;
  color: #fff !important;
}
.tookah-scope .wrong {
  background: #dc3545 !important;
  color: #fff !important;
}

/* 🎴 Style des blocs (cartes séparées) */
.tookah-scope .section-card {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 1.5rem;
  margin: 1.2rem auto;
  max-width: 650px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
  text-align: center;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

/* Variantes par type de carte */
.tookah-scope .player-info   { background: rgba(0, 0, 0, 0.3); }
.tookah-scope .join-card     { background: rgba(255, 255, 255, 0.18); }
.tookah-scope .question-card {
  background: rgba(0, 102, 204, 0.2);
  border: 2px solid rgba(0, 102, 204, 0.4);
}
.tookah-scope .results-card  {
  background: rgba(40, 167, 69, 0.2);
  border: 2px solid rgba(40, 167, 69, 0.4);
}
.tookah-scope .leaderboard-card {
  background: rgba(255, 215, 0, 0.2);
  border: 2px solid rgba(255, 215, 0, 0.4);
}
.tookah-scope .final-card {
  background: rgba(220, 53, 69, 0.2);
  border: 2px solid rgba(220, 53, 69, 0.4);
}

/* Liste des réponses */
.tookah-scope ul,
.tookah-scope ol {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
}
.tookah-scope ul li,
.tookah-scope ol li {
  background: rgba(255, 255, 255, 0.1);
  margin: 0.4rem auto;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  max-width: 500px;
  font-size: 1.2rem;
  text-align: left;
  color: #fff;
}

/* Bloc centré */
.tookah-scope .centered-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 56px - 100px); /* navbar + bouton header */
  text-align: center;
  width: 90%;
  max-width: 800px;
  margin: 0 auto;
}

/* Texte des questions et messages */
.tookah-scope .game-text {
  font-size: 1.6rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0.6rem 0;
}

/* Groupe de boutons de réponse */
.tookah-scope .answer-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

/* Bouton principal (App.js d'origine) — fixed mais SOUS la navbar nexus */
.tookah-scope .app-toggle-button {
  position: fixed;
  top: 76px; /* 56px navbar + 20px d'origine */
  left: 20px;
  z-index: 1000;
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// ClientComponent — fidèle à socket-io-client/src/ClientComponent.js
// ─────────────────────────────────────────────────────────────────────────────
function ClientComponent() {
  const [playerName, setPlayerName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [joined, setJoined] = useState(false);
  const [question, setQuestion] = useState(null);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState(null);
  const [finalResults, setFinalResults] = useState(null);
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [waitingForPlayers, setWaitingForPlayers] = useState(false);
  const [waitingForAnswers, setWaitingForAnswers] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  const timerRef = useRef(null);

  // --- Rejoindre le jeu ---
  const joinGame = () => {
    if (playerName && socket) {
      socket.emit("joinGame", playerName);
      setJoined(true);
      setFinalResults(null);
      setMessage("En attente d'autres joueurs...");
      setWaitingForPlayers(true);
    }
  };

  // --- Répondre à une question ---
  const answerQuestion = (answer) => {
    if (socket && playerName && question) {
      setSelectedAnswer(answer);
      socket.emit("answer", { answer, questionId: question._id });
      setMessage("En attente des autres joueurs...");
      setWaitingForAnswers(true);
    }
  };

  // --- Connexion Socket.IO ---
  useEffect(() => {
    // On (re)connecte le socket partagé à chaque montage du client.
    socket.connect();

    // Quand le joueur rejoint le jeu
    const onJoined = (data) => {
      setDisplayName(data.finalName);
      // L'événement original n'envoie pas de score ; on garde l'init local à 0.
      if (typeof data.score === "number") setScore(data.score);
    };

    // --- Messages d'état ---
    const onStatusMessage = (data) => {
      setMessage(data.text);
      setWaitingForPlayers(data.type === "WAIT_PLAYERS");
      setWaitingForAnswers(data.type === "WAIT_ANSWERS");
    };

    // --- Nouvelle question ---
    const onNewQuestion = (data) => {
      setQuestion(data);
      setResults(null);
      setSelectedAnswer(null);
      setWaitingForAnswers(false);
      setMessage("");

      if (data.duration) {
        setTimeLeft(data.duration);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              timerRef.current = null;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    };

    // --- Résultats d'une question ---
    const onQuestionResults = (data) => {
      setResults(data);
      setQuestion(null);
      setScore(data.score);
      setLeaderboard(data.leaderboard || []);
      setSelectedAnswer(null);
      setWaitingForAnswers(false);
      setTimeLeft(null);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    // --- Fin de partie ---
    const onFinalResults = (data) => {
      setFinalResults(data);
      if (data && data.leaderboard) setLeaderboard(data.leaderboard);
      setQuestion(null);
      setResults(null);
      setSelectedAnswer(null);
      setWaitingForAnswers(false);
      setWaitingForPlayers(false);
      setTimeLeft(null);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    socket.on("joined", onJoined);
    socket.on("statusMessage", onStatusMessage);
    socket.on("newQuestion", onNewQuestion);
    socket.on("questionResults", onQuestionResults);
    socket.on("finalResults", onFinalResults);

    // Cleanup : équivalent du `newSocket.disconnect()` de l'original.
    return () => {
      socket.off("joined", onJoined);
      socket.off("statusMessage", onStatusMessage);
      socket.off("newQuestion", onNewQuestion);
      socket.off("questionResults", onQuestionResults);
      socket.off("finalResults", onFinalResults);
      socket.disconnect();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="centered-block">
      {/* Affichage du joueur */}
      {joined && (
        <div className="section-card player-info">
          <p className="game-text">
            Joueur : {displayName}
          </p>
          <p className="game-text">
            Score : {score}
          </p>
        </div>
      )}

      {/* Bloc rejoindre le jeu */}
      {!joined && (
        <div className="section-card join-card">
          <input
            type="text"
            placeholder="Votre nom"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && joinGame()}
          />
          <button onClick={joinGame}>Rejoindre le jeu</button>
        </div>
      )}

      {/* Question en cours */}
      {question && (
        <div className="section-card question-card">
          <p className="game-text"> Question : {question.text}</p>
          {timeLeft !== null && (
            <p className="game-text">⏳ Temps restant : {timeLeft}s</p>
          )}
          <div className="answer-buttons">
            <button
              onClick={() => answerQuestion("vrai")}
              disabled={selectedAnswer === "vrai"}
              className={selectedAnswer === "vrai" ? "correct" : ""}
            >
              ✅ Vrai
            </button>
            <button
              onClick={() => answerQuestion("faux")}
              disabled={selectedAnswer === "faux"}
              className={selectedAnswer === "faux" ? "wrong" : ""}
            >
              ❌ Faux
            </button>
          </div>
        </div>
      )}

      {/* Messages d'attente */}
      {message &&
        ((waitingForPlayers && (!results || message.includes("♻️"))) ||
          (waitingForAnswers && !results)) && (
          <div className="section-card message-card">
            <p className="game-text">{message}</p>
          </div>
        )}

      {/* Résultats de la question */}
      {results && (
        <>
          <div className="section-card results-card">
            <h3 className="game-text">📊 Résultats</h3>
          </div>

          <div className="section-card">
            <p className="game-text">
              ✅ Bonne réponse : {results.correctAnswer}
            </p>
          </div>

          <div className="section-card">
            <p className="game-text">
              ⚡ Joueur le plus rapide :{" "}
              {results.fastestPlayer || "Aucune bonne réponse"}
            </p>
          </div>

          <div className="section-card">
            <h4 className="game-text">📝 Réponses de tous :</h4>
            <ul>
              {Object.entries(results.allAnswers).map(([player, data]) => (
                <li key={player} className="game-text">
                  {player} → {data.answer} ({data.time / 1000}s)
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Fin de partie */}
      {finalResults && (
        <>
          <div className="section-card final-card">
            <h2 className="game-text">🏁 Fin de la partie 🏁</h2>
            <p className="game-text">{finalResults.message}</p>
          </div>

          {leaderboard.length > 0 && (
            <div className="section-card leaderboard-card">
              <h3 className="game-text">🏆 Classement</h3>
              <ol>
                {leaderboard.map((player, index) => (
                  <li key={index} className="game-text">
                    {player.name} → {player.score} pts
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="section-card">
            <button
              onClick={() => {
                setFinalResults(null);
                joinGame();
                setMessage("En attente d'autres joueurs...");
                setWaitingForPlayers(true);
              }}
            >
              Rejoindre une nouvelle partie
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Arena (wrapper App.js original) — toggle QUITTER / REPRENDRE LE JEU
// ─────────────────────────────────────────────────────────────────────────────
export default function Arena() {
  const [loadClient, setLoadClient] = useState(true);

  return (
    <div className="tookah-page-host">
      <style>{TOOKAH_CSS}</style>
      <div className="tookah-scope">
        <button
          className="app-toggle-button"
          onClick={() => setLoadClient((prev) => !prev)}
        >
          {loadClient ? "QUITTER LE JEU" : "REPRENDRE LE JEU"}
        </button>

        {loadClient && <ClientComponent />}
      </div>
    </div>
  );
}
