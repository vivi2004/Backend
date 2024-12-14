import { Router } from "express";
import {
  toggleSubscription,
  getUserChannelSubscription,
  getSubscribedChannels,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"; // Assuming you have a middleware for verifying JWT tokens

const router = Router();

// Apply JWT authentication middleware to all routes
router.use(verifyJWT);

// Route to toggle subscription (subscribe or unsubscribe) to a channel
router.route("/:chanelId").post(toggleSubscription);

// Route to get all subscribers for a specific channel
router.route("/channel/:chanelId/subscribers").get(getUserChannelSubscription);

// Route to get all channels that a user is subscribed to
router.route("/user/:subscriberId/channels").get(getSubscribedChannels);

export default router;
