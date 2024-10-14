const { SlashCommandBuilder } = require("discord.js");
const namesSchema = require("../../schema/names-schema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-name")
    .setDescription("Add name (Ex. Amber, Kaeya, Lisa)")
    .addStringOption((option) =>
      option.setName("name").setDescription("Enter a name").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("sex")
        .setDescription("Male or Female")
        .setRequired(true)
        .addChoices([
          {
            name: "Male",
            value: "Male",
          },
          {
            name: "Female",
            value: "Female",
          },
        ])
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
      interaction.reply("You are not allowed to run this command!");
      return;
    }
    const name = interaction.options.get("name").value.trim();
    const sex = interaction.options.get("sex").value;
    try {
      await namesSchema.findOneAndUpdate(
        { name },
        { name, sex, taken: false },
        { upsert: true }
      );
      interaction.reply(`${name} has been added!`);
    } catch (error) {
      interaction.reply("Something went wrong...");
      interaction.reply(error);
    }
  },
};
