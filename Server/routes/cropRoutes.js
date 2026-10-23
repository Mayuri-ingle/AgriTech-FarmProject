const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createCrop,
    getCrops,
    updateCrop,
    deleteCrop,
} = require("../controllers/cropController");

router.use(authMiddleware);

router.post("/", createCrop);
router.get("/", getCrops);
router.put("/:id", updateCrop);
router.delete("/:id", deleteCrop);

module.exports = router;