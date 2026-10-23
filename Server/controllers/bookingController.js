const Booking = require("../models/Booking");

const createBooking = async (req, res) => {
    try {
        const { bookingType, title, scheduledDate } = req.body;

        if (!bookingType || !title || !scheduledDate) {
            return res.status(400).json({
                success: false,
                message: "Booking type, title and scheduled date are required",
            });
        }

        const booking = await Booking.create({
            ...req.body,
            user: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            user: req.user._id,
        }).populate("farm", "name");

        res.json({
            success: true,
            count: bookings.length,
            bookings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updateBooking = async (req, res) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        res.json({
            success: true,
            message: "Booking updated successfully",
            booking,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        res.json({
            success: true,
            message: "Booking deleted successfully",
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createBooking,
    getBookings,
    updateBooking,
    deleteBooking,
};