////////////////////////////////
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require('md5');
////////////////////////////////
const app = express();
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
    const password = md5(req.body.password)
    User.findOne({ email: email }, (err, foundUser) => {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          if (foundUser.password === password) {
            res.render("secrets");
          } else {
            res.send("wrong password");
          }
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
    const password = md5(req.body.password)
    const newUser = new User({
      email: email,
      password: password,
    });
    newUser.save((err) => {
      if (err) {
        res.send(err);
      } else {
        res.render("secrets");
      }
    });
  });
////////////////////////////////
app.listen(3000, () => {
  console.log(`Server started on https://localhost:3000`);
});
