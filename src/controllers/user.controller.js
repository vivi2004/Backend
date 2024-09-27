import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { response } from "express";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        console.log("Generated Acess Token", accessToken);
        console.log("Generated Refresh Token ", refreshToken);


        // Store the refreshToken in MongoDB
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new apiError(500, "Something went wrong when generating refresh and access token");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    // Validation - Check if any field is empty
    if ([fullName, email, username, password].some(field => field?.trim() === "")) {
        throw new apiError(400, "All fields are required");
    }

    // Check if the user already exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new apiError(409, "User with email or username already exists");
    }

    // Check for avatar file
    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    // Check for cover image file (optional)
    let coverImageLocalPath;
    if (req.files?.coverImage?.[0]?.path) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file is required");
    }

    // Upload avatar to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    // Create user object and save it to the database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    // Fetch the created user, excluding the password and refreshToken fields
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new apiError(500, "Something went wrong while registering the user");
    }

    // Return response with status 201 (created)
    return res.status(201).json(
        new apiResponse(201, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, password, email } = req.body;

    if (!username && !email) {
        throw new apiError(400, "Username or email is required");
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });

    if (!user) {
        throw new apiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new apiError(404, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new apiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));
});

const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: 1 } }, // Remove refresh token
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new apiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new apiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new apiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new apiError(401, "Refresh token is expired or used");
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new apiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed"));
    } catch (error) {
        throw new apiError(401, error.message || "Invalid refresh token");
    }
});


const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?.id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new apiError(400, " Invalid old password");

    }
    user.password = newPassword


    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new apiResponse(200, {}, "Password changed successfully"))
})
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(200, req.user, "Current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body
    if (!fullName || !email) {
        throw new apiError(400, "All fields are required")
    }
    //  information to  find and ,update fullName and email 
    const user = User.findByIdAndUpdate(
        req.user?.id,
        {
            // its function  mongodb to store  the value.
            $set: {
                fullName,
                email,
                // email:email   we can define these values in both ways it is correct 
            }

        }
        ,
        { new: true }, // it is basically after update value is saved and showed to use...
    ).select("-password")

    return res
        .status(200)
        .json(new apiResponse(200, user, "Account details updated successfully"))

})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar is missing ")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new apiError(400, "Error while uploading  on avatar")

    }
    // updating the avatar   
    const user = await User.findByIdAndUpdate(
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")


    return res
        .status(200)
        .json(
            new apiResponse(200, user, " Avatar  updated sucessfully ");
         )

    })

const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new apiError(400, "coverImage  is missing ")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new apiError(400, "Error while uploading  on coverImage ")

    }

    // updating the  coverImage  
    const user = await User.findByIdAndUpdate(
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")
    return res
        .status(200)
        .json(
            new apiResponse(200, user, "Cover Image updated sucessfully ");
     )

    })

// For watch History   from  one copy from modal to another ...  ..
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params
    if (!username?.trim()) {
        throw new apiError(400, "username is missing");
    }
    //  aggregation  mongodb pipeline wala part       
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },


        {
            $lookup: {
                from: "subscription",   // The collection to join sunsriptions
                localField: "_id",   //  The field in subsription to  match
                foreignField: "channel",  // from where should we matched to get the subscription model...
                as: "subcribers"   //  or What we called  our  as  subscribers.
            }
        },

        {
            /// <important>   for pipeline wala part  its mentioned that  it shoul be in lower case
            $lookup: {
                from: "subscription",   // The collection to join sunsriptions
                localField: "_id",   //  The field in subsription to  match
                foreignField: "subscriber",  // for calculating    to whom we subscribed  we have to  match the foreingField to subsrbier.
                as: "subcribedTO"
            }
        },
        {
            $addFields: {     /// basically it creates or add a fiels  so that we add  up the following..    
                subscribersCount: {
                    $size: "$subcribers"
                },
                channelSubscribedToCount: {
                    $size: "$subcribedTO"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.User?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }

            }

        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }

    ])
    if(!channel?.length) {
        throw new apiError( 404, "channel does not exist");
    }

    return  res 
    .status(200)
    .json(
        new apiResponse(200, channel[0] ," User channel fetched") 
    )
})
export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateCoverImage,


};



