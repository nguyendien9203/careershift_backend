const mongoose = require("mongoose");

const connectDB = async () => {
    try {
         await mongoose.connect(process.env.MONGO_URI)
        .then(()=>{
            console.log(`MongoDB success`)
        })

    }catch (error) {
        console.error(`Error connect fail to MongoDB: ${error.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;