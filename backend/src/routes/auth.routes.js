const express = require("express")
const { registerFarmer } = require("../controller/auth.controller")

const router = express.Router()

router.post("/register", registerFarmer);

module.exports = router