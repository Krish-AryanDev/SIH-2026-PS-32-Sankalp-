const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware")
const router = express.Router()
const { slot , check_availability,book} = require("../controller/slot.controller")

router.get("/slot",authMiddleware,slot);
router.get("/can_book",authMiddleware,check_availability);
router.post("/book",authMiddleware,book);

module.exports = router;