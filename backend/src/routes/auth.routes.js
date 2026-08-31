const express = require("express")
const { registerFarmer , verifyOTP } = require("../controller/auth.controller")

const router = express.Router()

router.get("/register", registerFarmer);
router.get("/verify-otp", verifyOTP);

module.exports = router