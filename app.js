////////////////////////////////
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
////////////////////////////////
//// auth
const bcrypt = require("bcrypt");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
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

app.use(
  session({
    secret: process.env.SESSION,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set("useCreateIndex",true)

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("USER", userSchema);

passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
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
            } else {
              return;
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

  // .post((req, res) => {
  //   const email = req.body.email;
  //   const password = req.body.password;

  //   bcrypt.hash(password, saltRounds, function (err, hash) {
  //     const newUser = new User({
  //       email: email,
  //       password: hash,
  //     });
  //     newUser.save((err) => {
  //       if (err) {
  //         res.send(err);
  //       } else {
  //         res.render("secrets");
  //       }
  //     });
  //   });
  // })
  .post((req, res) => {
    User.register({username: req.body.email },req.body.password,(err,user)=>{
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local", function(err, user, info){
        console.log(err,user, info);
        res.redirect("/secrets")
      })
    }
    })
  })
////////////////////////////////
app.get('/secrets', (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets")
  } else {
    res.redirect("login")
  }
return 	
});
////////////////////////////////
app.listen(3000, () => {
  console.log(`Server started on https://localhost:3000`);
});
