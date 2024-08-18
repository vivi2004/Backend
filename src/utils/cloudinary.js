import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
  
});

// Upload Function
const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) {
        console.error("Local file path is missing.");
        return null;
    }

    try {
        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log("File successfully uploaded to Cloudinary:", response.url);

        // Remove the locally saved temporary file
        try {
            fs.unlinkSync(localFilePath);
        } catch (unlinkError) {
            console.error("Failed to delete local file after upload:", unlinkError.message);
        }

        return response;

    } catch (error) {
        console.error("Error uploading file to Cloudinary:", error.message);

        // Attempt to remove the locally saved temporary file on failure
        try {
            fs.unlinkSync(localFilePath);
        } catch (unlinkError) {
            console.error("Failed to delete local file after failed upload:", unlinkError.message);
        }

        return null;
    }
};

export { uploadOnCloudinary };
