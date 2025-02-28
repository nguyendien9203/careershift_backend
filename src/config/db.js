const mongoose = require('mongoose');

const connectDB = async ()=>{
    try{
await mongoose.connect(process.env.MONGO_URI)
        .then(()=>{
            console.log("Connect to MongoDB Succsessfull")
        })
    }catch(error){
console.error(`Connect failed,error:${error.message}`)
process.exit(1);
    }
}
module.exports = connectDB;