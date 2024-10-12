import mongoose, {isValidObjectId, Schema} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(title === "" || description === ""){
        throw new ApiError(400,"All given fields required");
    }
    let LocalvideoPath ;
    if(req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length >0){
        LocalvideoPath = req.files.videoFile[0].path ;
    }
    let LocalThumbnailPath;
    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length >0){
        LocalThumbnailPath = req.files.thumbnail[0].path ;
    }
    if(!LocalvideoPath){
        throw new ApiError(400,"video file required");
    }
    if(!LocalThumbnailPath){
        throw new ApiError(400,"thumbnail required");
    }
    const videoFile = await uploadOnCloudinary(LocalvideoPath) ;
    const thumbnail = await uploadOnCloudinary(LocalThumbnailPath);
    if(!videoFile || !thumbnail){
        throw new ApiError(400,"One or more files are missing")
    }
    const duration = videoFile.duration;
    const owner = req.user._id ;
    const newvideo = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title: title,
        description: description,
        duration: duration,
        owner: owner
    });

    const createdVideo = await Video.findById(newvideo._id) ;

    if(!createdVideo){
        throw new ApiError(500,"Failed Uploading the video")
    }
    

    return res.status(200).json(new ApiResponse(200,createdVideo,"Video uploaded successfully")) ;




})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID format");
    }
    const videoObjectId = new mongoose.Types.ObjectId(videoId) ;  
    const fetchedVideo = await Video.findById(videoObjectId) ;
    if(!fetchedVideo){
        throw new ApiError(404,"Video not found");
    }

    return res.status(200).json(new ApiResponse(200,fetchedVideo,"Video fetched Successfully")) ;
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title,description} = req.body ;
    //TODO: update video details like title, description, thumbnail

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid Video ID format");
    }
    if(title==="" || description === ""){
        throw new ApiError(400,"All the fields required")
    }
    const newthumnail  = req.file?.path;
    if(!newthumnail){
        throw new ApiError(400,"Thumbnail required")
    }
    console.log(newthumnail) ;
    const thumbnail = await uploadOnCloudinary(newthumnail) ;
    if(!thumbnail){
        throw new ApiError(400,"Error while uploading file") ;
    }
    const videoObjectId = new mongoose.Types.ObjectId(videoId) ;
    const fetchedVideo = await Video.findByIdAndUpdate(videoObjectId,
        {
            $set:{
                title : title ,
                description : description ,
                thumbnail : thumbnail.url ,
            }
        },{new:true}) ;
    if(!fetchedVideo){
        throw new ApiError(404,"Video not found");
    }

    return res.status(200).json(new ApiResponse(200,fetchedVideo,"Details updated successfully")) ;


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid Video ID format");
    }
    const videoObjectId = new mongoose.Types.ObjectId(videoId) ;
    await Video.findByIdAndDelete(videoObjectId) ;
    return res.status(200).json(new ApiResponse(200,{},"Video deleted"));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid Video ID format");
    }
    const videoObjectId = new mongoose.Types.ObjectId(videoId) ;
    const fetchedVideo = await Video.findById(videoObjectId);
    if(!fetchedVideo){
        throw new ApiError(400,"no Such video in db");
    }
    fetchedVideo.isPublished = !fetchedVideo.isPublished ;
    await fetchedVideo.save({validateBeforeSave:false});

    const newfetchedVideo = await Video.findById(fetchedVideo._id);
    

    return res.status(200)
    .json(new ApiResponse(200,newfetchedVideo,"Publish Status Toggled")) ; 
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
