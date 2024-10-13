require("dotenv").config();
const {
  Client,
  IntentsBitField,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const mongoose = require("mongoose");
const namesSchema = require("./schema/names-schema");
const defaultMessageSchema = require("./schema/default-message-schema");
const token = process.env.TOKEN;
const dbURI = process.env.MONGODB_URI;

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("ready", (c) => {
  mongoose.connect(dbURI);
  console.log(`✅ ${c.user.username} is ready`);
});

client.on("interactionCreate", async (interaction) => {
  if (
    !interaction.isChatInputCommand() &&
    !interaction.isButton() &&
    !interaction.isAutocomplete()
  )
    return;
  else if (interaction.commandName === "add-name") {
    const name = interaction.options.get("name").value;
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
    sendEmbed(interaction);
  } else if (interaction.isButton()) {
    if (interaction.customId === "showAllNames") {
      try {
        const data = await namesSchema.find({});
        data.sort((a, b) => a.name.localeCompare(b.name));

        const namesData = data.map((name) => {
          if (name.taken) {
            return `${name.name} (Taken)`;
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

        const embed = new EmbedBuilder()
          .setTitle("These are all the names currently listed")
          .setDescription(description)
          .setColor("Random");
        interaction.channel.send({ embeds: [embed] });
      } catch (error) {
        interaction.reply("Something went wrong...");
        interaction.reply(error);
      }
    } else if (interaction.customId === "showAllNamesSex") {
      try {
        const data = await namesSchema.find({});
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

        const embed = new EmbedBuilder()
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
        interaction.channel.send({ embeds: [embed] });
      } catch (error) {
        interaction.reply("Something went wrong...");
        console.log(error);
      }
    } else if (interaction.customId === "showAllNonTakenNames") {
      try {
        const data = await namesSchema.find({ taken: false });

        if (!data.length) {
          const embed = new EmbedBuilder()
            .setTitle("These are all the names currently not taken")
            .setDescription("All names are taken!")
            .setColor("Random");
          interaction.channel.send({ embeds: [embed] });
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

          const embed = new EmbedBuilder()
            .setTitle("These are all the names currently not taken")
            .setDescription(description)
            .setColor("Random");
          interaction.channel.send({ embeds: [embed] });
        }
      } catch (error) {
        interaction.reply("Something went wrong...");
        interaction.reply(error);
      }
    } else if (interaction.customId === "showAllNonTakenNamesSex") {
      try {
        const data = await namesSchema.find({ taken: false });
        console.log("sex");
        if (!data.length) {
          const embed = new EmbedBuilder()
            .setTitle("These are all the names currently not taken")
            .setDescription("All names are taken!")
            .setColor("Random");
          interaction.channel.send({ embeds: [embed] });
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

          const embed = new EmbedBuilder()
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
          interaction.channel.send({ embeds: [embed] });
        }
      } catch (error) {
        interaction.reply("Something went wrong...");
        interaction.reply(error);
      }
    }
    sendEmbed(interaction);
  } else if (
    interaction.isAutocomplete() &&
    interaction.commandName === "assign-name"
  ) {
    const value = interaction.options.getFocused().toLowerCase();
    const data = await namesSchema.find({
      name: { $regex: value, $options: "i" },
      taken: false,
    });

    let choices = data.map((name) => name.name);
    const filtered = choices
      .filter((choice) => choice.toLowerCase().includes(value))
      .slice(0, 25);
    await interaction
      .respond(filtered.map((choice) => ({ name: choice, value: choice })))
      .catch(() => {});
  } else if (
    interaction.isAutocomplete() &&
    interaction.commandName === "unassign-name"
  ) {
    const value = interaction.options.getFocused().toLowerCase();
    const data = await namesSchema.find({
      name: { $regex: value, $options: "i" },
      taken: true,
    });

    let choices = data.map((name) => name.name);
    const filtered = choices
      .filter((choice) => choice.toLowerCase().includes(value))
      .slice(0, 25);
    await interaction
      .respond(filtered.map((choice) => ({ name: choice, value: choice })))
      .catch(() => {});
  } else if (interaction.commandName === "assign-name") {
    const name = interaction.options.get("name").value;
    const user = interaction.options.get("user").value;

    try {
      await namesSchema.findOneAndUpdate(
        { name },
        { name, user, taken: true },
        { upsert: true }
      );
      interaction.reply(`Name ${name} has been taken by ${user}!`);
    } catch (error) {
      console.log(error);
    }
    sendEmbed(interaction);
  } else if (interaction.commandName === "unassign-name") {
    const name = interaction.options.get("name").value;
    console.log(name);

    try {
      await namesSchema.findOneAndUpdate(
        { name },
        { name, user: null, taken: false },
        { upsert: true }
      );
      interaction.reply(`${name} is now available again!`);
    } catch (error) {
      console.log(error);
    }
    sendEmbed(interaction);
  }
});

async function sendEmbed(interaction) {
  try {
    const embed = new EmbedBuilder()
      .setTitle("TT Names")
      .setDescription("A bot to manage all Teyvat Times nicknames")
      .setColor("Random");

    const previousDefaultMessageId = await defaultMessageSchema.findOne({});

    if (previousDefaultMessageId) {
      const previousMessage = await interaction.channel.messages.fetch(
        previousDefaultMessageId?._id
      );
      if (previousMessage) {
        await previousMessage.delete();
        await defaultMessageSchema.deleteMany();
      }
    }
    const message = await interaction.channel.send({
      embeds: [embed],
      components: [...buttons()],
    });
    const data = await message.fetch();
    await defaultMessageSchema.create({ _id: data.id });
  } catch (error) {
    console.log(error);
  }
}

function buttons() {
  const showAllNames = new ButtonBuilder()
    .setCustomId("showAllNames")
    .setLabel("Show all names (Alphabetical order)")
    .setStyle(ButtonStyle.Primary);

  const showAllNamesSex = new ButtonBuilder()
    .setCustomId("showAllNamesSex")
    .setLabel("Show all names (Separated by sex)")
    .setStyle(ButtonStyle.Success);

  const showAllNonTakenNames = new ButtonBuilder()
    .setCustomId("showAllNonTakenNames")
    .setLabel("Show all names that are not yet taken")
    .setStyle(ButtonStyle.Secondary);

  const showAllNonTakenNamesSex = new ButtonBuilder()
    .setCustomId("showAllNonTakenNamesSex")
    .setLabel("Show all names that are not yet taken (Separated by sex)")
    .setStyle(ButtonStyle.Danger);

  const row1 = new ActionRowBuilder().addComponents(
    showAllNames,
    showAllNamesSex
  );

  const row2 = new ActionRowBuilder().addComponents(
    showAllNonTakenNames,
    showAllNonTakenNamesSex
  );

  return [row1, row2];
}

client.login(token);
