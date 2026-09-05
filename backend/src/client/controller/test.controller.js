const testModel = require("../models/test.model")

const testFunction = async (req, res) => {
    try {
        const { title, description } = req.body

        await testModel.create({ title : title, description: description })

        res.status(201).json({
            message: "Test created successfully"
        })
    } catch(e) {
        res.status(500).json({
            message: "Error creating test",
            error: e.message
        })
    }
};

module.exports = { testFunction }