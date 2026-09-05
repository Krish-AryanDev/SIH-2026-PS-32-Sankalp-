const express = require("express")
const cors = require("cors")
const testRoutes = require("./client/routes/test.routes")
const authRoutes = require("./client/routes/auth.routes")


const app = express()
app.use(cors())
app.use(express.json())

app.use("/api", testRoutes)
app.use("/api/auth" , authRoutes)

module.exports = app