const express = require("express")
const router = express.Router()

const appController = require('../controllers/app.controller')

router.post("/sign-up", appController.signUp)
router.get("/login",appController.login)
router.get("/",appController.Hello)

module.exports = router