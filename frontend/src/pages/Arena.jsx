import { useState, useEffect, useRef, useCallback } from "react";
import socket from "../socket";

/* ── Tookah design: radial gradient, glassmorphism, neon cyan, Poppins ── */

export default function Arena() {
  const [phase, setPhase] = useState("lobby");
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState(null);
  const [finalData, setFinalData] = useState(null);
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    socket.connect();
    socket.on("joined", (data) => setDisplayName(data.finalName));
    socket.on("statusMessage", (data) => {
      setMessage(data.text);
      if (data.type === "WAIT_PLAYERS") setPhase("waiting");
    });
    socket.on("newQuestion", (data) => {
      setQuestion(data); setSelected(null); setResults(null);
      setMessage(""); setPhase("question");
      if (data.duration) {
        setTimeLeft(data.duration);
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setTimeLeft((t) => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; });
        }, 1000);
      }
    });
    socket.on("questionResults", (data) => {
      clearInterval(timerRef.current); setResults(data); setQuestion(null);
      setScore(data.score); setLeaderboard(data.leaderboard || []); setPhase("result"); setTimeLeft(null);
    });
    socket.on("finalResults", (data) => {
      clearInterval(timerRef.current); setFinalData(data);
      setLeaderboard(data.leaderboard || []); setPhase("final"); setTimeLeft(null);
    });
    return () => { socket.off("joined"); socket.off("statusMessage"); socket.off("newQuestion"); socket.off("questionResults"); socket.off("finalResults"); socket.disconnect(); clearInterval(timerRef.current); };
  }, []);

  const join = useCallback(() => { if (!name.trim()) return; socket.emit("joinGame", name.trim()); setScore(0); setPhase("waiting"); setFinalData(null); setResults(null); }, [name]);
  const answer = useCallback((a) => { if (selected || !question) return; setSelected(a); clearInterval(timerRef.current); socket.emit("answer", { answer: a, questionId: question._id }); setMessage("En attente des autres joueurs..."); }, [selected, question]);
  const replay = useCallback(() => { setFinalData(null); setResults(null); setScore(0); socket.emit("joinGame", displayName || name); setPhase("waiting"); }, [displayName, name]);

  function quitGame() {
    socket.disconnect();
    setPhase("lobby"); setName(""); setDisplayName(""); setQuestion(null);
    setSelected(null); setResults(null); setFinalData(null); setScore(0);
    setLeaderboard([]); setMessage(""); setTimeLeft(null);
    clearInterval(timerRef.current);
    socket.connect();
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        .tookah-wrap {
          min-height: calc(100vh - 200px);
          display: flex; justify-content: center; align-items: flex-start;
          padding: 40px 16px;
          background: radial-gradient(circle at top left, #141e30, #243b55);
          margin: -16px; margin-top: 0;
          font-family: 'Poppins', sans-serif; color: #f5f5f5;
        }
        .centered-block {
          margin-top: 40px;
          background: rgba(255,255,255,0.05);
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 20px; padding: 30px;
          max-width: 600px; width: 100%;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          text-align: center;
          backdrop-filter: blur(10px);
          animation: tookahFadeIn 0.6s ease;
        }
        @keyframes tookahFadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
        .centered-block h2, .centered-block h3, .centered-block h4 {
          color: #00ffe5; margin-bottom: 15px;
          text-shadow: 0 0 8px rgba(0,255,229,0.6);
        }
        .centered-block .game-text { font-size: 18px; margin: 8px 0; }
        .centered-block input[type="text"] {
          padding: 12px 15px; border-radius: 12px; border: none; outline: none;
          font-size: 16px; margin-right: 10px;
          background: rgba(255,255,255,0.2); color: #fff;
          transition: 0.3s; font-family: 'Poppins', sans-serif;
        }
        .centered-block input:focus { background: rgba(255,255,255,0.3); box-shadow: 0 0 10px #00ffe5; }
        .centered-block input::placeholder { color: rgba(255,255,255,0.6); }
        .tookah-btn {
          padding: 12px 20px; margin: 10px; border: none; border-radius: 15px;
          font-size: 16px; font-weight: bold; cursor: pointer; transition: all 0.3s;
          background: linear-gradient(135deg, #00ffe5, #008cba);
          color: #0d1b2a; box-shadow: 0 5px 15px rgba(0,255,229,0.3);
          font-family: 'Poppins', sans-serif;
        }
        .tookah-btn:hover { transform: scale(1.05); box-shadow: 0 6px 18px rgba(0,255,229,0.5); }
        .tookah-btn:disabled { background: #555; color: #ccc; cursor: not-allowed; transform: none; box-shadow: none; }
        .tookah-btn-danger { background: linear-gradient(135deg, #ff6b6b, #c0392b); box-shadow: 0 5px 15px rgba(255,107,107,0.3); }
        .tookah-btn-quit {
          background: linear-gradient(135deg, #ff6b6b, #c0392b);
          box-shadow: 0 5px 15px rgba(255,107,107,0.3);
          font-size: 13px; padding: 8px 16px;
        }
        .timer {
          font-size: 20px; font-weight: bold; margin: 15px 0; padding: 10px;
          border-radius: 12px; background: rgba(0,255,229,0.1);
          border: 1px solid rgba(0,255,229,0.4); display: inline-block;
          animation: pulse 1s infinite;
        }
        @keyframes pulse { 0%{box-shadow:0 0 0 0 rgba(0,255,229,0.4)} 70%{box-shadow:0 0 0 12px rgba(0,255,229,0)} 100%{box-shadow:0 0 0 0 rgba(0,255,229,0)} }
        .tookah-list { list-style: none; padding: 0; }
        .tookah-list li {
          background: rgba(255,255,255,0.08); margin: 6px 0; padding: 10px;
          border-radius: 10px; transition: 0.3s; text-align: left;
        }
        .tookah-list li:hover { background: rgba(0,255,229,0.15); }
        .player-info { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; opacity: 0.7; }
      `}</style>

      <div className="tookah-wrap">
        <div className="centered-block">
          {/* QUITTER LE JEU button at top */}
          {phase !== "lobby" && (
            <div style={{marginBottom: 16}}>
              <button className="tookah-btn tookah-btn-quit" onClick={quitGame}>
                🚪 QUITTER LE JEU
              </button>
            </div>
          )}

          {/* Player info */}
          {phase !== "lobby" && (
            <div className="player-info">
              <span>👤 {displayName || name} : <strong>{score} pts</strong></span>
              <span>{phase === "waiting" ? "🔵 Attente" : phase === "question" ? "🟢 En jeu" : "📊 Résultats"}</span>
            </div>
          )}

          {/* LOBBY */}
          {phase === "lobby" && (
            <>
              <h2>Tookah</h2>
              <p style={{fontSize:14, opacity:0.6}}>Quiz temps réel · Socket.IO · Ouvrez 2 onglets</p>
              <div style={{marginTop:20}}>
                <input type="text" placeholder="Votre nom" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && join()} />
                <button className="tookah-btn" onClick={join}>🚀 Rejoindre le jeu</button>
              </div>
            </>
          )}

          {/* WAITING */}
          {phase === "waiting" && (
            <>
              <h3>⏳ En attente</h3>
              <p className="game-text">{message || "En attente d'autres joueurs..."}</p>
            </>
          )}

          {/* QUESTION */}
          {phase === "question" && question && (
            <>
              {timeLeft !== null && <div className="timer">⏳ Temps restant : {timeLeft}s</div>}
              <h3>❓ {question.text}</h3>
              {!selected ? (
                <div>
                  <button className="tookah-btn" onClick={() => answer("vrai")} style={{backgroundColor: selected === "vrai" ? "lightgreen" : ""}}>✅ Vrai</button>
                  <button className="tookah-btn tookah-btn-danger" onClick={() => answer("faux")} style={{backgroundColor: selected === "faux" ? "lightcoral" : ""}}>❌ Faux</button>
                </div>
              ) : (
                <p className="game-text">{message}</p>
              )}
            </>
          )}

          {/* RESULTS */}
          {phase === "result" && results && (
            <>
              <h3>📊 Résultats</h3>
              <p className="game-text">Bonne réponse : <strong>{results.correctAnswer}</strong></p>
              <p className="game-text">⚡ Plus rapide : {results.fastestPlayer || "Aucun"}</p>
              <h4>Réponses :</h4>
              <ul className="tookah-list">
                {Object.entries(results.allAnswers).map(([player, data]) => (
                  <li key={player}>{player} → {data.answer} ({(data.time/1000).toFixed(1)}s)</li>
                ))}
              </ul>
            </>
          )}

          {/* FINAL */}
          {phase === "final" && (
            <>
              <h2>🏆 Fin de la partie</h2>
              {finalData?.message && <p className="game-text">{finalData.message}</p>}
              {leaderboard.length > 0 && (
                <>
                  <h3>Classement</h3>
                  <ol style={{textAlign:"left", paddingLeft:20}}>
                    {leaderboard.map((p, i) => (
                      <li key={i} className="game-text">
                        {i === 0 && "🥇"}{i === 1 && "🥈"}{i === 2 && "🥉"} {p.name} → {p.score} pts
                      </li>
                    ))}
                  </ol>
                </>
              )}
              <button className="tookah-btn" onClick={replay}>🔄 Rejouer</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
