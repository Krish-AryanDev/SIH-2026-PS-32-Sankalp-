const farmerModel = require("../models/farmer.model")

const registerFarmer = async (req, res) => {
    try{
        const { userData } = req.body /* userData can be farmerID or AadharNumber */

        if(!userData){
            return res.status(400).json({
                message: "userData is required"
            })
        }

        let existingFarmer = null;
        if(/^\d{11}$/.test(userData)){
            // farmerID
            existingFarmer = await farmerModel.findOne({ farmerID: userData })

        }else if(/^\d{12}$/.test(userData)){
            // AadharNumber
            existingFarmer = await farmerModel.findOne({ AadharNumber: userData })
        }else {
            return res.status(400).json({
                message: "Invalid userData format. It should be either 11-digit farmerID or 12-digit AadharNumber."
            })
        }

        if(existingFarmer){
            return res.status(200).json({
                message: "Farmer is present in the database",
                present: true
            })
        }else{
            return res.status(200).json({
                message: "Farmer is not present in the database",
                present: false
            })
        }
    }catch(e) {
        res.status(500).json({
            message: "Error registering farmer",
            error: e.message
        })
    }
}

module.exports = { registerFarmer }