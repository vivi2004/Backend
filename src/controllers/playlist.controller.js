import mongoose, { isValidObjectId } from "mongoose";
import { playlist } from "../models/playlist.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// first create a  playlist  as a assync functions
const createPalylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
});

const addVideoPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { naem, description } = req.body;
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
