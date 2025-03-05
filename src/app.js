const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const passport = require("passport");
const bodyParser = require("body-parser");
const routes = require("./routes/index");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));
app.use(passport.initialize());

// define routes
app.use("/api", routes);

module.exports = app;
