const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema(
    {
        farm: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Farm",
            required: true,
        },
        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        variety: {
            type: String,
            trim: true,
        },
        plantingDate: {
            type: Date,
        },
        expectedHarvestDate: {
            type: Date,
        },
        growthStage: {
            type: String,
            enum: [
                "planned",
                "seedling",
                "vegetative",
                "flowering",
                "harvesting",
                "harvested",
            ],
            default: "planned",
        },
        area: {
            type: Number,
            min: 0,
        },
        status: {
            type: String,
            enum: ["active", "completed", "cancelled"],
            default: "active",
        },
        treatments: [
            {
                name: { type: String, required: true },
                date: { type: Date, default: Date.now },
                notes: String,
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Crop", cropSchema);