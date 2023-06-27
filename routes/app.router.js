const express = require("express")
const router = express.Router()

const appController = require('../controllers/app.controller')
const { app } = require("firebase-admin")
router.get("/",appController.Hello)

router.post("/sign-up", appController.signUp)
router.post("/login",appController.login)
router.put("/update-variables/:id",appController.updateVariables)
router.put("/reset/:id",appController.reset)
router.get("/get-variables/:id",appController.getVariables)
router.post("/image-diseases-upload",appController.imageAndDiseasesUpload)
router.get("/getAllNotifications/:id",appController.getAllNotifications)
router.get("/getNotificationById/:id",appController.getNotificationById)

module.exports = router