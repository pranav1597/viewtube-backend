import {asyncHandler} from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js";
import {apiResponse} from "../utils/apiResponse.js";
import {Tweet} from "../models/tweet.models.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new apiError(401, "Login to create tweet");
    }

    console.log(req.body)

    const {text} = req.body;

    if (!text) {
        throw new apiError(400, "Text is required");
    }

    try {
        const tweet = await Tweet.create({
        content: text,
        owner: req.user._id,
        });

        return res
        .status(201)
        .json(new apiResponse(201, tweet, "Tweet created successfully"));
    } catch (error) {
        console.log("Error creating tweet ", error);
        throw new apiError(500, "Failed to create tweet");
    }
});

const getAllTweets = asyncHandler(async (req, res) => {
    if(!req.user) {
        throw new apiError(401, "Login to view tweets")
    }

    try {
        const tweets = await Tweet.find({owner: req.user._id})
        return res.status(200).json(new apiResponse(200, tweets, "Tweets fetched successfully"))
    } catch (error) {
        throw new apiError(500, "Failed to fetch tweets")
    }
});

const getTweet = asyncHandler(async (req, res) => {
    if(!req.user) {
        throw new apiError(401, "Login to view tweet")
    }

    const {tweetId} = req.params

    if(!tweetId) {
        throw new apiError(400, "Tweet id is required")
    }

    try {
        const tweet = await Tweet.findById(tweetId)
    
        if(!mongoose.Types.ObjectId.isValid(tweetId) || !tweet) {
            throw new apiError(404, "Tweet not found")
        }
    
        return res.status(200).json(new apiResponse(200, tweet, "Tweet fetched successfully"))

    } catch (error) {
        throw new apiError(500, "Failed to fetch tweet")
    }
});

const updateTweet = asyncHandler(async (req, res) => {
    if(!req.user) {
        throw new apiError(401, "Login to update tweet")
    }

    const {tweetId} = req.params

    if(!mongoose.Types.ObjectId.isValid(tweetId) || !tweetId) {
        throw new apiError(400, "Tweet id is required")
    }

    const {text} = req.body

    if(!text) {
        throw new apiError(400, "Text is required")
    }

    try {
        const tweet = await Tweet.findByIdAndUpdate(
            tweetId,
            {
                $set: {
                    content: text
                }
            },
            {new: true}
        )
    
        return res.status(200).json(new apiResponse(200, tweet, "Tweet updated successfully"))
    } catch (error) {
        throw new apiError(500, "Failed to update tweet")
    }

});

const deleteTweet = asyncHandler(async (req, res) => {
    if(!req.user) {
        throw new apiError(401, "Login to delete tweet")
    }

    const {tweetId} = req.params

    if(!tweetId) {
        throw new apiError(400, "Tweet id is required")
    }

    try {
        await Tweet.findByIdAndDelete(tweetId)

        return res.status(200).json(new apiResponse(200, {}, "Tweet deleted successfully"))
    } catch (error) {
        throw new apiError(500, "Failed to delete tweet")
    }
});

export {createTweet, getAllTweets, getTweet, updateTweet, deleteTweet};
