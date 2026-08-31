const express = require("express")
const { testFunction } = require("../controller/test.controller")

const router = express.Router()

router.post("/test", testFunction)

module.exports = router