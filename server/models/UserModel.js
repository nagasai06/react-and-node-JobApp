import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required:true,
    },
    email: {
        type: String,
        unique: true,
        required:true,
    },
    auth0Id: {
        type: String,
        required: true,
        unique: true,
    },
    appliedJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
    }],
    savedJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
    }],
    role:{
        type: String,
        enum: ["jobSeeker", "recruiter"],
        default: "jobSeeker",
        
    },
    resume: {
        type: String,

    },
    profilePicture: {
        type: String,
    },
    Bio: {
        type: String,
        default: "No bio",
    },
    profession: {
        type: String,
        default: "Unemployed",
    },
    

}, { timestamps: true} );

const User = mongoose.model("User", userSchema);

export default User;