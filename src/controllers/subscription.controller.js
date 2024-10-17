import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,"Incorrect Channel Id");
    }
    const channelObjectId = new mongoose.Types.ObjectId(channelId);
    const findSubscribeStatus = await Subscription.findOne(
        {
            subscriber: req.user?._id,
            channel: channelObjectId,
        }
    );
    if(findSubscribeStatus){
        await Subscription.findOneAndDelete({
            subscriber: req.user?._id,
            channel: channelObjectId,
        })
    }else{
        const Suscribe = await Subscription.create({
            subscriber: req.user?._id,
            channel:channelObjectId,
        })
        if(!Suscribe){
            throw new ApiError(500,"Failed to subscribe");
        }
    }

    return res.status(200).json(new ApiResponse(200,{},"Subcription Toggled"));
    
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,"Incorrect Channel Id");
    }
    const channelObjectId = new mongoose.Types.ObjectId(channelId);
    const subscriberList = await Subscription.aggregate([
        {
            $match:{
                channel: channelObjectId,
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subcriberDetail",
                pipeline: [
                    {
                        $project:{
                            username:1,
                            fullName:1,
                            avatar:1,
                        }

                    },
                ]
            },
            
        },
        {
            $addFields:{
                    subcriberDetail:{

                        $first : "$subcriberDetail"
                    }
                }
        },
        {
            $project:{
                _id:0,
                subcriberDetail : 1,
            }
        }
        
    ])
    if(!subscriberList){
        throw new ApiError(400,"No such channel exist");
    }
    return res.status(200).json(new ApiResponse(200,subscriberList,"Subscriber list fetched"));

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!mongoose.Types.ObjectId.isValid(subscriberId)){
        throw new ApiError(400,"Incorrect subscriber Id");
    }
    const subscriberObjectId = new mongoose.Types.ObjectId(subscriberId);
    const channelList = await Subscription.aggregate([
        {
            $match:{
                subscriber: subscriberObjectId,
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetail",
                pipeline: [
                    {
                        $project:{
                            username:1,
                            fullName:1,
                            avatar:1,
                        }

                    },
                ]
            },
            
        },
        {
            $addFields:{
                channelDetail:{

                        $first : "$channelDetail"
                    }
                }
        },
        {
            $project:{
                _id:0,
                channelDetail : 1,
            }
        }
        
    ])
    if(!channelList){
        throw new ApiError(400,"No such user exist");
    }
    return res.status(200).json(new ApiResponse(200,channelList,"Channel list fetched"));


})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}