import mongoose from "mongoose";

const connect = async () => {
    try{
        console.log("Trying to connect to db....");
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log("Connected to DB");
    } catch(error){
        console.log("Failed connecting to DB", error.message);
        process.exit(1);
    }
};

export default connect;