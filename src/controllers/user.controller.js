import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import { use } from "bcrypt/promises.js";
import { jwt } from  "jsonwebtoken"

const generateAccessAndRefereshToken = async(userId) =>{
    try {
    const user =  await  User.findById(userId);
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    
    //    we have to store the refreshToken in the mongodb so that we  can used from it 
      user.refreshToken = refreshToken
     await  user.save({ validateBeforeSave:false });
      
     return { accessToken,refreshToken}

     } catch (error) {
        throw new apiError(500,"Something went wrong when generating  refresh and access token");

        
    }
}



const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;



    // Validation - Check if any field is empty
    if(
        [fullName, email, username, password].some(field => field?.trim() === "")) {
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
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }


     if (!avatarLocalPath) {
      res.status(400);
      res.json("Avatar not found");
        // throw new apiError(400, "Avatar file is required");
    }
    // Upload avatar to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
     

    

    if (!avatar) {
      res.status(400);
      res.json("Avatar not found");
        // throw new apiError(400, "Avatar file is required  ");
    }

    // Create user object and save it to the database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
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




const loginUser = asyncHandler(async(req,res) => {
    // req body-> data
    // username or email
    // find the user
    // password check
    // acess and refresh token   
    //  send cookies 
      const{ username,password,email } = req.body;
      console.log(email);
    
    if(!username && !email) {
       throw new  apiError(400, " username or email is is required");
       
    }

    console.log('Searching for user with:', { username, email });

      const user =   await  User.findOne({
    //    $or :[{username},{email}] , // here $ operator works as  if it's required any one of them 
        email:email


     })
     if(!user)  {
       throw new apiError(404,"User does not exist ");
     }

  const isPasswordValid =  await user.isPasswordCorrect(password)

  if(!isPasswordValid){
   throw new apiError(404,"Invalid User credentials ");
  }
  const {accessToken,refreshToken} =  await  generateAccessAndRefereshToken(user._id);


 const loggedInUser =  await  User.findById(user._id).
           select("-password -refreshToken") 
//    send it to the cookies ...
const options = {
    httpOnly: true,
    secure:true
 
}

 return res
 .status(200)
 .cookie("accessToken",  accessToken, options)
 .cookie("refreshToken", refreshToken, options)
 .json(
   new apiResponse(
       200,
       {
           user: loggedInUser,accessToken, refreshToken
            
       },
       "user logged in Successfully"
   )
 )

}); 

const logOutUser =  asyncHandler(async(req,res)=>{
    User.findByIdAndUpdate(
       req.user._id,
       {
           $set:{
               refreshToken: 1 // this   removes the field from document
           }
       },
       {
        new: true
       }
   
    )
   
    const options = {
       httpOnly: true,
       secure:true
  
   }
   return res
   .status(200)
   .clearCookie("acessToken",options)
   .clearCookie("refreshToken",options)
   .json(new apiResponse(200,{}, "User logged Out "))
})

const refreshAcessToken = asyncHandler(async(req,res) =>{
  const incomingRefreshToken =   req.cookies.refreshToken||req.body.refreshToken
   if(incomingRefreshToken) {
    throw new apiError(401,"Unauthorized request")
   
   }
  try {
     const decodedToken =  jwt.verify(
     incomingRefreshToken,
     process.env.REFRESH_TOKEN_SECRET
      )
    const user = await User.findById(decodedToken?._id)
  
    if(!user){
      throw new apiError(401," Invalid refresh token")
    }
     
     if(incomingRefreshToken !== user?.refreshToken){
      throw new apiError(401,"Refresh token is expired or used")
     } 
  
     const options = {
     httpOnly:true,
     secure:true
     }
  
      await  generateAccessAndRefereshToken(user._id) 
  
      return res
      .status(200)
      .cookie("accessToken",acessToken,options)
      .cookie("refreshToken",refreshToken,options)
      .json(
          new apiResponse(
              200,
              {
                  acessToken,refreshToken:newRefreshToken
              },
              "Access token refreshed "
          )
      )
  })
   catch (error) {
     throw new apiError(401, error?.message|| "Invalid  refresh token")

  }


export {
     registerUser,
    loginUser,
    logOutUser,
    refreshAcessToken
    };



