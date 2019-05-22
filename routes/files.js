var express = require("express");
var router = express.Router();
var aws = require("aws-sdk");
let upload = require("../config/multer.config.js");
const awsWorker = require("../controllers/aws.controller");


router.post("/save", upload.single("file"), async (req, res) => {
  try {
		awsWorker.doUpload(req.file, res);
		  
  } catch (err) {
    if (err) throw err;
    res.send(500);
  }
});

module.exports = router;
