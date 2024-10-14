const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const namesSchema = require("../../schema/names-schema");

async function getNames(params = {}) {
  const data = await namesSchema.find(params);
  data.sort((a, b) => a.name.localeCompare(b.name));
  return data;
}

async function showNames() {
  try {
    const data = await getNames();
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
      .setTitle("These are all the names currently listed")
      .setDescription(description)
      .setColor("Random");
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function showNamesBySex() {
  try {
    const data = await getNames();
    const maleNames = data
      .filter((name) => name.sex === "Male")
      .map((name) => {
        if (name.taken) return ` - ${name.name} (${name.user})\n`;
        return ` - ${name.name}\n`;
      })
      .join("");

    const femaleNames = data
      .filter((name) => name.sex === "Female")
      .map((name) => {
        if (name.taken) return ` - ${name.name} (Taken)\n`;
        return ` - ${name.name}\n`;
      })
      .join("");

    return new EmbedBuilder()
      .setTitle("These are all the names separated by sex")
      .setColor("Random")
      .addFields(
        {
          name: "Male",
          value: maleNames,
          inline: true,
        },
        {
          name: "Female",
          value: femaleNames,
          inline: true,
        }
      );
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function showNonTakenNames() {
  try {
    const data = await getNames({ taken: false });

    if (!data.length) {
      return new EmbedBuilder()
        .setTitle("These are all the names currently not taken")
        .setDescription("All names are taken!")
        .setColor("Random");
    } else {
      data.sort((a, b) => a.name.localeCompare(b.name));

      const namesData = data.map((name) => {
        if (name.taken) {
          return `${name.name}`;
        }
        return name.name;
      });
      const alphabetData = [
        ...new Set(namesData.map((name) => name.charAt(0))),
      ];
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
        .setTitle("These are all the names currently not taken")
        .setDescription(description)
        .setColor("Random");
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function showNonTakenNamesBySex() {
  try {
    const data = await getNames({ taken: false });
    if (!data.length) {
      return new EmbedBuilder()
        .setTitle("These are all the names currently not taken")
        .setDescription("All names are taken!")
        .setColor("Random");
    } else {
      data.sort((a, b) => a.name.localeCompare(b.name));

      const maleNames = data
        .filter((name) => name.sex === "Male")
        .map((name) => {
          if (name.taken) return ` - ${name.name} (Taken)\n`;
          return ` - ${name.name}\n`;
        })
        .join("");

      const femaleNames = data
        .filter((name) => name.sex === "Female")
        .map((name) => {
          if (name.taken) return ` - ${name.name} (Taken)\n`;
          return ` - ${name.name}\n`;
        })
        .join("");

      return new EmbedBuilder()
        .setTitle("These are all the names currently not taken")
        .setColor("Random")
        .addFields(
          {
            name: "Male",
            value: maleNames,
            inline: true,
          },
          {
            name: "Female",
            value: femaleNames,
            inline: true,
          }
        );
    }
  } catch (error) {
    console.log(error);
    return false;
  }
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
      if (interaction.customId === "showNames") embed = await showNames();
      else if (interaction.customId === "showNamesBySex")
        embed = await showNamesBySex();
      else if (interaction.customId === "showNonTakenNames") {
        embed = await showNonTakenNames();
      } else embed = await showNonTakenNamesBySex();

      if (embed) interaction.channel.send({ embeds: [embed] });
      else interaction.reply(embed);
    }
  },
};
