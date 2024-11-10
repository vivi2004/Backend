import mongoose, { isValidObjectId } from "mongoose";
import { Video } from " ../models/video.model.js";
import { User } from "../controllers/user.controller.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from " ../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// getAll videos  assyn   methods....
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;
  const filter = {};

  if (query) {
    filter.title = { $regex: query, $options: "i" };
  }
  if (userId) {
    filter.user = userId;
  }
  const sortOptions = { [sortBy]: sortType === "desc" ? -1 : 1 };

  const videos = await Video.find(filter)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Video.countDocuments(filter);
  res.status(200).json(
    new apiResponse(true, {
      videos,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO;  get video , upload to cloudinary  , create video
  const { file } = req;
  //  check if the file exists..
  if (!file) return res.status(400).json(apiError("Video  file  is required"));

  const uploadResponse = await uploadOnCloudinary(file.path);
  const video = new Video({
    title,
    description,
    url: uploadResponse.secure_url,
    user: req.user._id,
    isPublished: true,
  });
  await video.save();
  // save the response that it successfully
  res.status(200).json(new apiResponse(200, { video }, "Video publish"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // TODO : get video By videoId
  if (!isValidObjectId(videoId)) {
    throw new apiError("Invalid  vido Id ");
  }
  const video = await Video.findById(videoId);

  // check if video exists..
  if (!video) {
    throw new apiError(400, "Video not found.");
  }
  res
    .status(200)
    .json(new apiResponse(200, { video }, " Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // update the video details like title , description , thumbnail..
  const { title, description } = req.body;
  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid video ID ");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    { title, description },
    { new: true }
  );
  if (!video) {
    throw new apiError(404, "Video not found");
  }
});
//   Delete a video ...
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid video ID");
  }
  const video = await Video.findByIdAndDelete(videoId);
  if (!video) {
    throw new apiError("Video not found");
  }
  res.status(200).json(new apiResponse(200, {}, "Video deleted successfully "));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid video ID ");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new apiError(400, " Video  not found");
  }

  video.isPublished = !video.isPublished;
  await Video.save();
  res
    .status(200)
    .json(new apiResponse(200, { isPublished: video.isPublished }));
});
export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
