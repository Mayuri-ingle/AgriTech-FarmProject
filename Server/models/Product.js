const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            enum: [
                "seeds",
                "fertilizer",
                "pesticide",
                "equipment",
                "other",
            ],
            required: true,
        },
        description: {
            type: String,
            trim: true,
        },
        brand: {
            type: String,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        unit: {
            type: String,
            default: "piece",
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        imageUrl: {
            type: String,
            trim: true,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);