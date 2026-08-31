const express = require("express")
const { registerFarmer } = require("../controller/auth.controller")

const router = express.Router()

router.get("/register", registerFarmer);

module.exports = router