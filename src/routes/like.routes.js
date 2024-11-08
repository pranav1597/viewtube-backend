import {Router} from "express";
import {toggleVideoLike, toggleTweetLike, getLikedVideos, toggleCommentLike} from "../controllers/like.controllers.js";
import {verifyJWT} from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/like/:videoId").post(verifyJWT, toggleVideoLike);

router.route("/like-tweet/:tweetId").post(verifyJWT, toggleTweetLike);

router.route("/like-comment/:commentId").post(verifyJWT, toggleCommentLike);

router.route("/liked-videos").get(verifyJWT, getLikedVideos);

export default router
