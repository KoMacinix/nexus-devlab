const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  players:       [{ type: String }],
  question:      { type: String },
  correctAnswer: { type: String },
  fastestPlayer: { type: String },
  createdAt:     { type: Date, default: Date.now },
});

module.exports = mongoose.model("Game", gameSchema);
