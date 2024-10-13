const { Schema, model, models } = require("mongoose");

const defaultMessageSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
});

const name = "default-message";

module.exports = models[name] || model(name, defaultMessageSchema);
