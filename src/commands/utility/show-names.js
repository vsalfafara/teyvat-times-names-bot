const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const namesSchema = require("../../schema/names-schema");

async function getNames(params) {
  const data = await namesSchema.find(params);
  data.sort((a, b) => a.name.localeCompare(b.name));
  return data;
}

function noNames() {
  return new EmbedBuilder()
    .setTitle("There are no names listed")
    .setDescription("You can add names by running the command **/add-name**")
    .setColor("Random");
}

function allNamesAreTaken() {
  return new EmbedBuilder()
    .setTitle("These are all the names currently not taken")
    .setDescription("All names are taken!")
    .setColor("Random");
}

async function alphabeticalOrder(params = {}) {
  const data = await getNames(params);
  if (Object.keys(params).length && !data.length) {
    return allNamesAreTaken();
  }
  if (!data.length) {
    return noNames();
  }
  const namesData = data.map((name) => {
    if (name.taken) return `${name.name} (${name.user})`;
    return name.name;
  });
  const alphabetData = [...new Set(namesData.map((name) => name.charAt(0)))];
  const descriptionData = alphabetData.map((letter) => {
    return {
      letter,
      names: namesData
        .filter((name) => letter === name.charAt(0))
        .map((name) => ` - ${name}\n`)
        .join(""),
    };
  });

  const description = descriptionData
    .map((data) => {
      return `**${data.letter}**\n ${data.names}`;
    })
    .join("\n");
  return new EmbedBuilder()
    .setTitle(
      `These are all the names currently ${
        Object.keys(params).length ? "available" : "listed"
      }`
    )
    .setDescription(description)
    .setColor("Random");
}

async function bySex(params = {}) {
  const data = await getNames(params);
  if (Object.keys(params).length && !data.length) {
    return allNamesAreTaken();
  }
  if (!data.length) {
    return noNames();
  }
  let maleNames = data
    .filter((name) => name.sex === "Male")
    .map((name) => {
      if (name.taken) return ` - ${name.name} (${name.user})\n`;
      return ` - ${name.name}\n`;
    })
    .join("");

  if (!maleNames.length) {
    maleNames = "There are no male names available";
  }

  let femaleNames = data
    .filter((name) => name.sex === "Female")
    .map((name) => {
      if (name.taken) return ` - ${name.name} (${name.user})\n`;
      return ` - ${name.name}\n`;
    })
    .join("");
  if (!femaleNames.length) {
    femaleNames = "There are no female names available";
  }

  let otherNames = data
    .filter((name) => name.sex === "Other")
    .map((name) => {
      if (name.taken) return ` - ${name.name} (${name.user})\n`;
      return ` - ${name.name}\n`;
    })
    .join("");
  if (!femaleNames.length) {
    femaleNames = "There are no other names available";
  }

  const description = `
  Male
  ${maleNames}

  Female
  ${femaleNames}

  Other
  ${otherNames}
  `;

  return new EmbedBuilder()
    .setTitle("These are all the names separated by sex")
    .setDescription(description)
    .setColor("Random");
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("show-names")
    .setDescription("Show names")
    .addStringOption((option) =>
      option
        .setName("non-taken")
        .setDescription("Show names that are not taken")
        .addChoices([
          {
            name: "Yes",
            value: "yes",
          },
        ])
    )
    .addStringOption((option) =>
      option
        .setName("by-sex")
        .setDescription("Separate names by sex")
        .addChoices([
          {
            name: "Yes",
            value: "yes",
          },
        ])
    ),
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const nonTaken = interaction.options.get("non-taken");
      const bySex = interaction.options.get("by-sex");
      let embed = null;

      if (!bySex && !nonTaken) embed = await showNames();
      else if (bySex && !nonTaken) embed = await showNamesBySex();
      else if (!bySex && nonTaken) embed = await showNonTakenNames();
      else embed = await showNonTakenNamesBySex();

      if (embed) interaction.reply({ embeds: [embed] });
      else interaction.reply(embed);
    } else if (interaction.isButton()) {
      if (interaction.customId === "showNames")
        embed = await alphabeticalOrder();
      else if (interaction.customId === "showNamesBySex") embed = await bySex();
      else if (interaction.customId === "showNonTakenNames") {
        embed = await alphabeticalOrder({ taken: false });
      } else embed = await bySex({ taken: false });

      if (embed) interaction.channel.send({ embeds: [embed] });
      else interaction.reply(embed);
    }
  },
};
