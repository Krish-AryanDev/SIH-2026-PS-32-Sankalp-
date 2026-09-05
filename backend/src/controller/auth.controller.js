const farmerModel = require("../models/farmer.model")
const otpModel = require("../models/otp.model")
const jwt = require("jsonwebtoken")

{/*  This function generates OTP*/}

const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString(); // Generates a 4-digit OTP
}

{/* This function is connected to to /register route and checks if the userData is present in the database and sends them OTP for verification*/}

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

            const phoneNumber = existingFarmer.phoneNumber;
            const otp = generateOTP();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

            await otpModel.findOneAndUpdate(
                { phoneNumber },
                {
                    otp,
                    expiresAt
                },
                {
                    upsert: true,
                    returnDocument: 'after'
                }
            );

            /*await smsProvider.send(phoneNumber, `Your OTP is: ${otp}. It will expire in 5 minutes.`); */

            

            return res.status(200).json({
                message: "otp sent successfully",
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

{/* This function is connected to /verify-otp route and verifies OTP*/}

const verifyOTP = async (req, res) => {
    try{
        const { phoneNumber, otp } = req.body

        if(!phoneNumber || !otp){
            return res.status(400).json({
                message: "phoneNumber and otp are required",
                success: false
            })
        }

        const existingOTP = await otpModel.findOne({phoneNumber, otp})

        if(!existingOTP){
            return res.status(400).json({
                message: "OTP is invalid or expired",
                success: false
            })
        }

        await otpModel.deleteOne({phoneNumber, otp}) // Delete the OTP after successful verification

        return res.status(200).json({
            message: "otp verified successfully",
            success: true
        })

    }catch (e) {
        res.status(500).json({
            message: "Error verifying OTP",
            error: e.message
        })
    }
}

module.exports = { registerFarmer , verifyOTP }