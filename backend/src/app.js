const express = require("express")
const testModel = require("./models/test.model")


const app = express()

app.use(express.json())

app.post("/test", async(req, res) => {
    const { title, description } = req.body

    testModel.create({ title : title, description: description })

    res.status(201).json({
        message: "Test created successfully"
    })
})

module.exports = app