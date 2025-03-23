const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const routes = require("./src/routes");
const connectDB = require("./src/config/db");
// const redis = require("./src/config/redis");
require("dotenv").config();

const PORT = process.env.PORT || 9999;
const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);


// redis.on("connect", () => {
//   console.log("Connected to Redis");
// });

// redis.on("error", (err) => {
//   console.error("Redis error:", err);
// });

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
