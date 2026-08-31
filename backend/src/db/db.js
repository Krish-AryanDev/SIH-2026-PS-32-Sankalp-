const mongoose = require("mongoose")
const MONGO_URI = process.env.MONGO_URI

async function connectDB(){
    try {
        await mongoose.connect(`${MONGO_URI}/SIH2026-PS-32`)
        console.log("Database connected successfully")
    }
    catch(e){
        console.log(e)
    }
}

module.exports = connectDB