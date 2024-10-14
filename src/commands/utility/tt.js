const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tt")
    .setDescription("Initialize Teyvat Times Names Manager bot"),
  async execute() {},
};
