const Question = require("../models/Question");
const Player = require("../models/Player");
const Game = require("../models/Game");

const QUESTION_DURATION = 10000; // 10 secondes

/**
 * Initialise la logique Socket.IO pour le quiz Arena.
 * @param {import("socket.io").Server} io
 */
function initQuizSocket(io) {
  let lobby = [];
  let currentQuestion = null;
  let askedQuestions = new Set();
  let answers = {};
  let questionStartTime = null;
  let questionTimer = null;
  let gameState = "WAITING"; // WAITING | IN_PROGRESS | FINISHED

  // ── Démarrer une nouvelle question ──
  async function startNextQuestion() {
    const question = await Question.findOne({ _id: { $nin: [...askedQuestions] } });

    if (!question) {
      gameState = "FINISHED";
      const leaderboard = lobby
        .filter((p) => p.status === "inGame")
        .map((p) => ({ name: p.name, score: p.score }))
        .sort((a, b) => b.score - a.score);

      lobby.forEach((player) => {
        if (player.status === "inGame") {
          player.status = "finished";
          io.to(player.socketId).emit("finalResults", {
            message: "Toutes les questions ont été posées !",
            leaderboard,
          });
        }
      });

      currentQuestion = null;
      askedQuestions.clear();
      answers = {};
      console.log("✅ Partie terminée");
      return;
    }

    gameState = "IN_PROGRESS";
    currentQuestion = question;
    askedQuestions.add(question._id.toString());
    answers = {};
    questionStartTime = Date.now();

    lobby
      .filter((p) => p.status === "inGame")
      .forEach((player) => {
        io.to(player.socketId).emit("newQuestion", {
          _id: question._id,
          text: question.text,
          duration: QUESTION_DURATION / 1000,
        });
      });

    clearTimeout(questionTimer);
    questionTimer = setTimeout(() => processResults(), QUESTION_DURATION);
  }

  // ── Calculer les résultats ──
  async function processResults() {
    if (!currentQuestion) return;
    clearTimeout(questionTimer);

    const correctAnswer = currentQuestion.correctAnswer;
    let fastestPlayer = null;
    let minTime = Infinity;

    for (const [player, data] of Object.entries(answers)) {
      if (data.answer === correctAnswer && data.time < minTime) {
        minTime = data.time;
        fastestPlayer = player;
      }
    }

    if (fastestPlayer) {
      const playerObj = lobby.find((p) => p.name === fastestPlayer);
      if (playerObj) playerObj.score += 1;
    }

    // Sauvegarder la partie dans MongoDB
    await Game.create({
      players: Object.keys(answers),
      question: currentQuestion.text,
      correctAnswer,
      fastestPlayer,
    });

    const leaderboard = lobby
      .filter((p) => p.status === "inGame")
      .map((p) => ({ name: p.name, score: p.score }))
      .sort((a, b) => b.score - a.score);

    lobby
      .filter((p) => p.status === "inGame")
      .forEach((player) => {
        io.to(player.socketId).emit("questionResults", {
          correctAnswer,
          fastestPlayer,
          allAnswers: answers,
          score: player.score,
          leaderboard,
        });
      });

    currentQuestion = null;

    setTimeout(() => {
      const activePlayers = lobby.filter((p) => p.status === "inGame");
      if (activePlayers.length >= 2) {
        startNextQuestion();
      } else {
        gameState = "WAITING";
      }
    }, 3000);
  }

  // ── Connexion socket ──
  io.on("connection", (socket) => {
    console.log("✅ Client connecté :", socket.id);

    // Rejoindre le jeu
    socket.on("joinGame", async (playerName) => {
      let finalName = playerName;
      let suffix = 1;
      while (lobby.find((p) => p.name === finalName)) {
        finalName = `${playerName}_${suffix}`;
        suffix++;
      }

      io.to(socket.id).emit("joined", { finalName });

      let player = lobby.find((p) => p.socketId === socket.id);
      if (player) {
        player.status = "inGame";
        player.name = finalName;
        player.score = 0;
      } else {
        player = { name: finalName, socketId: socket.id, status: "inGame", score: 0 };
        lobby.push(player);
      }

      await Player.findOneAndUpdate(
        { socketId: socket.id },
        { name: finalName, score: 0 },
        { upsert: true, new: true }
      );

      console.log("🟢 Joueur rejoint :", finalName);

      if (gameState === "WAITING") {
        io.to(socket.id).emit("statusMessage", {
          type: "WAIT_PLAYERS",
          text: "En attente d'autres joueurs...",
        });
      } else if (gameState === "IN_PROGRESS" && currentQuestion) {
        io.to(socket.id).emit("newQuestion", {
          _id: currentQuestion._id,
          text: currentQuestion.text,
          duration: Math.ceil((QUESTION_DURATION - (Date.now() - questionStartTime)) / 1000),
        });
      }

      const activePlayers = lobby.filter((p) => p.status === "inGame");
      if (activePlayers.length >= 2 && gameState !== "IN_PROGRESS") {
        startNextQuestion();
      }
    });

    // Réponse du joueur
    socket.on("answer", (data) => {
      if (!currentQuestion) return;
      const player = lobby.find((p) => p.socketId === socket.id && p.status === "inGame");
      if (!player) return;

      const timeTaken = Date.now() - questionStartTime;
      answers[player.name] = { answer: data.answer, time: timeTaken };

      if (Object.keys(answers).length === lobby.filter((p) => p.status === "inGame").length) {
        processResults();
      } else {
        io.to(socket.id).emit("statusMessage", {
          type: "WAIT_ANSWERS",
          text: "En attente des autres joueurs...",
        });
      }
    });

    // Déconnexion
    socket.on("disconnect", async () => {
      console.log("❌ Joueur déconnecté :", socket.id);

      const player = lobby.find((p) => p.socketId === socket.id);
      if (player) {
        delete answers[player.name];
        lobby = lobby.filter((p) => p.socketId !== socket.id);
        await Player.deleteOne({ socketId: socket.id });
      }

      const activePlayers = lobby.filter((p) => p.status === "inGame");

      if (activePlayers.length < 2 && gameState === "IN_PROGRESS") {
        clearTimeout(questionTimer);
        currentQuestion = null;
        answers = {};
        gameState = "WAITING";
        askedQuestions.clear();

        lobby.forEach((p) => {
          io.to(p.socketId).emit("statusMessage", {
            type: "WAIT_PLAYERS",
            text: "Partie interrompue, en attente de joueurs...",
          });
        });
      }
    });
  });
}

module.exports = initQuizSocket;
