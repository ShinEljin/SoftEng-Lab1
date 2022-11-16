const md5 = require("md5");

const User = require("../models/user");
const transporter = require("../config/smtp");
const { createMessage } = require("./utilityFunctions");

let isAuthenticated = false;
let OTPCode = "";

let loginNote = "";
let suNote = "";
let otpNote = "";
let newUser;
let currentUserEmail = "";

const getHome = (req, res) => {
  if (isAuthenticated) {
    res.render("homepage");
  } else {
    res.redirect("/login");
  }
  loginNote = "";
};

const getLogin = (req, res) => {
  if (isAuthenticated) {
    res.redirect("/");
  } else {
    res.render("login", { loginNote: loginNote });
  }
  loginNote = "";
};

const getLogout = (req, res) => {
  isAuthenticated = false;
  res.redirect("/");
};

const getSignup = (req, res) => {
  res.render("signup", { suNote: suNote });
  suNote = "";
};

const getResendLogin = (req, res) => {
  if (currentUserEmail === "") {
    console.log("No currently user");
    res.redirect("/");
  } else {
    message = createMessage(currentUserEmail, OTPCode);

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
};

const getResendSU = (req, res) => {
  if (currentUserEmail === "") {
    console.log("No currently user");
    res.redirect("/");
  } else {
    message = createMessage(currentUserEmail, OTPCode);

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
};

// =================== POST METHOD ========================

const postLogin = (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const hashedPassword = md5(userPassword);

  if (userEmail === "") {
    loginNote = "Please input your email";
    res.redirect("/login");
  } else {
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
            message = createMessage(userEmail, OTPCode);

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
            loginNote = "Incorrect email or password";
            res.render("login", {
              loginNote: loginNote,
              email: userEmail,
              password: userPassword,
            });
          }
        } else {
          loginNote = "Incorrect email or password";
          res.render("login", {
            loginNote: loginNote,
            email: userEmail,
            password: userPassword,
          });
        }
      }
    });
  }
};

const postSignup = (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userConfirmPassword = req.body.password2;
  // Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character:
  const pwChecker =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@.!%&*?])[A-Za-z\d#$@!%.&*?]{8,30}$/;

  if (userConfirmPassword === userPassword) {
    if (pwChecker.test(userPassword)) {
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

      message = createMessage(userEmail, OTPCode);

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
      suNote = "Password too weak";
      res.render("signup", {
        suNote: suNote,
        email: userEmail,
        password: userPassword,
        password2: userConfirmPassword,
      });
    }
  } else {
    suNote = "Passwords not match";
    res.render("signup", {
      suNote: suNote,
      email: userEmail,
      password: userPassword,
      password2: userConfirmPassword,
    });
  }
};

const postOTPSU = (req, res) => {
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
};

const postOTPLogin = (req, res) => {
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
};

module.exports = {
  getHome,
  getLogin,
  getLogout,
  getSignup,
  getResendLogin,
  getResendSU,
  postLogin,
  postSignup,
  postOTPSU,
  postOTPLogin,
};
