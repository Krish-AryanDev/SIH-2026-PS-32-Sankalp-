const mongoose = require("mongoose")

const testSchema = new mongoose.Schema({
    title : String,
    description : String
})

const testModel = mongoose.model("Test", testSchema)

module.exports = testModel