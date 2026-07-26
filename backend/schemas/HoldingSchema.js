const { Schema } = require("mongoose");

const HoldingSchema = new Schema({
  name: {
    type: String,
    required: true,
    uppercase: true,
  },

  qty: {
    type: Number,
    required: true,
  },

  avg: {
    type: Number,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  net: {
    type: String,
    required: true,
  },

  day: {
    type: String,
    required: true,
  },

  isLoss: {
    type: Boolean,
    default: false,
  },
});

module.exports = { HoldingSchema };
