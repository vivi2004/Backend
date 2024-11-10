import { apiError } from "../utils/apiError";
import { apiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

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
