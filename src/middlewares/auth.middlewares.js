import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1] || req.body.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    console.log("Token: ", token)

    if(!token) {
        throw new apiError(401, "Unauthorized")
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        console.log("Decoded token: ", decodedToken)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        console.log("User: ", user)

        if(!user){
            throw new apiError(401, "Unauthorized")
        }

        req.user = user
        next()

    } catch (error) {
        throw new apiError(401,error?.message || "Invalid token")
    }
})