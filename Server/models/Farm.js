const mongoose = require("mongoose");

const farmSchema = new mongoose.Schema(
    {
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
        location: {
            address: {
                type: String,
                required: true,
            },
            city: String,
            state: String,
            pincode: String,
        },
        size: {
            type: Number,
            required: true,
            min: 0,
        },
        sizeUnit: {
            type: String,
            enum: ["acre", "hectare"],
            default: "acre",
        },
        soilType: {
            type: String,
            trim: true,
        },
        irrigationType: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Farm", farmSchema);