const app = require("./src/app");
const PORT = process.env.PORT || 5000;

app.use("/api/jobs", require("./src/routes/jobRoutes"));


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
