////////////////////////////////
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
////////////////////////////////
const app = express();
const saltRounds = 10;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = new mongoose.model("USER", userSchema);

////////////////////////////////
app.get("/", (req, res) => {
  res.render("home");
  return;
});
////////////////////////////////
app
  .route("/login")
  .get((req, res) => {
    res.render("login");
    return;
  })
  .post((req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email }, (err, foundUser) => {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          bcrypt.compare(password, foundUser.password, function (err, result) {
            if (result === true) {
                res.render("secrets");
            }else{
              return
            }
          });
        } else {
          res.send("wrong email");
        }
      }
    });
  });
////////////////////////////////
app
  .route("/register")
  .get((req, res) => {
    res.render("register");
    return;
  })
  .post((req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    bcrypt.hash(password, saltRounds, function (err, hash) {
      const newUser = new User({
        email: email,
        password: hash,
      });
      newUser.save((err) => {
        if (err) {
          res.send(err);
        } else {
          res.render("secrets");
        }
      });
    });
  });
////////////////////////////////
app.listen(3000, () => {
  console.log(`Server started on https://localhost:3000`);
});
