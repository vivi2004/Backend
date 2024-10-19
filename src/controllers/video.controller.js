import mongoose, { isValidObjectId } from "mongoose";
import { Video } from " ../models/video.model.js";
import { User } from "../controllers/user.controller.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from " ../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// getAll videos  assyn   methods....
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //  TODo ;  get all videos  based on query , sort , pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO;  get video , upload to cloudinary  , crete video
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // TODO : get video By videoId
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // update the video details like title , description , thumbnail..
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});
export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
