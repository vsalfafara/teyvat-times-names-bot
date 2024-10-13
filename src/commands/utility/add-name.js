const { SlashCommandBuilder } = require("discord.js");

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
    console.log(interaction);
  },
};
