import {Router} from "express";
import { createPlaylist, getUsersPlaylist, getPlaylistById, getAllPlaylists, addVideoToPlaylist, removeVideoFromPlaylist, updatePlaylist, deletePlaylist } from "../controllers/playlist.controllers.js";
import {verifyJWT} from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/create-playlist").post(verifyJWT, createPlaylist);

router.route("/user-playlist/:userId").get(verifyJWT, getUsersPlaylist);

router.route("/playlistId/:playlistId").get(verifyJWT, getPlaylistById);

router.route("/all-playlists").get(verifyJWT, getAllPlaylists);

router.route("/add-video-playlist/:playlistId/:videoId").post(verifyJWT, addVideoToPlaylist);

router.route("/remove-video-playlist/:playlistId/:videoId").post(verifyJWT, removeVideoFromPlaylist);

router.route("/delete-playlist/:playlistId").patch(verifyJWT, deletePlaylist);

router.route("/update-playlist/:playlistId").patch(verifyJWT, updatePlaylist);




export default router
