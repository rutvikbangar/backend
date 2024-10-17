import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
   const {content} = req.body ;
   if(content === ""){
    throw new ApiError(400,"Tweet content cannot be empty");
   }
   

   const newTweet = await Tweet.create({
    content:content,
    owner: req.user?._id
   });
   if(!newTweet){
    throw new ApiError(400,"Error while creating a tweet");
   }
   const createdTweet = await Tweet.findById(newTweet._id);
   if(!createdTweet){
    throw new ApiError(500,"Problem While fetcihing the tweet");
   }
   return res.status(200).json(new ApiResponse(200,createdTweet,"Tweet created successfully"));

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params;
    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400,"Incorrect user Id");
    }
    const userObjectId = new mongoose.Types.ObjectId(userId) ;
     const userTweet = await Tweet.aggregate([
        {
            $match:{
                owner: userObjectId
            }
        },
        {
            $project:{
                _id:0,
                owner:0,
            }
        }
     ]);
     if(!userTweet){
        throw new ApiError(200,"Invalid request")
     }
     return res.status(200).json(new ApiResponse(200,userTweet,"User Tweets fetched"));
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    
    const {tweetId} = req.params;
    const {content} = req.body ;
    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"Invalid tweet Id")
    }
    if(content === ""){
        throw new ApiError(400,"content required")
    }
    const updatedtweet = await Tweet.findByIdAndUpdate(tweetId,{
        $set:{
            content:content,
        }
    },{new:true});
    if(!updatedtweet){
        throw new ApiError(400,"tweet not found")
    }
    return res.status(200)
    .json(new ApiResponse(200,updatedtweet,"Tweet updated successfully"));

})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet Id");
    }
    

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    
    if (!deletedTweet) {
        throw new ApiError(404, "Tweet not found");
    }
    
    
    
    return res.status(200).json(new ApiResponse(200, {}, "Tweet deleted"));
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
