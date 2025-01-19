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
console.log('Environment Variables:', {
    DEV_MODE: process.env.DEV_MODE,
    PURGE_AGE: process.env.PURGE_AGE
});

// Development Mode: If true, messages are deleted every minute
const dev_mode = process.env.DEV_MODE === 'true' || process.env.DEV_MODE === 'TRUE';

// Purge Age: Delete messages after 'x' amount of hours
const purge_age_hours = parseInt(process.env.PURGE_AGE, 10);

if (!Number.isInteger(purge_age_hours) || purge_age_hours < 1) {
    throw new Error('PURGE_AGE must be a positive integer.');
}

/* Determines message age before auto-deletion */ 
function purgeAgeInMs() {
    console.log('Purge Age in ms:', purgeAgeInMs());
    return dev_mode ? 60000 : (purge_age_hours * 60 * 60 * 1000);
}

/* Returns a string of the age set for message auto-deletion */
function printTimer() {
    return dev_mode ? '60s' : `${purge_age_hours}h`;
}

/* Announce bot activation in specified auto-delete channel */
async function onAliveAnnounce(channelId) {
    const channel = client.channels.cache.get(channelId);

    if (channel && channel.isTextBased()) {
        try {
            await channel.send('Bot is now online!');
            await channel.send('Cleanup crew activated.');
            await channel.send(`Messages will auto-delete after ${dev_mode ? '1 minute' : `${purge_age_hours} hours`}.`);
        } catch (error) {
            console.error('Failed to announce bot activation:', error);
        }
    } else {
        console.error('Channel not found or not text-based.');
    }
}

/* Set bot status on activation */
function onAliveSetStatus() {
    client.user.setPresence({
        activities: [{
            name: "the time..",
            type: ActivityType.Watching 
        }],
        status: 'online' 
    });

    client.user.setActivity(`Clean-up timer: ${printTimer()}`, { type: ActivityType.Custom });
}

/* Discord.JS code below */
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

// Logger setup for better error logging
const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Runs on bot activation
client.once('ready', async () => {
    logger.info(`Logged in as ${client.user.tag}`);
    await onAliveAnnounce(CHANNEL_ID);
    setInterval(deleteOldMessages, 60000); // Check every minute (60000 ms)
    onAliveSetStatus();
});

// Runs on each message sent in channel
client.on('messageCreate', message => {
    if (message.guild && message.channelId === CHANNEL_ID) {
        const deleteAt = message.createdTimestamp + purgeAgeInMs();
        console.log('Message ID:', message.id, 'Will Delete At:', new Date(deleteAt));
        messagesToDelete.set(message.id, deleteAt);
    }
});

// Add timer to message and delete if old
async function deleteOldMessages() {
    const now = Date.now();
    console.log('Current Time:', now);
    console.log('Next Check:', now + 60000); // Since it runs every minute
    for (const [messageId, deleteTimestamp] of messagesToDelete) {
        if (now > deleteTimestamp) {
            const channel = client.channels.cache.get(CHANNEL_ID);
            if (channel) {
                try {
                    const msg = await channel.messages.fetch(messageId);
                    await msg.delete();
                    messagesToDelete.delete(messageId);
                    logger.info(`Deleted message ${messageId}`);
                } catch (error) {
                    if (error.code === 10008) { // Message not found
                        messagesToDelete.delete(messageId);
                    } else {
                        logger.error(`Failed to delete message ${messageId}:`, error);
                    }
                }
            }
        }
    }

    // Clean up the Map once a day to handle potential memory leaks
    if (now % 86400000 < 60000) { // Once every 24 hours, within the first minute
        cleanUpMessagesToDelete();
    }
}

function cleanUpMessagesToDelete() {
    const oneWeekAgo = Date.now() - 604800000; // 7 days in milliseconds
    const toDelete = [];
    for (const [messageId, deleteTimestamp] of messagesToDelete) {
        if (deleteTimestamp < oneWeekAgo) {
            toDelete.push(messageId);
        }
    }
    toDelete.forEach(messageId => messagesToDelete.delete(messageId));
    logger.info(`Cleaned up ${toDelete.length} old messages from memory.`);
}

// Bot token from Discord Developer Portal
client.login(process.env.BOT_TOKEN);