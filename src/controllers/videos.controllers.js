import {asyncHandler} from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js";
import {Video} from "../models/video.models.js";
import {uploadOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js";
import {apiResponse} from "../utils/apiResponse.js";
import { loginUser } from "./user.controllers.js";
import mongoose from "mongoose";
// import { getVideoDuration } from "../utils/getVideoDuration.js";
import { getVideoDurationInSeconds }  from 'get-video-duration'

// upload video
const uploadVideo = asyncHandler(async (req, res) => {

    console.log("req.user: ", req.user)

    if (!req.user) {
      // Instead of checking loginUser, check if req.user is set by your middleware
    throw new apiError(401, "Login to upload video");
    }

    console.log("req.file: ", req.files)

    const videoLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    console.log("Video local path: ", videoLocalPath)
    console.log("Thumbnail local path: ", thumbnailLocalPath)

    if(!videoLocalPath) {
        throw new apiError(400, "Video is required")
    }

    let videoPath;
    let duration;
    
    try {
        const durationInSeconds = await getVideoDurationInSeconds(videoLocalPath)
        duration = (durationInSeconds / 60).toFixed(2)
        console.log("Video duration: ", duration)
    } catch (error) {
        console.log("Failed to get video duration ", error)
        duration = 0
    }
    try {
        videoPath = await uploadOnCloudinary(videoLocalPath)
        
        if(!videoPath.url) {
            throw new apiError(500, "Failed to upload video")
        }
        
    } catch (error) {
        throw new apiError(500, "Failed to upload video")
    }


    let thumbnailPath;

    try {
        thumbnailPath = await uploadOnCloudinary(thumbnailLocalPath)
        
        if(!thumbnailPath.url) {
            throw new apiError(500, "Failed to upload thumbnail")
        }
    } catch (error) {
        throw new apiError(500, "Failed to upload thumbnail")
    }

    try {
        const videos = await Video.create({
            title: req.body?.title,
            description: req.body?.description,
            videoFile: videoPath?.url,
            owner: req.user?._id,
            thumbnail: thumbnailPath?.url || "",
            duration: duration,
            views: 0,
            
        })

        return res.status(200).json(new apiResponse(200, videos, "Video uploaded successfully"))


    } catch (error) {

            if (videoPath?.public_id) {
            await deleteFromCloudinary(videoPath.public_id);
            }
            if (thumbnailPath?.public_id) {
            await deleteFromCloudinary(thumbnailPath.public_id);
            }
            throw new apiError(500, "Failed to upload video")
    }
})

// get video by id
const getVideoById = asyncHandler(async (req, res) => {
    
    if(!req.user) {
        throw new apiError(401, "Login to view video")
    }
    

    const {videoId} = req.params

    console.log(videoId)

    if(!videoId) {
        throw new apiError(400, "Video id is required")
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(400, "Invalid Video ID format");
    }

    const video = await Video.findById(videoId)

    if(!video) {
        throw new apiError(404, "Video not found")
    }

    return res.status(200).json(new apiResponse(200, video, "Video fetched successfully"))
})

// get all videos 
const getAllVideos = asyncHandler(async (req, res) => {
    if(!req.user) {
        throw new apiError(401, "Login to view videos")
    }
    console.log("getallvideos req.user: ", req.user)
    console.log("getallvideos req.query: ",req.query)
    const {page = 1, limit = 10, query, sortBy = "title", sortType, userId} = req.query;

    // Validate and parse page and limit
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    if (pageNumber <= 0 || limitNumber <= 0) {
        throw new apiError(400, "Page and limit must be greater than 0");
    }

    // const pageAggregate = Video.aggregate([
    // {
    //     $match: {
    //         title: {
    //             $regex: query,
    //             $options: "i"
    //         }
    //     }
    // ]
            
    // })

    const pageAggregate = Video.aggregate()

    if(query){
        pageAggregate.match({
            title: {
                $regex: query,
                $options: "i"
            }
        })
    }

    if(userId){
        pageAggregate.match({
            owner: userId
        })
    }

    const sortDirection = sortType === "asc" ? 1 : (sortType === "desc" ? -1 : 1)

    console.log(sortDirection)

    // filter query object based on query params 
    // const queryObject = {
    //     ...(query ? {title: {$regex: query, $options: "i"}} : {})
    // }

    // console.log("Query object: ", queryObject)

    

    const sortOptions = {
        sort: {
            [sortBy || "createdAt"]: sortDirection
        }
    }

    console.log("Sort Options: ", sortOptions)

    pageAggregate.sort(sortOptions)

    const options = {
        page: pageNumber,
        limit: limitNumber
    }

    console.log("Options: ", options)


    try {
        const videos = await Video.aggregatePaginate(pageAggregate, options)
        console.log("Videos: ", videos)
    
        return res.status(200).json(new apiResponse(200, videos, "Videos fetched successfully"))
    } catch (error) {
        console.log("Error fetching videos ", error)
        throw new apiError(500, "Failed to fetch videos")
    }


})

// delete video
const deleteVideo = asyncHandler(async (req, res) => {
    if(!req.user) {
        throw new apiError(401, "Login to delete video")
    }

    const {videoId} = req.params

    if(!videoId) {
        throw new apiError(400, "Video id is required")
    }

    const video = await Video.findById(videoId)
    console.log(videoId)

    if(!video) {
        throw new apiError(404, "Video not found")
    }

    try {
        await deleteFromCloudinary(video.videoFile)
    } catch (error) {
        throw new apiError(500, "Failed to delete video")
    }

    await Video.deleteOne({_id: videoId});

    return res.status(200).json(new apiResponse(200, {}, "Video deleted successfully"))


})

// update video
const updateVideo = asyncHandler(async (req, res) => {
    console.log(req.body)
    const {videoId} = req.params

    if(!videoId) {
        throw new apiError(400, "Video id is required")
    }

    const video = await Video.findByIdAndUpdate(videoId, {
        $set: {
            title: req.body?.title,
            description: req.body?.description,
        }
    }, {
        new: true
    })


    if(!video) {
        throw new apiError(404, "Video not found")
    }

    return res.status(200).json(new apiResponse(200, video, "Video updated successfully"))

})

export { uploadVideo, getVideoById, getAllVideos, deleteVideo, updateVideo }

