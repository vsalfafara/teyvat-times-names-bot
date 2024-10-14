const { SlashCommandBuilder } = require("discord.js");
const namesSchema = require("../../schema/names-schema.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("assign-name")
    .setDescription("Assign name to user")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Enter a name")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("user")
        .setDescription("User who will take the name")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
      interaction.reply("You are not allowed to run this command!");
      return;
    }
    const name = interaction.options.get("name").value;
    const user = interaction.options.get("user").value.trim();

    try {
      await namesSchema.findOneAndUpdate(
        { name },
        { name, user, taken: true },
        { upsert: true }
      );
      interaction.reply(`Name ${name} has been taken by ${user}!`);
    } catch (error) {
      interaction.reply("Something went wrong...");
      console.log(error);
    }
  },
};
