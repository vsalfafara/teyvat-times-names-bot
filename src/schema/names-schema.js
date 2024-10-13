const { Schema, model, models } = require("mongoose");

const namesSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  sex: {
    type: String,
    enum: ["Male", "Female"],
    required: true,
  },
  taken: {
    type: Boolean,
    required: true,
  },
  user: {
    type: String,
    required: false,
  },
});

const name = "names";

module.exports = models[name] || model(name, namesSchema);
