async function goodbyeMessage (Client, member) {
  const guild = member.guild;

  const { bool: enabled } = (await Client.sql.query('SELECT bool FROM togglewelcome WHERE guildid = $1 LIMIT 1', [guild.id])).rows[0] || {};
  if (!enabled) return;

  const channelid = (await Client.sql.query('SELECT channel FROM welcomechannel WHERE guildid = $1 LIMIT 1', [guild.id])).rows[0].channel || 'default';

  const channel = channelid === 'default' ? guild.channels.find(c => c.position === 0 && c.type === 'text') : guild.channels.get(channelid);
  if (!channel) return;
  if (!Client.checkClientPerms(channel, 'EMBED_LINKS', 'SEND_MESSAGES')) return;

  const msgRow = (await Client.sql.query('SELECT custommessage FROM goodbyemessages WHERE guildid = $1', [guild.id])).rows[0];
  const msg = msgRow ? msgRow.custommessage
    .replace('<Guild>', guild.name)
    .replace('<User>', member.toString())
    .replace('<MemberCount>', guild.memberCount)
    : `${member} left **${member.guild.name}**. There are ${member.guild.memberCount} members now.`;

  const embed = new Client.Discord.MessageEmbed()
    .setDescription(msg)
    .setColor(0xFF0000)
    .setTimestamp();

  return channel.send(embed);
}

async function logMessage (Client, member) {
  const embed = new Client.Discord.MessageEmbed()
    .setTitle('Member Left or got Kicked')
    .setColor(0xFF0000)
    .setTimestamp()
    .setThumbnail(member.user.displayAvatarURL({ size: 2048 }))
    .setDescription(`**${member.user.tag}** (${member.user.id})`);
  return require('../functions/sendlog.js')(Client, embed, member.guild.id);
}

module.exports = async (Client, member) => {
  if (member === member.guild.me) return;
  if (!member.guild || !member.guild.available) return;
  logMessage(Client, member);
  goodbyeMessage(Client, member);
};
