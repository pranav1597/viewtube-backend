import {asyncHandler} from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js";
import {z} from "zod";
import {User} from "../models/user.models.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Define a schema for request body validation
const registerUserSchema = z.object({
    fullName: z.string().nonempty("Full name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    username: z.string().nonempty("Username is required"),
});

// schema for request change password validation
const changePasswordSchema = z.object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
})

const generateAccessAndRefreshToken = async (userId) => {
    try {
        console.log(userId)
        const user = await User.findById(userId)
        console.log("User found", user)
    
        if(!user){
            throw new apiError(404, "User not found");
        }
    
        const accessToken = user.generateAccessToken()
        console.log("Access token generated", accessToken)

        const refreshToken = user.generateRefreshToken()
        console.log("Refresh token generated", refreshToken)
    
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}
    } catch (error) {
        throw new apiError(500, "Failed to generate access and refresh token");
    }
}

// Register user
const registerUser = asyncHandler(async (req,res) => {
    const validatedData = registerUserSchema.parse(req.body);
    console.log(validatedData)
    const {fullName, email, password, username} = validatedData;

    // validation 
        if (!fullName || !email || !password || !username) {
        throw new apiError(400, "All fields are required");
    }

    // check if user already exists
    const existedUser = await User.findOne({
        $or: [
            { email },
            { username }
        ]
    })

    if(existedUser) {
        throw new apiError(409, "User with email or username already exists");
    }

    const profilePicPath = req.files?.profilePic?.[0]?.path
    const coverPicPath = req.files?.coverPic?.[0]?.path

    if(!profilePicPath){
        throw new apiError(400, "Profile picture is required");
    }

    // const profilePic = await uploadOnCloudinary(profilePicPath)
    // const coverPic = await uploadOnCloudinary(coverPicPath)

    let profilePic;
    try {
        profilePic = await uploadOnCloudinary(profilePicPath)
        console.log("Profile pic uploaded on cloudinary ", profilePic)
    } catch (error) {
        console.log("Error uploading profile pic ", error)
        throw new apiError(500, "Failed to upload profile pic")
    }

    let coverPic;
    try {
        coverPic = await uploadOnCloudinary(coverPicPath)
        console.log("Profile pic uploaded on cloudinary ", coverPic)
    } catch (error) {
        console.log("Error uploading cover pic ", error)
        throw new apiError(500, "Failed to upload cover pic")
    }

    try {
        const user = await User.create({
            fullName,
            profilePic: profilePic.url,
            coverPic: coverPic?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })
    
        const createdUser = await User.findById(user._id).select("-password, -refreshToken")
    
        if(!createdUser) {
            throw new apiError(500, "Failed to create user");
        }
    
        return res.status(201).json(new apiResponse(201, "User created successfully", createdUser))
    } catch (error) {
        console.log("Error creating user ", error)
        if(profilePic) {
            await deleteFromCloudinary(profilePic.public_id)
        }
        if(coverPic) {
            await deleteFromCloudinary(coverPic.public_id)
        }
        throw new apiError(500, "Failed to create user and images were deleted");
    }

})

// login user

const loginUser = asyncHandler(async (req,res) => {

    console.log(req.body)
    const {email, password} = req.body

    
    
    // validation
    if(!(email || password)) {
        throw new apiError(400, "All fields are required")
    }

    const user = await User.findOne({
        $or: [
            { email },
            { password }
        ]
    })

    if(!user){
        throw new apiError(404, "User not found")
    }

    const isPasswordMatched = await user.isPasswordCorrect(password)

    if(!isPasswordMatched){
        throw new apiError(401, "Invalid credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    console.log(loggedInUser)

    if(!loggedInUser){
        throw new apiError(500, "Failed to login user")
    }

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new apiResponse(
        200, 
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"))
})

// logout user

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined,
        }
        
    },{
        new: true
    })

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200,{}, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {
        throw new apiError(400, "Refresh token is required")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)

        if(!user) {
            throw new apiError(401, "Invalid refresh token")
        }

        if(incomingRefreshToken !== user?.refreshToken) {
            throw new apiError(401, "Invalid refresh token")
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        }

        const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshToken(user._id)

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new apiResponse(
            200, 
            { user, accessToken, refreshToken: newRefreshToken },
            "Access token refreshed successfully"))

    } catch (error) {
        throw new apiError(401, "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const validatedData  = changePasswordSchema.parse(req.body)
    const {newPassword} = validatedData

    const {oldPassword} = req.body

    if(!oldPassword || !newPassword) {
        throw new apiError(400, "All fields are required")
    } 


    const user = await User.findById(req.user?._id)

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordValid) {
        throw new apiError(400, "Old password is incorrect")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res.status(200).json(new apiResponse(200,{}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {

    return res.status(200).json(new apiResponse(200, { user: req.user }, "User fetched successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {email, fullName} = req.body

    if(!email || !fullName) {
        throw new apiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            email,
            fullName
        }
    },{
        new: true
    }).select("-password -refreshToken")

    return res.status(200).json(new apiResponse(200, { user }, "Account details updated successfully"))
})

const updateUserProfilePic = asyncHandler(async (req, res) => {

    const profilePicLocalPath = req.file?.path

    if(!profilePicLocalPath) {
        throw new apiError(400, "Profile picture is required")
    }

    const profilePic = await uploadOnCloudinary(profilePicLocalPath)

    if(!profilePic.url) {
        throw new apiError(500, "Failed to upload profile picture")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            profilePic: profilePic.url
        }
    },{
        new: true
    }
).select("-password -refreshToken")

return res.status(200).json(new apiResponse(200, { user }, "Profile picture updated successfully"))

})

const updateUserCoverPic = asyncHandler(async (req, res) => {
    const coverPicLocalPath = req.file?.path

    if(!coverPicLocalPath) {
        throw new apiError(400, "Cover picture is required")
    }

    const coverPic = await uploadOnCloudinary(coverPicLocalPath)

    if(!coverPic.url) {
        throw new apiError(500, "Failed to upload cover picture")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            coverPic: coverPic.url
        }
    },{
        new: true
    }
).select("-password -refreshToken")

return res.status(200).json(new apiResponse(200, { user }, "Cover picture updated successfully"))
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const {username} = req.params

    if(!username?.trim()) {
        throw new apiError(400, "Username is required")
    }

    const channel = await User.aggregate(
        [
            {
                $match: {
                    username: username?.toLowerCase()
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo"
                }
            },
            {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers"
                    
                    },
                    subscribedToCount: {
                        $size: "$subscribedTo"
                    },
                    isSubscribed: {
                        $cond: {
                            if: {
                                $in: [req.user?._id, "$subscribedTo.subscriber"]
                            },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                // project or display only necessary data 
                $project: {
                    fullName: 1,
                    username: 1,
                    profilePic: 1,
                    email: 1,
                    coverPic: 1,
                    subscribersCount: 1,
                    subscribedToCount: 1,
                    isSubscribed: 1
                }
            }
        ]
    )
    console.log(channel)

    if(!channel) {
        throw new apiError(404, "Channel not found")
    }

    return res.status(200).json(new apiResponse(200, channel[0], "Channel fetched successfully"))
})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate(
        [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            fullName: 1,
                                            username: 1,
                                            profilePic: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                owner: {
                                    $first: "$owner"
                                }
                            }
                        }
                    ]
                }
            }
        ]
    )

    if(!user) {
        throw new apiError(404, "User not found")
    }

    return res.status(200).json(new apiResponse(200, user[0]?.watchHistory, "Watch history fetched successfully"))
})

export { registerUser, loginUser, refreshAccessToken, logoutUser, getCurrentUser, updateAccountDetails, updateUserProfilePic, updateUserCoverPic, changeCurrentPassword, getUserChannelProfile, getWatchHistory }
