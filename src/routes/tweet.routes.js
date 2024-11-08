import {Router} from "express";
import {createTweet, getAllTweets, getTweet, updateTweet, deleteTweet} from "../controllers/tweets.controllers.js";
import {verifyJWT} from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/create-tweet").post(verifyJWT, createTweet);
router.route("/all-tweets").get(verifyJWT, getAllTweets);
router.route("/get-tweet/:tweetId").get(verifyJWT, getTweet);
router.route("/update-tweet/:tweetId").patch(verifyJWT, updateTweet);
router.route("/delete-tweet/:tweetId").delete(verifyJWT, deleteTweet);

export default router