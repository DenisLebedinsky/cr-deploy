const express = require("express");
const router = express.Router();
const User = require("../models/user").User;
const jwt = require("jsonwebtoken");
require('dotenv').config()


router.post("/signin", (req, res) => {
  const { username, password } = req.body;

  User.authorize(username, password, (err, user) => {
    if (err) {
      res.json({
        type: false,
        data: "Error occured: " + err
      });
    } else {
      if (user) {
        const secret = process.env.SECRETKEY || "2344235324";
        const token = jwt.sign({ user }, secret);

        res.json({
          type: true,
          token: token
        });
      } else {
        res.json({
          type: false,
          data: "Incorrect email/password"
        });
      }
    }
  });
});

router.post("/signup", (req, res) => {
  const { username, password, email, adminkey } = req.body;
  const keyApp = process.env.SIGNUP;
  if (adminkey === keyApp) {
    User.registration(username, password, email, () => {
      res.send("new user create").status(201);
    });
  } else {
    res.send().status(500);
  }
});

module.exports = router;
