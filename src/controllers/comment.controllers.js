import {asyncHandler} from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js";
import {apiResponse} from "../utils/apiResponse.js";
import {Comment} from "../models/comment.models.js";
import mongoose from "mongoose";

const createComment = asyncHandler(async (req, res) => {
    if(!req.user) {
        throw new apiError(401, "Login to comment")
    }

    const {videoId} = req.params

    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(400, "Video id is required")
    }

    console.log(req.body)
    const {comment} = req.body

    if(!comment) {
        throw new apiError(400, "Comment is required")
    }

    try {
        const newComment = await Comment.create({
            video: videoId,
            owner: req.user._id,
            content: comment
        })

        console.log("Comment created: ", newComment)

        return res
        .status(201)
        .json(new apiResponse(201, newComment, "Comment created successfully"))
    } catch (error) {
        console.log("Error creating comment ", error)
        throw new apiError(500, "Failed to create comment")
    }
})

const getVideoComments = asyncHandler(async (req, res) => {
    if(!req.user) {
        throw new apiError(401, "Login to view comments")
    }

    const {videoId} = req.params

    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(400, "Video id is required")
    }

    try {
        const comments = await Comment.find({video: videoId}).populate("owner")
        console.log("Comments: ", comments)

        return res.status(200).json(new apiResponse(200, comments, "Comments fetched successfully"))
    } catch (error) {
        console.log("Error fetching comments ", error)
        throw new apiError(500, "Failed to fetch comments")
    }
})

const deleteComment = asyncHandler(async (req, res) => {
    if(!req.user) {
        throw new apiError(401, "Login to delete comment")
    }

    const {commentId} = req.params

    if(!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
        throw new apiError(400, "Comment id is required")
    }

    try {
        await Comment.findByIdAndDelete(commentId)
        console.log("Comment deleted")

        return res
        .status(200)
        .json(new apiResponse(200, null, "Comment deleted successfully"))
    } catch (error) {
        console.log("Error deleting comment ", error)
        throw new apiError(500, "Failed to delete comment")
    }
})

const updateComment = asyncHandler(async (req, res) => {
    if(!req.user) {
        throw new apiError(401, "Login to update comment")
    }

    const {commentId} = req.params

    if(!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
        throw new apiError(400, "Comment id is required")
    }

    const {comment} = req.body

    if(!comment) {
        throw new apiError(400, "Comment is required")
    }

    try {
        const updatedComment = await Comment.findByIdAndUpdate(commentId,
        {
            content: comment
        },
        {
            new: true
        })

        console.log("Comment updated: ", updatedComment)

        return res
        .status(200)
        .json(new apiResponse(200, updatedComment, "Comment updated successfully"))
    } catch (error) {
        console.log("Error updating comment ", error)
        throw new apiError(500, "Failed to update comment")
    }
})

export { createComment, getVideoComments, deleteComment, updateComment }
