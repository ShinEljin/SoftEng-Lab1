function createMessage(userEmail, OTPCode) {
  return {
    from: "elleinc.rpe@gmail.com",
    to: userEmail,
    subject: "OTP Code",
    text: OTPCode,
  };
}

module.exports = { createMessage };
