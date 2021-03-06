async function logMessage (Client, role) {
  const embed = new Client.Discord.MessageEmbed()
    .setTitle('Role Created')
    .setColor(0x00FF00)
    .setTimestamp()
    .addField('Role', `${role.name} (\`${role.id}\`)`);

  if (role.guild.me.hasPermission('VIEW_AUDIT_LOG')) {
    const entry = (await role.guild.fetchAuditLogs({
      type: 'ROLE_CREATE',
      limit: 1
    })).entries.first();

    if (entry) {
      const executor = entry.executor;
      const reason = entry.reason || 'None';

      embed.setAuthor(`${executor.tag} (${executor.id})`, executor.displayAvatarURL())
        .addField('Reason', reason, true);
    }
  }

  return require('../functions/sendlog.js')(Client, embed, role.guild.id);
}

module.exports = (Client, role) => {
  if (!role.guild.available) return;

  logMessage(Client, role);
};
