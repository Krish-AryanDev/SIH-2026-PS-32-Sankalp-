const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware")
const router = express.Router()
const { slot , check_availability,book} = require("../controller/slot.controller")

router.get("/slot",slot);
router.get("/can_book",check_availability);
router.post("/book",book);

module.exports = router;