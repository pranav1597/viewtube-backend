import {Router} from "express";
import {registerUser, loginUser, logoutUser, getCurrentUser, updateAccountDetails, updateUserProfilePic, updateUserCoverPic, changeCurrentPassword, getUserChannelProfile, getWatchHistory, refreshAccessToken} from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// unsecured routes

// register user
router.route("/register").post(
    upload.fields([
        {
            name: "profilePic",
            maxCount: 1
        },
        {
            name: "coverPic",
            maxCount: 1
        }
    ]),
    registerUser);

    router.route('/login').post(loginUser);
    router.route('/refresh-token').post(refreshAccessToken);

    // secured routes

    // logout user
    router.route("/logout").post(verifyJWT, logoutUser)

    // change password
    router.route("/change-password").post(verifyJWT, changeCurrentPassword)

    // get current user
    router.route("/current-user").get(verifyJWT, getCurrentUser)

    // get user channel profile details
    router.route("/channel/:username").get(verifyJWT, getUserChannelProfile)
    
    // get watch history
    router.route("/watch-history").get(verifyJWT, getWatchHistory)
    
    // update account details
    router.route("/update-account").patch(verifyJWT, updateAccountDetails)

    // update profile pic
    router.route("/update-profile-pic").patch(verifyJWT, upload.single("profilePic"), updateUserProfilePic)
    
    // update cover pic
    router.route("/update-cover-pic").patch(verifyJWT, upload.single("coverPic"), updateUserCoverPic)
    
export default router;
