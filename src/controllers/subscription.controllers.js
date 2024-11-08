import {asyncHandler} from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js";
import {apiResponse} from "../utils/apiResponse.js";
import mongoose from "mongoose";
import {Subscription} from "../models/subscription.models.js";

const toggleSubscribe = asyncHandler(async (req, res) => {

    if(!req.user) {
        throw new apiError(401, "Login to subscribe")
    }

    const {channelId} = req.params

    if(!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
        throw new apiError(400, "Channel id is required")
    }

    try {
        const subscription = await Subscription.findOne({
            subscriber: req.user._id,
            channel: channelId
        })

        console.log("Subscription: ", subscription)

        if(subscription) {
            await Subscription.findByIdAndDelete(subscription._id)
            console.log("Subscription deleted")
        } else {
            await Subscription.create({
                subscriber: req.user._id,
                channel: channelId
            })
            console.log("Subscription created")
        }

        return res.status(200).json(new apiResponse(200, {}, "Subscription toggled successfully"))
    } catch (error) {
        throw new apiError(500, "Failed to toggle subscription")
    }
        


})

// get user subscribers

const getUserChannelSubscribers = asyncHandler(async (req, res) => {

    if(!req.user) {
        throw new apiError(401, "Login to view subscribers")
    }

    // const {channelId} = req.params

    // if(!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
    //     throw new apiError(400, "Channel id is required")
    // }

    const subscribers = await Subscription.find({channel: req.user._id})
      .select("subscriber")
      .populate("subscriber");

    console.log("Subscribers: ", subscribers)

    return res.status(200).json(new apiResponse(200, subscribers, "Subscribers fetched successfully"))
})

// get channels that user has subscribed to

const getUserSubscribedTo = asyncHandler(async (req, res) => {

    if(!req.user) {
        throw new apiError(401, "Login to view subscribers")
    }



    const subscribedTo = await Subscription.find({subscriber: req.user._id})
      .select("channel")
      .populate("channel");

    console.log("Subscribed to: ", subscribedTo)

    return res.status(200).json(new apiResponse(200, subscribedTo, "Subscribed to fetched successfully"))
})

export { toggleSubscribe, getUserChannelSubscribers, getUserSubscribedTo }
