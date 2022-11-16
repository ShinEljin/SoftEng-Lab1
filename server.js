require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();

const router = require("./routes/router");

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URL, (err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log("Database connected");
  }
});

app.use("/", router);

let port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server is running or port 3000");
});
