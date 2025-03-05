const app = require("./src/app");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const routes = require("./routes");
require("dotenv").config();
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 9999;

app.use(morgan("dev"));
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());


app.use("/api", routes);

app.use((err, req, res, next) => {
  console.error("Lỗi:", err.message);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Lỗi không xác định" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});