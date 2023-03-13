const mongoose = require('mongoose');

const appSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    isActive: { type: Boolean, required: true },
    createdBy: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('App', appSchema);