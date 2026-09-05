require("dotenv").config()

const app = require("./src/app")
const connectDB = require("./src/client/db/db")

connectDB()

const Port = 5000;

app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`)
})