import mongoose, { isValidObjectId } from "mongoose";
import { playlist } from "../models/playlist.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// first create a  playlist  as a assync functions
const createPalylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  // create   playlist..
  // validate the inputs
  if (!name) {
    throw new apiError(400, "Name  must be provided ");
  }
  try {
    // creat  a new playlist
    const newPlaylist = new playlist({
      name,
      description,
    });
    // save the playlist to the databse..
    const savedPlaylist = await newPlaylist.save();
    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          { savedPlaylist },
          " Playlist created successfully"
        )
      );
  } catch (error) {
    // if  any errors  that occcur during process..
    throw new apiError(500, "Failed to create playlist ..");
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  //  validate the   inputs..

  if (!userId) {
    throw new apiError(400, "User Id is required");
  }

  // find the playlist associated with the user...

  try {
    const playlists = await playlist.findById({ user: userId });

    // check if the playlist is found or not...

    if (!playlists || playlists.length === 0) {
      throw new apiError(404, "No playlist found for this user ");
    }

    return res
      .status(200)
      .json(
        new apiResponse(200, { playlist }, "Playlist reterived successfully ")
      );
  } catch (error) {
    throw new apiError(500, "Failed to retrieve playlist");
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // validate the input
  if (!playlistId) {
    throw new apiError(400, "Playlist ID is required");
  }

  try {
    // Find the playlist byID
    const Playlist = await playlist.findById(playlistId);
    // check if the playlist is found...
    if (!Playlist) {
      throw new apiError(400, "playlist is not found");
    }

    // return a success response with the playlist..
    return res
      .status(200)
      .json(
        new apiResponse(200, { playlist }, "Playlist reterived successfully")
      );
  } catch (error) {
    throw new apiError(500, " Failed to retrieve playlist");
  }
});

const addVideoPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId || !videoId) {
    throw new apiError(400, "playlist ID and Video ID are required");
  }
  try {
    //   Find the playlist and add the video atomically....

    const updatedPlaylist = await playlist.findById(
      playlistId,
      { $addToSet: { videos: videoId } }, // Prevent duplicates using  $addToSet..
      { new: true }
    );
    if (!updatedPlaylist) {
      throw new apiError(404, "Playlist not found");
    }
    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          { updatedPlaylist },
          "Video added  to playlist successfully "
        )
      );
  } catch (error) {
    throw new apiError(
      500,
      `Failed to add video  to playlist:${error.message}`
    );
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  //  validate the  input
  if (!playlistId || !videoId) {
    throw new apiError(400, "Playlist ID or Video ID must be provided");
  }

  try {
    // Find the playlist by it's ID
    const Playlist = await playlist.findById(playlistId);
    // check the playlist if it exists or not
    if (!playlist) {
      throw new apiError(404, "Playlist not found");
    }
    // check  if the  video exist in the playlist..
    const videoIndex = playlist.videos.indexOf(videoId);
    if (videoIndex === -1) {
      throw new apiError(404, " Video not found in the playlist.  ");
    }
    // Remove the  video from the playlist....
    playlist.videos.splice(videoIndex, 1); // Remove the video

    // save the updated playlist to the database.
    const updatedPlaylist = await playlist.save();
    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          { updatePlaylist },
          "Video  removed successfully from the playlist.."
        )
      );
  } catch (error) {
    throw new apiError(
      500,
      `Failed to remove video from playlist: ${error.message}`
    );
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // validate the inputs
  if (!playlistId) {
    throw new apiError(400, `Playlist ID is required`);
  }

  try {
    // find the playlist by its ID
    const Playlist = await playlist.findById(playlistId);
    if (!playlist) {
      throw new apiError(404, " playlist not found");
    }
    //Delete the  playlist...
    const deletePlaylist = await playlist.remove();

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          { deletePlaylist },
          "Playlist deleted successfully"
        )
      );
  } catch (error) {
    throw new apiError(500, `Failed to delete the playlist: $ {error.message}`);
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  // validate  inputs..
  if (!playlistId) {
    throw new apiError(400, " Playlist ID  is required");
  }

  if (!name || !description) {
    throw new apiError(400, "playlist name or description is required");
  }

  try {
    // find the playlist by its ID
    const Playlist = await playlist.findById(playlistId);

    if (!playlist) {
      throw new apiError(404, "playlist not found");
      // update the playlist field
      if (name) playlist.name = name;
      if (description) playlist.description = description;

      //  save the updated playlist to the database..
      const updatedPlaylist = await playlist.save();

      return res
        .status(200)
        .json(
          new apiResponse(
            200,
            { updatePlaylist },
            "playlist updates successfully"
          )
        );
    }
  } catch (error) {
    throw new apiError(500, `Failed to update playlist: ${error.message}`);
  }
});

export {
  createPalylist,
  getPlaylistById,
  getUserPlaylists,
  addVideoPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
