require("dotenv").config();
const {
  Client,
  IntentsBitField,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const mongoose = require("mongoose");
const { registerCommands } = require("./register-commands");
const { execute: showNames } = require("./commands/utility/show-names");
const { execute: addName } = require("./commands/utility/add-name");
const { execute: editName } = require("./commands/utility/edit-name");
const { execute: deleteName } = require("./commands/utility/delete-name");
const { execute: assignName } = require("./commands/utility/assign-name");
const { execute: unassignName } = require("./commands/utility/unassign-name");
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

client.on("guildCreate", async (guild) => {
  registerCommands(guild.id);
});

client.on("interactionCreate", async (interaction) => {
  if (
    !interaction.isChatInputCommand() &&
    !interaction.isButton() &&
    !interaction.isAutocomplete()
  )
    return;
  else if (
    interaction.commandName === "tt" ||
    interaction.customId === "showCommands"
  ) {
    sendEmbed(interaction);
  } else if (interaction.isAutocomplete()) {
    const value = interaction.options.getFocused().toLowerCase();
    const params = {
      name: { $regex: value, $options: "i" },
    };
    if (interaction.commandName === "assign-name") params.taken = false;
    if (interaction.commandName === "unassign-name") params.taken = true;
    const data = await namesSchema.find(params);
    let choices = data.map((name) => name.name);
    const filtered = choices
      .filter((choice) => choice.toLowerCase().includes(value))
      .slice(0, 25);
    await interaction
      .respond(filtered.map((choice) => ({ name: choice, value: choice })))
      .catch(() => {});
  } else if (interaction.commandName === "add-name") addName(interaction);
  else if (interaction.commandName === "edit-name") editName(interaction);
  else if (interaction.commandName === "delete-name") deleteName(interaction);
  else if (interaction.commandName === "assign-name") assignName(interaction);
  else if (interaction.commandName === "unassign-name")
    unassignName(interaction);
  else if (interaction.commandName === "show-names" || interaction.isButton())
    showNames(interaction);

  // if (interaction.isChatInputCommand() || interaction.isButton()) {
  //   await sendButtons(interaction);
  // }
});

async function sendEmbed(interaction) {
  const embed = new EmbedBuilder()
    .setTitle("TT Names")
    .setDescription(
      "A bot to manage all Teyvat Times nicknames. Click one of the buttons below or use the following slash commands:"
    )
    .addFields(
      {
        name: "/tt",
        value: "Show list of commands",
      },
      {
        name: "/show-names",
        value: `
        Show names in alphabetical order
        Options: by-sex, non-taken
      `,
      },
      {
        name: "/add-name",
        value: `
        Add a name to the list
        Options: name, sex
      `,
      },
      {
        name: "/edit-name",
        value: `
        Edit an existing name
        Options: name, new-name
      `,
      },
      {
        name: "/delete-name",
        value: `
        Delete a name from the list
        Options: name
      `,
      },
      {
        name: "/assign-name",
        value: `
        Assign a name to a user
        Options: name, user
      `,
      },
      {
        name: "/unassign-name",
        value: `
        Remove a user from a taken name
        Options: name
      `,
      }
    )
    .setColor("Random");
  if (interaction.isChatInputCommand()) {
    await interaction.reply({
      embeds: [embed],
    });
  } else {
    await interaction.channel.send({
      embeds: [embed],
    });
  }
}

async function sendButtons(interaction) {
  try {
    // const previousDefaultMessageId = await defaultMessageSchema.findOne({});
    // if (previousDefaultMessageId) {
    //   const previousMessage = await interaction.channel.messages.fetch(
    //     previousDefaultMessageId?._id
    //   );
    //   if (previousMessage) {
    //     await previousMessage.delete();
    //     await defaultMessageSchema.deleteMany();
    //   }
    // }
    const message = await interaction.channel.send({
      embeds: [new EmbedBuilder().setTitle("Click on one of the buttons")],
      components: [...buttons()],
    });
    const data = await message.fetch();
    await defaultMessageSchema.create({ _id: data.id });
  } catch (error) {
    console.log(error);
  }
}

function buttons() {
  const showNames = new ButtonBuilder()
    .setCustomId("showNames")
    .setLabel("Show all names (Sorted)")
    .setStyle(ButtonStyle.Primary);

  const showNamesBySex = new ButtonBuilder()
    .setCustomId("showNamesBySex")
    .setLabel("Show all names (Separated by sex)")
    .setStyle(ButtonStyle.Success);

  const showNonTakenNames = new ButtonBuilder()
    .setCustomId("showNonTakenNames")
    .setLabel("Show all names that are not taken (Sorted)")
    .setStyle(ButtonStyle.Secondary);

  const showNonTakenNamesBySex = new ButtonBuilder()
    .setCustomId("showNonTakenNamesBySex")
    .setLabel("Show all names that are not taken (Separated by sex)")
    .setStyle(ButtonStyle.Danger);

  const showCommands = new ButtonBuilder()
    .setCustomId("showCommands")
    .setLabel("Show list of commands")
    .setStyle(ButtonStyle.Primary);

  const content = [
    new ActionRowBuilder().addComponents(showNames, showNamesBySex),
    new ActionRowBuilder().addComponents(
      showNonTakenNames,
      showNonTakenNamesBySex
    ),
    new ActionRowBuilder().addComponents(showCommands),
  ];

  return content;
}

client.login(token);
