const jwt = require("jsonwebtoken");
const adminModel = require("../models/admin.model");

const adminAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access denied. No token provided or invalid format.",
                success: false
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const admin = await adminModel.findById(decoded.id).select("-password -__v");
        if (!admin) {
            return res.status(404).json({
                message: "Admin account not found",
                success: false
            });
        }

        req.admin = admin;
        next();
    } catch (e) {
        return res.status(401).json({
            message: "Invalid or expired token",
            error: e.message,
            success: false
        });
    }
};

module.exports = adminAuthMiddleware;
