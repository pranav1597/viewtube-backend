import {asyncHandler} from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js";
import {apiResponse} from "../utils/apiResponse.js";
import {Like} from '../models/like.models.js'
import mongoose from "mongoose";

// toggle video like
const toggleVideoLike = asyncHandler(async (req,res) => {

    if(!req.user) {
        throw new apiError(401, "Login to like video")
    }

    const {videoId} = req.params

    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(400, "Video id is required")
    }

    try {
        const like = await Like.findOne({
            video: videoId,
            likedBy: req.user._id
        })

        if(like) {
            await Like.findByIdAndDelete(like._id)
            console.log("Unliked video")
        } else {
            await Like.create({
                video: videoId,
                likedBy: req.user._id,
            })
            console.log("Liked video")
        }

        return res.status(200).json(new apiResponse(200, {}, "Like toggled successfully"))
    }
    catch (error) {
        console.log("Error toggling like ", error)
        throw new apiError(500, "Failed to toggle like")
    }
})

// toggle comment like
const toggleCommentLike = asyncHandler(async (req,res) => {
    if(!req.user) {
        throw new apiError(401, "Login to like comment")
    }

    const {commentId} = req.params

    if(!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
        throw new apiError(400, "Comment id is required")
    }

    try {
        const like = await Like.findOne({
            comment: commentId,
            likedBy: req.user._id
        })

        if(like) {
            await Like.findByIdAndDelete(like._id)
            console.log("Unliked comment")
        } else {
            await Like.create({
                comment: commentId,
                likedBy: req.user._id,
            })
            console.log("Liked comment")
        }
        
        return res.status(200).json(new apiResponse(200, {}, "Like toggled successfully"))
        }
        catch (error) {
            console.log("Error toggling like ", error)
            throw new apiError(500, "Failed to toggle like")
        }

})

// toggle tweet like
const toggleTweetLike = asyncHandler(async (req,res) => {
    if(!req.user) {
        throw new apiError(401, "Login to like tweet")
    }

    const {tweetId} = req.params

    if(!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new apiError(400, "Tweet id is required")
    }

    try {
        const like = await Like.findOne({
            tweet: tweetId,
            likedBy: req.user._id
        })

        if(like) {
            await Like.findByIdAndDelete(like._id)
            console.log("Unliked tweet")            
        } else {
            await Like.create({
                tweet: tweetId,
                likedBy: req.user._id,
            })
            console.log("Liked tweet")
        }

        return res.status(200).json(new apiResponse(200, {}, "Like toggled successfully"))
    }
    catch (error) {
        console.log("Error toggling like ", error)
        throw new apiError(500, "Failed to toggle like")
    }
})

// get liked videos
const getLikedVideos = asyncHandler(async (req,res) => {
    if(!req.user) {
        throw new apiError(401, "Login to view liked videos")
    }

    try {
        const likedVideos = await Like.find({
            likedBy: req.user._id,
            video: {
                $exists: true
            },
            tweet: {
                $exists: false
            },
            comment: {
                $exists: false
            }
        }).populate("video")

        console.log("Liked videos: ", likedVideos)
        return res.status(200).json(new apiResponse(200, likedVideos, "Liked videos fetched successfully"))
    }
    catch (error) {
        console.log("Error fetching liked videos ", error)
        throw new apiError(500, "Failed to fetch liked videos")
    }
})


export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos }