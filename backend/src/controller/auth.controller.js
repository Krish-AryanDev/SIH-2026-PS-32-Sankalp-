const farmerModel = require("../models/farmer.model")

const registerFarmer = async (req, res) => {
    try{
        //write ur code here
    }catch(e) {
        res.status(500).json({
            message: "Error registering farmer",
            error: e.message
        })
    }
}

module.exports = { registerFarmer }