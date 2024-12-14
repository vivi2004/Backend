import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {


  const { content } = req.body;
  // Ensure  that the content is provided..
  if (!content) {
    throw new apiError(400, "Tweet content is required");
  }
  // get the user form req.user._id
  const userId = req.user._id;
  // create the tweet

  const tweet = await Tweet.create({
    content,
    user: userId,
  });
  res.status(200).json(new apiResponse(200, {}, "Tweet created successfully "));
});

const getUserTweets = asyncHandler(async (req, res) => {
  //TODO: get user tweents
  //     Get the user ID from the request params or  authenticated user..
  const userId = req.params.userId || req.user._id;
  // find the users tweets..
  const tweets = await Tweet.find({ user: userId });

  if (!tweets || tweets.length == 0) {
    throw new apiError(404, "Tweet  not found for the user");
  }
  res
    .status(200)
    .json(new apiResponse(200, {}, "User tweets retrieved successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TOdo: update tweet..
  const { tweetId } = req.params; // get tweet ID  from the request paramete.
  const { content } = req.body; // get new tweet content form the request body..
  // check if the content is provided ..
  if (!content) {
    throw new apiError(400, "Tweet content is not  provided");
  }

  // Find the tweet by ID
  const tweet = await Tweet.findById(tweetId);
  // chec if the tweet exist.
  if (!tweet) {
    throw new apiError(404, "Tweet not found ");
  }
  // check if the logged - in use is the  owner of the  tweet..
  if (tweet.user.toString() !== req.user._id.toString()) {
    throw new apiError(403, "You are not authorized to this tweet");
  }
  // update the tweet  content ..
  tweet.content = content;
  //  save the updated tweet
  const updateTweet = await tweet.save();
  res.status(200).json(new apiResponse(200, {}, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  // delete a tweet..
  const { tweetId } = req.params; // get tweet ID  from the request paramete.
  if(!isValidObjectId(tweetId)) {
     throw new apiError(404 , "Invalid Tweet ID");
  }   
    
   
  // Find the tweet by ID
  const tweet = await Tweet.findById(tweetId);
  // chec if the tweet exist.
  if (!tweet) {
    throw new apiError(404, "Tweet not found ");
  }
  // check if the logged - in use is the  owner of the  tweet..
  if (tweet.user.toString() !== req.user._id.toString()) {
    throw new apiError(403, "You are not authorized to delete this tweet");
  }
  //  Delete the tweet..
  const deleteTweet = await tweet.deleteOne();

  res.status(200).json(new apiResponse( 200, {deleteTweet}, "Tweet deleted successfully "));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
