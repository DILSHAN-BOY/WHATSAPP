const mongoose = require('mongoose');

const envVarSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true }
});

const EnvVar = mongoose.model('EnvVar', envVarSchema);

// Function to get all environment variables
const readEnv = async () => {
    try {
        const envVars = await EnvVar.find({});
        const envVarObject = {};
        envVars.forEach(envVar => {
            envVarObject[envVar.key] = envVar.value;
        });
        return envVarObject;
    } catch (err) {
        console.error('Error retrieving environment variables:' + err.message);
        throw err;
    }
};

// Function to update an environment variable
const updateEnv = async (key, newValue) => {
    try {
        const result = await EnvVar.findOneAndUpdate(
            { key: key },
            { value: newValue },
            { new: true, upsert: true }
        );

        console.log(`Updated ${key} to ${newValue}`);
        return result;
    } catch (err) {
        console.error('Error updating environment variable:' + err.message);
        throw err;
    }
};

// ✅ Export everything in one object
module.exports = {
    EnvVar,
    readEnv,
    updateEnv
};
