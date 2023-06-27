const util = require("util");
const multer = require("multer");
const maxSize = 2 * 1024 * 1024;

// let storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, __dirname + "/resources");
//   },
//   filename: (req, file, cb) => {
//     console.log(file.originalname);
//     cb(null, file.originalname);
//   },
// });

let storage = multer.memoryStorage();

let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).single("diseases-image");

let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;