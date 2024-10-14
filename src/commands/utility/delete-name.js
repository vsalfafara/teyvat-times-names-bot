const { SlashCommandBuilder } = require("discord.js");
const namesSchema = require("../../schema/names-schema.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("delete-name")
    .setDescription("Delete a name")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Enter a name")
        .setRequired(true)
        .setAutocomplete(true)
    ),
  async execute(interaction) {
    const name = interaction.options.get("name").value.trim();

    try {
      await namesSchema.findOneAndDelete({ name });
      interaction.reply(`${name} has been deleted!`);
    } catch (error) {
      interaction.reply("Something went wrong...");
      console.log(error);
    }
  },
};
