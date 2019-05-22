var express = require("express");
var router = express.Router();
var House = require("../models/house").House;
var User = require("../models/user").User;
const jwt = require("jsonwebtoken");
require('dotenv').config()
router.get("/check", ensureAuthorized, function(req, res) {
  const secret = process.env.SECRETKEY || "2344235324";
  const decoded = jwt.verify(req.token, secret).user;

  if (decoded) {
    User.findOne({ username: decoded.username }, (err, user) => {
      if (err) {
        res.json({
          type: false,
          data: "Error occured: " + err
        });
      } else {
        if (user && user.hashedpasword === decoded.hashedpasword) {
          try {
            House.findCheck((err, house) => {
              if (err) return next(err);
              res.json({ house });
            });
          } catch (err) {
            res.status(500);
          }
        } else {
          res.status(403).send("user is not found");
        }
      }
    });
  } else {
    res.status(403).send("invalid token");
  }
});

router.patch("/changestatus", ensureAuthorized, (req, res) => {
  const secret = process.env.SECRETKEY || "2344235324";
  const decoded = jwt.verify(req.token, secret).user;

  if (decoded) {
    User.findOne({ username: decoded.username }, (err, user) => {
      if (err) {
        res.json({
          type: false,
          data: "Error occured: " + err
        });
      } else {
        if (user && user.hashedpasword === decoded.hashedpasword) {
          try {
            
            House.updateOne(
              { id: req.body.id },
              { status: true },
              (err, todo) => {
                if (err) return res.status(500).send(err);
                return res.send(todo);
              }
            );
          } catch (err) {
            res.status(500);
          }
        } else {
          res.status(403).send("user is not found");
        }
      }
    });
  } else {
    res.status(403).send("invalid token");
  }
});


function ensureAuthorized(req, res, next) {
  let bearerToken;
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    var bearer = bearerHeader.split(" ");
    bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.send(403);
  }
}
module.exports = router;
