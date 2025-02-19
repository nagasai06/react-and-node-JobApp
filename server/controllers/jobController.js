import asyncHandler from "express-async-handler";
import User from "../models/UserModel.js";
import Job from "../models/JobModel.js";

export const createJob = asyncHandler(async(req,res)=>{
    try{
        const user = await User.findOne({auth0Id:req.oidc.user.sub});
        //console.log("Auth0 User:", req.oidc.user);

        const {
            title,
            description,
            location,
            salary,
            jobType,
            tags,
            skills,
            salaryType,
            negotiable,
            createdBy,
        } = req.body;

        if(!title || !description || !location || !salary || !jobType || !tags || !skills || !salaryType || !negotiable){
            return res.status(400).json({message: "Fill all the required fields"})
        }

        const job = new Job({
            title,
            description,
            location,
            salary,
            jobType,
            tags,
            skills,
            salaryType,
            negotiable,
            createdBy: user._id,
        });
        await job.save();

        return res.status(200).json(job);
        console.log("User: ", User);
    } catch(error){
        console.log("Error creating a job", error);
        return res.status(500).json({message: "Internal server error"});
    }
});

export const getJobs = asyncHandler(async(req,res)=>{
    try{
        const jobs = await Job.find({}).populate("createdBy", "name email profilePicture").sort({createdAt: -1});
        return res.status(200).json(jobs);
    } catch(error){
        console.log("error getting jobs", error);
        return res.status(500).json({message: "Internal server error"});
    }
});

export const getJobsByUser = asyncHandler(async(req,res)=>{
    try{
        const user = await User.findById(req.params.id);
        
        if(!user){
            return res.status(400).json({message: "User not found"});
        }
        const jobs = await Job.find({createdBy: user._id}).populate("createdBy", "name email profilePicture").sort({createdAt: -1});
        return res.status(200).json(jobs);
    } catch (error){
        console.log("Error fetching jobs by user id", error);
        return res.status(500).json({message: "Internal server error"});
    }
    
});

export const searchJobs = asyncHandler(async(req,res)=>{
    try{
        const { tags, location, title} = req.query;
        
        let query = {};

        if(tags){
            query.tags = {$in: tags.split(",")};
        }
        if(location){
            query.location = {$regex: location, $options: "i"};
        }
        if(title){
            query.title = {$regex: title, $options: "i"};
        }
        const jobs = await Job.find(query).populate("createdBy", "name email profilePicture").sort({createdAt: -1})
        return res.status(200).json(jobs);
    } catch(error){
        console.log("Error searching jobs", error);
        return res.status(500).json({message: "Internal server error"});
    }
});

export const applyJob = asyncHandler(async(req,res)=>{
    try{
        const jobId = req.params.id;
        const job = await Job.findById(jobId);

        if(!job){
            return res.status(404).json({message: "Job not found"});
        }
        const user = await User.findOne({auth0Id: req.oidc.user.sub});
        if(!user){
            return res.status(404).json({message: "user not found"});
        }
        if(job.applicants.includes(user._id)){
            return res.status(403).json({message: "Already applied"});
        }
        job.applicants.push(user._id);
        await job.save();

        return res.status(200).json(job);

    } catch(error){
        console.log("Error in applying job", error);
        return res.status(500).json({message:"Internal server error"})
    }
});

export const likeJob = asyncHandler(async(req,res)=>{
    try{
        const job = await Job.findById(req.params.id);
        if(!job){
            return res.status(404).json({message: "Job not found"});
        }
        const user = await User.findOne({auth0Id: req.oidc.user.sub});
        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        const isLiked = job.likes.includes(user._id);
        if(isLiked){
            job.likes = job.likes.filter((like)=>!like.equals(user._id)); 
        } else{
            job.likes.push(user._id);
        }
        await job.save();

        return res.status(200).json(job);
    } catch(error){
        console.log("Error liking job", error);
        return res.status(500).json({message:"Internal server error"});
    }
});

export const getJobById = asyncHandler(async(req,res)=>{
    try{
        const job = await Job.findById(req.params.id).populate("createdBy", "name email profilePicture");

        if(!job){
            return res.status(404).json({message: "Job not found"});
        }
        return res.status(200).json(job);
    } catch(error){
        console.log("Error getting job by id", error);
        return res.status(500).json({message:"Internal server error"});
    }
});

export const deleteJob = asyncHandler(async(req,res)=>{
    try{
        const {id} = req.params;
        const job = await Job.findById(id);
        if(!job){
            return res.status(404).json({message:"Job not found"});
        }

        await job.deleteOne({
            _id: id,
        });

        return res.status(200).json({message: "Job deleted successfully"});
    } catch(error){
        console.log("Error deleting job", error);
        return res.status(500).json({message: "Internal server error"});
    }
});