import express from "express";
import { createJob, 
        getJobs, 
        getJobsByUser, 
        searchJobs, 
        applyJob, 
        likeJob, 
        getJobById, 
        deleteJob } from "../controllers/jobController.js";
import protect from "../middleware/protect.js"

const router = express.Router();

router.post("/jobs", protect, createJob);
router.get("/jobs", protect, getJobs);
router.get("/jobs/user/:id", protect, getJobsByUser);
router.get("/jobs/search", protect, searchJobs);
router.put("/jobs/apply/:id", protect, applyJob);
router.put("/jobs/like/:id", protect, likeJob);

router.get("/jobs/:id", protect, getJobById);
router.delete("/jobs/:id", protect, deleteJob);
export default router;