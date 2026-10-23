const Crop = require("../models/Crop");
const Farm = require("../models/Farm");

const createCrop = async (req, res) => {
    try {
        const { farm, name } = req.body;

        if (!farm || !name) {
            return res.status(400).json({
                success: false,
                message: "Farm ID and crop name are required",
            });
        }

        const farmExists = await Farm.findOne({
            _id: farm,
            farmer: req.user._id,
        });

        if (!farmExists) {
            return res.status(404).json({
                success: false,
                message: "Farm not found",
            });
        }

        const crop = await Crop.create({
            ...req.body,
            farm,
            farmer: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: "Crop created successfully",
            crop,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getCrops = async (req, res) => {
    try {
        const crops = await Crop.find({ farmer: req.user._id })
            .populate("farm", "name");

        res.json({
            success: true,
            count: crops.length,
            crops,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updateCrop = async (req, res) => {
    try {
        const crop = await Crop.findOneAndUpdate(
            { _id: req.params.id, farmer: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!crop) {
            return res.status(404).json({
                success: false,
                message: "Crop not found",
            });
        }

        res.json({
            success: true,
            message: "Crop updated successfully",
            crop,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteCrop = async (req, res) => {
    try {
        const crop = await Crop.findOneAndDelete({
            _id: req.params.id,
            farmer: req.user._id,
        });

        if (!crop) {
            return res.status(404).json({
                success: false,
                message: "Crop not found",
            });
        }

        res.json({
            success: true,
            message: "Crop deleted successfully",
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createCrop,
    getCrops,
    updateCrop,
    deleteCrop,
};