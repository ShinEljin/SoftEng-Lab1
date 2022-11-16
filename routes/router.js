const express = require("express");

const router = express.Router();

const {
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
} = require("./controller");

router.get("/", getHome);
router.get("/login", getLogin);
router.get("/logout", getLogout);
router.get("/signup", getSignup);
router.get("/resend-otp-login", getResendLogin);
router.get("/resend-otp-su", getResendSU);

router.post("/login", postLogin);
router.post("/signup", postSignup);
router.post("/otp", postOTPSU);
router.post("/otp-login", postOTPLogin);

module.exports = router;
