const { OrdersSchema } = require("../schemas/OrdersSchema.js");
const mongoose = require("mongoose");

const OrdersModel = mongoose.model("order", OrdersSchema);
module.exports = { OrdersModel };
