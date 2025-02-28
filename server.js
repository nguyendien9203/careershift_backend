const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

// Kết nối database
connectDB();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
