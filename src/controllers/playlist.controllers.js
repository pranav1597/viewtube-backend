import {asyncHandler} from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js";
import {apiResponse} from "../utils/apiResponse.js";
import {Playlist} from "../models/playlist.models.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
    if(!req.user) {
        throw new apiError(401, "Login to create playlist")
    }

    const {name, description} = req.body

    if(!name) {
        throw new apiError(400, "Name is required")
    }

    try {
        const playlist = await Playlist.create({
            owner: req.user._id,
            name,
            description
        })

        console.log("Playlist created: ", playlist)

        return res
        .status(201)
        .json(new apiResponse(201, playlist, "Playlist created successfully"))
    } catch (error) {
        console.log("Error creating playlist ", error);
        throw new apiError(500, "Failed to create playlist")
    }
})

// Get User's Playlists by user id
const getUsersPlaylist = asyncHandler(async (req, res) => {
    if(!req.user) {
        throw new apiError(401, "Login to view playlist")
    }

    const {userId} = req.params

    if(!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new apiError(400, "User id is required")
    }

    try {
        const playlist = await Playlist.find({owner: userId})

        console.log("User id: ", userId ," Users Playlist: ", playlist)

        return res
        .status(200)
        .json(new apiResponse(200, playlist, "Playlist fetched successfully"))
    } catch (error) {
        console.log("Error fetching playlist ", error);
        throw new apiError(500, "Failed to fetch playlist")
    }


})

// get playlist by playlist id
const getPlaylistById = asyncHandler(async (req, res) => {
    if(!req.user) {
        throw new apiError(401, "Login to view playlist")
    }

    const {playlistId} = req.params

    if(!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new apiError(400, "Playlist id is required")
    }

    try {
        const playlist = await Playlist.findById(playlistId)

        if(!playlist) {
            throw new apiError(404, "Playlist not found")
        }

        return res
        .status(200)
        .json(new apiResponse(200, playlist, "Playlist fetched successfully"))
    } catch (error) {
        console.log("Error fetching playlist ", error);
        throw new apiError(500, "Failed to fetch playlist")
    }
})

// Get All Playlists of logged in user 
const getAllPlaylists = asyncHandler(async (req, res) => {
    if(!req.user) {
        throw new apiError(401, "Login to view playlist")
    }

    try {
        const playlist = await Playlist.find({owner: req.user._id})

        if(!playlist) {
            throw new apiError(404, "Playlists not found")
        }

        return res
        .status(200)
        .json(new apiResponse(200, playlist, "Playlist fetched successfully"))
    } catch (error) {
        console.log("Error fetching playlist ", error);
        throw new apiError(500, "Failed to fetch playlist")
    }
})

// add video to playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    if(!req.user) {
        throw new apiError(401, "Login to add video to playlist")
    }

    const {playlistId, videoId} = req.params

    if(!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new apiError(400, "Playlist id is required")
    }

    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(400, "Video id is required")
    }

    try {
        const playlist = await Playlist.findById(playlistId)

        if(!playlist) {
            throw new apiError(404, "Playlist not found")
        }

        playlist.videos.push(videoId)
        await playlist.save()

        return res
        .status(200)
        .json(new apiResponse(200, playlist, "Video added to playlist successfully"))
    } catch (error) {
        console.log("Error adding video to playlist ", error);
        throw new apiError(500, "Failed to add video to playlist")
    }
})


// remove video to playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    if(!req.user){
        throw new apiError(401, "Login to add video to playlist")
    }

    const {playlistId, videoId} = req.params

    if(!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new apiError(400, "Playlist id is required")
    }

    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(400, "Video id is required")
    }

    try {
        const playlist = await Playlist.findById(playlistId)

        if(!playlist) {
            throw new apiError(404, "Playlist not found")
        }

        const videoIndex = playlist.videos.indexOf(videoId)

        console.log("Video index: ", videoIndex)
        playlist.videos.splice(videoIndex, 1)
        await playlist.save()

        return res
        .status(200)
        .json(new apiResponse(200, playlist, "Video removed from playlist successfully"))
    } catch (error) {
        console.log("Error removing video from playlist ", error);
        throw new apiError(500, "Failed to remove video from playlist")
    }

    
    
})


// delete playlist
const deletePlaylist = asyncHandler(async (req, res) => {
    if(!req.user) {
        throw new apiError(401, "Login to delete playlist")
    }

    const {playlistId} = req.params

    if(!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new apiError(400, "Playlist id is required")
    }

    try {
        const playlist = await Playlist.findByIdAndDelete(playlistId)

        if(!playlist) {
            throw new apiError(404, "Playlist not found")
        
        }

        return res
        .status(200)
        .json(new apiResponse(200, playlist, "Playlist deleted successfully"))
    } catch (error) {
        console.log("Error deleting playlist ", error);
        throw new apiError(500, "Failed to delete playlist")
    }
})


// update playlist
const updatePlaylist = asyncHandler(async (req, res) => {
    if(!req.user) {
        throw new apiError(401, "Login to update playlist")
    }

    const {playlistId} = req.params

    if(!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new apiError(400, "Playlist id is required")
    }

    const {name, description} = req.body

    if(!name) {
        throw new apiError(400, "Name is required")
    }

    try {
        const playlist = await Playlist.findByIdAndUpdate(playlistId, {
            $set: {
                name,
                description
            }
        },
        {new: true}
    )

        if(!playlist) {
            throw new apiError(404, "Playlist not found")
        }

        res.status(200).json(new apiResponse(200, playlist, "Playlist updated successfully"))


    } catch (error) {
        console.log("Error updating playlist ", error);
        throw new apiError(500, "Failed to update playlist")
    }
})



export {createPlaylist, getUsersPlaylist, getPlaylistById, getAllPlaylists, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist}
