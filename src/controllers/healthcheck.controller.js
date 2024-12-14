import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  try {
    res
      .status(200)
      .json(new apiResponse(200, null, "Server is running  healthy "));
  } catch (error) {
    throw new apiError(500, "Health check failed", error.message);
  }
});

export { healthcheck };
