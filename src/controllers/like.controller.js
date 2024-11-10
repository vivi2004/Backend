import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { request } from "express";

// Toggle like video....
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;
  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid video ID ");
  }
  const existingLike = await Like.findOne({
    user: userId,
    targetId: videoId,
    type: "video",
  });
  if (existingLike) {
    await existingLike.remove();
    return res.json(new apiResponse(200, "Liked remove from video", null));
  } else {
    await Like.create({ user: userId, targetId: videoId, type: "video" });
    return res.json(new apiResponse(201, "Like added to video", null));
  }
});

// Toggle  like  on a comment..

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(commentId)) {
    throw new apiError(400, "Invalid comment ID");
  }
  const existingLike = await Like.findOne({
    user: userId,
    targetId: commentId,
    type: "comment",
  });

  if (existingLike) {
    await existingLike.remove();

    return res.json(new apiResponse(200, "Like remove from comment", null));
  } else {
    await Like.create({ user: userId, targetId: commentId, type: "comment" });
  }
});

// Toggle like on a tweet ...

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(tweetId)) {
    throw new apiError(400, "Invalid tweet ID ");
  }
  const existingTweet = await Like.findOne({
    user: userId,
    targetId: tweetId,
    type: "tweet",
  });

  if (existingLike) {
    await existingLike.remove();
    return;
    res
      .status(200)
      .json(new apiResponse(200, "Liked removed from  tweet", null));
  } else {
    await Like.create({ user: userId, targetId: tweetId, type: "tweet" });
    return res
      .status(201)
      .json(new apiResponse(201, "Liked  added to the tweet", null));
  }
});
// Get all  liked videos..
const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const likedVideos = await Like.findOne({
    user: userId,
    type: "video",
  }).populate("targetId");

  if (!likedVideos) {
    throw new apiError(404, "NO like video found ");
  }
  return res.json(
    new apiResponse(200, "Liked video retrieved successfully"),
    likedVideos
  );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
