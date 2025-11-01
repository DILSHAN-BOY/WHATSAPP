const mongoose = require('mongoose');

/** ─── ENV VARS ────────────────────────────────────────────────────────── **/
const envVarSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true }
});
const EnvVar = mongoose.model('EnvVar', envVarSchema);

/** ─── OWNER NUMBERS ────────────────────────────────────────────────────── **/
const ownerSchema = new mongoose.Schema({
    jid: { type: String, required: true, unique: true }
});
const OWNER_NUM = mongoose.model('OWNER_NUM', ownerSchema);

/** ─── PLUGIN FLAGS ────────────────────────────────────────────────────── **/
const pluginSchema = new mongoose.Schema({
    plugin: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: true }
});
const Plugin = mongoose.model('Plugin', pluginSchema);

/** ─── API CONFIG ───────────────────────────────────────────────────────── **/
const apiSchema = new mongoose.Schema({
    service: { type: String, required: true, unique: true },
    url: { type: String, required: true }
});
const API_CONFIG = mongoose.model('API_CONFIG', apiSchema);

/** ─── DB CONNECT & DEFAULTS ────────────────────────────────────────────── **/
const config = require('../config');

const defaultEnvVariables = [
    { key: 'PREFIX', value: '.' },
    { key: 'MODE', value: 'public' },
    { key: 'AUTO_READ_STATUS', value: 'true' },
    { key: 'AUTO_REACT_STATUS', value: 'true' },
    { key: 'LANGUAGE', value: 'sinhala' },
    { key: 'AUTO_REACT', value: 'true' }, 
    { key: 'FAKE_RECORDING', value: 'false' },
    { key: 'AUTO_TYPING', value: 'true' },
    { key: 'ANTI_LINK', value: 'true' },
    { key: 'AUTO_VOICE', value: 'true' },
    { key: 'AUTO_REPLY', value: 'true' },
    { key: 'ANTI_BAD', value: 'true' },
    { key: 'READ_MESSAGE', value: 'true' },
    { key: 'ALWAYS_ONLINE', value: 'true' },
    { key: 'ANTI_DELETE', value: 'true' },
    { key: 'DELETEMSGSENDTO', value: 'none' },
    { key: 'INBOX_BLOCK', value: 'true' },
    { key: 'ANTI_BOT', value: 'false' },
    { key: 'AUTO_TIKTOK', value: 'false' },
    { key: 'AUTO_NEWS_ENABLED', value: 'false' },
    { key: 'SEND_START_NEWS', value: 'false' },
    { key: 'MOVIE_FOOTER', value: '> *𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐬𝐡𝐚𝐬𝐡𝐢𝐤𝐚 𝐝𝐢𝐥𝐬𝐡𝐚𝐧🍃*' },
    { key: 'BOT_NAME', value: '𝐀𝐆𝐍𝐈' },
    { key: 'OWNER_REACT', value: 'true' },
    { key: 'ALIVE_MSG', value: 'AGNI ALIVE NOW. . .' },
    { key: 'ALIVE_IMG', value: 'https://files.catbox.moe/ue4ppc.jpg' },
    { key: 'OWNER_NAME', value: '𝐬𝐡𝐚𝐬𝐡𝐢𝐤𝐚 𝐝𝐢𝐥𝐬𝐡𝐚𝐧' },
    { key: 'OWNER_EMOJI', value: '☣️' },
    { key: 'HEART_REACT', value: 'true' },
    { key: 'OWNER_NUMBER', value: '94772469026' },
    { key: 'MENU_IMG', value: 'https://files.catbox.moe/8bkx4q.jpg' },
];

const defaultAPIs = [
    { service: 'spotify_track', url: 'https://apiskeith.vercel.app/download/spotify?q=' },
    { service: 'spotify_album', url: 'https://apis-starlights-team.koyeb.app/starlight/spotify-albums-list?url=' },
    { service: 'spotify_search', url: 'https://okatsu-rolezapiiz.vercel.app/search/spotify?q=' },
    { service: 'pinterest', url: 'https://apiskeith.vercel.app/download/pinterest?url=' },
    // add more plugin APIs here
];

const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGODB);
        console.log('╰───┄ °❀〽️ MongoDB Connected ✅');

        // Create default env vars
        await Promise.all(defaultEnvVariables.map(async env => {
            const exists = await EnvVar.findOne({ key: env.key });
            if (!exists) await EnvVar.create(env);
        }));

        // Create default APIs
        await Promise.all(defaultAPIs.map(async api => {
            const exists = await API_CONFIG.findOne({ service: api.service });
            if (!exists) await API_CONFIG.create(api);
        }));

        // Sync all env vars to config
        const allVars = await EnvVar.find({});
        allVars.forEach(env => { config[env.key] = env.value });

        console.log('🔄 Config synced from database ✅');

    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

/** ─── OWNER HELPERS ────────────────────────────────────────────────────── **/
const addOwner = async (jid) => {
    return await OWNER_NUM.findOneAndUpdate({ jid }, { jid }, { upsert: true, new: true });
};

const removeOwner = async (jid) => {
    return await OWNER_NUM.deleteOne({ jid });
};

const getOwners = async () => {
    return (await OWNER_NUM.find({})).map(o => o.jid);
};

/** ─── PLUGIN HELPERS ───────────────────────────────────────────────────── **/
const enablePlugin = async (pluginName) => {
    return await Plugin.findOneAndUpdate({ plugin: pluginName }, { enabled: true }, { upsert: true, new: true });
};

const disablePlugin = async (pluginName) => {
    return await Plugin.findOneAndUpdate({ plugin: pluginName }, { enabled: false }, { upsert: true, new: true });
};

const isPluginEnabled = async (pluginName) => {
    const plugin = await Plugin.findOne({ plugin: pluginName });
    return plugin ? plugin.enabled : true; // default enabled
};

/** ─── API HELPERS ──────────────────────────────────────────────────────── **/
const setAPI = async (service, url) => {
    return await API_CONFIG.findOneAndUpdate({ service }, { url }, { upsert: true, new: true });
};

const getAPI = async (service) => {
    const api = await API_CONFIG.findOne({ service });
    return api ? api.url : null;
};

/** ─── EXPORTS ──────────────────────────────────────────────────────────── **/
module.exports = {
    EnvVar,
    OWNER_NUM,
    Plugin,
    API_CONFIG,
    connectDB,
    addOwner,
    removeOwner,
    getOwners,
    enablePlugin,
    disablePlugin,
    isPluginEnabled,
    setAPI,
    getAPI
};
