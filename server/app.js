import express from "express";
import { auth } from "express-openid-connect";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connect from "./db/connect.js";
import cors from "cors";
import fs from "fs";
import { error } from "console";
import User from "./models/UserModel.js";
import asyncHandler from "express-async-handler";

dotenv.config();
const app = express();

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL
};

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use(auth(config));
 
//condition to check user in db
const ensureUserInDB = asyncHandler(async(user)=>{
    try{
        const existingUser = await User.findOne({auth0Id:user.sub});
        if(!existingUser){
            const newUser= new User({
                auth0Id: user.sub,
                email: user.email,
                name: user.name,
                role: "jobSeeker",
                profilePicture: user.picture,
            });
            await newUser.save();
            console.log("user added to db");
        }else{
            console.log("User already exists in DB", existingUser);
        }
    }catch(error){
        console.log("Error checking or adding user to DB", error.message);
    }
});
app.get("/", async(req,res)=>{
    try{
    if(req.oidc.isAuthenticated()){
 //console.log("User authenticated:", req.oidc.user);
        await ensureUserInDB(req.oidc.user);

        return res.redirect(process.env.CLIENT_URL)
    }else{
        return res.send("Logged out");
    }
}catch (error){
    console.error("error in route",error.message);
    return res.status(500).send("Internal server error");
}
});
//routes
const routeFiles = fs.readdirSync("./routes");
routeFiles.forEach((file)=>{
    import(`./routes/${file}`).then((route)=>{app.use("/api/v1/",route.default)}).catch((error)=>{console.log("error importing routes",error);})
});
const server = async () => {
    try{
        await connect();
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);  
        });
    } catch (error){
        console.log("Server error", error.message);
    }
}

server();