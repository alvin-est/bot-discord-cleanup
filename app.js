// Initialize dotenv
// Module to safely handle Discord's token functionality
require('dotenv').config(); 

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

// Store messages to be deleted
const messagesToDelete = new Map();

// Replace 'CHANNEL_ID' with the ID of the channel you want to monitor
const CHANNEL_ID = process.env.CHANNEL_ID;

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    setInterval(deleteOldMessages, 3600000); // Check every hour (3600000 ms)
});

client.on('messageCreate', message => {
    if (message.guild && message.channelId === CHANNEL_ID) {
        // Store message id with the timestamp when it should be deleted
        messagesToDelete.set(message.id, message.createdTimestamp + 86400000); // 86400 seconds in a day * 1000 for ms
    }
});

function deleteOldMessages() {
    const now = Date.now();
    messagesToDelete.forEach((deleteTimestamp, messageId) => {
        if (now > deleteTimestamp) {
            const channel = client.channels.cache.get(CHANNEL_ID);
            if (channel) {
                channel.messages.fetch(messageId).then(msg => {
                    msg.delete().then(() => {
                        messagesToDelete.delete(messageId);
                        console.log(`Deleted message ${messageId}`);
                    }).catch(error => {
                        if (error.code === 10008) { // Message not found
                            messagesToDelete.delete(messageId);
                        } else {
                            console.error(`Failed to delete message ${messageId}:`, error);
                        }
                    });
                }).catch(error => {
                    console.error(`Failed to fetch message ${messageId}:`, error);
                });
            }
        }
    });
}

// Replace 'YOUR_BOT_TOKEN' with the actual token from Discord Developer Portal
client.login(process.env.BOT_TOKEN);