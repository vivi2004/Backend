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
    owner: userId,
  });
  res.status(200).json(new apiResponse(200, {}, "Tweet created successfully "));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // Get the user ID from params or authenticated user
  const userId = req.params.userId || req.user._id;

  // Validate the userId as a valid ObjectId
  if (!mongoose.isValidObjectId(userId)) {
    throw new apiError(400, "Invalid user ID");
  }

  // Query tweets based on the user ID
  const tweets = await Tweet.find({ owner: userId });

  if (!tweets || tweets.length === 0) {
    throw new apiError(404, "No tweets found for the user");
  }

  res
    .status(200)
    .json(new apiResponse(200, tweets, "User tweets retrieved successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new apiError(400, "Tweet content is not provided");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new apiError(404, `Tweet with ID ${tweetId} not found`);
  }

  console.log("Tweet user:", tweet.owner);
  console.log("Logged-in user:", req.user);
  console.log("Logged-in user ID:", req.user ? req.user._id : "No user ID");

  if (!tweet.owner || !req.user || !req.user._id) {
    throw new apiError(400, "Invalid user or tweet data");
  }

  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new apiError(403, "You are not authorized to update this tweet");
  }

  tweet.content = content;
  await tweet.save();

  res.status(200).json(new apiResponse(200, {}, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  // delete a tweet..

  const { tweetId } = req.params; // get tweet ID  from the request paramete.
  // validate the tweet Id

  if (!isValidObjectId(tweetId)) {
    throw new apiError(404, "Invalid Tweet ID");
  }

  // Find the tweet by ID
  const tweet = await Tweet.findById(tweetId);
  // chec if the tweet exist.
  if (!tweet) {
    throw new apiError(404, "Tweet not found ");
  }
  // check if the logged - in use is the  owner of the  tweet..
  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new apiError(403, "You are not authorized to delete this tweet");
  }
  //  Delete the tweet..
  await tweet.deleteOne();

  res.status(200).json(new apiResponse(200, {}, "Tweet deleted successfully "));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
