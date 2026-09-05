const mongoose = require("mongoose")

const otpSchema = new mongoose.Schema({
    phoneNumber : {
        type : String,
        required : true,
        unique : true,
        match : /^[0-9]{10}$/
    },

    otp : {
        type : String,
        required : true,
    },

    expiresAt : {
        type : Date,
        required : true,
        index : { expires: 0 }
    }

})

const otpModel = mongoose.model("Otp", otpSchema)

module.exports = otpModel