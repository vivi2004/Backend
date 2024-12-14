import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { MongoOIDCError } from "mongodb";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //    Set  default values for page and limit from query parametes..

  const { page = 1, limit = 10 } = req.query;

  try {
    //  check if the videoId  is a valid ObjectId or not ...
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      throw new apiError(400, "Invalid video ID");
    }
    // set up aggregate pipeline to filter  comments by videoId and populate owner  details..
    const aggregationPipeline = [
      { $match: { video: mongoose.Types.ObjectId(videoId) } },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "ownerDetails",
        },
      },
      {
        $unwind: "$ownerDetails", // unwind to get a single document in ownerDetails..
      },
      {
        $project: {
          content: 1,
          "ownerDetails.name": 1,
          "ownerDetails.email": 1,
          createdAt: 1,
        },
      },
    ];

    // Use aggregatePaginate to paginate results...
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
    };
    const comments = await Comment.aggregatePaginate(
      Comment.aggregate(aggregationPipeline),
      options
    );

    //  Respond  with th  paginated comments..
    res
      .status(200)
      .json(
        new apiResponse(200, { comments }, " Comments fetched successfully")
      );
  } catch (error) {
    throw new apiError(500, "Failed to retrieve comments", error.message);
  }
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  try {
    //  validate video ID
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      throw new apiError(400, " Invalid video ID ");
    }
    // validate content....
    if (!content || content.trim() === "") {
      throw new apiError(400, " Comment content is required ");
    }
    //  Create a new comment..
    const newComment = new Comment({
      video: mongoose.Types.ObjectId(videoId),
      owner: userId,
      content,
    });
    // save the comment to the database..
    await newComment.save();

    // Return the created comment with a success message....
    res
      .status(201)
      .json(
        new apiResponse(
          201,
          { Comment: newComment },
          "Comment added successfully "
        )
      );
  } catch (error) {
    throw new apiError(500, "Failed to add comment", error.message);
  }
});
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;
  try {
    // validate the content..
    if (!content || content.trim() === "") {
      throw new apiError(400, "Comment content cannot be empty ");
    }

    //  Find the comment by commentId..
    const comment = await Comment.findById(commentId);

    ///  check if the comment is exist..
    if (!comment) {
      throw new apiError(404, "Comment not found ");
    }
    // check if the user is the owner of the comment(important that user can only edit their own comments..)

    if (comment.owner.toString() !== userId.toString()) {
      throw new apirError(403, " You are not authorized to edit this comment ");
    }
    // update  the comment's content ..
    comment.content = content;
    // save the  updated comment..
    await comment.save();

    // Respond with the updated comment...
    res
      .status(200)
      .json(new apiResponse(200, { comment }, "Comment updated successfully "));
  } catch (error) {
    throw new apiError(500, "Failed to update comment", error.message);
  }
});
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;
  try {
    // Find out the comment by commentId..
    const comment = await comment.findById(commentId);

    // check if the comment exist..
    if (!comment) {
      throw new apiError(404, "comment not found ");
    }

    // check if the user is the owner of the comment(important that user can only edit their own comments..)
    if (comment.owner.toString() !== userId.toString()) {
      throw new apiError(
        403,
        "You are not authorized to delete  this comment "
      );
    }
    //  Delete the comment..
    await comment.remove();

    // Respond with a success message...
    res
      .status(200)
      .json(new apiResponse(200, null, "Comment deleted successfully"));
  } catch (error) {
    throw new apiError(500, "Failed to delete comment ", error.message);
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
