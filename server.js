const app = require("./src/app");

const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});

app.use("/api/jobs", require("./src/routes/jobRoutes"));
