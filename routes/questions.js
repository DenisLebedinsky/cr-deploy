const express = require("express");
const router = express.Router();
const Questions = require("../models/questions").Questions;
const User = require("../models/user").User;
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* POST */
router.post("/", function(req, res, next) {
  try {
    if (req.body.text && req.body.phone) {
      const id = String(Date.now());
      var questions = new Questions({
        id: id,
        text: req.body.text,
        phone: req.body.phone
      });

      questions.save(function(err) {
        if (err) throw err;
        res.status(201).send("created");
      });
    } else {
      res.status(500);
    }
  } catch {
    res.status(500);
  }
});

/* GET */
router.get("/", ensureAuthorized, (req, res, next) => {
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
            Questions.findall(function(err, questions) {
              if (err) return next(err);
              res.send(questions);
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

/* DELETE */
router.delete("/:id", ensureAuthorized, (req, res, next) => {
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
            Questions.findOnList(req.params.id, (err, data) => {
              if (err) return next(err);
              if (data != undefined) {
                data.remove();
                res.statusCode = 200;
                res.send("ok");
              } else {
                res.statusCode = 400;
                res.send({ error: "Validation error" });
              }
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

function ensureAuthorized(req, res, next) {
  let bearerToken;
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    var bearer = bearerHeader.split(" ");
    bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.status(403).send("Forbidden");
  }
}

module.exports = router;
