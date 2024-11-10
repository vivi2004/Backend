import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { chanelId } = req.params;
  const userId = req.user._id;
  try {
    // Check if the user is already  subscribed  to the  channel..
    if (!mongoose.Types.ObjectId.isValid(chanelId)) {
      throw new apiError(400, "Invalid Channel Id");
    }

    // check if the user is already  subscribed to the channel.
    const existingSubscription = await Subscription.find({
      user: mongoose.Types.ObjectId(userId),
      channel: mongoose.Types.ObjectId(chanelId),
    });
    if (existingSubscription) {
      // If the user is already subscribed , unsubscribe them (delete subscription )
      await existingSubscription.remove();
      // send response with success message..
      res
        .status(200)
        .json(
          new apiResponse(200, null, "Unsubscribed from channel successfully")
        );
    } else {
      // If the user is not subscribed , subscribe them (create a new  subscription)
      const newSubscription = new Subscription({
        user: mongoose.Types.ObjectId(userId),
        channel: mongoose.Types.ObjectId(chanelId),
      });

      await newSubscription.save();
      // send response with success message..
      res
        .status(200)
        .json(
          new apiResponse(
            200,
            newSubscription,
            "Subscribed to channel successfully "
          )
        );
    }
  } catch (error) {
    throw new apiError(500, "Faile to toggle subscription ", error.message);
  }
});

const getUserChannelSubscription = asyncHandler(async (req, res) => {
  const { chanelId } = req.params;

  try {
    // check if channelId is a valid mongodb  objectId
    if (!mongoose.Types.ObjectId.isValid(chanelId)) {
      throw new apiError(400, "Invalid channed Id");
    }
    //Fetch the subscribers for the given channel by looking up all the subscriptions

    const subscribers = await Subscription.find({
      channel: mongoose.Types.ObjectId(chanelId),
    })
      .populate("user", "name email")
      .select("user");

    // check if no subscribers were found..
    if (!subscribers || subscribers.length == 0) {
      return status(400).json(
        new apiResponse(404, null, "No subscribers  found for this channel")
      );
    }

    //   Extract user data from subscriptions..
    const subsciberList = subscribers.map((Subscription) => Subscription.user);

    //    Respond with the list of subscribers..
    res
      .status(200)
      .json(
        new apiResponse(200, subsciberList, "Subscribers fetched successfully")
      );
  } catch (error) {
    throw new apiError(
      500,
      "Failed to fetch channel subscribers",
      error.message
    );
  }
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  try {
    // check if subscriberId  is a valid mongoDB   objectId
    if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
      throw new apiError(400, "Invalid subscriber ID ");
    }
    // Fetch the channels the user is subscribed to by looking up all subscription
    const subscriptions = await Subscription.find({
      user: mongoose.Types.ObjectId(subscriberId),
    })
      .populate("channel", "name description ")
      .select("channel"); // only select the  channel field from subscription
    if (!subscriptions || subscriptions.length === 0) {
      return res
        .status(404)
        .json(
          new apiResponse(404, null, "No subscriptions found from this user ")
        );
    }

    const subscribedChannels = subscriptions.map(
      (subscriptions) => subscriptions.channel
    );

    res
      .status(200)
      .json(
        new apiResponse(
          200,
          subscribedChannels,
          "Subscribed channels fetched successfully "
        )
      );
  } catch (error) {
    throw new apiError(
      500,
      "Failed to fetch subscribed channels",
      error.message
    );
  }
});
export {
  toggleSubscription,
  getUserChannelSubscription,
  getUserChannelSubscription,
};
