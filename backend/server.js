const app = require("./src/app")

const Port = 5000;

app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`)
})