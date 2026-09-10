const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware")
const router = express.Router()
const { slot , check_availability, book, get_active_pass, cancel_booking } = require("../controller/slot.controller")

router.get("/slot",authMiddleware,slot);
router.get("/can_book",authMiddleware,check_availability);
router.get("/active_pass",authMiddleware,get_active_pass);
router.post("/book",authMiddleware,book);
router.post("/cancel",authMiddleware,cancel_booking);

module.exports = router;