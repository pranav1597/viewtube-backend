import {Router} from "express";
import {
    createComment,
    getVideoComments,
    deleteComment,
    updateComment
} from "../controllers/comment.controllers.js";
import {verifyJWT} from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/create-comment/:videoId").post(verifyJWT, createComment);

router.route("/get-comments/:videoId").get(verifyJWT, getVideoComments);

router.route("/delete-comment/:commentId").delete(verifyJWT, deleteComment);

router.route("/update-comment/:commentId").patch(verifyJWT, updateComment);

export default router
