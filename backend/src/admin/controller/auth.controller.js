const adminModel = require("../models/admin.model");
const jwt = require("jsonwebtoken");

/**
 * Admin Login
 * Validates email, password, and centerCode using plain text comparison and returns JWT token
 */
const loginAdmin = async (req, res) => {
    try {
        const { email, password, centerCode } = req.body;

        if (!email || !password || !centerCode) {
            return res.status(400).json({
                message: "Email, password, and centerCode are required",
                success: false
            });
        }

        // Find admin matching email and centerCode
        const admin = await adminModel.findOne({
            email: email.toLowerCase().trim(),
            centerCode: centerCode.trim()
        });

        if (!admin) {
            return res.status(401).json({
                message: "Invalid email, center code, or password",
                success: false
            });
        }

        // Plain text password comparison
        if (admin.password !== password) {
            return res.status(401).json({
                message: "Invalid email, center code, or password",
                success: false
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: admin._id,
                email: admin.email,
                centerCode: admin.centerCode
            },
            process.env.JWT_SECRET,
            { expiresIn: "12h" }
        );

        return res.status(200).json({
            message: "Admin logged in successfully",
            success: true,
            token,
            admin: {
                id: admin._id,
                email: admin.email,
                centerCode: admin.centerCode
            }
        });

    } catch (e) {
        return res.status(500).json({
            message: "Error during admin login",
            error: e.message,
            success: false
        });
    }
};

module.exports = { loginAdmin };
