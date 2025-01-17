const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    id: { type: String,
         required: true 
        },

    description: {
        type: String
    },

    duration: {
        type: Number
    },

    date: {
        type: String
    }
}, { versionKey: false }
)

module.exports = mongoose.model('Exercise', exerciseSchema);