const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    id: { type: String,
         required: true 
        },
    description: {
        type:String
    },
    duration: {
        type: Number
    },
    date: {
        type: Date,
        get: (date) => date.toDateString()
    }
})

module.exports = mongoose.model('Exercise', exerciseSchema);