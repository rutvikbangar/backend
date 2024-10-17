import mongoose from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { json } from "express"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist
    if(name==="" || description === ""){
        throw new ApiError(400,"All the fields are required");
    }
    const cplayList = await Playlist.create({
        name: name,
        description: description,
        owner: req.user?._id,
        videos:[],

    });
    const createdplaylist = await Playlist.findById(cplayList._id);
    if(!createPlaylist){
        throw new ApiError(500,"Failed to create a playlist");
    }
    return res.status(200)
    .json(new ApiResponse(200,createdplaylist,"Playlist created successfully"));
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400,"Invalid request") ;
    }
    const userObjectId = new mongoose.Types.ObjectId(userId) ;
    const getplaylist = await Playlist.aggregate([
        {
            $match:{
                owner: userObjectId,
            },
            
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos",
            }
        }
        
    ]);
    if(!getplaylist){
        throw new ApiError(400,"Unable to fetch the playlist in invalid");
    }
    return res.status(200)
    .json(new ApiResponse(200,getplaylist,"Playlist fetched succesfully")) ;
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Invalid request") ;
    }
    const playlistobjectId = new mongoose.Types.ObjectId(playlistId);
    const playlist = await Playlist.aggregate([
        {
            $match:{_id:playlistobjectId}
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos",
            }
        },
        {
            $limit: 1
        }
    ]);
    if(!playlist){
        throw new ApiError(400,"Invalid playlist Id");
    }
    return res.status(200).json(new ApiResponse(200,playlist[0],"This is the required playlist"));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid request Id") ;
    }
    const addvideo = await Playlist.findByIdAndUpdate(playlistId,{
        $push:{
            videos: videoId
        }
    },{new:true});
    if(!addvideo){
        throw new ApiError(500,"Failed adding the video");
    }
    return res.status(200).json(new ApiResponse(200,{},"video added"));
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid request Id") ;
    }
    const deletevideo = await Playlist.findByIdAndUpdate(playlistId,{
        $pull:{
            videos: videoId,
        }
    },{new:true});
    if(!deletevideo){
        throw new ApiError(404,"Playlist not found");
    }
    return res.status(200).json(new ApiResponse(200,{},"video deleted"));    

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Invalid Id")
    }
    await Playlist.findByIdAndDelete(playlistId).catch((er)=>{
        console.log(er.message);
        
    });
    return res.status(200).json(new ApiResponse(200,{},"Playlist deleted"));

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Invalid Id")
    }
    const updateplay = await Playlist.findByIdAndUpdate(playlistId,{
        $set:{
            name:name,
            description:description
        }
    },{new:true});
    if(!updateplay){
        throw new ApiError(400,"Invalid playlist Id");
    }
    return res.status(200)
    .json(new ApiResponse(200,updateplay,"Playlist updated successfully")) ;

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
