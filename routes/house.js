var express = require("express");
var router = express.Router();
var House = require("../models/house").House;
var User = require("../models/user").User;
require("dotenv").config();
const jwt = require("jsonwebtoken");

/* GET */
router.get("/", (req, res, next) => {
  House.findall((err, house) => {
    if (err) return next(err);
    res.send({ house });
  });
});

/* GET */
router.get("/:id", (req, res, next) => {
  House.findOnList(req.params.id, (err, house) => {
    if (err) return next(err);
    res.send({ house });
  });
});

/* POST */
router.post("/search", (req, res, next) => {
  House.findOnName(req.body.str, (err, house) => {
    if (err) return next(err);
    res.send({ house });
  });
});

/* POST */
router.post("/more", (req, res, next) => {
	const params  = req.body
 	
  if (!params.priceRange) {
    params.priceRange = { min: 0, max: 20000000 };
  }
 
    House.findMore(params,(err, house) => {
      if (err) return next(err);
      res.send({ house });
    });
  
});

/* POST */
router.post("/", (req, res) => {
  try {
    var id = Math.floor(Math.random() * 100000000);
    if (req.body.categoryId && req.body.name && req.body.description) {
      var house = new House({
        id: id,
        categoryId: req.body.categoryId,
        name: req.body.name,
        email: req.body.email,
        tel: req.body.tel,
        description: req.body.description,
        price: req.body.price,
        status: req.body.status,
        images: req.body.images,
        locationId: req.body.locationId,
        districtId: req.body.districtId,
        realtObjectId: req.body.realtObjectId,
        area: req.body.area,
        floor: req.body.floor,
        sale: req.body.sale,
        status: false
      });

      house.save(function (err, house, affected) {
        if (err) throw err;
      });
      res.status(201).send("create in database");
    } else {
      res.status(206);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

/* PATCH */
router.patch("/update", ensureAuthorized, (req, res) => {
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
              {
                categoryId: req.body.categoryId,
                name: req.body.name,
                email: req.body.email,
                tel: req.body.tel,
                description: req.body.description,
                price: req.body.price,
                status: req.body.status,
                images: req.body.images,
                locationId: req.body.locationId,
                districtId: req.body.districtId,
                realtObjectId: req.body.realtObjectId,
                area: req.body.area,
                floor: req.body.floor,
                sale: req.body.sale
              },
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

/* DELETE */
router.delete("/del/:id", ensureAuthorized, function (req, res) {
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
            House.findOnList(req.params.id, function (err, docs) {
              if (err) throw err;
              if (docs != undefined) {
                docs.remove();
                res.statusCode = 200;
                res.send({ error: "ok" });
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
  var bearerToken;

  var bearerHeader = req.headers["authorization"];
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
