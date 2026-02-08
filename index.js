require('dotenv').config();
process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot is online!");
});

app.listen(PORT, () => {
  console.log(`Webserver draait op poort ${PORT}`);
});

const {
Client,
GatewayIntentBits,
Partials,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
StringSelectMenuBuilder,
ChannelType,
PermissionFlagsBits,
REST,
Routes,
SlashCommandBuilder,
EmbedBuilder,
Events
} = require("discord.js");

const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const CLIENT_ID = process.env.CLIENT_ID;

/* ================= CONFIG ================= */

const CATEGORY_PREFIX = {
vragen: '🟢-vraag',
solliciteren: '🔵-sollicatie',
klachten: '🔴-klacht',
ally: '🟣-ally',
wapen_inkoop_verkoop: '🟤-Wapens-inkoop/verkoop'
};

const CATEGORY_PARENTS = {
vragen: '1379125690166677656',
solliciteren: '1379125835298242620',
klachten: '1379125937798647818',
ally: '1451603709636378644'
};

const STAFF_ROLES = {
vragen: '1451252906908057611',
solliciteren: '1426262480761524335',
klachten: '1451307494205952122',
ally: '1364330989769330688'
};

const QUESTIONS = {
solliciteren: [
'1. Wat is je naam?',
'2. Wat is je leeftijd?',
'3. Wat is je Motivatie -# ( Minimaal 30 woorden )?',
'4. Waarom Specifiek Bloody Angels?',
'5. 3 Plus Punten',
'6. 2 Minpunten',
'7. Ken je de Apv?',
'8. Heb je ervaringen? -# zo ja, welke Gang en in welke Steden?'
],
vragen: ['Wat is je vraag?'],
klachten: ['Tegen wie is de klacht?','Wat is er gebeurd?','Heb je bewijs?'],
ally: ['Naam van de server?','Hoeveel leden?','Invite link?'],
wapen_inkoop_verkoop: ['Wat is je naam?','Welke Wapen(s) wil je Kopen/Verkopen?','Wat is jou budget/prijs?']
};

/* ================= CLIENT ================= */

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.DirectMessages,
GatewayIntentBits.MessageContent
],
partials: [Partials.Channel, Partials.Message, Partials.User]
});

/* ================= READY ================= */

client.once(Events.ClientReady, () => {
console.log(`${client.user.tag} is online!`);
});

/* ================= SLASH COMMANDS ================= */

const commands = [
new SlashCommandBuilder().setName('ticket').setDescription('Plaats het ticket panel'),
new SlashCommandBuilder().setName('add').setDescription('Voeg een gebruiker toe aan dit ticket')
.addUserOption(opt => opt.setName('user').setDescription('Gebruiker om toe te voegen').setRequired(true)),
new SlashCommandBuilder().setName('remove').setDescription('Verwijder een gebruiker van dit ticket')
.addUserOption(opt => opt.setName('user').setDescription('Gebruiker om te verwijderen').setRequired(true)),
new SlashCommandBuilder().setName('close').setDescription('Sluit het ticket')
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
console.log('Slash commands geregistreerd');
})();

/* ================= INTERACTIONS ================= */

client.on(Events.InteractionCreate, async interaction => {

const guild = interaction.guild;
const channel = interaction.channel;
const user = interaction.user;

/* /ticket */

if (interaction.isChatInputCommand() && interaction.commandName === 'ticket') {

const embed = new EmbedBuilder()
.setTitle('🎫 Bloody – Tickets')
.setDescription(
`Beste Criminelen van **Vertex Roleplay**, hier ben je aan het juiste adres om vragen aan ons kader team te stellen.

Druk op de knop onder dit bericht om een ticket te openen!
Selecteer de categorie die het beste past bij jouw vraag. Als de gewenste categorie er niet bij staat, overwegen we deze mogelijk later toe te voegen.

**📋 Beschikbare Categorieën:**
🔹 Vragen
🔹 Solliciteren
🔹 Klachten
🔹 Ally Aanvraag
🔹 Wapen Inkoop/Verkoop

Kies voor nu de meest geschikte categorie!`
)
.setColor(0x8B0000)
.setThumbnail('https://image2url.com/r2/default/images/1769799269156-7e853847-4259-4739-bb94-78956ed43a97.png')
.setFooter({ text:'Bloody Roleplay', iconURL:'https://image2url.com/r2/default/images/1769799269156-7e853847-4259-4739-bb94-78956ed43a97.png'})
.setTimestamp();

const buttonRow = new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId('ticket_open').setLabel('Open ticket').setStyle(ButtonStyle.Primary)
);

await interaction.reply({ content:'✅ Ticket panel geplaatst.', ephemeral:true });
return interaction.channel.send({ embeds:[embed], components:[buttonRow] });

}

/* BUTTON OPEN */

if (interaction.isButton() && interaction.customId === 'ticket_open') {

const embed = new EmbedBuilder()
.setTitle('📂 Selecteer een categorie')
.setDescription(
`Kies hieronder de categorie die het beste past bij jouw ticket.

⚠️ Let op:
- Je ontvangt eerst een vragenlijst in DM
- Daarna wordt je ticket aangemaakt`
)
.setColor(0x8B0000)
.setThumbnail('https://image2url.com/r2/default/images/1769799269156-7e853847-4259-4739-bb94-78956ed43a97.png')
.setFooter({ text:'Bloody Angels', iconURL:'https://image2url.com/r2/default/images/1769799269156-7e853847-4259-4739-bb94-78956ed43a97.png'});

const selectRow = new ActionRowBuilder().addComponents(
new StringSelectMenuBuilder()
.setCustomId('ticket_select')
.setPlaceholder('📋 Selecteer een categorie')
.addOptions([
{ label:'Vragen', value:'vragen', emoji:'🟢' },
{ label:'Solliciteren', value:'solliciteren', emoji:'🔵' },
{ label:'Klachten', value:'klachten', emoji:'🔴' },
{ label:'Ally Aanvraag', value:'ally', emoji:'🟣' },
{ label:'Wapen Inkoop/Verkoop', value:'wapen_inkoop_verkoop', emoji:'🟤' }
])
);

return interaction.reply({ embeds:[embed], components:[selectRow], ephemeral:true });

}

/* SELECT MENU */

if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {

await interaction.deferReply({ ephemeral:true });

const category = interaction.values[0];
const answers = [];
const dm = await user.createDM();

await dm.send({ embeds:[
new EmbedBuilder()
.setTitle('📋 Ticket vragenlijst')
.setDescription('Beantwoord de volgende vragen één voor één.')
.setColor(0x5865F2)
]});

for (const question of QUESTIONS[category]) {
await dm.send(`**${question}**`);
const collected = await dm.awaitMessages({ filter:m=>m.author.id===user.id, max:1, time:300000 });
if (!collected.size) return interaction.editReply({ content:'❌ Geen antwoord ontvangen.' });
answers.push(collected.first().content);
}

const ticketChannel = await guild.channels.create({
name: `${CATEGORY_PREFIX[category]}-${user.username}`.toLowerCase(),
type: ChannelType.GuildText,
parent: CATEGORY_PARENTS[category],
permissionOverwrites: [
{ id:guild.id, deny:[PermissionFlagsBits.ViewChannel]},
{ id:user.id, allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory]},
{ id:STAFF_ROLES[category], allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory]}
],
topic:`ticketOwner:${user.id}`
});

const catEmbed = new EmbedBuilder()
.setTitle(`Welkom <@${user.id}>!`)
.setDescription(
`Welkom in je ticket! Wacht geduldig op een antwoord.

**De Regels**
- Niet schelden
- Niet spammen
- Niet taggen of replyen

**Ticket info**
• Ticket categorie: **${category}**
• Geopend door: <@${user.id}>
• Gemaakt op: <t:${Math.floor(Date.now()/1000)}:F>`
)
.setColor(0x5865F2);

const closeRow = new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId('ticket_close').setLabel('Sluit ticket').setStyle(ButtonStyle.Danger)
);

const answersEmbed = new EmbedBuilder()
.setTitle('📋 Antwoorden vragenlijst')
.setColor(0x57F287)
.setFooter({ text:`Ingezonden door ${user.tag}` });

QUESTIONS[category].forEach((q,i)=>answersEmbed.addFields({name:q,value:answers[i]||'Geen antwoord'}));

await ticketChannel.send({ embeds:[catEmbed], components:[closeRow] });
await ticketChannel.send({ embeds:[answersEmbed] });

const confirmEmbed = new EmbedBuilder()
.setTitle('✅ Vragenlijst verzonden')
.setDescription(`Bedankt voor het invullen van de vragenlijst!\n\nJe ticket is succesvol aangemaakt: ${ticketChannel}`)
.setColor(0x57F287)
.setFooter({ text:'Bloody Angels' });

await dm.send({ embeds:[confirmEmbed] });
return interaction.editReply({ content:`✅ Ticket aangemaakt: ${ticketChannel}` });

}

/* CLOSE BUTTON */

if (interaction.isButton() && interaction.customId === 'ticket_close') {

const member = interaction.member;
const staffAllowed = Object.values(STAFF_ROLES).some(r=>member.roles.cache.has(r));
if(!staffAllowed) return interaction.reply({ content:'❌ Je hebt geen permissie.', ephemeral:true });

await interaction.deferUpdate();
await interaction.channel.delete().catch(()=>null);

}

});
client.login(process.env.TOKEN)
  .then(() => console.log("Login gestart..."))
  .catch(console.error);
