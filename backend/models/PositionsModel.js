const { PositionsSchema } = require("../schemas/PositionsSchema");
const mongoose = require("mongoose");

const PositionsModel = mongoose.model("position", PositionsSchema);

module.exports = { PositionsModel };
