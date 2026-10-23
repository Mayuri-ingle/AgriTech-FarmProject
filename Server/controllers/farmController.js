const Farm = require("../models/Farm");

const createFarm = async (req, res) => {
    try {
        const farm = await Farm.create({
            ...req.body,
            farmer: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: "Farm created successfully",
            farm,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getFarms = async (req, res) => {
    try {
        const farms = await Farm.find({ farmer: req.user._id });

        res.json({
            success: true,
            count: farms.length,
            farms,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getFarmById = async (req, res) => {
    try {
        const farm = await Farm.findOne({
            _id: req.params.id,
            farmer: req.user._id,
        });

        if (!farm) {
            return res.status(404).json({
                success: false,
                message: "Farm not found",
            });
        }

        res.json({ success: true, farm });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const updateFarm = async (req, res) => {
    try {
        const farm = await Farm.findOneAndUpdate(
            { _id: req.params.id, farmer: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!farm) {
            return res.status(404).json({
                success: false,
                message: "Farm not found",
            });
        }

        res.json({
            success: true,
            message: "Farm updated successfully",
            farm,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteFarm = async (req, res) => {
    try {
        const farm = await Farm.findOneAndDelete({
            _id: req.params.id,
            farmer: req.user._id,
        });

        if (!farm) {
            return res.status(404).json({
                success: false,
                message: "Farm not found",
            });
        }

        res.json({
            success: true,
            message: "Farm deleted successfully",
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createFarm,
    getFarms,
    getFarmById,
    updateFarm,
    deleteFarm,
};