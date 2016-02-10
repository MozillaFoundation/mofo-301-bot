# 301 Bot

This IRC bot waits in a specific set of channels for new users to join. When they do, it checks whether or not it has encountered them in the past 30 days. If it has not, it will inform them that Mozilla Foundation activities and communication are now being conducted on a Mattermost instance.

## Environment settings

Variable | Purpose
---------|--------
REDIS_URL | Connection string to a Redis instance
IRC_SERVER | Hostname of the IRC server to connect to, i.e. irc.mozilla.org
NICK | Nick that the bot will use
CHANNEL_LIST | A list of channels to join, space separated. i.e "#one #two"
IRC_PORT | The port to connect to on the IRC host
SECURE_CONNECTION | set to true to connect using SSL