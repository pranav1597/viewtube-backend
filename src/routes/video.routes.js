import {Router} from "express";
import {
  uploadVideo,
  getVideoById,
  getAllVideos,
  deleteVideo,
  updateVideo,
} from "../controllers/videos.controllers.js";
import {upload, uploadFields} from "../middlewares/multer.middlewares.js";
import {verifyJWT} from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/upload").post(verifyJWT, uploadFields, uploadVideo);

router.route("/:videoId").get(verifyJWT, getVideoById);

router.route("/get-all").get(verifyJWT, getAllVideos);

router.route("/delete/:videoId").delete(verifyJWT, deleteVideo);

router.route("/update/:videoId").patch(verifyJWT, updateVideo);

export default router;
