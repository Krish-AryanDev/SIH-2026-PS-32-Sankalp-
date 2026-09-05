const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    email : {
        required : true,
        type : String,
        unique : true,
        lowercase : true
    },

    password : {
        required : true,
        type : String
    },

    centerCode : {
        required : true,
        type : String,
        unique : true
    }
    
});

const adminModel = mongoose.model("Admin", adminSchema);

module.exports = adminModel;