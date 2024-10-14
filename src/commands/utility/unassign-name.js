const { SlashCommandBuilder } = require("discord.js");
const namesSchema = require("../../schema/names-schema.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unassign-name")
    .setDescription("Assign name to user")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Enter a name")
        .setRequired(true)
        .setAutocomplete(true)
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
      interaction.reply("You are not allowed to run this command!");
      return;
    }
    const name = interaction.options.get("name").value;

    try {
      await namesSchema.findOneAndUpdate(
        { name },
        { name, user: null, taken: false },
        { upsert: true }
      );

      interaction.reply(`${name} is now available!`);
    } catch (error) {
      interaction.reply("Something went wrong...");
      console.log(error);
    }
  },
};
