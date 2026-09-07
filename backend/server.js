require("dotenv").config()

const app = require("./src/app")
const connectDB = require("./src/db/db")
const supabaseConnection = require("./src/db/supabase_connect")

connectDB()

const Port = 5000;

app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`)
})