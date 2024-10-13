const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("show-names")
    .setDescription("Show all names in alphabetical order"),
  async execute(interaction) {
    console.log(interaction);
  },
};
