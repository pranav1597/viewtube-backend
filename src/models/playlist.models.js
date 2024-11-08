// id string pk
//   owner ObjectId users
//   videos ObjectId[] videos
//   name string
//   description string
//   createdAt Date
//   updatedAt Date


import mongoose, {Schema} from "mongoose";

const playlistSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    videos:[{
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true
    }],
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, {timestamps: true})

export const Playlist = mongoose.model("Playlist", playlistSchema)