const EnvVar = require('./mongodbenv'); // Assuming this is the model for environment variables

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

		if (result) {
			console.log(`Updated ${key} to ${newValue}`);
		} else {
			console.log(`Environment variable ${key} not found`);
		}
	} catch (err) {
		console.error('Error updating environment variable:' + err.message);
		throw err;
	}
};

// Function to set the Anti-Delete status (True/False)
const setAntiDeleteStatus = async (status) => {
    try {
        const result = await EnvVar.findOneAndUpdate(
            { key: 'antidelete' },
            { value: status.toString() }, // Store as string 'true' or 'false'
            { new: true, upsert: true }
        );
        if (result) {
            console.log(`Updated Anti-Delete status to ${status}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error setting Anti-Delete status:', error.message);
        return false;
    }
};

// Function to get the Anti-Delete status
const getAntiDeleteStatus = async () => {
    try {
        const result = await EnvVar.findOne({ key: 'antidelete' });
        if (result) {
            return result.value === 'true'; // Convert back to boolean
        }
        return false; // Default to false if not set
    } catch (error) {
        console.error('Error getting Anti-Delete status:', error.message);
        return false;
    }
};

module.exports = {
	readEnv,
	updateEnv,
    setAntiDeleteStatus,
    getAntiDeleteStatus
};
    
