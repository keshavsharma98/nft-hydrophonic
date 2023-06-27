const express = require("express")
const app = express()

require('dotenv').config()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const bookRouter = require('./routes/app.router')

app.use(bookRouter)

app.listen(process.env.PORT, () => console.log("Server is running on port 3000"))