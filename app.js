/*
    Example .env file for bot configuration

    // Discord Bot Token API Key
    BOT_TOKEN=

    // Channel in which bot will auto-delete messages
    CHANNEL_ID=

    // If true, messages are deleted every minute. For testing and development purposes
    DEV_MODE=false

    // Delete messages after specified amount of time in hours
    PURGE_AGE=24

*/

// Module to safely handle Discord's token functionality
require('dotenv').config(); 

// Development Mode: If true, messages are deleted every minute
const dev_mode = process.env.DEV_MODE;

// Purge Age: Delete messages after 'x' amount of hours
const purge_age_hours = process.env.PURGE_AGE;

/* Determines message age before auto-deletion */ 
function purgeAgeInMs() {
    if (dev_mode) {
        return 60000; // Delete messages after 60 seconds
    }

    if(!purge_age_hours) {
        throw new Error('purge_age error. please input amount of hours before message deletion.');
    }

    const ms_in_hour = 60 * 60 * 1000;
    const total_ms = purge_age_hours * ms_in_hour;

    return total_ms;
}

/* Returns a string of the age set for message auto-deletion */
function printTimer() {
    if(dev_mode === 'true' || dev_mode === 'TRUE') {
        return '60s';
    }
    if(dev_mode === 'false' || dev_mode === 'FALSE') {
        return `${purge_age_hours}h`;
    }
}

/* Announce bot activation in specified auto-delete channel */
function onAliveAnnounce() {
    const channelId = process.env.CHANNEL_ID;
    const channel = client.channels.cache.get(channelId);

    if (channel && channel.isTextBased()) {
        channel.send('Bot is now online!');
        channel.send('Cleanup crew activated.');
        if(dev_mode === 'false' || dev_mode === 'FALSE'){ 
            channel.send(`Messages will auto-delete after ${purge_age_hours} hours.`);
        }
        else if (dev_mode === 'true' || dev_mode === 'TRUE') { 
            channel.send('Development mode is on.');
            channel.send('Messages will be deleted after 1 minute.');
        }
        else {
            channel.send('Configuration error. Shutting down!');
            throw new Error('dev_mode error. value not set to true or false.');
        }
    } else {
        console.error('Channel not found or not text-based.');
    }
}

/* Set bot status on activation */
function onAliveSetStatus() {
    client.user.setPresence({
        activities: [{
            name: "the time..", // You can set a custom status message here
            type: ActivityType.Watching // Can be one of: Playing, Streaming, Listening, Watching, Competing
        }],
        status: 'online' // online, idle, dnd, or invisible
    });

    client.user.setActivity(`Auto-delete timer: ${printTimer()}`, { type: ActivityType.Custom });
}

/* Discord.JS code below */
// Set up client
const { Client, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
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

// Set this to the ID of the channel to be monitored for purging
const CHANNEL_ID = process.env.CHANNEL_ID;

// Runs on bot activation
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    setInterval(deleteOldMessages, 60000); // Check every minute (60000 ms)
    onAliveAnnounce(); // Announce bot presence in channel
    onAliveSetStatus();
});

// Runs on each message sent in channel
client.on('messageCreate', message => {
    if (message.guild && message.channelId === CHANNEL_ID) {
        // Store message id with the timestamp when it should be deleted
        messagesToDelete.set(message.id, message.createdTimestamp + purgeAgeInMs()); // 60 seconds * 1000 for ms
    }
});

// Add timer to message and delete if old
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

// Bot token from Discord Developer Portal
client.login(process.env.BOT_TOKEN);