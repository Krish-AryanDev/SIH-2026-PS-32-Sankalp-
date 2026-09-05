const express = require("express")
const { registerFarmer, verifyOTP, getMe } = require("../controller/auth.controller")
const authMiddleware = require("../middlewares/auth.middleware")

const router = express.Router()

router.post("/register", registerFarmer);
router.post("/verify-otp", verifyOTP);
router.get("/me", authMiddleware, getMe);

module.exports = router