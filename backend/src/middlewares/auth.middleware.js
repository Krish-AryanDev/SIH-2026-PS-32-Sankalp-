const jwt = require("jsonwebtoken");
const farmerModel = require("../models/farmer.model");

const authMiddleware = async (req, res, next) => {
    try {
        // 1. Check if Authorization header is present
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access denied. No token provided or invalid format.",
                success: false
            });
        }

        // 2. Extract token from 'Bearer <token>'
        const token = authHeader.split(" ")[1];

        // 3. Verify the token using secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Find the farmer from the decoded token ID
        const farmer = await farmerModel.findById(decoded.id).select("-__v");
        if (!farmer) {
            return res.status(404).json({
                message: "Farmer account not found",
                success: false
            });
        }

        // 5. Attach farmer data to request object
        req.farmer = farmer;
        next();

    } catch (e) {
        return res.status(401).json({
            message: "Invalid or expired token",
            error: e.message,
            success: false
        });
    }
};

module.exports = authMiddleware;
