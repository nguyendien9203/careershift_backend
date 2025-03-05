const app = require("./src/app");
const connectDB = require("./src/config/db");

app.listen(process.env.PORT , () => {

    console.log(`Server running at http://localhost:${process.env.PORT } `);
    connectDB();
})
