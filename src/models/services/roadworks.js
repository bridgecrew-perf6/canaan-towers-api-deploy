const mongoose = require('mongoose');

const Roadworks = mongoose.model('Roadworks', { 
    description: {
        type: String,
        required: true,
        trim: true
    },
    carousel: [],
    slider: []
})

module.exports = Roadworks;