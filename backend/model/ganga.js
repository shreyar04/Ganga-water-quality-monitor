const mongoose = require("mongoose");

const WaterQualitySchema = new mongoose.Schema({
    STATION_CODE: {
        type: String,
        required: true,
    },
    LOCATIONS: {
        type: String,
        required: true,
    },
    STATE: {
        type: String,
        required: true,
    },
    TEMP: {
        type: Number,
        required: true,
    },
    DO: {
        // Dissolved Oxygen
        type: Number,
        required: true,
    },
    pH: {
        type: Number,
        required: true,
    },
    CONDUCTIVITY: {
        type: Number,
        required: true,
    },
    BOD: {
        // Biochemical Oxygen Demand
        type: Number,
        required: true,
    },
    NITRATE_N_NITRITE_N: {
        type: Number,
        required: true,
    },
    FECAL_COLIFORM: {
        type: Number,
        required: true,
    },
    TOTAL_COLIFORM: {
        type: Number,
        required: true,
    },
    DATE: {
        type: Date,
        required: true,
    },
});

// Create model
const WaterQuality = mongoose.model("WaterQuality", WaterQualitySchema);

module.exports = WaterQuality;
