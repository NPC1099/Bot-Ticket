const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ChannelType, 
  PermissionsBitField,
  SlashCommandBuilder,
  REST,
  Routes
} = require('discord.js');

require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

const commands = [
  new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Envia o painel de tickets')
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Slash command registrado.');
  } catch (error) {
    console.error(error);
  }
})();

client.once('ready', () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {

  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === 'ticket') {

      const button = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('criar_ticket')
          .setLabel('🎫 Criar Ticket')
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({
        content: '🎫 **Sistema de Ticket**\nClique no botão abaixo para abrir um ticket.',
        components: [button]
      });
    }
  }

  if (interaction.isButton()) {

    if (interaction.customId === 'criar_ticket') {

      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ]
          }
        ]
      });

      const closeButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('fechar_ticket')
          .setLabel('🔒 Fechar Ticket')
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({
        content: `🎫 | ${interaction.user}, suporte irá te atender!`,
        components: [closeButton]
      });

      await interaction.reply({
        content: `✅ Seu ticket foi criado: ${channel}`,
        ephemeral: true
      });
    }

    if (interaction.customId === 'fechar_ticket') {
      await interaction.channel.delete();
    }
  }
});

client.login(process.env.TOKEN);
