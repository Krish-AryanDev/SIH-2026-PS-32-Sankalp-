const mongoose = require("mongoose")

const farmerSchema = new mongoose.Schema({
    farmerID : {
        type : String,
        required : true,
        unique : true,
        match : /^[0-9]{11}$/
    },

    Name : {
        type : String,
        required : true,

    },

    phoneNumber : {
        type : String,
        required : true,
        unique : true,
        match : /^[0-9]{10}$/
    },

    AadharNumber : {
        type : String,
        required : true,
        unique : true,
        match : /^[0-9]{12}$/
    },

    city : {
        type : String,
        required : true,
    },

    state : {
        type : String,
        required : true,
    },

    pincode : {
        type : String,
        required : true,
        match : /^[0-9]{6}$/
    }

})

const farmerModel = mongoose.model("Farmers", farmerSchema)

module.exports = farmerModel

