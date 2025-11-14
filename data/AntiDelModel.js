const mongoose = require('mongoose');

const AntiDeleteSchema = new mongoose.Schema({
    id: {
        type: Number,
        default: 1,
        required: true,
        unique: true,
    },
    status: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('AntiDelete', AntiDeleteSchema);
