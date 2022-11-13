const express = require("express");
const ejs = require("ejs");
const md5 = require("md5");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();

let isAuthenticated = false;
let OTPCode = "";

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

let transporter = nodemailer.createTransport({
  host: "smtp.elasticemail.com",
  port: 2525,
  auth: {
    user: "elleinc.rpe@gmail.com",
    pass: "0DD2AB94AB05552BE9CEE94EC5588BEE8651",
  },
});

const url =
  "mongodb+srv://admin-raphael:Scnlhpr.062202@cluster0.flkrs.mongodb.net/accountsDB";
mongoose.connect(url, (err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log("Database connected");
  }
});

const userSchema = mongoose.Schema({
  email: String,
  password: String,
});

const User = new mongoose.model("User", userSchema);

let loginNote = "";
let suNote = "";
let otpNote = "";
let otpEmail = "";
let newUser;
let currentUserEmail = "";
let currentUserPassword = "";

app.get("/", (req, res) => {
  if (isAuthenticated) {
    res.render("homepage");
  } else {
    res.redirect("/login");
  }
  loginNote = "";
});

app.get("/login", (req, res) => {
  if (isAuthenticated) {
    res.redirect("/");
  } else {
    res.render("login", { loginNote: loginNote });
  }
  loginNote = "";
});

app.get("/logout", (req, res) => {
  isAuthenticated = false;
  res.redirect("/");
});

app.get("/signup", (req, res) => {
  res.render("signup", { suNote: suNote });
  suNote = "";
});

app.get("/resend-otp-login", (req, res) => {
  if (currentUserEmail === "") {
    console.log("No currently user");
    res.redirect("/");
  } else {
    message = {
      from: "elleinc.rpe@gmail.com",
      to: currentUserEmail,
      subject: "OTP Code",
      text: OTPCode,
    };

    transporter.sendMail(message, function (err, info) {
      if (err) {
        console.log(err);
        res.render("otp-login");
      } else {
        res.render("otp-login", {
          userEmail: currentUserEmail,
          otpNote: "OTP Code has been Resent!",
        });
        otpNote = "";
      }
    });
  }
});

app.get("/resend-otp-su", (req, res) => {
  if (currentUserEmail === "") {
    console.log("No currently user");
    res.redirect("/");
  } else {
    message = {
      from: "elleinc.rpe@gmail.com",
      to: currentUserEmail,
      subject: "OTP Code",
      text: OTPCode,
    };

    transporter.sendMail(message, function (err, info) {
      if (err) {
        console.log(err);
        res.render("otp", {
          userEmail: currentUserEmail,
          otpNote: "There's an error sending the otp",
        });
      } else {
        res.render("otp", {
          userEmail: currentUserEmail,
          otpNote: "OTP Code has been Resent!",
        });
        otpNote = "";
      }
    });
  }
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const hashedPassword = md5(userPassword);

  User.findOne({ email: userEmail }, (err, foundUser) => {
    if (err) {
      loginNote = err;
      res.redirect("/login");
    } else {
      if (foundUser) {
        if (hashedPassword === foundUser.password) {
          currentUserEmail = userEmail;
          currentUserPassword = userPassword;
          OTPCode = "";
          for (let i = 0; i <= 5; i++) {
            OTPCode += Math.floor(Math.random() * 10);
          }
          message = {
            from: "elleinc.rpe@gmail.com",
            to: userEmail,
            subject: "OTP Code",
            text: OTPCode,
          };

          transporter.sendMail(message, function (err, info) {
            if (err) {
              loginNote = err;
              res.redirect("/signup");
            } else {
              res.render("otp-login", {
                userEmail: currentUserEmail,
                otpNote: otpNote,
              });
            }
          });
        } else {
          loginNote = "Password incorrect";
          res.redirect("/login");
        }
      } else {
        loginNote = "Email not found";
        res.redirect("/login");
      }
    }
  });
});

app.post("/signup", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userConfirmPassword = req.body.confirmPassword;

  if (userConfirmPassword === userPassword) {
    const hashedPassword = md5(userPassword);
    currentUserEmail = userEmail;
    currentUserPassword = userPassword;

    newUser = new User({
      email: userEmail,
      password: hashedPassword,
    });

    OTPCode = "";

    for (let i = 0; i <= 5; i++) {
      OTPCode += Math.floor(Math.random() * 10);
    }

    message = {
      from: "elleinc.rpe@gmail.com",
      to: userEmail,
      subject: "OTP Code",
      text: OTPCode,
    };

    transporter.sendMail(message, function (err, info) {
      if (err) {
        console.log(err);
        res.redirect("/signup");
      } else {
        res.render("otp", { userEmail: currentUserEmail, otpNote: otpNote });
        otpNote = "";
      }
    });
  } else {
    suNote = "Passwords not match";
    res.redirect("/signup", { suNote });
  }
});

app.post("/otp", (req, res) => {
  const otpSubmitted = req.body.otp;

  if (OTPCode === otpSubmitted) {
    newUser.save((err) => {
      if (err) {
        console.log(err);
      } else {
        res.render("signup-success");
      }
    });
  } else {
    otpNote = "Wrong OTP";
    res.render("otp", {
      userEmail: currentUserEmail,
      otpNote: otpNote,
    });
    otpNote = "";
  }
});

app.post("/otp-login", (req, res) => {
  const otpSubmitted = req.body.otp;
  if (OTPCode === otpSubmitted) {
    isAuthenticated = true;
    res.redirect("/");
  } else {
    otpNote = "Wrong OTP";
    res.render("otp-login", {
      userEmail: currentUserEmail,
      otpNote: otpNote,
    });
    otpNote = "";
  }
});

let port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server is running or port 3000");
});
