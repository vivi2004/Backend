import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { Subscription } from "../models/subscription.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  try {
    // validate channelId..
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      throw new apiError(404, "Invalid channel ID");
    }
    // Fetch total videos  uploaded by the channel..

    const totalVideos = await Video.countDocuments({
      channel: mongoose.Types.ObjectId(channelId),
    });
    // Fetch total views for all videos by summing the views of each videos..
    const totalViewsResult = await Video.aggregate([
      { $match: { channel: mongoose.Types.ObjectId(channelId) } },
      { $group: { _id: null, totalViews: { $sum: "$views " } } },
    ]);

    const totalViews = totalViewsResult[0]?.totalViews || 0;

    // Count total subscribers for the channel..

    const totalSubscribers = await Subscription.countDocuments({
      channel: mongoose.Types.ObjectId(channelId),
    });

    // Fetch total likes for all videos in the channel..
    const totalLikesResult = await Like.aggregate([
      { $match: { channel: mongoose.Types.ObjectId(channelId) } },
      { $group: { _id: null, totalLkes: { $sum: 1 } } },
    ]);
    const totalLikes = totalLikesResult[0]?.totalLikes || 0;
    // Send response with channel stats..
    res
      .status(200)
      .json(
        new apiResponse(
          200,
          { totalVideos, totalLikes, totalViews, totalSubscribers },
          "Channel statistics fetched successfully "
        )
      );
  } catch (error) {
    throw new apiError(500, "Failed to fetch channel statistics", error.k);
  }
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    // Validate channelId ..
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      throw new apiError(400, "Invalid channel ID ");
    }
    // Pagination options....
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),

      sort: { createdAt: -1 }, // sort by newest first..
    };

    // Fetch videos with paginated videos..
    const videos = await Video.aggregatePaginate(
      { channel: mongoose.Types.ObjectId(channelId) },
      options
    );
    // Send response with pagination  videos..

    res
      .status(200)
      .jsom(
        new apiResponse(200, videos, "channel videos fetched successfully")
      );
  } catch (error) {
    throw new apiError(500, "Failed to fetch channel videos", error.message);
  }
});

export { getChannelStats, getChannelVideos };
