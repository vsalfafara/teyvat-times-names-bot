const { SlashCommandBuilder } = require("discord.js");
const namesSchema = require("../../schema/names-schema.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("edit-name")
    .setDescription("Edit an existing name")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Enter a name")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option.setName("new-name").setDescription("New name").setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
      interaction.reply("You are not allowed to run this command!");
      return;
    }
    const name = interaction.options.get("name").value.trim();
    const newName = interaction.options.get("new-name").value.trim();

    try {
      await namesSchema.findOneAndUpdate({ name }, { name: newName });
      interaction.reply(`${name} has been changed to ${newName}!`);
    } catch (error) {
      interaction.reply("Something went wrong...");
      console.log(error);
    }
  },
};
