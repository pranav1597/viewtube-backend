import {Router} from "express";
import { toggleSubscribe, getUserChannelSubscribers, getUserSubscribedTo } from "../controllers/subscription.controllers.js";
import {verifyJWT} from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/subscribe/:channelId").post(verifyJWT, toggleSubscribe);

router.route("/subscribers/").get(verifyJWT, getUserChannelSubscribers);

router.route("/subscribed-to").get(verifyJWT, getUserSubscribedTo);

export default router