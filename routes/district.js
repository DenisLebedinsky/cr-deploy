const express = require("express");
const router = express.Router();
const District = require("../models/district").District;
const User = require("../models/user").User;
const jwt = require("jsonwebtoken");
require('dotenv').config()

/* GET */
router.get("/", function (req, res, next) {
  District.findall(function (err, district) {
    if (err) return next(err);
    res.send(district);
  });
});

/* POST */
router.post("/", ensureAuthorized, (req, res, next) => {
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
            if (req.body.id && req.body.name) {
              var district = new District({
                id: req.body.id,
                name: req.body.name
              });

              district.save(function (err, district, affected) {
                if (err) throw err;
                res.status(201).send("created");
              });
            }
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
            District.findOnList(req.params.id, (err, data) => {
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

/* PATCH */
router.patch("/", ensureAuthorized, (req, res) => {
  const secret = process.env.SECRETKEY || "2344235324";
  const decoded = jwt.verify(req.token, secret).user;

  User.findOne({ username: decoded.username }, (err, user) => {
    if (err) {
      res.json({
        type: false,
        data: "Error occured: " + err
      });
    } else {
      if (user) {
        try {
          District.updateOne(
            { id: req.body.id },
            { name: req.body.name },
            (err, todo) => {
              if (err) return res.status(500).send(err);
              return res.send(todo).status(200);
            }
          );
        } catch (err) {
          res.status(404).send("district is not found");
        }
      } else {
        res.status(403).send("Forbidden");
      }
    }
  });
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
