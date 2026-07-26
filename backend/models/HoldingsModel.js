const mongoose = require("mongoose");
const { HoldingSchema } = require("../schemas/HoldingSchema.js");

const HoldingsModel = mongoose.model("holding", HoldingSchema);

module.exports = { HoldingsModel };
